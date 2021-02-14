import { Box, CellContext } from "asciiflow/client/common";
import * as constants from "asciiflow/client/constants";
import { Layer, LayerView } from "asciiflow/client/layer";
import { DrawingId, store } from "asciiflow/client/store";
import {
  ArrayStringifier,
  Persistent,
} from "asciiflow/client/store/persistent";
import { IVector, Vector } from "asciiflow/client/vector";
import { action, observable } from "mobx";
import { Characters } from "asciiflow/client/constants";
import { DrawingStringifier } from "asciiflow/client/store/drawing_stringifier";

/**
 * Holds the entire state of the diagram as a 2D array of cells
 * and provides methods to modify the current state.
 */
export class CanvasStore {
  constructor(public readonly drawingId: DrawingId) {}

  public persistentKey(...values: string[]) {
    return Persistent.key("drawing", this.drawingId.persistentKey, ...values);
  }

  private _zoom = Persistent.json(this.persistentKey("zoom"), 1);

  public get zoom() {
    return this._zoom.get();
  }

  @action.bound public setZoom(value: number) {
    this._zoom.set(value);
  }

  private _offset = Persistent.json<IVector>(this.persistentKey("offset"), {
    x: (constants.MAX_GRID_WIDTH * constants.CHAR_PIXELS_H) / 2,
    y: (constants.MAX_GRID_HEIGHT * constants.CHAR_PIXELS_V) / 2,
  });

  public get offset() {
    return new Vector(this._offset.get().x, this._offset.get().y);
  }

  @action.bound public setOffset(value: Vector) {
    this._offset.set({
      x: value.x,
      y: value.y,
    });
  }

  @observable public persistentCommitted = Persistent.custom(
    this.persistentKey("committed-layer"),
    this.drawingId.shareSpec
      ? new DrawingStringifier().deserialize(this.drawingId.shareSpec).layer
      : new Layer(),
    Layer
  );
  @observable public scratch = new Layer();

  @observable public selection: Box;

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

  @observable public undoLayers = Persistent.custom(
    this.persistentKey("undo-layers"),
    [],
    new ArrayStringifier(Layer)
  );

