goog.provide('ascii.State');

/** @const */ var MAX_GRID_SIZE = 1000;

/**
 * An individual cell within the diagram and it's current value.
 *
 * @constructor
 */
ascii.Cell = function() {
  /** @type {?string} */ this.value = null;
};

/**
 * Sets the cells value.
 *
 * @param {string} value
 */
ascii.Cell.prototype.setValue = function(value) {
  this.value = value;
};

/**
 * Holds the entire state of the diagram as a 2D array of cells.
 *
 * @constructor
 */
ascii.State = function() {
  /** @type {Array.<Array.<ascii.Cell>>} */
  this.cells = new Array(MAX_GRID_SIZE);

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
 * @return {asii.Cell}
 */
ascii.State.prototype.getCell = function(vector) {
  return this.cells[vector.x][vector.y];
};
