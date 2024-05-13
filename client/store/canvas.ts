import { Box, CellContext } from "#asciiflow/client/common";
import * as constants from "#asciiflow/client/constants";
import { Layer, LayerView } from "#asciiflow/client/layer";
import { DrawingId, store } from "#asciiflow/client/store";
import { Persistent } from "#asciiflow/client/store/persistent";
import { ArrayStringifier } from "#asciiflow/client/store/stringifiers";
import { IVector, Vector } from "#asciiflow/client/vector";
import { action, makeAutoObservable, observable } from "mobx";
import { Characters } from "#asciiflow/client/constants";
import { DrawingStringifier } from "#asciiflow/client/store/drawing_stringifier";


/**
 * Holds the entire state of the diagram as a 2D array of cells
 * and provides methods to modify the current state.
 */
export class CanvasStore {
  public readonly persistentCommitted: Persistent<Layer>;
  public readonly undoLayers: Persistent<Layer[]>;
  public readonly redoLayers: Persistent<Layer[]>;
  private _zoom: Persistent<number>;
  private _offset: Persistent<IVector>;

  constructor(public readonly drawingId: DrawingId) {
    this.persistentCommitted = Persistent.custom(
      this.persistentKey("committed-layer"),
      this.drawingId.shareSpec
        ? new DrawingStringifier().deserialize(this.drawingId.shareSpec).layer
        : new Layer(),
      Layer
    );
    this.undoLayers = Persistent.custom(
      this.persistentKey("undo-layers"),
      [],
      new ArrayStringifier(Layer)
    );
    this.redoLayers = Persistent.custom(
      this.persistentKey("redo-layers"),
      [],
      new ArrayStringifier(Layer)
    );
    this._zoom = Persistent.json(this.persistentKey("zoom"), 1);
    this._offset = Persistent.json<IVector>(this.persistentKey("offset"), {
      x: (constants.MAX_GRID_WIDTH * constants.CHAR_PIXELS_H) / 2,
      y: (constants.MAX_GRID_HEIGHT * constants.CHAR_PIXELS_V) / 2,
    })
  }

  public persistentKey(...values: string[]) {
    return Persistent.key("drawing", this.drawingId.persistentKey, ...values);
  }

  public get zoom() {
    return this._zoom.get();
  }

  @action.bound public setZoom(value: number) {
    this._zoom.set(value);
  }

  public get offset() {
    return new Vector(this._offset.get().x, this._offset.get().y);
  }

  @action.bound public setOffset(value: Vector) {
    this._offset.set({
      x: value.x,
      y: value.y,
    });
  }

  @observable accessor scratch = new Layer();

  @observable accessor selection: Box;

  get committed() {
    return this.persistentCommitted.get();
  }

  set committed(value: Layer) {
    this.persistentCommitted.set(value);
  }

  get combined() {
    return new LayerView([this.committed, this.scratch]);
  }

  get shareSpec() {
    return new DrawingStringifier().serialize({
      name: this.drawingId.localId,
      layer: this.committed,
    });
  }

  @action.bound setSelection(box: Box) {
    this.selection = box;
  }

  clearSelection() {
    this.setSelection(null);
  }

  @action.bound setScratchLayer(layer: Layer) {
    this.scratch = layer;
  }

  /**
   * This clears the entire state, but is undoable.
   */
  @action.bound clear() {
    this.undoLayers.get().push(this.committed);
    this.undoLayers.sync();
    this.persistentCommitted.set(new Layer());
    this.redoLayers.set([]);
  }

  /**
   * Clears the current drawing scratchpad.
   */
  clearScratch() {
    this.scratch = new Layer();
  }

  /**
   * Returns the draw value of a cell at the given position.
   */

  get rendered() {
    return this.combined;
  }

  /**
   * Ends the current draw, commiting anything currently drawn on the scratch layer.
   */
  @action.bound commitScratch() {
    const [newLayer, undoLayer] = this.committed.apply(this.scratch);
    this.committed = newLayer;
    if (undoLayer.size() > 0) {
      // Don't push a no-op to the undo stack.
      this.undoLayers.get().push(undoLayer);
      this.undoLayers.sync();
    }
    // If you commit something new, delete the redo stack.
    this.redoLayers.set([]);
    this.scratch = new Layer();
  }

  /**
   * Undoes the last committed state.
   */
  @action.bound undo() {
    if (this.undoLayers.get().length === 0) {
      return;
    }
    const [newLayer, redoLayer] = this.committed.apply(
      this.undoLayers.get().pop()
    );
    this.committed = newLayer;
    this.redoLayers.get().push(redoLayer);
    this.undoLayers.sync();
    this.redoLayers.sync();
  }

  /**
   * Redoes the last undone.
   */
  @action.bound redo() {
    if (this.redoLayers.get().length === 0) {
      return;
    }
    const [newLayer, undoLayer] = this.committed.apply(
      this.redoLayers.get().pop()
    );
    this.committed = newLayer;
    this.undoLayers.get().push(undoLayer);
    this.undoLayers.sync();
    this.redoLayers.sync();
  }
}
