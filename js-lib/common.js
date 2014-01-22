/**
 * Common classes and constants.
 */

goog.provide('ascii');

/** @const */ var MAX_GRID_WIDTH = 2000;
/** @const */ var MAX_GRID_HEIGHT = 600;

/** @const */ var SPECIAL_VALUE = '+';

/** @const */ var MAX_UNDO = 50;

/** @const */ var SPECIAL_LINE_H = '\u2013';
/** @const */ var SPECIAL_LINE_V = '|';

/** @const */ var ERASE_CHAR = '\u2009';

/** @const */ var DRAG_LATENCY = 130; // Milliseconds.
/** @const */ var DRAG_ACCURACY = 3; // Pixels.

/** @const */ var CHAR_PIXELS_H = 9;
/** @const */ var CHAR_PIXELS_V = 17;

/** @const */ var RENDER_PADDING = 70;

/** @const */ var KEY_RETURN = '<enter>';
/** @const */ var KEY_BACKSPACE = '<backspace>';
/** @const */ var KEY_COPY = '<copy>';
/** @const */ var KEY_PASTE = '<paste>';
/** @const */ var KEY_CUT = '<cut>';
/** @const */ var KEY_UP = '<up>';
/** @const */ var KEY_DOWN = '<down>';
/** @const */ var KEY_LEFT = '<left>';
/** @const */ var KEY_RIGHT = '<right>';

/**
 * Stores a 2D vector.
 *
 * @constructor
 * @param {number} x
 * @param {number} y
 */
ascii.Vector = function(x, y) {
  /** type {Number} */ this.x = x;
  /** type {Number} */ this.y = y;
};

/**
 * @param {ascii.Vector} other
 * @return {boolean}
 */
ascii.Vector.prototype.equals = function(other) {
  return (other != null) && (this.x == other.x) && (this.y == other.y);
};

/**
 * @param {ascii.Vector} other
 * @return {ascii.Vector}
 */
ascii.Vector.prototype.subtract = function(other) {
  return new ascii.Vector(this.x - other.x, this.y - other.y);
};

/**
 * @param {ascii.Vector} other
 * @return {ascii.Vector}
 */
ascii.Vector.prototype.add = function(other) {
  return new ascii.Vector(this.x + other.x, this.y + other.y);
};

/**
 * @return {ascii.Vector}
 */
ascii.Vector.prototype.clone = function() {
  return new ascii.Vector(this.x, this.y);
};

/** @return {number} */
ascii.Vector.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * @param {number} scale
 * @return {ascii.Vector}
 */
ascii.Vector.prototype.scale = function(scale) {
  return new ascii.Vector(this.x * scale, this.y * scale);
};

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
ascii.Cell.prototype.getRawValue = function() {
  return (this.scratchValue != null ? this.scratchValue : this.value);
};

/** @return {boolean} */
ascii.Cell.prototype.isSpecial = function() {
  return this.getRawValue() == SPECIAL_VALUE;
};

/** @return {boolean} */
ascii.Cell.prototype.hasScratch = function() {
  return this.scratchValue != null;
};

/** @return {boolean} */
ascii.Cell.prototype.isErase = function() {
  return this.scratchValue == ERASE_CHAR;
};

/**
 * The context for a cell, i.e. the status of the cells around it.
 *
 * @param {boolean} left
 * @param {boolean} right
 * @param {boolean} up
 * @param {boolean} down
 * @constructor
 */
ascii.CellContext = function(left, right, up, down) {
  /** @type {boolean} */ this.left = left;
  /** @type {boolean} */ this.right = right;
  /** @type {boolean} */ this.up = up;
  /** @type {boolean} */ this.down = down;
};

/**
 * Returns the total number of surrounding special cells.
 * @return {number}
 */
ascii.CellContext.prototype.sum = function() {
  return this.left + this.right + this.up + this.down;
};

/**
 * A pair of a vector and a string value. Used in history management.
 * @constructor
 * @struct
 */
ascii.MappedValue = function(position, value) {
  this.position = position;
  this.value = value;
}

/**
 * A pair of a vector and a cell. Used in history management.
 * @constructor
 * @struct
 */
ascii.MappedCell = function(position, cell) {
  this.position = position;
  this.cell = cell;
}
