import * as c from './constants';
import State from './state';
import Vector from './vector';
import { Box } from './common';

/**
 * All drawing classes and functions.
 */

/**
 * Draws a line on the diagram state.
 *
 * @param {State} state
 * @param {Vector} startPosition
 * @param {Vector} endPosition
 * @param {boolean} clockwise
 * @param {string=} value
 */
function drawLine(state, startPosition, endPosition, clockwise, value = c.SPECIAL_VALUE) {
  var box = new Box(startPosition, endPosition);
  var startX = box.startX;
  var startY = box.startY;
  var endX = box.endX;
  var endY = box.endY;

  var midX = clockwise ? endPosition.x : startPosition.x;
  var midY = clockwise ? startPosition.y : endPosition.y;

  while (startX++ < endX) {
    var position = new Vector(startX, midY);
    var context = state.getContext(new Vector(startX, midY));
    // Don't erase any lines that we cross.
    if (value != ' ' || context.up + context.down != 2) {
      state.drawValueIncremental(position, value);
    }
  }
  while (startY++ < endY) {
    var position = new Vector(midX, startY);
    var context = state.getContext(new Vector(midX, startY));
    // Don't erase any lines that we cross.
    if (value != ' ' || context.left + context.right != 2) {
      state.drawValueIncremental(position, value);
    }
  }

  state.drawValue(startPosition, value);
  state.drawValue(endPosition, value);
  state.drawValueIncremental(new Vector(midX, midY), value);
}

/**
 * Common interface for different drawing functions, e.g. box, line, etc.
 * @interface
 */
export class DrawFunction {
  /** Start of drawing. @param {Vector} position */
  start(position) {};
  /** Drawing move. @param {Vector} position */
  move(position) {};
  /** End of drawing. */
  end() {};
  /** Cursor for given cell.
   * @param {Vector} position
   * @return {string}
   */
  getCursor(position) {};
  /** Handle the key with given value being pressed. @param {string} value */
  handleKey(value) {};
}

/**
 * @implements {DrawFunction}
 */
export class DrawBox {
  /**
   * @param {State} state
   */
  constructor(state) {
    this.state = state;
    /** @type {Vector} */ this.startPosition = null;
    /** @type {Vector} */ this.endPosition = null;
  }

  /** @inheritDoc */
  start(position) {
    this.startPosition = position;
  }

  /** @inheritDoc */
  move(position) {
    this.endPosition = position;
    this.state.clearDraw();
    drawLine(this.state, this.startPosition, position, true);
    drawLine(this.state, this.startPosition, position, false);
  }

  /** @inheritDoc */
  end() {
    this.state.commitDraw();
  }

  /** @inheritDoc */
  getCursor(position) {
    return 'crosshair';
  }

  /** @inheritDoc */
  handleKey(value) {};
}

/**
 * @implements {DrawFunction}
 */
export class DrawLine {
  /**
   * @param {State} state
   * @param {boolean} isArrow
   */
  constructor(state, isArrow) {
    this.state = state;
    this.isArrow = isArrow;
    /** @type {Vector} */ this.startPosition = null;
  }

  /** @inheritDoc */
  start(position) {
    this.startPosition = position;
  }

  /** @inheritDoc */
  move(position) {
    this.state.clearDraw();

    // Try to infer line orientation.
    // TODO: Split the line into two lines if we can't satisfy both ends.
    var startContext = this.state.getContext(this.startPosition);
    var endContext = this.state.getContext(position);
    var clockwise = (startContext.up && startContext.down) ||
        (endContext.left && endContext.right);

    drawLine(this.state, this.startPosition, position, clockwise);
    if (this.isArrow) {
      this.state.drawValue(position, c.ALT_SPECIAL_VALUE);
    }
  }

  /** @inheritDoc */
  end() {
    this.state.commitDraw();
  }

  /** @inheritDoc */
  getCursor(position) {
    return 'crosshair';
  }

  /** @inheritDoc */
  handleKey(value) {};
}

/**
 * @implements {DrawFunction}
 */
export class DrawFreeform {
  /**
   * @param {State} state
   * @param {?string} value
   */
  constructor(state, value) {
    this.state = state;
    this.value = value;
    if (c.TOUCH_ENABLED) {
      $('#freeform-tool-input').val('');
      $('#freeform-tool-input').hide(0, function() {$('#freeform-tool-input').show(0, function() {$('#freeform-tool-input').focus();});});
    }
  }

  /** @inheritDoc */
  start(position) {
    this.state.drawValue(position, this.value);
  }

  /** @inheritDoc */
  move(position) {
    this.state.drawValue(position, this.value);
  }

  /** @inheritDoc */
  end() {
    this.state.commitDraw();
  }

  /** @inheritDoc */
  getCursor(position) {
    return 'crosshair';
  }

