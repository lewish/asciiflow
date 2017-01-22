/**
 * Stores a 2D vector.
 */
export default class Vector {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    /** type {number} */ this.x = x;
    /** type {number} */ this.y = y;
  }

  /**
   * @param {jQuery.Event} event
   * @return {!Vector}
   */
  static fromMouseEvent(event) {
    return new Vector(event.clientX, event.clientY);
  }

  /**
   * @param {jQuery.Event} event
   * @param {number=} index
   * @return {!Vector}
   */
  static fromTouchEvent(event, index = 0) {
    const { pageX, pageY } = event.originalEvent.touches[index];
    return new Vector(pageX, pageY);
  }

  /**
   * @param {?Vector} other
   * @return {boolean}
   */
  equals(other) {
    return (other != null) && (this.x == other.x) && (this.y == other.y);
  }

  /**
   * @param {Vector} other
   * @return {Vector}
   */
  subtract(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  /**
   * @param {Vector} other
   * @return {Vector}
   */
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  /**
   * @return {!Vector}
   */
  clone() {
    return new Vector(this.x, this.y);
  }

  /** @return {number} */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * @param {number} scale
   * @return {Vector}
   */
  scale(scale) {
    return new Vector(this.x * scale, this.y * scale);
  }

  /**
   * Move up by value. Defaults to 1.
   * @param {number=} value
   * @return {Vector}
   */
  up(value = 1) {
    return new Vector(this.x, this.y - value);
  }

  /**
   * Move down by value. Defaults to 1.
   * @param {number=} value
   * @return {Vector}
   */
  down(value = 1) {
    return new Vector(this.x, this.y + value);
  }

  /**
   * Move left by value. Defaults to 1.
   * @param {number=} value
   * @return {Vector}
   */
  left(value = 1) {
    return new Vector(this.x - value, this.y);
  }

  /**
   * Move right by value. Defaults to 1.
   * @param {number=} value
   * @return {Vector}
   */
  right(value = 1) {
    return new Vector(this.x + value, this.y);
  }
}
