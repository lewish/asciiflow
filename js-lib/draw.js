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

  var startX = Math.min(startPosition.x, endPosition.x);
  var startY = Math.min(startPosition.y, endPosition.y);
  var endX = Math.max(startPosition.x, endPosition.x);
  var endY = Math.max(startPosition.y, endPosition.y);

  var midX = clockwise ? endPosition.x : startPosition.x;
  var midY = clockwise ? startPosition.y : endPosition.y;

  while (startX++ < endX) {
    state.drawValue(new ascii.Vector(startX, midY), value);
  }
  while (startY++ < endY) {
    state.drawValue(new ascii.Vector(midX, startY), value);
  }
  state.drawValue(startPosition, value);
  state.drawValue(endPosition, value);
  state.drawValue(new ascii.Vector(midX, midY), value);
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
/** Cursor for given cell.
 * @param {ascii.Vector} position
 * @return {string} 
 */
ascii.DrawFunction.prototype.getCursor = function(position) {};
/** Handle the key with given value being pressed. @param {string} value */
ascii.DrawFunction.prototype.handleKey = function(value) {};

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
ascii.DrawBox.prototype.getCursor = function(position) {
  return 'crosshair';
};
ascii.DrawBox.prototype.handleKey = function(value) {};

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
ascii.DrawLine.prototype.getCursor = function(position) {
  return 'crosshair';
};
ascii.DrawLine.prototype.handleKey = function(value) {};

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
  this.state.drawValue(position, this.value);
};
ascii.DrawFreeform.prototype.move = function(position) {
  this.state.drawValue(position, this.value);
};
ascii.DrawFreeform.prototype.end = function(position) {
  this.state.commitDraw();
};
ascii.DrawFreeform.prototype.getCursor = function(position) {
  return 'crosshair';
};
ascii.DrawFreeform.prototype.handleKey = function(value) {};

/**
 * @constructor
 * @implements {ascii.DrawFunction}
 * @param {ascii.State} state
 */
ascii.DrawText = function(state) {
  this.state = state;
  this.startPosition = null;
  this.currentPosition = null;
};

ascii.DrawText.prototype.start = function(position) {
  this.startPosition = position;
  this.currentPosition = position;
  // Clean up any existing draws.
  this.state.clearDraw();
  // Effectively highlights the starting cell.
  var currentValue = this.state.getCell(position).getRawValue();
  this.state.drawValue(position, currentValue == null ? ' ' : currentValue);
};
ascii.DrawText.prototype.move = function(position) {};
ascii.DrawText.prototype.end = function(position) {};
ascii.DrawText.prototype.getCursor = function(position) {
  return 'text';
};
ascii.DrawText.prototype.handleKey = function(value) {
  if (this.currentPosition == null) {
    return;
  }
  var nextPosition = this.currentPosition.add(new ascii.Vector(1, 0));
  
  if (value == KEY_RETURN || this.state.getCell(nextPosition).isSpecial()) {
    // Pressed return key or hit box, so clear this cell and new line.
    this.state.clearDraw();
    nextPosition = this.startPosition.add(new ascii.Vector(0, 1));
    this.startPosition = nextPosition;
  } 
  if (value == KEY_BACKSPACE && this.startPosition.x <= nextPosition.x) {
    // Pressed backspace key, so clear this cell and go back.
    this.state.clearDraw();
    nextPosition = this.currentPosition.add(new ascii.Vector(-1, 0));
    this.state.drawValue(nextPosition, ' ');
    this.state.commitDraw();
  }
  if (value == KEY_UP) { 
    this.state.clearDraw();
    this.startPosition = nextPosition = this.currentPosition.add(new ascii.Vector(0, -1))
  }
  if (value == KEY_LEFT) {
    this.state.clearDraw();
    this.startPosition = nextPosition = this.currentPosition.add(new ascii.Vector(-1, 0))
  }
  if (value == KEY_RIGHT) {
    this.state.clearDraw();
    this.startPosition = nextPosition = this.currentPosition.add(new ascii.Vector(1, 0))
  }
  if (value == KEY_DOWN) {
    this.state.clearDraw();
    this.startPosition = nextPosition = this.currentPosition.add(new ascii.Vector(0, 1))
  }

  if (value.length == 1) {
    // The value is not a special character, so draw the value and commit it.
    this.state.drawValue(this.currentPosition, value);
    this.state.commitDraw();
  }

  // Highlight the next cell.
  this.currentPosition = nextPosition;
  var nextValue = this.state.getCell(nextPosition).getRawValue();
  this.state.drawValue(nextPosition, nextValue == null ? ' ' : nextValue);
};

/**
 * @constructor
 * @implements {ascii.DrawFunction}
 * @param {ascii.State} state
 */
ascii.DrawErase = function(state) {
  this.state = state;
  this.startPosition = null;
  this.endPosition = null;
};

ascii.DrawErase.prototype.start = function(position) {
  this.startPosition = position;
  this.move(position);
};
ascii.DrawErase.prototype.move = function(position) {
  this.state.clearDraw();
  this.endPosition = position;

  var startX = Math.min(this.startPosition.x, this.endPosition.x);
  var startY = Math.min(this.startPosition.y, this.endPosition.y);
  var endX = Math.max(this.startPosition.x, this.endPosition.x);
  var endY = Math.max(this.startPosition.y, this.endPosition.y);

  for (var i = startX; i <= endX; i++) {
    for (var j = startY; j <= endY; j++) {
      this.state.drawValue(new ascii.Vector(i, j), ' ');
    }
  }
};
ascii.DrawErase.prototype.end = function(position) {
  this.state.commitDraw();
};
ascii.DrawErase.prototype.getCursor = function(position) {
  return 'crosshair';
};
ascii.DrawErase.prototype.handleKey = function(value) {};

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

/**
 * Follows a line in a given direction from the startPosition.
 * Returns a list of positions that were line 'junctions'. This is a bit of a
 * loose definition, but basically means a point around which we resize things.
 */
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
    // TODO: Would be nice to skip over 4 way junctions here, but need to avoid
    // clearing them too if we decide to do that.
    if (!(context.left && context.right && !context.up && !context.down) &&
        !(!context.left && !context.right && context.up && context.down)) {
      junctions.push(endPosition);
    }
  }
};

ascii.DrawMove.prototype.getCursor = function(position) {
  if (this.state.getCell(position).isSpecial()) {
    return 'pointer';
  } else {
    return 'default';
  }
};

ascii.DrawMove.prototype.handleKey = function(value) {};

