import { Vector } from "asciiflow/client/vector";
import { IModifierKeys } from "asciiflow/client/store";

/**
 * Common interface for different drawing functions, e.g. box, line, etc.
 */
export interface IDrawFunction {
  /**
   *  Start of drawing.
   */
  start(position: Vector, modifierKeys: IModifierKeys): void;
  /**
   * Drawing move.
   */
  move(position: Vector, modifierKeys: IModifierKeys): void;
  /**
   * End of drawing.
   */
  end(): void;
  /**
   * Cursor for given cell.
   */
  getCursor(position: Vector, modifierKeys: IModifierKeys): string;
  /**
   * Handle the key with given value being pressed.
   */
  handleKey(value: string, modifierKeys: IModifierKeys): void;

  /**
   * When exiting the tool.
   */
  cleanup(): void;
}

export abstract class AbstractDrawFunction implements IDrawFunction {
  start(position: Vector, modifierKeys: IModifierKeys): void {}
  move(position: Vector, modifierKeys: IModifierKeys): void {}
  end(): void {}
  getCursor(position: Vector, modifierKeys: IModifierKeys): string {
    return "default";
  }
  handleKey(value: string, modifierKeys: IModifierKeys): void {}
  cleanup(): void {}
}
