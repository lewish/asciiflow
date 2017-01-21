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
   * @param {Vector} other
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
   * @return {Vector}
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
}
