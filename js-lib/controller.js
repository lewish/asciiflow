/**
 * Handles user input events and modifies state.
 *
 * @constructor
 * @param {ascii.View} view
 * @param {ascii.State} state
 */
ascii.Controller = function(view, state) {
  /** @type {ascii.View} */ this.view = view;
  /** @type {ascii.State} */ this.state = state;

  /** @type {ascii.DrawFunction} */ this.drawFunction =
      new ascii.DrawBox(state);

  /** @type {ascii.Vector} */ this.dragOrigin;
  /** @type {ascii.Vector} */ this.pressVector;
  /** @type {ascii.Vector} */ this.lastMoveCell;
  /** @type {number} */ this.pressTimestamp;

  this.installBindings();
};

/**
 * @param {ascii.Vector} position
 */
ascii.Controller.prototype.handlePress = function(position) {
  this.pressVector = position;
  this.pressTimestamp = $.now();

  // Check to see if a drag happened in the given allowed time.
  window.setTimeout(function() {
    if (this.dragOrigin == null && this.pressVector != null) {
      this.drawFunction.start(this.view.screenToCell(position));
      this.view.dirty = true;
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
    this.drawFunction.move(this.view.screenToCell(position));
    this.view.dirty = true;
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
    this.drawFunction.end(this.view.screenToCell(position));
    this.view.dirty = true;
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
ascii.Controller.prototype.installBindings = function() {
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

  $(this.view.canvas).mouseleave(function(e) {
      controller.handleRelease(new ascii.Vector(e.clientX, e.clientY));
  });

  $(this.view.canvas).mousemove(function(e) {
      controller.handleMove(new ascii.Vector(e.clientX, e.clientY));
  });

  $(window).resize(function(e) { controller.view.resizeCanvas() });

  $(this.view.canvas).bind('touchstart', function(e) {
      e.preventDefault();
      controller.handlePress(new ascii.Vector(
         e.originalEvent.touches[0].pageX,
         e.originalEvent.touches[0].pageY));
  });

  $(this.view.canvas).bind('touchend', function(e) {
      e.preventDefault();
      // TODO: This works for now as we don't use a touchend position anywhere.
      //       Need to track last position from touchmove and use it here.
      controller.handleRelease(new ascii.Vector(0, 0));
  });

  $(this.view.canvas).bind('touchmove', function(e) {
      e.preventDefault();
      controller.handleMove(new ascii.Vector(
         e.originalEvent.touches[0].pageX,
         e.originalEvent.touches[0].pageY));
  });
  // TODO: Handle pinch to zoom.

  $('#box-button').click(function(e) {
    this.drawFunction = new ascii.DrawBox(this.state);
  }.bind(this));

  $('#line-button').click(function(e) {
    this.drawFunction = new ascii.DrawLine(this.state);
  }.bind(this));

  $('#freeform-button').click(function(e) {
    this.drawFunction = new ascii.DrawFreeform(this.state, '+');
  }.bind(this));

  $('#erase-button').click(function(e) {
    this.drawFunction = new ascii.DrawFreeform(this.state, null);
  }.bind(this));

  $('#move-button').click(function(e) {
    this.drawFunction = new ascii.DrawMove(this.state);
  }.bind(this));
};
