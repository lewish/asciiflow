/**
 * Handles desktop inputs, and passes them onto the main controller.
 * @constructor
 * @param {ascii.Controller} controller
 */
ascii.DesktopController = function(controller) {
  /** @type {ascii.Controller} */ this.controller = controller;

  /** @type {boolean} */ this.isDragging = false;

  this.installBindings();
};

/**
 * @param {number} delta
 */
ascii.DesktopController.prototype.handleZoom = function(delta) {
  var newzoom = this.controller.view.zoom * (delta > 0 ? 1.1 : 0.9);
  newzoom = Math.max(Math.min(newzoom, 5), 0.2);
  this.controller.view.setZoom(newzoom);
};

/**
 * Installs input bindings associated with keyboard controls.
 */
ascii.DesktopController.prototype.installBindings = function() {
  var canvas = this.controller.view.canvas;
  $(canvas).bind('mousewheel', function(e) {
      this.handleZoom(e.originalEvent.wheelDelta);
  }.bind(this));

  $(canvas).mousedown(function(e) {
      // Can drag by holding either the control or meta (Apple) key.
      if (e.ctrlKey || e.metaKey) {
        this.controller.startDrag(new ascii.Vector(e.clientX, e.clientY));
      } else {
        this.controller.startDraw(new ascii.Vector(e.clientX, e.clientY));
      }
  }.bind(this));

  // Pass these events through to the main controller.
  $(canvas).mouseup(function(e) {
      this.controller.endAll();
  }.bind(this));

  $(canvas).mouseleave(function(e) {
      this.controller.endAll();
  }.bind(this));

  $(canvas).mousemove(function(e) {
      this.controller.handleMove(new ascii.Vector(e.clientX, e.clientY));
  }.bind(this));
};


/**
 * Handles touch inputs, and passes them onto the main controller.
 * @constructor
 * @param {ascii.Controller} controller
 */
ascii.TouchController = function(controller) {
  /** @type {ascii.Controller} */ this.controller = controller;

  /** @type {ascii.Vector} */ this.pressVector;

  /** @type {number} */ this.originalZoom;
  /** @type {number} */ this.zoomLength;

  /** @type {number} */ this.pressTimestamp;
  /** @type {boolean} */ this.dragStarted = false;
  /** @type {boolean} */ this.zoomStarted = false;

  this.installBindings();
};

/**
 * @param {ascii.Vector} position
 */
ascii.TouchController.prototype.handlePress = function(position) {
  this.pressVector = position;
  this.pressTimestamp = $.now();
  this.dragStarted = false;

  // If a drag didn't start, then handle it as a draw.
  window.setTimeout(function() {
    if (!this.dragStarted && !this.zoomStarted) {
      this.controller.startDraw(position);
    }
  }.bind(this), DRAG_LATENCY);
};

/**
 * The multi-touch version of handlePress.
 * @param {ascii.Vector} positionOne
 * @param {ascii.Vector} positionTwo
 */
ascii.TouchController.prototype.handlePressMulti =
    function(positionOne, positionTwo) {
  // A second finger as been placed, cancel whatever we were doing.
  this.controller.endAll();
  this.zoomStarted = true;
  this.dragStarted = false;
  this.zoomLength = positionOne.subtract(positionTwo).length();
  this.originalZoom = this.controller.view.zoom;
};

/**
 * @param {ascii.Vector} position
 */
ascii.TouchController.prototype.handleMove = function(position) {
  // Initiate a drag if we have moved enough, quickly enough.
  if (!this.dragStarted &&
      ($.now() - this.pressTimestamp) < DRAG_LATENCY &&
      position.subtract(this.pressVector).length() > DRAG_ACCURACY) {
      this.dragStarted = true;
      this.controller.startDrag(position);
  }
  // Pass on the event.
  this.controller.handleMove(position);
};

/**
 * The multi-touch version of handleMove, effectively only deals with zooming.
 * @param {ascii.Vector} positionOne
 * @param {ascii.Vector} positionTwo
 */
ascii.TouchController.prototype.handleMoveMulti =
      function(positionOne, positionTwo) {
  if (this.zoomStarted) {
    var newZoom = this.originalZoom *
        positionOne.subtract(positionTwo).length() / this.zoomLength;
    newZoom = Math.max(Math.min(newZoom, 5), 0.5);
    this.controller.view.setZoom(newZoom);
  }
};

/**
 * Ends all current actions, cleans up any state.
 */
ascii.TouchController.prototype.reset = function() {
  this.dragStarted = false;
  this.zoomStarted = false;
  this.pressVector = null;
};

/**
 * Installs input bindings associated with touch controls.
 */
ascii.TouchController.prototype.installBindings = function() {
  var canvas = this.controller.view.canvas;

  $(canvas).bind('touchstart', function(e) {
      e.preventDefault();
      if (e.originalEvent.touches.length == 1) {
        this.handlePress(new ascii.Vector(
           e.originalEvent.touches[0].pageX,
           e.originalEvent.touches[0].pageY));
      } else if (e.originalEvent.touches.length > 1) {
        this.handlePressMulti(new ascii.Vector(
           e.originalEvent.touches[0].pageX,
           e.originalEvent.touches[0].pageY),
           new ascii.Vector(
               e.originalEvent.touches[1].pageX,
               e.originalEvent.touches[1].pageY));
      }
  }.bind(this));

  $(canvas).bind('touchmove', function(e) {
      e.preventDefault();
      if (e.originalEvent.touches.length == 1) {
        this.handleMove(new ascii.Vector(
           e.originalEvent.touches[0].pageX,
           e.originalEvent.touches[0].pageY));
      } else if (e.originalEvent.touches.length > 1) {
        this.handleMoveMulti(new ascii.Vector(
           e.originalEvent.touches[0].pageX,
           e.originalEvent.touches[0].pageY),
           new ascii.Vector(
               e.originalEvent.touches[1].pageX,
               e.originalEvent.touches[1].pageY));
      }
  }.bind(this));

  // Pass through, no special handling.
  $(canvas).bind('touchend', function(e) {
      e.preventDefault();
      this.reset();
      this.controller.endAll();
  }.bind(this));
};
