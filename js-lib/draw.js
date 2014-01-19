/**
 * All drawing classes and functions.
 */

/**
 * Draws a line on the diagram state.
 *
 * @param {ascii.State} state
 * @param {ascii.Vector} startPosition
 * @param {ascii.Vector} endPosition
 * @param {boolean} clockwise
 * @param {string=} opt_value
 */
function drawLine(state, startPosition, endPosition, clockwise, opt_value) {
  var value = opt_value || SPECIAL_VALUE;

  var hX1 = Math.min(startPosition.x, endPosition.x);
  var vY1 = Math.min(startPosition.y, endPosition.y);
  var hX2 = Math.max(startPosition.x, endPosition.x);
  var vY2 = Math.max(startPosition.y, endPosition.y);

  var hY = clockwise ? startPosition.y : endPosition.y;
  var vX = clockwise ? endPosition.x : startPosition.x;

  while (hX1++ < hX2) {
    state.drawValue(new ascii.Vector(hX1, hY), value);
  }
  while (vY1++ < vY2) {
    state.drawValue(new ascii.Vector(vX, vY1), value);
  }
  state.drawValue(startPosition, value);
  state.drawValue(endPosition, value);
  state.drawValue(new ascii.Vector(vX, hY), value);
}

/**
 * Common interface for different drawing functions, e.g. box, line, etc.
 * @interface
 */
ascii.DrawFunction = function() {};
/** Start of drawing. @param {ascii.Vector} position */
ascii.DrawFunction.prototype.start = function(position) {};
/** Drawing move. @param {ascii.Vector} position */
ascii.DrawFunction.prototype.move = function(position) {};
/** End of drawing. @param {ascii.Vector} position */
ascii.DrawFunction.prototype.end = function(position) {};

/**
 * @constructor
 * @implements {ascii.DrawFunction}
 * @param {ascii.State} state
 */
ascii.DrawBox = function(state) {
  this.state = state;
  /** @type {ascii.Vector} */ this.startPosition = null;
};

ascii.DrawBox.prototype.start = function(position) {
  this.startPosition = position;
};
ascii.DrawBox.prototype.move = function(position) {
  this.endPosition = position;
  this.state.clearDraw();
  drawLine(this.state, this.startPosition, position, true);
  drawLine(this.state, this.startPosition, position, false);
};
ascii.DrawBox.prototype.end = function(position) {
  this.state.commitDraw();
};


/**
 * @constructor
 * @implements {ascii.DrawFunction}
 * @param {ascii.State} state
 */
ascii.DrawLine = function(state) {
  this.state = state;
  /** @type {ascii.Vector} */ this.startPosition = null;
};

ascii.DrawLine.prototype.start = function(position) {
  this.startPosition = position;
};
ascii.DrawLine.prototype.move = function(position) {
  this.state.clearDraw();

  // Try to infer line orientation.
  // TODO: Split the line into two lines if we can't satisfy both ends.
  var startContext = this.state.getContext(this.startPosition);
  var endContext = this.state.getContext(position);
  var clockwise = (startContext.up && startContext.down) ||
      (endContext.left && endContext.right);

  drawLine(this.state, this.startPosition, position, clockwise);
};

ascii.DrawLine.prototype.end = function(position) {
  this.state.commitDraw();
};

/**
 * @constructor
 * @implements {ascii.DrawFunction}
 * @param {ascii.State} state
 * @param {?string} value
 */
ascii.DrawFreeform = function(state, value) {
  this.state = state;
  this.value = value;
};

ascii.DrawFreeform.prototype.start = function(position) {
  this.state.setValue(position, this.value);
};
ascii.DrawFreeform.prototype.move = function(position) {
  this.state.setValue(position, this.value);
};

ascii.DrawFreeform.prototype.end = function(position) {
};

/**
 * @constructor
 * @implements {ascii.DrawFunction}
 * @param {ascii.State} state
 */
ascii.DrawMove = function(state) {
  this.state = state;
  this.ends = null;
};

ascii.DrawMove.prototype.start = function(position) {
  var context = this.state.getContext(position);
  var directions = [
    new ascii.Vector(1, 0),
    new ascii.Vector(-1, 0),
    new ascii.Vector(0, 1),
    new ascii.Vector(0, -1)];

  var ends = [];
  for (var i in directions) {
    var midPoints = this.followLine(position, directions[i]);
    for (var k in midPoints) {
    var midPoint = midPoints[k];

    // Clockwise is a lie, it is true if we move vertically first.
    var clockwise = (directions[i].x != 0);
    // Ignore any directions that didn't go anywhere.
    if (position.equals(midPoint)) {
      continue;
    }
    var midPointContext = this.state.getContext(midPoint);
    // Special case, a straight line with no turns.
    if ((midPointContext.left + midPointContext.right +
        midPointContext.up + midPointContext.down) == 1) {
      ends.push({position: midPoint, clockwise: clockwise});
      continue;
    }
    // Continue following lines from the midpoint.
    for (var j in directions) {
      if (directions[i].add(directions[j]).length() == 0 ||
        directions[i].add(directions[j]).length() == 2) {
        // Don't go back on ourselves, or don't carry on in same direction.
        continue;
      }
      // On the second line we don't care about multiple junctions.
      var endz = this.followLine(midPoint, directions[j]);
      // Ignore any directions that didn't go anywhere.
      if (endz.length == 0 || midPoint.equals(endz[0])) {
        continue;
      }
      ends.push({position: endz[0], clockwise: clockwise});
    }
    }
  }
  this.ends = ends;

  // Clear all the lines so we can draw them afresh.
  for (var i in ends) {
    drawLine(this.state, position, ends[i].position, ends[i].clockwise, ' ');
  }
  this.state.commitDraw();
  // Redraw the new lines after we have cleared the existing ones.
  this.move(position);
};

ascii.DrawMove.prototype.move = function(position) {
  this.state.clearDraw();
  for (var i in this.ends) {
    drawLine(this.state, position, this.ends[i].position,
        this.ends[i].clockwise);
  }
};

ascii.DrawMove.prototype.end = function(position) {
  this.state.commitDraw();
};

ascii.DrawMove.prototype.followLine = function(startPosition, direction) {
  var endPosition = startPosition.clone();
  var junctions = [];
  while (true) {
    var nextEnd = endPosition.add(direction);
    if (!this.state.getCell(endPosition).isSpecial() ||
        !this.state.getCell(nextEnd).isSpecial()) {
      return junctions;
    }
    endPosition = nextEnd;
    var context = this.state.getContext(nextEnd);
    if (!(context.left && context.right && !context.up && !context.down) &&
        !(!context.left && !context.right && context.up && context.down)) {
      junctions.push(endPosition);
    }
  }
};

