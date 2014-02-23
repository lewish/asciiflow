/**
 * Handles desktop inputs, and passes them onto the main controller.
 * @constructor
 * @param {ascii.Controller} controller
 */
ascii.DesktopController = function(controller) {
  /** @type {ascii.Controller} */ this.controller = controller;

  /** @type {boolean} */ this.isDragging = false;

  this.installBindings();
}

/**
 * @param {ascii.Vector} position
 */
ascii.DesktopController.prototype.handlePress = function(position, e) {
  // Can drag by holding either the control or meta (Apple) key.
  if (e.ctrlKey || e.metaKey) {
    this.controller.startDrag(position);
  } else {
    this.controller.startDraw(position);
  }
};

ascii.DesktopController.prototype.installBindings = function() {
  var canvas = this.controller.view.canvas;
  $(canvas).bind('mousewheel', function(e) {
      this.controller.handleZoom(e.originalEvent.wheelDelta);
  }.bind(this));

  $(canvas).mousedown(function(e) {
      this.handlePress(new ascii.Vector(e.clientX, e.clientY), e);
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
  /** @type {number} */ this.pressTimestamp;
  /** @type {boolean} */ this.dragStarted = false;

  this.installBindings();
}

/**
 * @param {ascii.Vector} position
 */
ascii.TouchController.prototype.handlePress = function(position) {
  this.pressVector = position;
  this.pressTimestamp = $.now();
  this.dragStarted = false;

  // If a drag didn't start, then handle it as a draw.
  window.setTimeout(function() {
    if (!this.dragStarted) {
      this.controller.startDraw(position);
    }
  }.bind(this), DRAG_LATENCY);
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

ascii.TouchController.prototype.installBindings = function() {
  var canvas = this.controller.view.canvas;

  $(canvas).bind('touchstart', function(e) {
      e.preventDefault();
      this.handlePress(new ascii.Vector(
         e.originalEvent.touches[0].pageX,
         e.originalEvent.touches[0].pageY));
  }.bind(this));

  $(canvas).bind('touchmove', function(e) {
      e.preventDefault();
      this.handleMove(new ascii.Vector(
         e.originalEvent.touches[0].pageX,
         e.originalEvent.touches[0].pageY));
  }.bind(this));

  // Pass through, no special handling.
  $(canvas).bind('touchend', function(e) {
      e.preventDefault();
      this.controller.endAll();
  }.bind(this));
};
