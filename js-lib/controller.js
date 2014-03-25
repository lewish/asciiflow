/**
 * Different modes of control.
 * @const
 */
var Mode = {
    NONE: 0,
    DRAG: 1,
    DRAW: 2
};

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

  /** @type {number} */ this.mode = Mode.NONE;
  /** @type {ascii.Vector} */ this.dragOrigin;
  /** @type {ascii.Vector} */ this.dragOriginCell;

  this.installBindings();
};

/**
 * @param {ascii.Vector} position
 */
ascii.Controller.prototype.startDraw = function(position) {
  this.mode = Mode.DRAW;
  this.drawFunction.start(this.view.screenToCell(position));
};

/**
 * @param {ascii.Vector} position
 */
ascii.Controller.prototype.startDrag = function(position) {
  this.mode = Mode.DRAG;
  this.dragOrigin = position;
  this.dragOriginCell = this.view.offset;
};

/**
 * @param {ascii.Vector} position
 */
ascii.Controller.prototype.handleMove = function(position) {
  var moveCell = this.view.screenToCell(position);

  // First move event, make sure we don't blow up here.
  if (this.lastMoveCell == null) {
    this.lastMoveCell = moveCell;
  }

  // Update the cursor pointer, depending on the draw function.
  if (!moveCell.equals(this.lastMoveCell)) {
    this.view.canvas.style.cursor = this.drawFunction.getCursor(moveCell);
  }

  // In drawing mode, so pass the mouse move on, but remove duplicates.
  if (this.mode == Mode.DRAW && !moveCell.equals(this.lastMoveCell)) {
    this.drawFunction.move(moveCell);
  }

  // Drag in progress, update the view origin.
  if (this.mode == Mode.DRAG) {
    this.view.setOffset(this.dragOriginCell.add(
        this.dragOrigin
            .subtract(position)
            .scale(1 / this.view.zoom)));
  }
  this.lastMoveCell = moveCell;
};

/**
 * Ends the current operation.
 */
ascii.Controller.prototype.endAll = function() {
  if (this.mode == Mode.DRAW) {
    this.drawFunction.end();
  }
  // Cleanup state.
  this.mode = Mode.NONE;
  this.dragOrigin = null;
  this.dragOriginCell = null;
  this.lastMoveCell = null;
};

/**
 * Installs input bindings for common use cases devices.
 */
ascii.Controller.prototype.installBindings = function() {
  var controller = this;

  $(window).resize(function(e) { controller.view.resizeCanvas() });

  $('#draw-tools > button.tool').click(function(e) {
    $('#text-tool-widget').hide(0);
    this.handleDrawButton(e.target.id);
  }.bind(this));

  $('#file-tools > button.tool').click(function(e) {
    this.handleFileButton(e.target.id);
  }.bind(this));

  $('button.close-dialog-button').click(function(e) {
    $('.dialog').removeClass('visible');
  }.bind(this));

  $('#import-submit-button').click(function(e) {
    this.state.clear();
    this.state.fromText($('#import-area').val(),
        this.view.screenToCell(new ascii.Vector(
            this.view.canvas.width / 2,
            this.view.canvas.height / 2)));
    $('#import-area').val('');
  }.bind(this));

  $('#use-lines-button').click(function(e) {
   $('.dialog').removeClass('visible');
    this.view.setUseLines(true);
  }.bind(this));

  $('#use-ascii-button').click(function(e) {
   $('.dialog').removeClass('visible');
    this.view.setUseLines(false);
  }.bind(this));

  $(window).keypress(function(e) {
    this.handleKeyPress(e);
  }.bind(this));

  $(window).keydown(function(e) {
    this.handleKeyDown(e);
  }.bind(this));

  // Bit of a hack, just triggers the text tool to get a new value.
  $('#text-tool-input, #freeform-tool-input').keyup(function(){
      this.drawFunction.handleKey('');
  }.bind(this));
  $('#text-tool-input, #freeform-tool-input').change(function(){
      this.drawFunction.handleKey('');
  }.bind(this));
  $('#text-tool-close').click(function(){
    $('#text-tool-widget').hide();
    this.state.commitDraw();
  }.bind(this));
};

/**
 * Handles the buttons in the UI.
 * @param {string} id The ID of the element clicked.
 */
ascii.Controller.prototype.handleDrawButton = function(id) {
  $('#draw-tools > button.tool').removeClass('active');
  $('#' + id).toggleClass('active');
  $('.dialog').removeClass('visible');

  // Install the right draw tool based on button pressed.
  if (id == 'box-button') {
    this.drawFunction = new ascii.DrawBox(this.state);
  }
  if (id == 'line-button') {
    this.drawFunction = new ascii.DrawLine(this.state);
  }
  if (id == 'freeform-button') {
    this.drawFunction = new ascii.DrawFreeform(this.state, "X");
  }
  if (id == 'erase-button') {
    this.drawFunction = new ascii.DrawErase(this.state);
  }
  if (id == 'move-button') {
    this.drawFunction = new ascii.DrawMove(this.state);
  }
  if (id == 'text-button') {
    this.drawFunction = new ascii.DrawText(this.state, this.view);
  }
  this.state.commitDraw();
  this.view.canvas.focus();
};

/**
 * Handles the buttons in the UI.
 * @param {string} id The ID of the element clicked.
 */
ascii.Controller.prototype.handleFileButton = function(id) {
  $('.dialog').removeClass('visible');
  $('#' + id + '-dialog').toggleClass('visible');

  if (id == 'import-button') {
    $('#import-area').val('');
    $('#import-area').focus();
  }

  if (id == 'export-button') {
    $('#export-area').val(this.state.outputText());
    $('#export-area').select();
  }
  if (id == 'clear-button') {
    this.state.clear();
  }
  if (id == 'undo-button') {
    this.state.undo();
  }
  if (id == 'redo-button') {
    this.state.redo();
  }
};

/**
 * Handles key presses.
 * @param {Object} event
 */
ascii.Controller.prototype.handleKeyPress = function(event) {
  if (!event.ctrlKey && !event.metaKey && event.keyCode != 13) {
    this.drawFunction.handleKey(String.fromCharCode(event.keyCode));
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
    if (event.keyCode == 90) { this.state.undo(); }
    if (event.keyCode == 89) { this.state.redo(); }
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
  }
};

