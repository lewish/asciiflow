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
    var position = new ascii.Vector(startX, midY);
    var context = state.getContext(new ascii.Vector(startX, midY));
    // Don't erase any lines that we cross.
    if (value != ' ' || context.up + context.down != 2) {
      state.drawValueIncremental(position, value);
    }
  }
  while (startY++ < endY) {
    var position = new ascii.Vector(midX, startY);
    var context = state.getContext(new ascii.Vector(midX, startY));
    // Don't erase any lines that we cross.
    if (value != ' ' || context.left + context.right != 2) {
      state.drawValueIncremental(position, value);
    }
  }

  state.drawValue(startPosition, value);
  state.drawValue(endPosition, value);
  state.drawValueIncremental(new ascii.Vector(midX, midY), value);
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
/** End of drawing. */
ascii.DrawFunction.prototype.end = function() {};
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

/** @inheritDoc */
ascii.DrawBox.prototype.start = function(position) {
  this.startPosition = position;
};

/** @inheritDoc */
ascii.DrawBox.prototype.move = function(position) {
  this.endPosition = position;
  this.state.clearDraw();
  drawLine(this.state, this.startPosition, position, true);
  drawLine(this.state, this.startPosition, position, false);
};

/** @inheritDoc */
ascii.DrawBox.prototype.end = function() {
  this.state.commitDraw();
};

/** @inheritDoc */
ascii.DrawBox.prototype.getCursor = function(position) {
  return 'crosshair';
};

/** @inheritDoc */
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

/** @inheritDoc */
ascii.DrawLine.prototype.start = function(position) {
  this.startPosition = position;
};

/** @inheritDoc */
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

/** @inheritDoc */
ascii.DrawLine.prototype.end = function() {
  this.state.commitDraw();
};

/** @inheritDoc */
ascii.DrawLine.prototype.getCursor = function(position) {
  return 'crosshair';
};

/** @inheritDoc */
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
  if (TOUCH_ENABLED) {
    $('#freeform-tool-input').val('');
    $('#freeform-tool-input').hide(0, function() {$('#freeform-tool-input').show(0, function() {$('#freeform-tool-input').focus();});});
  }
};

/** @inheritDoc */
ascii.DrawFreeform.prototype.start = function(position) {
  this.state.drawValue(position, this.value);
};

/** @inheritDoc */
ascii.DrawFreeform.prototype.move = function(position) {
  this.state.drawValue(position, this.value);
};

/** @inheritDoc */
ascii.DrawFreeform.prototype.end = function() {
  this.state.commitDraw();
};

/** @inheritDoc */
ascii.DrawFreeform.prototype.getCursor = function(position) {
  return 'crosshair';
};

/** @inheritDoc */
ascii.DrawFreeform.prototype.handleKey = function(value) {
  if (TOUCH_ENABLED) {
    this.value = $('#freeform-tool-input').val().substr(0, 1);
    $('#freeform-tool-input').blur();
    $('#freeform-tool-input').hide(0);
  }
  if (value.length == 1) {
    // The value is not a special character, so lets use it.
    this.value = value;
  }
};

/**
 * @constructor
 * @implements {ascii.DrawFunction}
 * @param {ascii.State} state
 */
ascii.DrawText = function(state, view) {
  this.state = state;
  this.startPosition = null;
};

/** @inheritDoc */
ascii.DrawText.prototype.start = function(position) {
  this.state.commitDraw();
  $('#text-tool-input').val('');
  this.startPosition = position;
  // Effectively highlights the starting cell.
  var currentValue = this.state.getCell(this.startPosition).getRawValue();
  this.state.drawValue(this.startPosition,
      currentValue == null ? ERASE_CHAR : currentValue);
};

/** @inheritDoc */
ascii.DrawText.prototype.move = function(position) {};

/** @inheritDoc */
ascii.DrawText.prototype.end = function() {
  if (this.startPosition != null) {
    this.endPosition = this.startPosition;
    this.startPosition = null;
    // Valid end click/press, show the textbox and focus it.
    $('#text-tool-widget').hide(0, function() {$('#text-tool-widget').show(0, function() {$('#text-tool-input').focus();});});
  }
};

/** @inheritDoc */
ascii.DrawText.prototype.getCursor = function(position) {
  return 'pointer';
};

