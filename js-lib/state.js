goog.provide('ascii.State');

/** @const */ var MAX_GRID_SIZE = 1000;

/**
 * An individual cell within the diagram and it's current value.
 *
 * @constructor
 */
ascii.Cell = function() {
  /** @type {?string} */ this.value = null;
  /** @type {?string} */ this.scratchValue = null;
};

/** @return {?string} */
ascii.Cell.prototype.getDrawValue = function() {
  return (this.scratchValue != null ? this.scratchValue : this.value);
};

/**
 * Holds the entire state of the diagram as a 2D array of cells.
 *
 * @constructor
 */
ascii.State = function() {
  /** @type {Array.<Array.<ascii.Cell>>} */
  this.cells = new Array(MAX_GRID_SIZE);
  /** @type {Array.<ascii.Cell>} */
  this.scratchCells = new Array();

  for (var i = 0; i < this.cells.length; i++) {
    this.cells[i] = new Array(MAX_GRID_SIZE);
    for (var j = 0; j < this.cells[i].length; j++) {
      this.cells[i][j] = new ascii.Cell();
    }
  }
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
 * Sets the cells value at the given position. Probably shouldn't
 * be used directly in many cases. Used drawValue instead.
 *
 * @param {ascii.Vector} position
 * @param {string} value
 */
ascii.State.prototype.setValue = function(position, value) {
  this.getCell(position).value = value;
};

/**
 * Sets the cells scratch (uncommitted) value at the given position.
 *
 * @param {ascii.Vector} position
 * @param {string} value
 */
ascii.State.prototype.drawValue = function(position, value) {
  var cell = this.getCell(position);
  this.scratchCells.push(cell);
  cell.scratchValue = value;
};

/**
 * Clears the current drawing scratchpad.
 */
ascii.State.prototype.clearDraw = function() {
  for (var i in this.scratchCells) {
    this.scratchCells[i].scratchValue = null;
  }
  this.scratchCells.length = 0;
};

/**
 * Ends the current draw, commiting anything currently drawn the scratchpad.
 */
ascii.State.prototype.commitDraw = function() {
  for (var i in this.scratchCells) {
    this.scratchCells[i].value = this.scratchCells[i].getDrawValue();
    this.scratchCells[i].scratchValue = null;
  }
};

