import { Box } from "#asciiflow/client/common";
import * as constants from "#asciiflow/client/constants";
import { Layer, LayerView } from "#asciiflow/client/layer";
import { DrawingId, storageKey } from "#asciiflow/client/store";
import { DrawingStringifier } from "#asciiflow/client/store/drawing_stringifier";
import { ArrayStringifier, IStringifier, JSONStringifier } from "#asciiflow/common/stringifiers";
import { IVector, Vector } from "#asciiflow/client/vector";

// localStorage always stores offsets in the original pixel format (H=9, V=16).
// We convert to/from current pixel sizes on read/write so existing data just works.
const STORED_CHAR_PIXELS_H = 9;
const STORED_CHAR_PIXELS_V = 16;

function readPersistent<T>(
  key: string,
  defaultValue: T,
  stringifier: IStringifier<T> = new JSONStringifier() as any
): T {
  const raw = localStorage.getItem(key);
  if (raw === null || raw === undefined) {
    return defaultValue;
  }
  try {
    return stringifier.deserialize(raw);
  } catch {
    return defaultValue;
  }
}

function writePersistent<T>(
  key: string,
  value: T,
  stringifier: IStringifier<T> = new JSONStringifier() as any
): void {
  localStorage.setItem(key, stringifier.serialize(value));
}

/**
 * Holds the entire state of the diagram as a 2D array of cells
 * and provides methods to modify the current state.
 */
export class CanvasStore {
  private _committed: Layer;
  private _undoLayers: Layer[];
  private _redoLayers: Layer[];
  private _zoom: number;
  private _offset: IVector;
  private _scratch: Layer = new Layer();
  private _selection: Box | undefined = undefined;

  // Keys for localStorage persistence.
  private committedKey: string;
  private undoKey: string;
  private redoKey: string;
  private zoomKey: string;
  private offsetKey: string;

  constructor(
    public readonly drawingId: DrawingId,
    private notify: () => void
  ) {
    this.committedKey = storageKey(drawingId, "committed-layer");
    this.undoKey = storageKey(drawingId, "undo-layers");
    this.redoKey = storageKey(drawingId, "redo-layers");
    this.zoomKey = storageKey(drawingId, "zoom");
    this.offsetKey = storageKey(drawingId, "offset");

    this._committed = drawingId.shareSpec
      ? new DrawingStringifier().deserialize(drawingId.shareSpec).layer
      : readPersistent(this.committedKey, new Layer(), Layer);

    this._undoLayers = readPersistent(
      this.undoKey,
      [],
      new ArrayStringifier(Layer)
    );
    this._redoLayers = readPersistent(
      this.redoKey,
      [],
      new ArrayStringifier(Layer)
    );
    this._zoom = readPersistent(this.zoomKey, 1);

    const defaultOffset: IVector = {
      x: (constants.MAX_GRID_WIDTH * STORED_CHAR_PIXELS_H) / 2,
      y: (constants.MAX_GRID_HEIGHT * STORED_CHAR_PIXELS_V) / 2,
    };
    const storedOffset = readPersistent<IVector>(this.offsetKey, defaultOffset);
    // Convert from stored pixel format (H=9, V=16) to current pixel sizes.
    this._offset = {
      x: (storedOffset.x / STORED_CHAR_PIXELS_H) * constants.CHAR_PIXELS_H,
      y: (storedOffset.y / STORED_CHAR_PIXELS_V) * constants.CHAR_PIXELS_V,
    };
  }

  public get zoom() {
    return this._zoom;
  }

  public setZoom(value: number) {
    this._zoom = value;
    writePersistent(this.zoomKey, value);
    this.notify();
  }

  public resetZoom() {
    this.setZoom(1);
  }