/** @inheritDoc */
ascii.DrawText.prototype.handleKey = function(value) {
  var text = $('#text-tool-input').val();
  this.state.clearDraw();
  var x = 0, y = 0;
  for(var i = 0; i < text.length; i++) {
    if (text[i] == '\n') {
      y++;
      x = 0;
      continue;
    }
    this.state.drawValue(this.endPosition.add(new ascii.Vector(x, y)), text[i]);
    x++;
  }
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

/** @inheritDoc */
ascii.DrawErase.prototype.start = function(position) {
  this.startPosition = position;
  this.move(position);
};

/** @inheritDoc */
ascii.DrawErase.prototype.move = function(position) {
  this.state.clearDraw();
  this.endPosition = position;

  var startX = Math.min(this.startPosition.x, this.endPosition.x);
  var startY = Math.min(this.startPosition.y, this.endPosition.y);
  var endX = Math.max(this.startPosition.x, this.endPosition.x);
  var endY = Math.max(this.startPosition.y, this.endPosition.y);

  for (var i = startX; i <= endX; i++) {
    for (var j = startY; j <= endY; j++) {
      this.state.drawValue(new ascii.Vector(i, j), ERASE_CHAR);
    }
  }
};

/** @inheritDoc */
ascii.DrawErase.prototype.end = function() {
  this.state.commitDraw();
};

/** @inheritDoc */
ascii.DrawErase.prototype.getCursor = function(position) {
  return 'crosshair';
};

/** @inheritDoc */
ascii.DrawErase.prototype.handleKey = function(value) {};

/**
 * @constructor
 * @implements {ascii.DrawFunction}
 * @param {ascii.State} state
 */
ascii.DrawMove = function(state) {
  this.state = state;
  this.startPosition = null;
  this.ends = null;
};

/** @inheritDoc */
ascii.DrawMove.prototype.start = function(position) {
  this.startPosition =
      TOUCH_ENABLED ? this.snapToNearest(position) : position;
  this.ends = null;

  // If this isn't a special cell then quit, or things get weird.
  if (!this.state.getCell(this.startPosition).isSpecial()) {
    return;
  }
  var context = this.state.getContext(this.startPosition);

  var ends = [];
  for (var i in DIRECTIONS) {
    var midPoints = this.followLine(this.startPosition, DIRECTIONS[i]);
    for (var k in midPoints) {
      var midPoint = midPoints[k];

      // Clockwise is a lie, it is true if we move vertically first.
      var clockwise = (DIRECTIONS[i].x != 0);

      var midPointContext = this.state.getContext(midPoint);
      // Special case, a straight line with no turns.
      if (midPointContext.sum() == 1) {
        ends.push({position: midPoint, clockwise: clockwise});
        continue;
      }
      // Continue following lines from the midpoint.
      for (var j in DIRECTIONS) {
        if (DIRECTIONS[i].add(DIRECTIONS[j]).length() == 0 ||
          DIRECTIONS[i].add(DIRECTIONS[j]).length() == 2) {
          // Don't go back on ourselves, or don't carry on in same direction.
          continue;
        }
        var secondEnds = this.followLine(midPoint, DIRECTIONS[j]);
        // Ignore any directions that didn't go anywhere.
        if (secondEnds.length == 0) {
          continue;
        }
        // On the second line we don't care about multiple
        // junctions, just the last.
        ends.push({position: secondEnds[secondEnds.length - 1],
            clockwise: clockwise});
      }
    }
  }
  this.ends = ends;
  // Redraw the new lines after we have cleared the existing ones.
  this.move(this.startPosition);
};

/** @inheritDoc */
ascii.DrawMove.prototype.move = function(position) {
  this.state.clearDraw();
  // Clear all the lines so we can draw them afresh.
  for (var i in this.ends) {
    drawLine(this.state, this.startPosition, this.ends[i].position,
        this.ends[i].clockwise, ' ');
  }
  for (var i in this.ends) {
    drawLine(this.state, position, this.ends[i].position,
        this.ends[i].clockwise);
  }
};

/** @inheritDoc */
ascii.DrawMove.prototype.end = function() {
  this.state.commitDraw();
};

/**
 * Follows a line in a given direction from the startPosition.
 * Returns a list of positions that were line 'junctions'. This is a bit of a
 * loose definition, but basically means a point around which we resize things.
 * @param {ascii.Vector} startPosition
 * @param {ascii.Vector} direction
 * @return {Array.<ascii.Vector>}
 */
ascii.DrawMove.prototype.followLine = function(startPosition, direction) {
  var endPosition = startPosition.clone();
  var junctions = [];
  while (true) {
    var nextEnd = endPosition.add(direction);
    if (!this.state.getCell(nextEnd).isSpecial()) {
      // Junctions: Right angles and end T-Junctions.
      if (!startPosition.equals(endPosition)) {
        junctions.push(endPosition);
      }
      return junctions;
    }

    endPosition = nextEnd;
    var context = this.state.getContext(endPosition);
    // Junctions: Side T-Junctions.
    if (context.sum() == 3) {
      junctions.push(endPosition);
    }
  }
};

/**
 * For a given position, finds the nearest cell that is of any interest to the
 * move tool, e.g. a corner or a line. Will look up to 1 cell in each direction
 * including diagonally.
 * @param {ascii.Vector} position
 * @return {ascii.Vector}
 */
ascii.DrawMove.prototype.snapToNearest = function(position) {
  if (this.state.getCell(position).isSpecial()) {
    return position;
  }
  var allDirections = DIRECTIONS.concat([
    DIR_LEFT.add(DIR_UP),
    DIR_LEFT.add(DIR_DOWN),
    DIR_RIGHT.add(DIR_UP),
    DIR_RIGHT.add(DIR_DOWN)]);

  var bestDirection = null;
  var bestContextSum = 0;
  for (var i in allDirections) {
    // Find the most connected cell, essentially.
    var newPos = position.add(allDirections[i]);
    var contextSum = this.state.getContext(newPos).sum();
    if (this.state.getCell(newPos).isSpecial() &&
        contextSum > bestContextSum) {
      bestDirection = allDirections[i];
      bestContextSum = contextSum;
    }
  }
  if (bestDirection == null) {
    // Didn't find anything, so just return the current cell.
    return position;
  }
  return position.add(bestDirection);
};

/** @inheritDoc */
ascii.DrawMove.prototype.getCursor = function(position) {
  if (this.state.getCell(position).isSpecial()) {
    return 'pointer';
  } else {
    return 'default';
  }
};

/** @inheritDoc */
ascii.DrawMove.prototype.handleKey = function(value) {};

