/**
 * Holds the entire state of the diagram as a 2D array of cells
 * and provides methods to modify the current state.
 *
 * @constructor
 */
ascii.State = function() {
  /** @type {Array.<Array.<ascii.Cell>>} */
  this.cells = new Array(MAX_GRID_WIDTH);
  /** @type {Array.<ascii.MappedCell>} */
  this.scratchCells = new Array();
  /** @type {boolean} */
  this.dirty = true;

  /** @type {Array.<Array.<ascii.MappedValue>>} */
  this.undoStates = new Array();
  /** @type {Array.<Array.<ascii.MappedValue>>} */
  this.redoStates = new Array();

  for (var i = 0; i < this.cells.length; i++) {
    this.cells[i] = new Array(MAX_GRID_HEIGHT);
    for (var j = 0; j < this.cells[i].length; j++) {
      this.cells[i][j] = new ascii.Cell();
    }
  }
};

/**
 * This clears the entire state, but is undoable.
 */
ascii.State.prototype.clear = function() {
  for (var i = 0; i < this.cells.length; i++) {
    for (var j = 0; j < this.cells[i].length; j++) {
      var position = new ascii.Vector(i, j);
      if (this.cells[i][j].getRawValue() != null) {
        this.drawValue(new ascii.Vector(i, j), ERASE_CHAR);
      }
    }
  }
  this.commitDraw();
};

/**
 * Returns the cell at the given coordinates.
 *
 * @param {ascii.Vector} vector
 * @return {ascii.Cell}
 */
ascii.State.prototype.getCell = function(vector) {
  return this.cells[vector.x][vector.y];
};

/**
 * Sets the cells scratch (uncommitted) value at the given position.
 *
 * @param {ascii.Vector} position
 * @param {?string} value
 */
ascii.State.prototype.drawValue = function(position, value) {
  var cell = this.getCell(position);
  this.scratchCells.push(new ascii.MappedCell(position, cell));
  cell.scratchValue = value;
  this.dirty = true;
};

/**
 * Sets the cells scratch (uncommitted) value at the given position
 * iff the value is different to what it already is.
 *
 * @param {ascii.Vector} position
 * @param {?string} value
 */
ascii.State.prototype.drawValueIncremental = function(position, value) {
  if (this.getCell(position).getRawValue() != value) {
    this.drawValue(position, value);
  }
};

/**
 * Clears the current drawing scratchpad.
 */
ascii.State.prototype.clearDraw = function() {
  for (var i in this.scratchCells) {
    this.scratchCells[i].cell.scratchValue = null;
  }
  this.scratchCells.length = 0;
};

/**
 * Returns the draw value of a cell at the given position.
 *
 * @param {ascii.Vector} position
 * @return {?string}
 */
ascii.State.prototype.getDrawValue = function(position) {
  var cell = this.getCell(position);
  var value = cell.scratchValue != null ? cell.scratchValue : cell.value;
  if (value != SPECIAL_VALUE) {
    return value;
  }

  // Magic time.
  var context = this.getContext(position);

  if (context.left && context.right && !context.up && !context.down) {
    return SPECIAL_LINE_H;
  }
  if (!context.left && !context.right && context.up && context.down) {
    return SPECIAL_LINE_V;
  }
  if (context.left && context.right && context.up && context.down) {
    return SPECIAL_LINE_H;
  }
  return SPECIAL_VALUE;
};

/**
 * @param {ascii.Vector} position
 * @return {ascii.CellContext}
 */
ascii.State.prototype.getContext = function(position) {
  var left = this.getCell(position.add(DIR_LEFT)).isSpecial();
  var right = this.getCell(position.add(DIR_RIGHT)).isSpecial();
  var up = this.getCell(position.add(DIR_UP)).isSpecial();
  var down = this.getCell(position.add(DIR_DOWN)).isSpecial();
  return new ascii.CellContext(left, right, up, down);
};

/**
 * Ends the current draw, commiting anything currently drawn the scratchpad.
 * @param {boolean=} opt_undo
 */
ascii.State.prototype.commitDraw = function(opt_undo) {
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

  for (var i in scratchCellsUnique) {
    var position = scratchCellsUnique[i].position;
    var cell = scratchCellsUnique[i].cell;

    // Push the effective old value unto the array.
    oldValues.push(new ascii.MappedValue(position,
        cell.value != null ? cell.value : ' '));

    var newValue = cell.getRawValue();
    if (newValue == ERASE_CHAR || newValue == ' ') {
      newValue = null;
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
};

/**
 * Undoes the last committed state.
 */
ascii.State.prototype.undo = function() {
  if (this.undoStates.length == 0) { return; }

  var lastState = this.undoStates.pop();
  for (var i in lastState) {
    var mappedValue = lastState[i];
    this.drawValue(mappedValue.position, mappedValue.value);
  }
  this.commitDraw(true);
};

/**
 * Redoes the last undone.
 */
ascii.State.prototype.redo = function() {
  if (this.redoStates.length == 0) { return; }

  var lastState = this.redoStates.pop();
  for (var i in lastState) {
    var mappedValue = lastState[i];
    this.drawValue(mappedValue.position, mappedValue.value);
  }
  this.commitDraw();
};

/**
 * Outputs the entire contents of the diagram as text.
 * @return {string}
 */
ascii.State.prototype.outputText = function() {
  // Find the first/last cells in the diagram so we don't output everything.
  var start = new ascii.Vector(Number.MAX_VALUE, Number.MAX_VALUE);
  var end = new ascii.Vector(-1, -1);

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

  var output = '';
  for (var j = start.y; j <= end.y; j++) {
    var line = '';
    for (var i = start.x; i <= end.x; i++) {
      var val = this.getDrawValue(new ascii.Vector(i, j));
      line += (val == null ? ' ' : val);
    }
    // Trim end whitespace.
    output += line.replace('\\s+$/g', '') + '\n';
  }
  return output;
};

/**
 * Loads the given text into the diagram starting at the given offset (centered).
 * @param {string} value
 * @param {ascii.Vector} offset
 */
ascii.State.prototype.fromText = function(value, offset) {
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
      if (char == SPECIAL_LINE_H || char == SPECIAL_LINE_V) {
        char = SPECIAL_VALUE;
      }
      this.drawValue(new ascii.Vector(i, j).add(offset).subtract(middle), char);
    }
  }
  this.commitDraw();
};
