import { DrawFunction } from './function';
import { TOUCH_ENABLED } from '../constants';
import State from '../state';

/**
 * @implements {DrawFunction}
 */
export default class DrawFreeform {
  /**
   * @param {State} state
   * @param {?string} value
   */
  constructor(state, value) {
    this.state = state;
    this.value = value;
    if (TOUCH_ENABLED) {
      $('#freeform-tool-input').val('');
      $('#freeform-tool-input').hide(0, function() {$('#freeform-tool-input').show(0, function() {$('#freeform-tool-input').focus();});});
    }
  }

  /** @inheritDoc */
  start(position) {
    this.state.drawValue(position, this.value);
  }

  /** @inheritDoc */
  move(position) {
    this.state.drawValue(position, this.value);
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
  handleKey(value) {
    if (TOUCH_ENABLED) {
      this.value = $('#freeform-tool-input').val().substr(0, 1);
      $('#freeform-tool-input').blur();
      $('#freeform-tool-input').hide(0);
    }
    if (value.length == 1) {
      // The value is not a special character, so lets use it.
      this.value = value;
    }
  }
}
