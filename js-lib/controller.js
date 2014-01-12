/**
 * Handles user input events and modifies state.
 */
goog.provide('ascii.Controller');

goog.require('ascii.StateController');
goog.require('ascii.Vector');
goog.require('ascii.View');

/** @const */ var DRAG_LATENCY = 150; // Milliseconds.
/** @const */ var DRAG_ACCURACY = 0.1; // Pixels.

/**
 * @constructor
 * @param {ascii.View} view
 * @param {ascii.State} state
 */
ascii.Controller = function(view, state) {
  /** @type {ascii.View} */ this.view = view;
  /** @type {ascii.State} */ this.state = state;

  /** @type {ascii.StateController} */ this.stateController =
      new ascii.StateController(state);

  /** @type {ascii.Vector} */ this.dragOrigin;
  /** @type {ascii.Vector} */ this.pressVector;
  /** @type {ascii.Vector} */ this.lastMoveCell;
  /** @type {number} */ this.pressTimestamp;

  this.installDesktopBindings();
  this.installTouchBindings();
};

/**
 * @param {ascii.Vector} position
 */
ascii.Controller.prototype.handlePress = function(position) {
  this.pressVector = position;
  this.pressTimestamp = $.now();

  // Check to see if a drag happened in the given allowed time.
  window.setTimeout(function() {
    if (this.dragOrigin == null) {
      this.stateController.handleDrawingPress(this.view.screenToCell(position));
    }
    // TODO: Skip this if release happens before timeout.
  }.bind(this), DRAG_LATENCY);
};

/**
 * @param {ascii.Vector} position
 */
ascii.Controller.prototype.handleMove = function(position) {
  // No clicks, so just ignore.
  if (this.pressVector == null) { return; }

  // Initiate a drag if we have moved enough, quickly enough.
  if (this.dragOrigin == null &&
      ($.now() - this.pressTimestamp) < DRAG_LATENCY &&
      position.subtract(this.pressVector).length() > DRAG_ACCURACY) {
      this.dragOrigin = this.view.offset;
  }

  // Not dragging, so pass the mouse move on, but remove duplicates.
  if (this.dragOrigin == null &&
      ($.now() - this.pressTimestamp) >= DRAG_LATENCY &&
      (this.lastMoveCell == null ||
          !this.view.screenToCell(position)
          .equals(this.view.screenToCell(this.lastMoveCell)))) {
    this.stateController.handleDrawingMove(this.view.screenToCell(position));
    this.lastMoveCell = position;
  }

  // Drag in progress, update the view origin.
  if (this.dragOrigin != null) {
    this.view.setOffset(this.dragOrigin.add(
        this.pressVector
            .subtract(position)
            .scale(1 / this.view.zoom)));
  }
};

/**
 * @param {ascii.Vector} position
 */
ascii.Controller.prototype.handleRelease = function(position) {
  // Drag wasn't initiated in time, treat this as a drawing event.
  if (this.dragOrigin == null &&
      ($.now() - this.pressTimestamp) >= DRAG_LATENCY) {
    this.stateController.handleDrawingRelease(this.view.screenToCell(position));
  }
  this.pressVector = null;
  this.pressTimestamp = 0;
  this.dragOrigin = null;
  this.lastMoveCell = null;
};

/**
 * @param {number} delta
 */
ascii.Controller.prototype.handleZoom = function(delta) {
  var newzoom = this.view.zoom * (delta > 0 ? 1.1 : 0.9);
  newzoom = Math.max(Math.min(newzoom, 5), 0.2);
  this.view.setZoom(newzoom);
};

/**
 * Installs input bindings for desktop devices.
 */
ascii.Controller.prototype.installDesktopBindings = function() {
  var controller = this;
  $(this.view.canvas).bind('mousewheel', function(e) {
      controller.handleZoom(e.originalEvent.wheelDelta);
  });
  $(this.view.canvas).mousedown(function(e) {
      controller.handlePress(new ascii.Vector(e.clientX, e.clientY));
  });
  $(this.view.canvas).mouseup(function(e) {
      controller.handleRelease(new ascii.Vector(e.clientX, e.clientY));
  });
  $(this.view.canvas).mousemove(function(e) {
      controller.handleMove(new ascii.Vector(e.clientX, e.clientY));
  });
  $(window).resize(function(e) { controller.view.resizeCanvas() });
};

/**
 * Installs input bindings for touch devices.
 */
ascii.Controller.prototype.installTouchBindings = function() {
  var controller = this;
  $(this.view.canvas).bind('touchstart', function(e) {
      e.preventDefault();
      controller.handlePress(new ascii.Vector(
         e.originalEvent.touches[0].pageX,
         e.originalEvent.touches[0].pageY));
  });
  $(this.view.canvas).bind('touchend', function(e) {
      e.preventDefault();
      controller.handleRelease(new ascii.Vector(
         e.originalEvent.touches[0].pageX,
         e.originalEvent.touches[0].pageY));
  });
  $(this.view.canvas).bind('touchmove', function(e) {
      e.preventDefault();
      controller.handleMove(new ascii.Vector(
         e.originalEvent.touches[0].pageX,
         e.originalEvent.touches[0].pageY));
  });
  // TODO: Handle pinch to zoom.
};
