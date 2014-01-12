goog.provide('ascii.StateController');

goog.require('ascii.Vector');

/**
 * Handles management of the diagram state. Input events are cleaned in the
 * parent controller and passed down to this class for dealing with drawing.
 *
 * @constructor
 * @param {ascii.State} state
 */
ascii.StateController = function(state) {
  /** @type {ascii.State} */ this.state = state;
};

/**
 * Handles a press in the context of the drawing frame.
 * @param {ascii.Vector} position
 */
ascii.StateController.prototype.handleDrawingPress = function(position) {
  this.state.setValue(position, 'O');
};

/**
 * Handles a release in the context of the drawing frame.
 * @param {ascii.Vector} position
 */
ascii.StateController.prototype.handleDrawingRelease = function(position) {
};

/**
 * Handles a move in the context of the drawing frame.
 * @param {ascii.Vector} position
 */
ascii.StateController.prototype.handleDrawingMove = function(position) {
  this.state.setValue(position, 'O');
};

