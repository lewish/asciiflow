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
  // Update the cursor pointer, depending on the draw function.
  this.view.canvas.style.cursor = this.drawFunction.getCursor(
      this.view.screenToCell(position));

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

  $('#buttons > button.tool').click(function(e) {
    this.updateButtons(e.target.id);
  }.bind(this));

  $('#undo-button').click(function(e) {
    this.state.undo();
    this.view.dirty = true;
  }.bind(this));

  $('#import-submit-button').click(function(e) {
    this.state.clear();
    this.state.fromText($('#import-area').val(),
        this.view.screenToCell(new ascii.Vector(
            this.view.canvas.width / 4,
            this.view.canvas.height / 4)));
    $('#import-area').val('');
    this.view.dirty = true;
  }.bind(this));

  $(window).keypress(function(e) {
    this.handleKeyPress(e);
  }.bind(this));

  $(window).keydown(function(e) {
    this.handleKeyDown(e);
  }.bind(this));
};

/**
 * Handles the buttons in the UI.
 * @param {string} id The ID of the element clicked.
 */
ascii.Controller.prototype.updateButtons = function(id) {
  $('#buttons > button.tool').removeClass('active');
  $('.dialog').removeClass('visible');

  $('#' + id).toggleClass('active');
  $('#' + id + '-dialog').toggleClass('visible');

  // Install the right draw tool based on button pressed.
  if (id == 'box-button') {
    this.drawFunction = new ascii.DrawBox(this.state);
  }
  if (id == 'line-button') {
    this.drawFunction = new ascii.DrawLine(this.state);
  }
  if (id == 'freeform-button') {
    this.drawFunction = new ascii.DrawFreeform(this.state, SPECIAL_VALUE);
  }
  if (id == 'erase-button') {
    this.drawFunction = new ascii.DrawErase(this.state);
  }
  if (id == 'move-button') {
    this.drawFunction = new ascii.DrawMove(this.state);
  }
  if (id == 'text-button') {
    this.drawFunction = new ascii.DrawText(this.state);
  }
  if (id == 'export-button') {
    $('#export-area').val(this.state.outputText());
  }
  if (id == 'clear-button') {
    this.state.clear();
    this.view.dirty = true;
  }
};

/**
 * Handles key presses.
 * @param {Object} event
 */
ascii.Controller.prototype.handleKeyPress = function(event) {
  if (!event.ctrlKey && !event.metaKey && event.keyCode != 13) {
    this.drawFunction.handleKey(String.fromCharCode(event.keyCode));
    this.view.dirty = true;
  }
};

/**
 * Handles key down events.
 * @param {Object} event
 */
ascii.Controller.prototype.handleKeyDown = function(event) {
  // Override some special characters so that they can be handled in one place.
  var specialKeyCode = null;

  if (event.ctrlKey || event.metaKey) {
    if (event.keyCode == 67) { specialKeyCode = KEY_COPY; }
    if (event.keyCode == 86) { specialKeyCode = KEY_PASTE; }
    if (event.keyCode == 90) { this.state.undo(); this.view.dirty = true; }
    // if (event.keyCode == 89) { this.state.redo(); }
    if (event.keyCode == 88) { specialKeyCode = KEY_CUT; }
  }

  if (event.keyCode == 8) { specialKeyCode = KEY_BACKSPACE; }
  if (event.keyCode == 13) { specialKeyCode = KEY_RETURN; }
  if (event.keyCode == 38) { specialKeyCode = KEY_UP; }
  if (event.keyCode == 40) { specialKeyCode = KEY_DOWN; }
  if (event.keyCode == 37) { specialKeyCode = KEY_LEFT; }
  if (event.keyCode == 39) { specialKeyCode = KEY_RIGHT; }

  if (specialKeyCode != null) {
    //event.preventDefault();
    //event.stopPropagation();
    this.drawFunction.handleKey(specialKeyCode);
    this.view.dirty = true;
  }
};

