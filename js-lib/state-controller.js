/**
 * Handles management of the diagram state.
 */
goog.provide('ascii.StateController');

goog.require('ascii.Vector');

/**
 * @constructor
 */
ascii.StateController = function(state) {
  /** @type {ascii.State} */ this.state = state;
};

ascii.StateController.prototype.handleDrawingPress = function(position) {
  this.state.getCell(position).value = 'O';
};

ascii.StateController.prototype.handleDrawingRelease = function(position) {
};


ascii.StateController.prototype.handleDrawingMove = function(position) {
  this.state.getCell(position).value = 'O';
};
