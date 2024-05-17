import { ALL_SPECIAL_VALUES } from "#asciiflow/client/constants";
import { Vector } from "#asciiflow/client/vector";

/**
 * Represents a box with normalized position vectors.
 */
export class Box {
  constructor(public readonly start: Vector, public readonly end: Vector) {}

  left() {
    return Math.min(this.start.x, this.end.x);
  }

  right() {
    return Math.max(this.start.x, this.end.x);
  }

  top() {
    return Math.min(this.start.y, this.end.y);
  }

  bottom() {
    return Math.max(this.start.y, this.end.y);
  }

  topLeft() {
    return new Vector(
      Math.min(this.start.x, this.end.x),
      Math.min(this.start.y, this.end.y)
    );
  }

  topRight() {
    return new Vector(
      Math.max(this.start.x, this.end.x),
      Math.min(this.start.y, this.end.y)
    );
  }

  bottomRight() {
    return new Vector(
      Math.max(this.start.x, this.end.x),
      Math.max(this.start.y, this.end.y)
    );
  }

  bottomLeft() {
    return new Vector(
      Math.min(this.start.x, this.end.x),
      Math.max(this.start.y, this.end.y)
    );
  }

  contains(position: Vector) {
    const topLeft = this.topLeft();
    const bottomRight = this.bottomRight();
    return (
      position.x >= topLeft.x &&
      position.x <= bottomRight.x &&
      position.y >= topLeft.y &&
      position.y <= bottomRight.y
    );
  }
}


export class CellContext {
  constructor(
    public left: boolean,
    public right: boolean,
    public up: boolean,
    public down: boolean,
    public leftup: boolean,
    public leftdown: boolean,
    public rightup: boolean,
    public rightdown: boolean
  ) {}

  sum() {
    return +this.left + +this.right + +this.up + +this.down;
  }
}
