import Vector from '../vector';

/**
 * Common interface for different drawing functions, e.g. box, line, etc.
 * @interface
 */
export default class DrawFunction {
  /** Start of drawing. @param {Vector} position */
  start(position) {};
  /** Drawing move. @param {Vector} position */
  move(position) {};
  /** End of drawing. */
  end() {};
  /** Cursor for given cell.
   * @param {Vector} position
   * @return {string}
   */
  getCursor(position) {};
  /** Handle the key with given value being pressed. @param {string} value */
  handleKey(value) {};
}