  /** @inheritDoc */
  handleKey(value) {
    if (c.TOUCH_ENABLED) {
      this.value = $('#freeform-tool-input').val().substr(0, 1);
      $('#freeform-tool-input').blur();
      $('#freeform-tool-input').hide(0);
    }
    if (value.length == 1) {
      // The value is not a special character, so lets use it.
      this.value = value;
    }
  }
}

/**
 * @implements {DrawFunction}
 */
export class DrawText {
  /**
   * @param {State} state
   */
  constructor(state, view) {
    this.state = state;
    this.startPosition = null;
    this.endPosition = null;
  };

  /** @inheritDoc */
  start(position) {
    this.state.commitDraw();
    $('#text-tool-input').val('');
    this.startPosition = position;

    // Not working yet, needs fixing so that it can remove the underlying text completely.
    //this.loadExistingText(position);

    // Effectively highlights the starting cell.
    var currentValue = this.state.getCell(this.startPosition).getRawValue();
    this.state.drawValue(this.startPosition,
        currentValue == null ? c.ERASE_CHAR : currentValue);
  }

  /** @inheritDoc */
  move(position) {}

  /** @inheritDoc */
  end() {
    if (this.startPosition != null) {
      this.endPosition = this.startPosition;
      this.startPosition = null;
      // Valid end click/press, show the textbox and focus it.
      $('#text-tool-widget').hide(0, function() {$('#text-tool-widget').show(0, function() {$('#text-tool-input').focus();});});
    }
  }

  /** @inheritDoc */
  getCursor(position) {
    return 'pointer';
  }

  /** @inheritDoc */
  handleKey(value) {
    var text = $('#text-tool-input').val();
    this.state.clearDraw();
    var x = 0, y = 0;
    for(var i = 0; i < text.length; i++) {
      if (text[i] == '\n') {
        y++;
        x = 0;
        continue;
      }
      this.state.drawValue(this.endPosition.add(new Vector(x, y)), text[i]);
      x++;
    }
  }

  /**
   * Loads any existing text if it is present.
   * TODO: This is horrible, and does not quite work, fix it.
   */
  loadExistingText(position) {
    var currentPosition = new Vector(position.x, position.y);
    var cell = this.state.getCell(position);
    var spacesCount = 0;
    // Go back to find the start of the line.
    while ((!cell.isSpecial() && cell.getRawValue() != null) || spacesCount < 1) {
      if (cell.getRawValue() == null) {
        spacesCount++;
      } else if (!cell.isSpecial()) {
        spacesCount = 0;
      }
      currentPosition.x--;
      cell = this.state.getCell(currentPosition);
    }
    this.startPosition = currentPosition.add(new Vector(spacesCount + 1, 0));
    var text = '';
    spacesCount = 0;
    currentPosition = this.startPosition.clone();
    // Go forward to load the text.
    while ((!cell.isSpecial() && cell.getRawValue() != null) || spacesCount < 1) {
      cell = this.state.getCell(currentPosition);
      if (cell.getRawValue() == null) {
        spacesCount++;
        text += ' ';
      } else if (!cell.isSpecial()) {
        spacesCount = 0;
        text += cell.getRawValue();
        this.state.drawValue(currentPosition, cell.getRawValue());
      }
      currentPosition.x++;
    }
    $('#text-tool-input').val(text.substr(0, text.length - 1));
  }
}

/**
 * @implements {DrawFunction}
 */
export class DrawErase {
  /**
   * @param {State} state
   */
  constructor(state) {
    this.state = state;
    this.startPosition = null;
    this.endPosition = null;
  }

  /** @inheritDoc */
  start(position) {
    this.startPosition = position;
    this.move(position);
  }

  /** @inheritDoc */
  move(position) {
    this.state.clearDraw();
    this.endPosition = position;

    var startX = Math.min(this.startPosition.x, this.endPosition.x);
    var startY = Math.min(this.startPosition.y, this.endPosition.y);
    var endX = Math.max(this.startPosition.x, this.endPosition.x);
    var endY = Math.max(this.startPosition.y, this.endPosition.y);

    for (var i = startX; i <= endX; i++) {
      for (var j = startY; j <= endY; j++) {
        this.state.drawValue(new Vector(i, j), c.ERASE_CHAR);
      }
    }
  }

  /** @inheritDoc */
  end() {
    this.state.commitDraw();
  }

  /** @inheritDoc */
  getCursor(position) {
    return 'crosshair';
  }

  /** @inheritDoc */
  handleKey(value) {}
}

/**
 * @implements {DrawFunction}
 */
export class DrawMove {
  /**
   * @param {State} state
   */
  constructor(state) {
    this.state = state;
    this.startPosition = null;
    /** @type {!Array<{position, clockwise, startIsAlt, midPointIsAlt, endIsAlt}>} */
    this.ends = [];
  }

