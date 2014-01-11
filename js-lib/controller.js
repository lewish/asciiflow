/**
 * Handles user input events and modifies state.
 */
goog.provide('ascii.Controller');

goog.require('ascii.StateController');
goog.require('ascii.Vector');
goog.require('ascii.View');

/** @const */ var DRAG_LATENCY = 100; // Milliseconds.
/** @const */ var DRAG_ACCURACY = 0.1; // Pixels.

/**
 * @constructor
 */
ascii.Controller = function(view, state) {
  /** @type {ascii.View} */ this.view = view;
  /** @type {ascii.State} */ this.state = state;

  /** @type {ascii.StateController} */ this.stateController =
      new ascii.StateController(state);

  /** @type {ascii.Vector} */ this.dragOrigin;
  /** @type {ascii.Vector} */ this.pressVector;
  /** @type {number} */ this.pressTimestamp;

  // TODO: Setup different bindings for tablet/mobile.
  this.installDesktopBindings();
  this.installTouchBindings();
};

ascii.Controller.prototype.handlePress = function(x, y) {
  var position = new ascii.Vector(x, y);

  this.pressVector = new ascii.Vector(x, y);
  this.pressTimestamp = $.now();

  // Check to see if a drag happened in the given allowed time.
  window.setTimeout(function() {
    if (this.dragOrigin == null) {
      this.stateController.handleDrawingPress(this.view.screenToCell(position));
    }
    // TODO: Skip this if release happens before timeout.
  }.bind(this), DRAG_LATENCY);
};

ascii.Controller.prototype.handleMove = function(x, y) {
  var position = new ascii.Vector(x, y);

  // No clicks, so just ignore.
  if (this.pressVector == null) { return; } 

  // Initiate a drag if we have moved enough, quickly enough.
  if (this.dragOrigin == null &&
      ($.now() - this.pressTimestamp) < DRAG_LATENCY &&
      position.subtract(this.pressVector).length() > DRAG_ACCURACY) {
      this.dragOrigin = this.view.offset;
  }

  // Not dragging, so pass the mouse move on.
  if (this.dragOrigin == null &&
      ($.now() - this.pressTimestamp) >= DRAG_LATENCY) {
    this.stateController.handleDrawingMove(this.view.screenToCell(position));
  }

  // Drag in progress, update the view origin.
  if (this.dragOrigin != null) {
    this.view.offset = this.dragOrigin.add(
        this.pressVector
            .subtract(new ascii.Vector(x, y))
            .scale(1/this.view.zoom));
  }
};

ascii.Controller.prototype.handleRelease = function(x, y) {
  var position = new ascii.Vector(x, y);

  // Drag wasn't initiated in time, treat this as a drawing event.
  if (this.dragOrigin == null &&
      ($.now() - this.pressTimestamp) >= DRAG_LATENCY) {
    this.stateController.handleDrawingRelease(this.view.screenToCell(position));
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

ascii.Controller.prototype.installTouchBindings = function() {
  var controller = this;
  $(this.view.canvas).bind("touchstart", function(e) {
      e.stopPropagation();
      controller.handlePress(
         e.originalEvent.touches[0].clientX,
         e.originalEvent.touches[0].clientY);
  });
  $(this.view.canvas).bind("touchend", function(e) {
      e.stopPropagation();
      controller.handleRelease(
         e.originalEvent.touches[0].clientX,
         e.originalEvent.touches[0].clientY);
  });
  $(this.view.canvas).bind("touchmove", function(e) {
      e.stopPropagation();
      controller.handleMove(
         e.originalEvent.touches[0].clientX,
         e.originalEvent.touches[0].clientY);
  });
};
