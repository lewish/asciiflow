/**
 * Handles user input events and modifies state.
 * Core logic comes through this class.
 */
goog.provide('ascii.Controller');

goog.require('ascii.Vector');
goog.require('ascii.View');

/**
 * @constructor
 */
ascii.Controller = function(view, state) {
  /** @type {ascii.View} */ this.view = view;
  /** @type {ascii.State} */ this.state = state;

  /** @type {ascii.Vector} */ this.pressVector;

  this.installDesktopBindings();
};

ascii.Controller.prototype.handlePress = function(x, y) {
  this.pressVector = new ascii.Vector(x, y);
};

ascii.Controller.prototype.handleMove = function(x, y) {
  if (this.pressVector != null) {
    // Drag has started.
    this.view.offset.x -= (x - this.pressVector.x)/this.view.zoom;
    this.view.offset.y -= (y - this.pressVector.y)/this.view.zoom;
    this.pressVector = new ascii.Vector(x, y);
  }
};

ascii.Controller.prototype.handleRelease = function(x, y) {
  var position = new ascii.Vector(x, y);
  if (this.pressVector.equals(position)) {
    // We should handle this as a 'click' as there was no dragging involved.
    // Hand off to the state controller, as this will initiate a modification of the diagram itself.
    this.state.getCell(this.view.screenToFrame(position)).value = 'P';
  }
  this.pressVector = null;
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
