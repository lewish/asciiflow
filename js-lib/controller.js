/**
 * Handles user input events and modifies state.
 * Core logic comes through this class.
 */
goog.provide('ascii.Controller');

goog.require('ascii.Vector');
goog.require('ascii.View');

/** @const */ var DRAG_LATENCY = 200; // Milliseconds.
/** @const */ var DRAG_ACCURACY = 5; // Pixels.

/**
 * @constructor
 */
ascii.Controller = function(view, state) {
  /** @type {ascii.View} */ this.view = view;
  /** @type {ascii.State} */ this.state = state;

  /** @type {ascii.Vector} */ this.dragOrigin;
  /** @type {ascii.Vector} */ this.pressVector;
  /** @type {number} */ this.pressTimestamp;

  this.installDesktopBindings();
};

ascii.Controller.prototype.handlePress = function(x, y) {
  this.pressVector = new ascii.Vector(x, y);
  this.pressTimestamp = $.now();
};

ascii.Controller.prototype.handleMove = function(x, y) {
  var position = new ascii.Vector(x, y);

  if (this.pressVector == null) { return; } // No clicks, so just ignore.

  // Initiate a drag if we have moved enough, quickly enough.
  if (this.dragOrigin == null &&
      ($.now() - this.pressTimestamp) < DRAG_LATENCY &&
      position.subtract(this.pressVector).length() > DRAG_ACCURACY) {
      this.dragOrigin = this.view.offset;
  }

  // Drag in progress, update the view origin.
  if (this.dragOrigin != null) {
    this.view.offset = this.dragOrigin.add(
        this.pressVector
            .subtract(new ascii.Vector(x, y))
            .scale(1/this.view.zoom));
  }

  // Drag wasn't initiated in time, treat this as a drawing event.
  if (this.dragOrigin == null && ($.now() - this.pressTimestamp) >= DRAG_LATENCY) {
    // TODO: Draw stuff.
    this.state.getCell(this.view.screenToCell(position)).value = 'O';
  }
};

ascii.Controller.prototype.handleRelease = function(x, y) {
  var position = new ascii.Vector(x, y);
  // Drag wasn't initiated in time, treat this as a drawing event.
  if (this.dragOrigin == null &&
      ($.now() - this.pressTimestamp) >= DRAG_LATENCY &&
      position.subtract(this.pressVector).length() > DRAG_ACCURACY) {
    // TODO: Draw stuff.
  }
  this.pressVector = null;
  this.pressTimestamp = 0;
  this.dragOrigin = null;
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
  $(window).resize(function(e) { controller.view.resizeCanvas() });
};
