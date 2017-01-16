/**
 * Common classes and constants.
 */

import { ERASE_CHAR, ALL_SPECIAL_VALUES } from './constants';
import Vector from './vector';

/**
 * Represents a box with normalized position vectors.
 */
export class Box {
  /**
   * @param {Vector} a
   * @param {Vector} b
   */
  constructor(a, b) {
    /** type {number} */ this.startX = Math.min(a.x, b.x);
    /** type {number} */ this.startY = Math.min(a.y, b.y);
    /** type {number} */ this.endX = Math.max(a.x, b.x);
    /** type {number} */ this.endY = Math.max(a.y, b.y);
  }

  /** @return {Vector} */
  topLeft() {
    return new Vector(this.startX, this.startY);
  }

  /** @return {Vector} */
  bottomRight() {
    return new Vector(this.endX, this.endY);
  }

  /** @return {boolean} */
  contains(position) {
    return position.x >= this.startX && position.x <= this.endX
        && position.y >= this.startY && position.y <= this.endY;
  }
}

/**
 * An individual cell within the diagram and it's current value.
 */
export class Cell {

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
export class CellContext {
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
export class MappedValue {
  /**
   * @param {Vector} position
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
export class MappedCell {
  /**
   * @param {Vector} position
   * @param {Cell} cell
   */
  constructor(position, cell) {
    this.position = position;
    this.cell = cell;
  }
}
