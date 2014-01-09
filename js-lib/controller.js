/**
 * Handles user input events and modifies state.
 * Core logic comes through this class.
 */
goog.provide('ascii.Controller');

goog.require('ascii.Position');
goog.require('ascii.View');

/**
 * @constructor
 */
ascii.Controller = function(view) {
  /** type {ascii.View} */ this.view = view;
  /** type {ascii.StateControler */ this.stateController;
  /** type {ascii.Position} */ this.pressPosition;

  this.installDesktopBindings();
};

ascii.Controller.prototype.handlePress = function(x, y) {
  this.pressPosition = new ascii.Position(x, y);
};

ascii.Controller.prototype.handleMove = function(x, y) {
  if (this.clickPosition) {
    // Drag has started.
    this.view.offset.x -= (x - this.pressPosition.x)/this.view.zoom;
    this.view.offset.y -= (y - this.pressPosition.y)/this.view.zoom;
    this.clickPosition = new ascii.Position(x, y);
  }
};

ascii.Controller.prototype.handleRelease = function(x, y) {
  if (this.pressPosition.equals(new ascii.Position(x, y))) {
    // We should handle this as a 'click' as there was no dragging involved.
    // Hand off to the state controller, as this will initiate a modification of the diagram itself.
    // TODO: Work out how to pass off work into state-controller.
  }
  this.pressPosition = null;
};

ascii.Controller.prototype.handleZoom = function(delta) {
  this.view.zoom *= delta > 0 ? 1.1 : 0.9;
  this.view.zoom = Math.max(Math.min(this.view.zoom, 5), 0.2);
};


ascii.Controller.prototype.installDesktopBindings = function() {
  var controller = this;
  $(this.view.canvas).bind('mousewheel', function(e) {
      controller.handleZoom(e.originalEvent.wheelDelta);
  });
  $(this.view.canvas).mousedown(function(e) {
      controller.handlePress(e.clientX, e.clientY);
  });
  $(this.view.canvas).mouseup(function(e) {
      controller.handleRelease(e.clientX, e.clientY);
  });
  $(this.view.canvas).mousemove(function(e) {
      controller.handleMove(e.clientX, e.clientY);
  });
};
