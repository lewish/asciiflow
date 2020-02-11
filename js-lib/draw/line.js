import { DrawFunction } from './function';
import { drawLine } from './utils';
import { SPECIAL_ARROW_LEFT } from '../constants';
import { SPECIAL_ARROW_UP } from '../constants';
import { SPECIAL_ARROW_RIGHT } from '../constants';
import { SPECIAL_ARROW_DOWN } from '../constants';
import { SPECIAL_LINE_H } from '../constants';
import { SPECIAL_LINE_V } from '../constants';
import State from '../state';
import Vector from '../vector';

/**
 * @implements {DrawFunction}
 */
export default class DrawLine {
  /**
   * @param {State} state
   * @param {?string} type
   */
  constructor(state, type = 'connector') {
    this.state = state;
    this.type = type
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

    if (this.type === 'plain') {
      this.drawEndpoint(this.startPosition)
      this.drawEndpoint(position)
    }
    else if (this.type === 'arrow') {
  	  var endValue;
  	  if (endContext.up) {
    		endValue = SPECIAL_ARROW_UP;
  	  } else if (endContext.down) {
    		endValue = SPECIAL_ARROW_DOWN;
  	  } else if (endContext.left) {
    		endValue = SPECIAL_ARROW_LEFT;
  	  } else {
    		endValue = SPECIAL_ARROW_RIGHT;
  	  }
      this.state.drawValue(position, endValue);
    }
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
