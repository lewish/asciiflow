/**
 * Common classes and constants.
 */

// Define namespace for closure compiler but don't make it a requirement.
try {
  goog.provide('ascii');
  throw 1;
} catch (e) {
  /** type {Object} */
  window.ascii = window.ascii || {};
}

const MAX_GRID_WIDTH = 2000;
const MAX_GRID_HEIGHT = 600;

const SPECIAL_VALUE = '+';
const ALT_SPECIAL_VALUE = '^';
const SPECIAL_ARROW_LEFT = '<';
const SPECIAL_ARROW_UP = '^';
const SPECIAL_ARROW_RIGHT = '>';
const SPECIAL_ARROW_DOWN = 'v';
const SPECIAL_VALUES = ['+', '\u2012', '\u2013', '-', '|'];
const ALT_SPECIAL_VALUES = ['>', '<', '^', 'v'];
const ALL_SPECIAL_VALUES = SPECIAL_VALUES.concat(ALT_SPECIAL_VALUES);

const MAX_UNDO = 50;

const SPECIAL_LINE_H = '-';
const SPECIAL_LINE_V = '|';

const ERASE_CHAR = '\u2009';

const DRAG_LATENCY = 150; // Milliseconds.
const DRAG_ACCURACY = 6; // Pixels.

const CHAR_PIXELS_H = 9;
const CHAR_PIXELS_V = 17;

const RENDER_PADDING_CELLS = 3;

const KEY_RETURN = '<enter>';
const KEY_BACKSPACE = '<backspace>';
const KEY_COPY = '<copy>';
const KEY_PASTE = '<paste>';
const KEY_CUT = '<cut>';
const KEY_UP = '<up>';
const KEY_DOWN = '<down>';
const KEY_LEFT = '<left>';
const KEY_RIGHT = '<right>';

// http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
const TOUCH_ENABLED =
    'ontouchstart' in window ||
    'onmsgesturechange' in window;

/**
 * Stores a 2D vector.
 */
ascii.Vector = class {

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    /** type {Number} */ this.x = x;
    /** type {Number} */ this.y = y;
  }

  /**
   * @param {ascii.Vector} other
   * @return {boolean}
   */
  equals(other) {
    return (other != null) && (this.x == other.x) && (this.y == other.y);
  }

  /**
   * @param {ascii.Vector} other
   * @return {ascii.Vector}
   */
  subtract(other) {
    return new ascii.Vector(this.x - other.x, this.y - other.y);
  }

  /**
   * @param {ascii.Vector} other
   * @return {ascii.Vector}
   */
  add(other) {
    return new ascii.Vector(this.x + other.x, this.y + other.y);
  }

  /**
   * @return {ascii.Vector}
   */
  clone() {
    return new ascii.Vector(this.x, this.y);
  }

  /** @return {number} */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * @param {number} scale
   * @return {ascii.Vector}
   */
  scale(scale) {
    return new ascii.Vector(this.x * scale, this.y * scale);
  }
}

/**
 * Represents a box with normalized position vectors.
 */
ascii.Box = class {
  /**
   * @param {ascii.Vector} a
   * @param {ascii.Vector} b
   */
  constructor(a, b) {
    /** type {Number} */ this.startX = Math.min(a.x, b.x);
    /** type {Number} */ this.startY = Math.min(a.y, b.y);
    /** type {Number} */ this.endX = Math.max(a.x, b.x);
    /** type {Number} */ this.endY = Math.max(a.y, b.y);
  }

  /** @return {ascii.Vector} */
  topLeft() {
    return new ascii.Vector(this.startX, this.startY);
  }

  /** @return {ascii.Vector} */
  bottomRight() {
    return new ascii.Vector(this.endX, this.endY);
  }

  /** @return {boolean} */
  contains(position) {
    return position.x >= this.startX && position.x <= this.endX
        && position.y >= this.startY && position.y <= this.endY;
  }
}

const DIR_LEFT  = new ascii.Vector(-1,  0);
const DIR_RIGHT = new ascii.Vector( 1,  0);
const DIR_UP    = new ascii.Vector( 0, -1);
const DIR_DOWN  = new ascii.Vector( 0,  1);

const DIRECTIONS = [DIR_LEFT, DIR_RIGHT, DIR_UP, DIR_DOWN];

/**
 * An individual cell within the diagram and it's current value.
 */
ascii.Cell = class {

  constructor() {
    /** @type {?string} */ this.value = null;
    /** @type {?string} */ this.scratchValue = null;
  }

  /** @return {?string} */
  getRawValue() {
    return (this.scratchValue != null ? this.scratchValue : this.value);
  }

  /** @return {boolean} */
  isSpecial() {
    return ALL_SPECIAL_VALUES.indexOf(this.getRawValue()) != -1;
  }

  /** @return {boolean} */
  isEmpty() {
    return this.value == null && this.scratchValue == null;
  }

  /** @return {boolean} */
  hasScratch() {
    return this.scratchValue != null;
  }

  /** @return {boolean} */
  isErase() {
    return this.scratchValue == ERASE_CHAR;
  }
}

/**
 * The context for a cell, i.e. the status of the cells around it.
 */
ascii.CellContext = class {
  /**
   * @param {boolean} left
   * @param {boolean} right
   * @param {boolean} up
   * @param {boolean} down
   */
  constructor(left, right, up, down) {
    /** @type {boolean} */ this.left = left;
    /** @type {boolean} */ this.right = right;
    /** @type {boolean} */ this.up = up;
    /** @type {boolean} */ this.down = down;
    /** @type {boolean} */ this.leftup = false;
    /** @type {boolean} */ this.rightup = false;
    /** @type {boolean} */ this.leftdown = false;
    /** @type {boolean} */ this.rightdown = false;
  }

  /**
   * Returns the total number of surrounding special cells.
   * @return {number}
   */
  sum() {
    return this.left + this.right + this.up + this.down;
  }

  /**
   * Returns the total number of surrounding special cells.
   * @return {number}
   */
  extendedSum() {
    return this.left + this.right + this.up + this.down
         + this.leftup + this.leftdown + this.rightup + this.rightdown;
  }
}

/**
 * A pair of a vector and a string value. Used in history management.
 */
ascii.MappedValue = class {
  /**
   * @param {ascii.Vector} position
   * @param {string|null} value
   */
  constructor(position, value) {
    this.position = position;
    this.value = value;
  }
}

/**
 * A pair of a vector and a cell. Used in history management.
 */
ascii.MappedCell = class {
  /**
   * @struct
   * @param {ascii.Vector} position
   * @param {ascii.Cell} cell
   */
  constructor(position, cell) {
    this.position = position;
    this.cell = cell;
  }
}
