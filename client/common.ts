import { ERASE_CHAR, ALL_SPECIAL_VALUES } from "asciiflow/client/constants";
import { Vector } from "asciiflow/client/vector";

/**
 * Represents a box with normalized position vectors.
 */
export class Box {
  public readonly startX: number;
  public readonly startY: number;

  public readonly endX: number;
  public readonly endY: number;

  constructor(a: Vector, b: Vector) {
    this.startX = Math.min(a.x, b.x);
    this.startY = Math.min(a.y, b.y);
    this.endX = Math.max(a.x, b.x);
    this.endY = Math.max(a.y, b.y);
  }

  topLeft() {
    return new Vector(this.startX, this.startY);
  }

  bottomRight() {
    return new Vector(this.endX, this.endY);
  }

  contains(position: Vector) {
    return (
      position.x >= this.startX &&
      position.x <= this.endX &&
      position.y >= this.startY &&
      position.y <= this.endY
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

  isErase() {
    return this.scratchValue == ERASE_CHAR;
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
