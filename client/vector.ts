/**
 * Stores a 2D vector.
 */

export interface IVector {
  x: number;
  y: number;
}
export class Vector implements IVector {
  public static readonly STRINGIFIER = {
    serialize(value: Vector) {
      return value.toString();
    },
    deserialize(value: string) {
      return Vector.fromString(value);
    },
  };

  constructor(public x: number, public y: number) {}

  // TODO: These shouldn't be here.
  static fromMouseEvent(event: React.MouseEvent<any>) {
    return new Vector(event.clientX, event.clientY);
  }

  static fromTouchEvent(event: React.TouchEvent<any>, index = 0) {
    const { pageX, pageY } = event.touches[index];
    return new Vector(pageX, pageY);
  }

  toString() {
    return `${this.x}:${this.y}`;
  }

  static fromString(value: string) {
    const split = value.split(":");
    return new Vector(Number(split[0]), Number(split[1]));
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
