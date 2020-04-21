import { Box, ExtendedCellContext } from "asciiflow/client/common";
import * as constants from "asciiflow/client/constants";
import { Layer, LayerView } from "asciiflow/client/layer";
import { store } from "asciiflow/client/store";
import { Persistent } from "asciiflow/client/store/persistent";
import { Vector } from "asciiflow/client/vector";
import { action, observable } from "mobx";
import { Characters } from "asciiflow/client/constants";

/**
 * Holds the entire state of the diagram as a 2D array of cells
 * and provides methods to modify the current state.
 */
export class CanvasStore {
  @observable public persistentCommitted = Persistent.custom(
    "layer",
    new Layer(),
    Layer
  );
  @observable public scratch = new Layer();

  get committed() {
    return this.persistentCommitted.get();
  }

  set committed(value: Layer) {
    this.persistentCommitted.set(value);
  }

  get combined() {
    return new LayerView([this.committed, this.scratch]);
  }

  @observable public undoLayers: Layer[] = [];
  @observable public redoLayers: Layer[] = [];

  @action.bound setScratchLayer(layer: Layer) {
    this.scratch = layer;
  }

  /**
   * This clears the entire state, but is undoable.
   */
  @action.bound clear() {
    this.undoLayers.push(this.committed);
    this.persistentCommitted.set(new Layer());
    this.redoLayers = [];
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

    if (isArrow) {
      // Leave arrows as is, but convert them between character sets.
      if (
        value === constants.UNICODE.arrowUp ||
        value === constants.ASCII.arrowUp
      ) {
        return characterSet.arrowUp;
      }
      if (
        value === constants.UNICODE.arrowDown ||
        value === constants.ASCII.arrowDown
      ) {
        return characterSet.arrowDown;
      }
      if (
        value === constants.UNICODE.arrowLeft ||
        value === constants.ASCII.arrowLeft
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
        const leftupempty = !!combined.get(position.left().up());
        const rightupempty = !!combined.get(position.right().up());
        if (
          context.up &&
          context.left &&
          context.right &&
          (!leftupempty || !rightupempty)
        ) {
          return characterSet.lineHorizontal;
        }
        const leftdownempty = !!combined.get(position.left().down());
        const rightdownempty = !!combined.get(position.right().down());
        if (
          context.down &&
          context.left &&
          context.right &&
          (!leftdownempty || !rightdownempty)
        ) {
          return characterSet.lineHorizontal;
        }
        // Special cases here are to not put junctions when there is
        // an adjacent connection arrow that doesn't embed into the line.
        if (context.left && context.right && context.down) {
          if (Characters.isArrow(combined.get(position.down()))) {
            return characterSet.lineHorizontal;
          }
          return characterSet.junctionDown;
        }
        if (context.left && context.right && context.up) {
          if (Characters.isArrow(combined.get(position.up()))) {
            return characterSet.lineHorizontal;
          }
          return characterSet.junctionUp;
        }
        if (context.left && context.up && context.down) {
          if (Characters.isArrow(combined.get(position.left()))) {
            return characterSet.lineVertical;
          }
          return characterSet.junctionLeft;
        }
        if (context.up && context.right && context.down) {
          if (Characters.isArrow(combined.get(position.right()))) {
            return characterSet.lineVertical;
          }
          return characterSet.junctionRight;
        }
        return constants.SPECIAL_VALUE;
      }

      // Four way junctions.
      if (context.sum() === 4) {
        return characterSet.junctionAll;
      }
    }

    return value;
  }

  /**
   * Ends the current draw, commiting anything currently drawn the scratchpad.
   */
  @action.bound commitScratch() {
    const [newLayer, undoLayer] = this.committed.apply(this.scratch);
    this.committed = newLayer;
    this.undoLayers.push(undoLayer);
    // If you commit something new, delete the redo stack.
    this.redoLayers = [];
    this.scratch = new Layer();
  }

  /**
   * Undoes the last committed state.
   */
  @action.bound undo() {
    if (this.undoLayers.length === 0) {
      return;
    }
    const [newLayer, redoLayer] = this.committed.apply(this.undoLayers.pop());
    this.committed = newLayer;
    this.redoLayers.push(redoLayer);
  }

  /**
   * Redoes the last undone.
   */
  @action.bound redo() {
    if (this.redoLayers.length === 0) {
      return;
    }
    const [newLayer, undoLayer] = this.committed.apply(this.redoLayers.pop());
    this.committed = newLayer;
    this.undoLayers.push(undoLayer);
  }

  outputText(box?: Box) {
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
    for (let j = box.startY; j <= box.endY; j++) {
      let line = "";
      for (let i = box.startX; i <= box.endX; i++) {
        const val = this.getDrawValue(new Vector(i, j));
        line += val == null || val === constants.ERASE_CHAR ? " " : val;
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
