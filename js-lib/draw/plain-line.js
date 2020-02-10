import { DrawFunction } from './function';
import { drawLine } from './utils';
import { SPECIAL_LINE_V, SPECIAL_LINE_H } from '../constants';
import State from '../state';
import Vector from '../vector';

/**
 * @implements {DrawFunction}
 */
export default class DrawPlainLine {
  /**
   * @param {State} state
   */
  constructor(state) {
    this.state = state;
    /** @type {Vector} */ this.startPosition = null;
  }

  /** @inheritDoc */
  start(position) {
    this.startPosition = position;
  }

  drawEndpoint(position) {
    var context = this.state.getContext(position);
    if (context.up || context.down) {
      this.state.drawValue(position, SPECIAL_LINE_V);
    }
    else if (context.left || context.right) {
      this.state.drawValue(position, SPECIAL_LINE_H);
    }
  }

  /** @inheritDoc */
  move(position) {
    this.state.clearDraw();

    // Try to infer line orientation.
    // TODO: Split the line into two lines if we can't satisfy both ends.
    var startContext = this.state.getContext(this.startPosition);
    var endContext = this.state.getContext(position);
    var clockwise = (startContext.up && startContext.down) ||
        (endContext.left && endContext.right);


    drawLine(this.state, this.startPosition, position, clockwise);
    this.drawEndpoint(this.startPosition)
    this.drawEndpoint(position)
  }

  /** @inheritDoc */
  end() {
    this.state.commitDraw();
  }

  /** @inheritDoc */
  getCursor(position) {
    return 'crosshair';
  }

  /** @inheritDoc */
  handleKey(value) {};
}
