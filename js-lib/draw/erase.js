import { DrawFunction } from './function';
import { ERASE_CHAR } from '../constants';
import State from '../state';
import Vector from '../vector';

/**
 * @implements {DrawFunction}
 */
export default class DrawErase {
  /**
   * @param {State} state
   */
  constructor(state) {
    this.state = state;
    this.startPosition = null;
    this.endPosition = null;
  }

  /** @inheritDoc */
  start(position) {
    this.startPosition = position;
    this.move(position);
  }

  /** @inheritDoc */
  move(position) {
    this.state.clearDraw();
    this.endPosition = position;

    var startX = Math.min(this.startPosition.x, this.endPosition.x);
    var startY = Math.min(this.startPosition.y, this.endPosition.y);
    var endX = Math.max(this.startPosition.x, this.endPosition.x);
    var endY = Math.max(this.startPosition.y, this.endPosition.y);

    for (var i = startX; i <= endX; i++) {
      for (var j = startY; j <= endY; j++) {
        this.state.drawValue(new Vector(i, j), ERASE_CHAR);
      }
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
  handleKey(value) {}
}