  /** @inheritDoc */
  start(position) {
    this.startPosition =
        c.TOUCH_ENABLED ? this.snapToNearest(position) : position;
    this.ends = [];

    // If this isn't a special cell then quit, or things get weird.
    if (!this.state.getCell(this.startPosition).isSpecial()) {
      return;
    }
    var context = this.state.getContext(this.startPosition);

    var ends = [];
    for (var i of c.DIRECTIONS) {
      var midPoints = this.followLine(this.startPosition, i);
      for (var midPoint of midPoints) {
        // Clockwise is a lie, it is true if we move vertically first.
        var clockwise = (i.x != 0);
        var startIsAlt = c.ALT_SPECIAL_VALUES.indexOf(this.state.getCell(position).getRawValue()) != -1;
        var midPointIsAlt = c.ALT_SPECIAL_VALUES.indexOf(this.state.getCell(midPoint).getRawValue()) != -1;

        var midPointContext = this.state.getContext(midPoint);
        // Special case, a straight line with no turns.
        if (midPointContext.sum() == 1) {
          ends.push({position: midPoint, clockwise, startIsAlt, endIsAlt: midPointIsAlt});
          continue;
        }
        // Continue following lines from the midpoint.
        for (var j of c.DIRECTIONS) {
          if (i.add(j).length() == 0 || i.add(j).length() == 2) {
            // Don't go back on ourselves, or don't carry on in same direction.
            continue;
          }
          var secondEnds = this.followLine(midPoint, j);
          // Ignore any directions that didn't go anywhere.
          if (secondEnds.length == 0) {
            continue;
          }
          var secondEnd = secondEnds[0];
          var endIsAlt = c.ALT_SPECIAL_VALUES.indexOf(this.state.getCell(secondEnd).getRawValue()) != -1;
          // On the second line we don't care about multiple
          // junctions, just the last.
          ends.push({position: secondEnd, clockwise, startIsAlt, midPointIsAlt, endIsAlt});
        }
      }
    }
    this.ends = ends;
    // Redraw the new lines after we have cleared the existing ones.
    this.move(this.startPosition);
  }

  /** @inheritDoc */
  move(position) {
    this.state.clearDraw();
    // Clear all the lines so we can draw them afresh.
    for (var end of this.ends) {
      drawLine(this.state, this.startPosition, end.position, end.clockwise, ' ');
    }
    for (var i in this.ends) {
      drawLine(this.state, position, end.position, end.clockwise);
    }
    for (var end of this.ends) {
      // If the ends or midpoint of the line was a alt character (arrow), need to preserve that.
      if (end.startIsAlt) {
        this.state.drawValue(position, c.ALT_SPECIAL_VALUE);
      }
      if (end.endIsAlt) {
        this.state.drawValue(end.position, c.ALT_SPECIAL_VALUE);
      }
      if (end.midPointIsAlt) {
        var midX = end.clockwise ? end.position.x : position.x;
        var midY = end.clockwise ? position.y : end.position.y;
        this.state.drawValue(new Vector(midX, midY), c.ALT_SPECIAL_VALUE);
      }
    }
  }

  /** @inheritDoc */
  end() {
    this.state.commitDraw();
  }

  /**
   * Follows a line in a given direction from the startPosition.
   * Returns a list of positions that were line 'junctions'. This is a bit of a
   * loose definition, but basically means a point around which we resize things.
   * @param {Vector} startPosition
   * @param {Vector} direction
   * @return {!Array<Vector>}
   */
  followLine(startPosition, direction) {
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
  }

  /**
   * For a given position, finds the nearest cell that is of any interest to the
   * move tool, e.g. a corner or a line. Will look up to 1 cell in each direction
   * including diagonally.
   * @param {Vector} position
   * @return {Vector}
   */
  snapToNearest(position) {
    if (this.state.getCell(position).isSpecial()) {
      return position;
    }
    var allDirections = c.DIRECTIONS.concat([
      c.DIR_LEFT.add(c.DIR_UP),
      c.DIR_LEFT.add(c.DIR_DOWN),
      c.DIR_RIGHT.add(c.DIR_UP),
      c.DIR_RIGHT.add(c.DIR_DOWN)]);

    var bestDirection = null;
    var bestContextSum = 0;
    for (var direction of allDirections) {
      // Find the most connected cell, essentially.
      var newPos = position.add(direction);
      var contextSum = this.state.getContext(newPos).sum();
      if (this.state.getCell(newPos).isSpecial() &&
          contextSum > bestContextSum) {
        bestDirection = direction;
        bestContextSum = contextSum;
      }
    }
    if (bestDirection == null) {
      // Didn't find anything, so just return the current cell.
      return position;
    }
    return position.add(bestDirection);
  }

  /** @inheritDoc */
  getCursor(position) {
    if (this.state.getCell(position).isSpecial()) {
      return 'pointer';
    } else {
      return 'default';
    }
  }

  /** @inheritDoc */
  handleKey(value) {}
}
