/**
 * Holds the entire state of the diagram as a 2D array of cells
 * and provides methods to modify the current state.
 */
ascii.State = class {
  constructor() {
    /** @type {Array<Array<ascii.Cell>>} */
    this.cells = new Array(MAX_GRID_WIDTH);
    /** @type {!Array<ascii.MappedCell>} */
    this.scratchCells = [];
    /** @type {boolean} */
    this.dirty = true;

    /** @type {!Array<Array<ascii.MappedValue>>|!Iterable<Iterable<ascii.MappedValue>>} */
    this.undoStates = [];
    /** @type {!Array<Array<ascii.MappedValue>>|!Iterable<Iterable<ascii.MappedValue>>} */
    this.redoStates = [];

    for (var i = 0; i < this.cells.length; i++) {
      this.cells[i] = new Array(MAX_GRID_HEIGHT);
      for (var j = 0; j < this.cells[i].length; j++) {
        this.cells[i][j] = new ascii.Cell();
      }
    }
  }

  /**
   * This clears the entire state, but is undoable.
   */
  clear() {
    for (var i = 0; i < this.cells.length; i++) {
      for (var j = 0; j < this.cells[i].length; j++) {
        var position = new ascii.Vector(i, j);
        if (this.cells[i][j].getRawValue() != null) {
          this.drawValue(new ascii.Vector(i, j), ERASE_CHAR);
        }
      }
    }
    this.commitDraw();
  }

  /**
   * Returns the cell at the given coordinates.
   *
   * @param {ascii.Vector} vector
   * @return {ascii.Cell}
   */
  getCell(vector) {
    return this.cells[vector.x][vector.y];
  }

  /**
   * Sets the cells scratch (uncommitted) value at the given position.
   *
   * @param {ascii.Vector} position
   * @param {?string} value
   */
  drawValue(position, value) {
    var cell = this.getCell(position);
    this.scratchCells.push(new ascii.MappedCell(position, cell));
    cell.scratchValue = value;
    this.dirty = true;
  }

  /**
   * Sets the cells scratch (uncommitted) value at the given position
   * iff the value is different to what it already is.
   *
   * @param {ascii.Vector} position
   * @param {?string} value
   */
  drawValueIncremental(position, value) {
    if (this.getCell(position).getRawValue() != value) {
      this.drawValue(position, value);
    }
  }

  /**
   * Clears the current drawing scratchpad.
   */
  clearDraw() {
    for (var { cell } of this.scratchCells) {
      cell.scratchValue = null;
    }
    this.scratchCells.length = 0;
  }

  /**
   * Returns the draw value of a cell at the given position.
   *
   * @param {ascii.Vector} position
   * @return {?string}
   */
  getDrawValue(position) {
    var cell = this.getCell(position);
    var value = cell.scratchValue != null ? cell.scratchValue : cell.value;
    var isSpecial = SPECIAL_VALUES.indexOf(value) != -1;
    var isAltSpecial = ALT_SPECIAL_VALUES.indexOf(value) != -1;
    if (!isSpecial && !isAltSpecial) {
      return value;
    }

    // Because the underlying state only stores actual cell values and there is
    // no underlying representation of shapes, we do a lot of crazy logic here
    // to make diagrams display as expected.
    var context = this.getContext(position);

    if (isSpecial && context.left && context.right && !context.up && !context.down) {
      return SPECIAL_LINE_H;
    }
    if (isSpecial && !context.left && !context.right && context.up && context.down) {
      return SPECIAL_LINE_V;
    }
    if (context.sum() == 4) {
      return SPECIAL_LINE_H;
    }
    if (isAltSpecial && context.sum() == 3) {
      if (!context.left) {
        return SPECIAL_ARROW_LEFT;
      }
      if (!context.up) {
        return SPECIAL_ARROW_UP;
      }
      if (!context.down) {
        return SPECIAL_ARROW_DOWN;
      }
      if (!context.right) {
        return SPECIAL_ARROW_RIGHT;
      }
    }
    if ((isSpecial || isAltSpecial) && context.sum() == 3) {
      this.extendContext(position, context);
      if (!context.right && context.leftup && context.leftdown) {
        return SPECIAL_LINE_V;
      }
      if (!context.left && context.rightup && context.rightdown) {
        return SPECIAL_LINE_V;
      }
      if (!context.down && context.leftup && context.rightup) {
        return SPECIAL_LINE_H;
      }
      if (!context.up && context.rightdown && context.leftdown) {
        return SPECIAL_LINE_H;
      }
      var leftupempty = this.getCell(position.add(DIR_LEFT).add(DIR_UP)).isEmpty();
      var rightupempty = this.getCell(position.add(DIR_RIGHT).add(DIR_UP)).isEmpty();
      if (context.up && context.left && context.right && (!leftupempty || !rightupempty)) {
        return SPECIAL_LINE_H;
      }
      var leftdownempty = this.getCell(position.add(DIR_LEFT).add(DIR_DOWN)).isEmpty();
      var rightdownempty = this.getCell(position.add(DIR_RIGHT).add(DIR_DOWN)).isEmpty();
      if (context.down && context.left && context.right && (!leftdownempty || !rightdownempty)) {
        return SPECIAL_LINE_H;
      }
      return SPECIAL_VALUE;
    }

    if (isAltSpecial && context.sum() == 1) {
      if (context.left) {
        return SPECIAL_ARROW_RIGHT;
      }
      if (context.up) {
        return SPECIAL_ARROW_DOWN;
      }
      if (context.down) {
        return SPECIAL_ARROW_UP;
      }
      if (context.right) {
        return SPECIAL_ARROW_LEFT;
      }
    }
    return value;
  }

  /**
   * @param {ascii.Vector} position
   * @return {ascii.CellContext}
   */
  getContext(position) {
    var left = this.getCell(position.add(DIR_LEFT)).isSpecial();
    var right = this.getCell(position.add(DIR_RIGHT)).isSpecial();
    var up = this.getCell(position.add(DIR_UP)).isSpecial();
    var down = this.getCell(position.add(DIR_DOWN)).isSpecial();
    return new ascii.CellContext(left, right, up, down);
  }

  /**
   * @param {ascii.Vector} position
   * @param {ascii.CellContext} context
   */
  extendContext(position, context) {
    context.leftup = this.getCell(position.add(DIR_LEFT).add(DIR_UP)).isSpecial();
    context.rightup = this.getCell(position.add(DIR_RIGHT).add(DIR_UP)).isSpecial();
    context.leftdown = this.getCell(position.add(DIR_LEFT).add(DIR_DOWN)).isSpecial();
    context.rightdown = this.getCell(position.add(DIR_RIGHT).add(DIR_DOWN)).isSpecial();
  }

  /**
   * Ends the current draw, commiting anything currently drawn the scratchpad.
   * @param {boolean=} opt_undo
   */
  commitDraw(opt_undo) {
    var oldValues = [];

    // Dedupe the scratch values, or this causes havoc for history management.
    var positions = this.scratchCells.map(function(value) {
      return value.position.x.toString() + value.position.y.toString();
    });
    var scratchCellsUnique =
        this.scratchCells.filter(function(value, index, arr) {
      return positions.indexOf(positions[index]) == index;
    });

    this.scratchCells.length = 0;

    for (var { position, cell } of scratchCellsUnique) {

      // Push the effective old value unto the array.
      oldValues.push(new ascii.MappedValue(position,
          cell.value != null ? cell.value : ' '));

      var newValue = cell.getRawValue();
      if (newValue == ERASE_CHAR || newValue == ' ') {
        newValue = null;
      }
      // Let's store the actual drawed value, so behaviour matches what the user sees.
      if (cell.isSpecial()) {
        newValue = this.getDrawValue(position);
      }
      cell.scratchValue = null;
      cell.value = newValue;
    }

    var stateStack = opt_undo ? this.redoStates : this.undoStates;
    if (oldValues.length > 0) {
      // If we have too many states, clear one out.
      if (stateStack.length > MAX_UNDO) {
        stateStack.shift();
      }
      stateStack.push(oldValues);
    }
    this.dirty = true;
  }

  /**
   * Undoes the last committed state.
   */
  undo() {
    if (this.undoStates.length == 0) { return; }

    var lastState = this.undoStates.pop();
    for (var i in lastState) {
      var mappedValue = lastState[i];
      this.drawValue(mappedValue.position, mappedValue.value);
    }
    this.commitDraw(true);
  }

  /**
   * Redoes the last undone.
   */
  redo() {
    if (this.redoStates.length == 0) { return; }

    var lastState = this.redoStates.pop();
    for (var mappedValue of lastState) {
      this.drawValue(mappedValue.position, mappedValue.value);
    }
    this.commitDraw();
  }

  /**
   * Outputs the entire contents of the diagram as text.
   * @param {ascii.Box=} opt_box
   * @return {string}
   */
  outputText(opt_box) {
    // Find the first/last cells in the diagram so we don't output everything.
    var start = new ascii.Vector(Number.MAX_VALUE, Number.MAX_VALUE);
    var end = new ascii.Vector(-1, -1);

    if (!opt_box) {
      for (var i = 0; i < this.cells.length; i++) {
        for (var j = 0; j < this.cells[i].length; j++) {
          if (this.cells[i][j].getRawValue() != null) {
            if (i < start.x) { start.x = i; }
            if (j < start.y) { start.y = j; }
            if (i > end.x) { end.x = i; }
            if (j > end.y) { end.y = j; }
          }
        }
      }
      if (end.x < 0) { return '' }
    } else {
      start = opt_box.topLeft();
      end = opt_box.bottomRight();
    }

    var output = '';
    for (var j = start.y; j <= end.y; j++) {
      var line = '';
      for (var i = start.x; i <= end.x; i++) {
        var val = this.getDrawValue(new ascii.Vector(i, j));
        line += (val == null || val == ERASE_CHAR) ? ' ' : val;
      }
      // Trim end whitespace.
      output += line.replace(/\s+$/, '') + '\n';
    }
    return output;
  }

  /**
   * Loads the given text into the diagram starting at the given offset (centered).
   * @param {string} value
   * @param {ascii.Vector} offset
   */
  fromText(value, offset) {
    var lines = value.split('\n');
    var middle = new ascii.Vector(0, Math.round(lines.length / 2));
    for (var j = 0; j < lines.length; j++) {
      middle.x = Math.max(middle.x, Math.round(lines[j].length / 2));
    }
    for (var j = 0; j < lines.length; j++) {
      var line = lines[j];
      for (var i = 0; i < line.length; i++) {
        var char = line.charAt(i);
        // Convert special output back to special chars.
        // TODO: This is a horrible hack, need to handle multiple special chars
        // correctly and preserve them through line drawing etc.
        if (SPECIAL_VALUES.indexOf(char)  != -1) {
          char = SPECIAL_VALUE;
        }
        if (ALT_SPECIAL_VALUES.indexOf(char) != -1) {
          char = ALT_SPECIAL_VALUE;
        }
        this.drawValue(new ascii.Vector(i, j).add(offset).subtract(middle), char);
      }
    }
  }
}
