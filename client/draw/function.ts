import { Vector } from "asciiflow/client/vector";

/**
 * Common interface for different drawing functions, e.g. box, line, etc.
 */
export interface DrawFunction {
  /**
   *  Start of drawing.
   */
  start(position: Vector): void;
  /**
   * Drawing move.
   */
  move(position: Vector): void;
  /**
   * End of drawing.
   */
  end(): void;
  /**
   * Cursor for given cell.
   */
  getCursor(position: Vector): string;
  /**
   * Handle the key with given value being pressed.
   */
  handleKey(value: string): void;
}
