import { SPECIAL_VALUE } from '../constants';
import { Box } from '../common';
import State from '../state';
import Vector from '../vector';

/**
 * Draws a line on the diagram state.
 *
 * @param {State} state
 * @param {Vector} startPosition
 * @param {Vector} endPosition
 * @param {boolean} clockwise
 * @param {string=} value
 */
export function drawLine(
    state, startPosition, endPosition, clockwise, value = SPECIAL_VALUE) {

  var box = new Box(startPosition, endPosition);
  var startX = box.startX;
  var startY = box.startY;
  var endX = box.endX;
  var endY = box.endY;

  var midX = clockwise ? endPosition.x : startPosition.x;
  var midY = clockwise ? startPosition.y : endPosition.y;

  while (startX++ < endX) {
    var position = new Vector(startX, midY);
    var context = state.getContext(new Vector(startX, midY));
    // Don't erase any lines that we cross.
    if (value != ' ' || context.up + context.down != 2) {
      state.drawValueIncremental(position, value);
    }
  }
  while (startY++ < endY) {
    var position = new Vector(midX, startY);
    var context = state.getContext(new Vector(midX, startY));
    // Don't erase any lines that we cross.
    if (value != ' ' || context.left + context.right != 2) {
      state.drawValueIncremental(position, value);
    }
  }

  state.drawValue(startPosition, value);
  state.drawValue(endPosition, value);
  state.drawValueIncremental(new Vector(midX, midY), value);
}

/**
 * Sets the cells scratch (uncommitted) values to the given text.
 * Handles newlines appropriately.
 * @param {State} state
 * @param {Vector} position
 * @param {string} text
 */
export function drawText(state, position, text) {
  let x = 0, y = 0;
  for (const char of State.paddingText(text)) {
    if (char == '\n') {
      y++;
      x = 0;
      continue;
    }
    state.drawValue(position.add(new Vector(x, y)), char);
    x++;
  }
}
