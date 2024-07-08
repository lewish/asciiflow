import { Box } from "#asciiflow/client/common";
import * as constants from "#asciiflow/client/constants";
import { Layer, LayerView } from "#asciiflow/client/layer";
import { DrawingId } from "#asciiflow/client/store";
import { DrawingStringifier } from "#asciiflow/client/store/drawing_stringifier";
import { Persistent } from "#asciiflow/client/store/persistent";
import { ArrayStringifier } from "#asciiflow/client/store/stringifiers";
import { IVector, Vector } from "#asciiflow/client/vector";
import {
  WatchableAdapter,
  watchableAdapter,
  watchableValue,
} from "#asciiflow/common/watchable";

/**
 * Holds the entire state of the diagram as a 2D array of cells
 * and provides methods to modify the current state.
 */
export class CanvasStore {
  public readonly persistentCommitted: WatchableAdapter<Layer>;
  public readonly undoLayers: WatchableAdapter<Layer[]>;
  public readonly redoLayers: WatchableAdapter<Layer[]>;
  private _zoom: WatchableAdapter<number>;
  private _offset: WatchableAdapter<IVector>;

  constructor(public readonly drawingId: DrawingId) {
    this.persistentCommitted = watchableAdapter(
      Persistent.custom(
        this.persistentKey("committed-layer"),
        this.drawingId.shareSpec
          ? new DrawingStringifier().deserialize(this.drawingId.shareSpec).layer
          : new Layer(),
        Layer
      )
    );
    this.undoLayers = watchableAdapter(
      Persistent.custom(
        this.persistentKey("undo-layers"),
        [],
        new ArrayStringifier(Layer)
      )
    );
    this.redoLayers = watchableAdapter(
      Persistent.custom(
        this.persistentKey("redo-layers"),
        [],
        new ArrayStringifier(Layer)
      )
    );
    this._zoom = watchableAdapter(
      Persistent.json(this.persistentKey("zoom"), 1)
    );
    this._offset = watchableAdapter(
      Persistent.json<IVector>(this.persistentKey("offset"), {
        x: (constants.MAX_GRID_WIDTH * constants.CHAR_PIXELS_H) / 2,
        y: (constants.MAX_GRID_HEIGHT * constants.CHAR_PIXELS_V) / 2,
      })
    );
  }

  public persistentKey(...values: string[]) {
    return Persistent.key("drawing", this.drawingId.persistentKey, ...values);
  }

  public get zoom() {
    return this._zoom.get();
  }

  public setZoom(value: number) {
    this._zoom.set(value);
  }

  public get offset() {
    return new Vector(this._offset.get().x, this._offset.get().y);
  }

  public setOffset(value: Vector) {
    this._offset.set({
      x: value.x,
      y: value.y,
    });
  }

  public readonly scratch = watchableValue(new Layer());

  public readonly selection = watchableValue<Box>(undefined);

  get committed() {
    return this.persistentCommitted.get();
  }

  set committed(value: Layer) {
    this.persistentCommitted.set(value);
  }

  get combined() {
    return new LayerView([this.committed, this.scratch.get()]);
  }

  get shareSpec() {
    return new DrawingStringifier().serialize({
      name: this.drawingId.localId,
      layer: this.committed,
    });
  }

  setSelection(box: Box) {
    this.selection.set(box);
  }

  clearSelection() {
    this.setSelection(null);
  }

  setScratchLayer(layer: Layer) {
    this.scratch.set(layer);
  }

  /**
   * This clears the entire state, but is undoable.
   */
  clear() {
    this.undoLayers.set([...this.undoLayers.get(), this.committed]);
    this.persistentCommitted.set(new Layer());
    this.redoLayers.set([]);
  }

  /**
   * Clears the current drawing scratchpad.
   */
  clearScratch() {
    this.scratch.set(new Layer());
  }

  /**
   * Ends the current draw, commiting anything currently drawn on the scratch layer.
   */
  commitScratch() {
    const [newLayer, undoLayer] = this.committed.apply(this.scratch.get());
    this.committed = newLayer;
    if (undoLayer.size() > 0) {
      // Don't push a no-op to the undo stack.
      this.undoLayers.set([...this.undoLayers.get(), undoLayer]);
    }
    // If you commit something new, delete the redo stack.
    this.redoLayers.set([]);
    this.scratch.set(new Layer());
  }

  /**
   * Undoes the last committed state.
   */
  undo() {
    if (this.undoLayers.get().length === 0) {
      return;
    }
    const [newLayer, redoLayer] = this.committed.apply(
      this.undoLayers.get().at(-1)
    );
    this.committed = newLayer;
    this.redoLayers.set([...this.redoLayers.get(), redoLayer]);
    this.undoLayers.set(this.undoLayers.get().slice(0, -1));
  }

  /**
   * Redoes the last undone.
   */
  redo() {
    if (this.redoLayers.get().length === 0) {
      return;
    }
    const [newLayer, undoLayer] = this.committed.apply(
      this.redoLayers.get().at(-1)
    );
    this.committed = newLayer;
    this.undoLayers.set([...this.undoLayers.get(), undoLayer]);
    this.redoLayers.set(this.redoLayers.get().slice(0, -1));
  }
}
