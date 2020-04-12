/**
 * Stores a 2D vector.
 */
export class Vector {
  constructor(public x: number, public y: number) {}

  static fromMouseEvent(event: MouseEvent) {
    return new Vector(event.clientX, event.clientY);
  }

  static fromTouchEvent(event: TouchEvent, index = 0) {
    const { pageX, pageY } = event.touches[index];
    return new Vector(pageX, pageY);
  }

  equals(other: Vector) {
    return other != null && this.x == other.x && this.y == other.y;
  }

  subtract(other: Vector) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  add(other: Vector) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  scale(scale: number) {
    return new Vector(this.x * scale, this.y * scale);
  }

  /**
   * Move up by value. Defaults to 1.
   */
  up(value = 1) {
    return new Vector(this.x, this.y - value);
  }

  /**
   * Move down by value. Defaults to 1.
   */
  down(value = 1) {
    return new Vector(this.x, this.y + value);
  }

  /**
   * Move left by value. Defaults to 1.
   */
  left(value = 1) {
    return new Vector(this.x - value, this.y);
  }

  /**
   * Move right by value. Defaults to 1.
   */
  right(value = 1) {
    return new Vector(this.x + value, this.y);
  }
}