  public recenter() {
    const cells = this._committed.keys();
    if (cells.length === 0) {
      // Nothing drawn — reset to grid center.
      this.setOffset(new Vector(
        (constants.MAX_GRID_WIDTH * constants.CHAR_PIXELS_H) / 2,
        (constants.MAX_GRID_HEIGHT * constants.CHAR_PIXELS_V) / 2,
      ));
      return;
    }
    let sumX = 0;
    let sumY = 0;
    for (const cell of cells) {
      sumX += cell.x;
      sumY += cell.y;
    }
    const avgX = sumX / cells.length;
    const avgY = sumY / cells.length;
    this.setOffset(new Vector(
      avgX * constants.CHAR_PIXELS_H,
      avgY * constants.CHAR_PIXELS_V,
    ));
  }

  public get offset() {
    return new Vector(this._offset.x, this._offset.y);
  }

  public setOffset(value: Vector) {
    this._offset = { x: value.x, y: value.y };
    // Convert back to stored pixel format (H=9, V=16).
    writePersistent(this.offsetKey, {
      x: (value.x / constants.CHAR_PIXELS_H) * STORED_CHAR_PIXELS_H,
      y: (value.y / constants.CHAR_PIXELS_V) * STORED_CHAR_PIXELS_V,
    });
    this.notify();
  }

  get scratch() {
    return this._scratch;
  }

  get selection() {
    return this._selection;
  }

  get committed() {
    return this._committed;
  }

  set committed(value: Layer) {
    this._committed = value;
    writePersistent(this.committedKey, value, Layer);
    this.notify();
  }

  get combined() {
    return new LayerView([this.committed, this._scratch]);
  }

  get shareSpec() {
    return new DrawingStringifier().serialize({
      name: this.drawingId.localId,
      layer: this.committed,
    });
  }

  setSelection(box: Box) {
    this._selection = box;
    this.notify();
  }

  clearSelection() {
    this.setSelection(null);
  }

  setScratchLayer(layer: Layer) {
    this._scratch = layer;
    this.notify();
  }

  clear() {
    this._undoLayers = [...this._undoLayers, this.committed];
    writePersistent(this.undoKey, this._undoLayers, new ArrayStringifier(Layer));
    this._committed = new Layer();
    writePersistent(this.committedKey, this._committed, Layer);
    this._redoLayers = [];
    writePersistent(this.redoKey, this._redoLayers, new ArrayStringifier(Layer));
    this.notify();
  }

  clearScratch() {
    this._scratch = new Layer();
    this.notify();
  }

  commitScratch() {
    const [newLayer, undoLayer] = this.committed.apply(this._scratch);
    this._committed = newLayer;
    writePersistent(this.committedKey, this._committed, Layer);
    if (undoLayer.size() > 0) {
      this._undoLayers = [...this._undoLayers, undoLayer];
      writePersistent(
        this.undoKey,
        this._undoLayers,
        new ArrayStringifier(Layer)
      );
    }
    this._redoLayers = [];
    writePersistent(this.redoKey, this._redoLayers, new ArrayStringifier(Layer));
    this._scratch = new Layer();
    this.notify();
  }

  undo() {
    if (this._undoLayers.length === 0) {
      return;
    }
    const [newLayer, redoLayer] = this.committed.apply(
      this._undoLayers.at(-1)
    );
    this._committed = newLayer;
    writePersistent(this.committedKey, this._committed, Layer);
    this._redoLayers = [...this._redoLayers, redoLayer];
    writePersistent(this.redoKey, this._redoLayers, new ArrayStringifier(Layer));
    this._undoLayers = this._undoLayers.slice(0, -1);
    writePersistent(this.undoKey, this._undoLayers, new ArrayStringifier(Layer));
    this.notify();
  }

  redo() {
    if (this._redoLayers.length === 0) {
      return;
    }
    const [newLayer, undoLayer] = this.committed.apply(
      this._redoLayers.at(-1)
    );
    this._committed = newLayer;
    writePersistent(this.committedKey, this._committed, Layer);
    this._undoLayers = [...this._undoLayers, undoLayer];
    writePersistent(this.undoKey, this._undoLayers, new ArrayStringifier(Layer));
    this._redoLayers = this._redoLayers.slice(0, -1);
    writePersistent(this.redoKey, this._redoLayers, new ArrayStringifier(Layer));
    this.notify();
  }
}
