goog.provide('ascii.StateController');

goog.require('ascii.Vector');

/**
 * Common interface for different drawing functions, e.g. box, line, etc.
 * @interface
 */
function DrawFunction() {}
/** Start of drawing. @param {ascii.Vector} position */
DrawFunction.prototype.start = function(position) {};
/** Drawing move. @param {ascii.Vector} position */
DrawFunction.prototype.move = function(position) {};
/** End of drawing. @param {ascii.Vector} position */
DrawFunction.prototype.end = function(position) {};

/**
 * @constructor
 * @implements {DrawFunction}
 * @param {ascii.State} state
 */
function DrawBox(state) {
  this.state = state;
  /** @type {ascii.Vector} */ this.startPosition = null;
  /** @type {ascii.Vector} */ this.endPosition = null;
}

DrawBox.prototype.start = function(position) {
  this.startPosition = position;
  this.endPosition = position;
  this.draw();
};
DrawBox.prototype.move = function(position) {
  this.endPosition = position;
  this.state.clearDraw();
  this.draw();
};
DrawBox.prototype.end = function(position) {
  this.state.commitDraw();
};

/** Draws the currently dragged out box. */
DrawBox.prototype.draw = function() {
  var x1 = Math.min(this.startPosition.x, this.endPosition.x);
  var y1 = Math.min(this.startPosition.y, this.endPosition.y);
  var x2 = Math.max(this.startPosition.x, this.endPosition.x);
  var y2 = Math.max(this.startPosition.y, this.endPosition.y);

  this.state.drawSpecial(new ascii.Vector(x1, y1));
  this.state.drawSpecial(new ascii.Vector(x1, y2));
  this.state.drawSpecial(new ascii.Vector(x2, y1));
  this.state.drawSpecial(new ascii.Vector(x2, y2));


  for (var x = x1 + 1; x < x2; x++) {
    this.state.drawSpecial(new ascii.Vector(x, y1));
    this.state.drawSpecial(new ascii.Vector(x, y2));
  }
  for (var y = y1 + 1; y < y2; y++) {
    this.state.drawSpecial(new ascii.Vector(x1, y));
    this.state.drawSpecial(new ascii.Vector(x2, y));
  }
};

/**
 * @constructor
 * @implements {DrawFunction}
 * @param {ascii.State} state
 */
function DrawLine(state) {
  this.state = state;
  /** @type {ascii.Vector} */ this.startPosition = null;
  /** @type {ascii.Vector} */ this.endPosition = null;
}

DrawLine.prototype.start = function(position) {
  this.startPosition = position;
  this.endPosition = position;
  this.draw();
};
DrawLine.prototype.move = function(position) {
  this.endPosition = position;
  this.state.clearDraw();
  this.draw();
};
DrawLine.prototype.end = function(position) {
  this.state.commitDraw();
};

/** 
 * Draws the currently dragged out line.
 */
DrawLine.prototype.draw = function() {
  var upStart = this.state.isSpecial(
      this.startPosition.add(new ascii.Vector(0, -1)));
  var downStart = this.state.isSpecial(
      this.startPosition.add(new ascii.Vector(0, 1)));
  var leftEnd = this.state.isSpecial(
      this.endPosition.add(new ascii.Vector(-1, 0)));
  var rightEnd = this.state.isSpecial(
      this.endPosition.add(new ascii.Vector(1, 0)));

  // Look at the start and end contexts to infer line orientation.
  var isClockwise = (upStart && downStart) || (leftEnd && rightEnd);

  var hX1 = Math.min(this.startPosition.x, this.endPosition.x);
  var vY1 = Math.min(this.startPosition.y, this.endPosition.y);
  var hX2 = Math.max(this.startPosition.x, this.endPosition.x);
  var vY2 = Math.max(this.startPosition.y, this.endPosition.y);

  var hY = isClockwise ? this.startPosition.y : this.endPosition.y;
  var vX = isClockwise ? this.endPosition.x : this.startPosition.x;

  while (hX1++ < hX2) {
    this.state.drawSpecial(new ascii.Vector(hX1, hY));
  }
  while (vY1++ < vY2) {
    this.state.drawSpecial(new ascii.Vector(vX, vY1));
  }
  this.state.drawSpecial(new ascii.Vector(this.startPosition.x, this.startPosition.y));
  this.state.drawSpecial(new ascii.Vector(this.endPosition.x, this.endPosition.y));
  this.state.drawSpecial(new ascii.Vector(vX, hY));
};

/**
 * @constructor
 * @implements {DrawFunction}
 * @param {ascii.State} state
 * @param {?string} value
 */
function DrawFreeform(state, value) {
  this.state = state;
  this.value = value;
}

DrawFreeform.prototype.start = function(position) {
  this.state.setValue(position, this.value);
};
DrawFreeform.prototype.move = function(position) {
  this.state.setValue(position, this.value);
};

DrawFreeform.prototype.end = function(position) {
};

/**
 * Handles management of the diagram state. Input events are cleaned in the
 * parent controller and passed down to this class for dealing with drawing.
 *
 * @constructor
 * @param {ascii.State} state
 */
ascii.StateController = function(state) {
  /** @type {ascii.State} */ this.state = state;
  /** @type {DrawFunction} */ this.drawFunction = new DrawBox(state);

  $('#box-button').click(function(e) {
    this.drawFunction = new DrawBox(state);
  }.bind(this));

  $('#line-button').click(function(e) {
    this.drawFunction = new DrawLine(state);
  }.bind(this));

  $('#freeform-button').click(function(e) {
    this.drawFunction = new DrawFreeform(state, 'O');
  }.bind(this));

  $('#erase-button').click(function(e) {
    this.drawFunction = new DrawFreeform(state, null);
  }.bind(this));
};

/**
 * Handles a press in the context of the drawing frame.
 * @param {ascii.Vector} position
 */
ascii.StateController.prototype.handleDrawingPress = function(position) {
  this.drawFunction.start(position);
};

/**
 * Handles a release in the context of the drawing frame.
 * @param {ascii.Vector} position
 */
ascii.StateController.prototype.handleDrawingRelease = function(position) {
  this.drawFunction.end(position);
};

/**
 * Handles a move in the context of the drawing frame.
 * @param {ascii.Vector} position
 */
ascii.StateController.prototype.handleDrawingMove = function(position) {
  this.drawFunction.move(position);
};
