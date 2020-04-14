import { Vector } from "asciiflow/client/vector";
import {
  Cell,
  MappedValue,
  MappedCell,
  CellContext,
  Box,
} from "asciiflow/client/common";
import * as constants from "asciiflow/client/constants";
import { observable, action, computed } from "mobx";
import { store } from "asciiflow/client/store";

/**
 * Holds the entire state of the diagram as a 2D array of cells
 * and provides methods to modify the current state.
 */
export class CanvasStore {
  private cells: Cell[][] = new Array(constants.MAX_GRID_WIDTH);
  public scratchCells: MappedCell[] = [];
  public undoStates: MappedValue[][] = [];
  public redoStates: MappedValue[][] = [];

  @observable public dirty = 0;

  public getCells() {
    // Instead of keeping track of every tiny single cell change, we instead just track a dirty counter.
    // tslint:disable-next-line: no-unused-expression
    this.dirty;
    return this.cells;
  }

  constructor() {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = new Array(constants.MAX_GRID_HEIGHT);
      for (let j = 0; j < this.cells[i].length; j++) {
        this.cells[i][j] = new Cell();
      }
    }
  }

  @action.bound apply() {
    this.dirty = (this.dirty + 1) % Number.MAX_SAFE_INTEGER;
  }

  /**
   * This clears the entire state, but is undoable.
   */
  @action.bound clear() {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        if (this.cells[i][j].getRawValue() != null) {
          this.drawValue(new Vector(i, j), constants.ERASE_CHAR);
        }
      }
    }
    this.commitDraw();
  }

  /**
   * Returns the cell at the given coordinates.
   */
  getCell(vector: Vector) {
    return this.cells[vector.x][vector.y];
  }

  /**
   * Sets the cells scratch (uncommitted) value at the given position.
   */
  drawValue(position: Vector, value: string) {
    const cell = this.getCell(position);
    this.scratchCells.push(new MappedCell(position, cell));
    cell.scratchValue = value;
  }

  /**
   * Sets the cells scratch (uncommitted) value at the given position
   * iff the value is different to what it already is.
   */
  drawValueIncremental(position: Vector, value: string) {
    if (this.getCell(position).getRawValue() != value) {
      this.drawValue(position, value);
    }
  }

  /**
   * Clears the current drawing scratchpad.
   */
  clearDraw() {
    for (const { cell } of this.scratchCells) {
      cell.scratchValue = null;
    }
    this.scratchCells.length = 0;
  }

  /**
   * Returns the draw value of a cell at the given position.
   */
  getDrawValue(position: Vector) {
    const characterSet = store.unicode.value
      ? constants.UNICODE
      : constants.ASCII;

    const cell = this.getCell(position);
    const value = cell.scratchValue != null ? cell.scratchValue : cell.value;
    const isSpecial = constants.SPECIAL_VALUES.includes(value);
    const isAltSpecial = constants.ALT_SPECIAL_VALUES.includes(value);
    if (!isSpecial && !isAltSpecial) {
      return value;
    }

    // Because the underlying state only stores actual cell values and there is
    // no underlying representation of shapes, we do a lot of crazy logic here
    // to make diagrams display as expected.
    const context = this.getContext(position);

    if (
      isSpecial &&
      context.left &&
      context.right &&
      !context.up &&
      !context.down
    ) {
      return characterSet.lineHorizontal;
    }
    if (
      isSpecial &&
      !context.left &&
      !context.right &&
      context.up &&
      context.down
    ) {
      return characterSet.lineVertical;
    }
    if (context.sum() == 4) {
      return characterSet.junctionAll;
    }
    if (isAltSpecial && context.sum() == 3) {
      if (!context.left) {
        return characterSet.arrowLeft;
      }
      if (!context.up) {
        return characterSet.arrowDown;
      }
      if (!context.down) {
        return characterSet.arrowDown;
      }
      if (!context.right) {
        return characterSet.arrowRight;
      }
    }
    if ((isSpecial || isAltSpecial) && context.sum() == 3) {
      this.extendContext(position, context);
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
      const leftupempty = this.getCell(position.left().up()).isEmpty();
      const rightupempty = this.getCell(position.right().up()).isEmpty();
      if (
        context.up &&
        context.left &&
        context.right &&
        (!leftupempty || !rightupempty)
      ) {
        return characterSet.lineHorizontal;
      }
      const leftdownempty = this.getCell(position.left().down()).isEmpty();
      const rightdownempty = this.getCell(position.right().down()).isEmpty();
      if (
        context.down &&
        context.left &&
        context.right &&
        (!leftdownempty || !rightdownempty)
      ) {
        return characterSet.lineHorizontal;
      }
      if (context.left && context.right && context.down) {
        return characterSet.junctionDown;
      }
      if (context.left && context.right && context.up) {
        return characterSet.junctionUp;
      }
      if (context.left && context.up && context.down) {
        return characterSet.junctionLeft;
      }
      if (context.up && context.right && context.down) {
        return characterSet.junctionRight;
      }
      return constants.SPECIAL_VALUE;
    }

    if (isAltSpecial && context.sum() == 1) {
      if (context.left) {
        return characterSet.arrowRight;
      }
      if (context.up) {
        return characterSet.arrowDown;
      }
      if (context.down) {
        return characterSet.arrowUp;
      }
      if (context.right) {
        return characterSet.arrowLeft;
      }
    }

    if (isSpecial && context.sum() === 2) {
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
      if (context.left && context.right) {
        return characterSet.lineHorizontal;
      }
      if (context.up && context.down) {
        return characterSet.lineVertical;
      }
    }
    return value;
  }

  getContext(position: Vector) {
    const left = this.getCell(position.left()).isSpecial();
    const right = this.getCell(position.right()).isSpecial();
    const up = this.getCell(position.up()).isSpecial();
    const down = this.getCell(position.down()).isSpecial();
    return new CellContext(left, right, up, down);
  }

  extendContext(position: Vector, context: CellContext) {
    context.leftup = this.getCell(position.left().up()).isSpecial();
    context.rightup = this.getCell(position.right().up()).isSpecial();
    context.leftdown = this.getCell(position.left().down()).isSpecial();
    context.rightdown = this.getCell(position.right().down()).isSpecial();
  }

  /**
   * Ends the current draw, commiting anything currently drawn the scratchpad.
   */
  @action.bound commitDraw(opt_undo = false) {
    const oldValues = [];

    // Dedupe the scratch values, or this causes havoc for history management.
    const positions = this.scratchCells.map((value) => {
      return value.position.x.toString() + value.position.y.toString();
    });
    const scratchCellsUnique = this.scratchCells.filter((value, index, arr) => {
      return positions.indexOf(positions[index]) == index;
    });

    this.scratchCells.length = 0;

    for (const { position, cell } of scratchCellsUnique) {
      // Push the effective old value unto the array.
      oldValues.push(
        new MappedValue(position, cell.value != null ? cell.value : " ")
      );

      let newValue = cell.getRawValue();
      if (newValue == constants.ERASE_CHAR || newValue == " ") {
        newValue = null;
      }
      // Let's store the actual drawed value, so behaviour matches what the user sees.
      if (cell.isSpecial()) {
        newValue = this.getDrawValue(position);
      }
      cell.scratchValue = null;
      cell.value = newValue;
    }

    const stateStack = opt_undo ? this.redoStates : this.undoStates;
    if (oldValues.length > 0) {
      // If we have too many states, clear one out.
      if (stateStack.length > constants.MAX_UNDO) {
        stateStack.shift();
      }
      stateStack.push(oldValues);
    }
    this.apply();
  }

  /**
   * Undoes the last committed state.
   */
  @action.bound undo() {
    if (this.undoStates.length == 0) {
      return;
    }

    const lastState = this.undoStates.pop();
    for (const { position, value } of lastState) {
      this.drawValue(position, value);
    }
    this.commitDraw(true);
  }

  /**
   * Redoes the last undone.
   */
  @action.bound redo() {
    if (this.redoStates.length == 0) {
      return;
    }

    const lastState = this.redoStates.pop();
    for (const { position, value } of lastState) {
      this.drawValue(position, value);
    }
    this.commitDraw();
  }

  /**
   * Outputs the entire contents of the diagram as text.
   * @param {Box=} opt_box
   * @return {string}
   */
  outputText(opt_box?: Box) {
    // Find the first/last cells in the diagram so we don't output everything.
    let start = new Vector(Number.MAX_VALUE, Number.MAX_VALUE);
    let end = new Vector(-1, -1);

    if (!opt_box) {
      for (let i = 0; i < this.cells.length; i++) {
        for (let j = 0; j < this.cells[i].length; j++) {
          if (this.cells[i][j].getRawValue() != null) {
            if (i < start.x) {
              start.x = i;
            }
            if (j < start.y) {
              start.y = j;
            }
            if (i > end.x) {
              end.x = i;
            }
            if (j > end.y) {
              end.y = j;
            }
          }
        }
      }
      if (end.x < 0) {
        return "";
      }
    } else {
      start = opt_box.topLeft();
      end = opt_box.bottomRight();
    }

    let output = "";
    for (let j = start.y; j <= end.y; j++) {
      let line = "";
      for (let i = start.x; i <= end.x; i++) {
        const val = this.getDrawValue(new Vector(i, j));
        line += val == null || val == constants.ERASE_CHAR ? " " : val;
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
        this.drawValue(new Vector(i, j).add(offset).subtract(middle), char);
      }
    }
  }
}
