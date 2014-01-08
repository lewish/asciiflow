/**
 * Handles user input events and modifies state.
 * Core logic comes through this class.
 */
goog.provide('asciiflow.Controller');

goog.require('asciiflow.View');

/**
 * @constructor
 */
asciiflow.Controller = function(view) {
  /** type {asciiflow.View} */
  this.view = view;
  /** type {asciiflow.common.Position} */
  this.clickPosition;

  this.installDesktopBindings();
};

asciiflow.Controller.prototype.handlePress = function(x, y) {
  this.clickPosition = new asciiflow.common.Position(x, y);
};

asciiflow.Controller.prototype.handleMove = function(x, y) {
  if (this.clickPosition) {
    // Drag has started.
    this.view.offset.x -= (x - this.clickPosition.x)/this.view.zoom;
    this.view.offset.y -= (y - this.clickPosition.y)/this.view.zoom;
    this.clickPosition = new asciiflow.common.Position(x, y);
  }
};

asciiflow.Controller.prototype.handleRelease = function(x, y) {
  this.clickPosition = null;
};

asciiflow.Controller.prototype.handleZoom = function(delta) {
  this.view.zoom *= delta > 0 ? 1.1 : 0.9;
  this.view.zoom = Math.max(Math.min(this.view.zoom, 5), 0.2);
};


asciiflow.Controller.prototype.installDesktopBindings = function() {
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
