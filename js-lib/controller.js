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

  this.installDesktopBindings();
};

asciiflow.Controller.prototype.handlePress = function(x, y) {
  
};

asciiflow.Controller.prototype.handleZoom = function(delta) {
  this.view.zoom *= delta > 0 ? 1.1 : 0.9;
  this.view.zoom = Math.max(Math.min(this.view.zoom, 5), 0.2);
};

asciiflow.Controller.prototype.handlePan = function(deltaX, deltaY) {
  this.view.offsetX += deltaX;
  this.view.offsetY += deltaY;
};

asciiflow.Controller.prototype.installDesktopBindings = function() {
  var controller = this;
  $(this.view.canvas).bind('mousewheel', function(e) {
      controller.handleZoom(e.originalEvent.wheelDelta);
  });
  $(document).keydown(function(e) {
      if (e.keyCode == 37) { controller.handlePan(-10, 0); }
      if (e.keyCode == 38) { controller.handlePan(0, -10); }
      if (e.keyCode == 39) { controller.handlePan(10, 0); }
      if (e.keyCode == 40) { controller.handlePan(0, 10); }
  });
};
