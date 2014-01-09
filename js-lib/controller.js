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
  /** type {ascii.View} */
  this.view = view;
  /** type {ascii.Position} */
  this.clickPosition;

  this.installDesktopBindings();
};

ascii.Controller.prototype.handlePress = function(x, y) {
  this.clickPosition = new ascii.Position(x, y);
};

ascii.Controller.prototype.handleMove = function(x, y) {
  if (this.clickPosition) {
    // Drag has started.
    this.view.offset.x -= (x - this.clickPosition.x)/this.view.zoom;
    this.view.offset.y -= (y - this.clickPosition.y)/this.view.zoom;
    this.clickPosition = new ascii.Position(x, y);
  }
};

ascii.Controller.prototype.handleRelease = function(x, y) {
  this.clickPosition = null;
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
