/**
 * Classes holding the state of the ascii-diagram.
 */
goog.provide('ascii.State');

/** @const */ ascii.MAX_GRID_SIZE = 1000;

/**
 * @constructor
 */
ascii.Cell = function() {
  /** @type {string|null} */ // Uses the string "#" for lines.
  this.value = null;
};

ascii.Cell.prototype.setValue = function(value) {
  this.value = value;
};

/**
 * @constructor
 */
ascii.State = function() {
  /** @type {Array.<Array.<ascii.Cell>>} */
  this.cells = new Array(ascii.MAX_GRID_SIZE);

  for (var i = 0; i < this.cells.length; i++) {
    this.cells[i] = new Array(ascii.MAX_GRID_SIZE);
    for (var j = 0; j < this.cells[i].length; j++) {
      this.cells[i][j] = new ascii.Cell();
    }
  }
};

ascii.State.prototype.getCell = function(vector) {
  return this.cells[vector.x][vector.y];
};