  @observable public redoLayers = Persistent.custom(
    this.persistentKey("redo-layers"),
    [],
    new ArrayStringifier(Layer)
  );

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
  getDrawValue(position: Vector) {
    const characterSet = store.characters;

    const combined = this.combined;
    const value = combined.get(position);
    const isLine = Characters.isLine(value);
    const isArrow = Characters.isArrow(value);

    function inText(textPosition: Vector) {
      return (
        (combined.get(textPosition.left()) &&
          !constants.isSpecial(combined.get(textPosition.left()))) ||
        (combined.get(textPosition.right()) &&
          !constants.isSpecial(combined.get(textPosition.right())))
      );
    }

    if (isArrow) {
      // In some situations, we can be certain about arrow orientation.
      const context = combined.context(position);

      if (context.sum() === 1) {
        if (context.up) {
          return characterSet.arrowDown;
        }
        if (context.down) {
          return characterSet.arrowUp;
        }
        if (context.left) {
          return characterSet.arrowRight;
        }
        if (context.right) {
          return characterSet.arrowLeft;
        }
      }

      if (context.sum() === 2) {
        if (
          context.left &&
          context.right &&
          !context.rightup &&
          !context.rightdown
        ) {
          return characterSet.arrowLeft;
        }
        if (
          context.left &&
          context.right &&
          !context.leftup &&
          !context.leftdown
        ) {
          return characterSet.arrowRight;
        }
        if (context.up && context.down && !context.leftup && !context.rightup) {
          return characterSet.arrowDown;
        }
        if (
          context.up &&
          context.down &&
          !context.leftdown &&
          !context.rightdown
        ) {
          return characterSet.arrowUp;
        }
      }

      if (context.sum() === 3) {
        if (!context.up) {
          return characterSet.arrowUp;
        }
        if (!context.down) {
          return characterSet.arrowDown;
        }
        if (!context.left) {
          return characterSet.arrowLeft;
        }
        if (!context.right) {
          return characterSet.arrowRight;
        }
      }
      // Otherwise, leave arrows as is, but convert them between character sets.
      if (
        value === constants.UNICODE.arrowUp ||
        value === constants.ASCII.arrowUp
      ) {
        return characterSet.arrowUp;
      }
      // Only convert v's to unicode if we are sure they are not part of text.
      if (
        (value === constants.UNICODE.arrowDown ||
          value === constants.ASCII.arrowDown) &&
        context.sum() > 0 &&
        !inText(position)
      ) {
        return characterSet.arrowDown;
      }
      if (
        (value === constants.UNICODE.arrowLeft ||
          value === constants.ASCII.arrowLeft) &&
        context.sum() > 0 &&
        !inText(position)
      ) {
        return characterSet.arrowLeft;
      }
      if (
        value === constants.UNICODE.arrowRight ||
        value === constants.ASCII.arrowRight
      ) {
        return characterSet.arrowRight;
      }
    }

    if (isLine) {
      const context = combined.context(position);

      // Terminating character in a line.
      if (context.sum() === 1) {
        if (context.left || context.right) {
          return characterSet.lineHorizontal;
        }
        if (context.up || context.down) {
          return characterSet.lineVertical;
        }
      }
      // Line sections or corners.
      if (context.sum() === 2) {
        if (context.left && context.right) {
          return characterSet.lineHorizontal;
        }
        if (context.up && context.down) {
          return characterSet.lineVertical;
        }
        if (context.right && context.down) {
          return characterSet.cornerTopLeft;
        }
        if (context.left && context.down) {
          return characterSet.cornerTopRight;
        }
        if (context.right && context.up) {
          return characterSet.cornerBottomLeft;
        }
        if (context.left && context.up) {
          return characterSet.cornerBottomRight;
        }
      }

      // Three way junctions.
      if (context.sum() === 3) {
        if (!context.right && context.leftup && context.leftdown) {
          return characterSet.lineVertical;
        }
        if (!context.left && context.rightup && context.rightdown) {
          return characterSet.lineVertical;
        }
        if (!context.down && context.leftup && context.rightup) {
          return characterSet.lineHorizontal;
        }
        if (!context.up && context.rightdown && context.leftdown) {
          return characterSet.lineHorizontal;
        }

        if (
          context.up &&
          context.left &&
          context.right &&
          context.leftup &&
          context.rightup
        ) {
          return characterSet.lineHorizontal;
        }
        if (
          context.down &&
          context.left &&
          context.right &&
          context.leftdown &&
          context.rightdown
        ) {
          return characterSet.lineHorizontal;
        }
        // Special cases here are to not put junctions when there is
        // an adjacent connection arrow that doesn't embed into the line.
        if (context.left && context.right && context.down) {
          const down = combined.get(position.down());
          if (down === constants.UNICODE.arrowUp) {
            return characterSet.lineHorizontal;
          }
          return characterSet.junctionDown;
        }
        if (context.left && context.right && context.up) {
          const up = combined.get(position.up());
          if (up === constants.UNICODE.arrowDown) {
            return characterSet.lineHorizontal;
          }
          return characterSet.junctionUp;
        }
        if (context.left && context.up && context.down) {
          const left = combined.get(position.left());
          if (left === constants.UNICODE.arrowRight) {
            return characterSet.lineVertical;
          }
          return characterSet.junctionLeft;
        }
        if (context.up && context.right && context.down) {
          const right = combined.get(position.right());
          if (right === constants.UNICODE.arrowLeft) {
            return characterSet.lineVertical;
          }
          return characterSet.junctionRight;
        }
        return constants.SPECIAL_VALUE;
      }

      // Four way junctions.
      if (context.sum() === 4) {
        if (
          Characters.isArrow(combined.get(position.up())) &&
          Characters.isArrow(combined.get(position.down()))
        ) {
          return characterSet.lineHorizontal;
        }
        if (
          Characters.isArrow(combined.get(position.left())) &&
          Characters.isArrow(combined.get(position.right()))
        ) {
          return characterSet.lineVertical;
        }
        return characterSet.junctionAll;
      }
    }

    return value;
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

  outputText(box?: Box) {
    if (this.committed.entries().length === 0) {
      return "";
    }
    if (!box) {
      // Find the first/last cells in the diagram so we don't output everything.
      const start = new Vector(
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER
      );
      const end = new Vector(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

      this.committed.entries().forEach(([position, _]) => {
        start.x = Math.min(start.x, position.x);
        start.y = Math.min(start.y, position.y);
        end.x = Math.max(end.x, position.x);
        end.y = Math.max(end.y, position.y);
      });
      box = new Box(start, end);
    }

    let output = "";
    const topLeft = box.topLeft();
    const bottomRight = box.bottomRight();
    for (let j = topLeft.y; j <= bottomRight.y; j++) {
      let line = "";
      for (let i = topLeft.x; i <= bottomRight.x; i++) {
        const val = this.getDrawValue(new Vector(i, j));
        line += val == null ? " " : val;
      }
      // Trim end whitespace.
      output += line.replace(/\s+$/, "") + "\n";
    }
    return output;
  }

  /**
   * Loads the given text into the diagram starting at the given offset (centered).
   */
  fromText(value: string, offset: Vector) {
    const tempLayer = new Layer();
    const lines = value.split("\n");
    const middle = new Vector(0, Math.round(lines.length / 2));
    for (let j = 0; j < lines.length; j++) {
      middle.x = Math.max(middle.x, Math.round(lines[j].length / 2));
    }
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      for (let i = 0; i < line.length; i++) {
        let char = line.charAt(i);
        // Convert special output back to special chars.
        // TODO: This is a horrible hack, need to handle multiple special chars
        // correctly and preserve them through line drawing etc.
        if (constants.SPECIAL_VALUES.includes(char)) {
          char = constants.SPECIAL_VALUE;
        }
        tempLayer.set(new Vector(i, j).add(offset).subtract(middle), char);
      }
    }
    this.setScratchLayer(tempLayer);
    this.commitScratch();
  }
}
