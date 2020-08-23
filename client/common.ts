import { ALL_SPECIAL_VALUES } from "asciiflow/client/constants";
import { Vector } from "asciiflow/client/vector";

/**
 * Represents a box with normalized position vectors.
 */
export class Box {
  constructor(public readonly start: Vector, public readonly end: Vector) {}

  topLeft() {
    return new Vector(
      Math.min(this.start.x, this.end.x),
      Math.min(this.start.y, this.end.y)
    );
  }

  bottomRight() {
    return new Vector(
      Math.max(this.start.x, this.end.x),
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

/**
 * An individual cell within the diagram and it's current value.
 */
export class Cell {
  constructor(public value?: string, public scratchValue?: string) {}

  getRawValue() {
    return this.scratchValue != null ? this.scratchValue : this.value;
  }

  isSpecial() {
    return ALL_SPECIAL_VALUES.includes(this.getRawValue());
  }

  isEmpty() {
    return this.value == null && this.scratchValue == null;
  }

  hasScratch() {
    return this.scratchValue != null;
  }
}

export class ExtendedCellContext {
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
  /**
   * Returns the total number of surrounding special cells.
   */
  extendedSum() {
    return (
      +this.left +
      +this.right +
      +this.up +
      +this.down +
      +this.leftup +
      +this.leftdown +
      +this.rightup +
      +this.rightdown
    );
  }
}

/**
 * A pair of a vector and a string value. Used in history management.
 */
export class MappedValue {
  constructor(public position: Vector, public value: string) {}
}

/**
 * A pair of a vector and a cell. Used in history management.
 */
export class MappedCell {
  constructor(public position: Vector, public cell: Cell) {}
}
