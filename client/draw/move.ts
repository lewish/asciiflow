import * as constants from "asciiflow/client/constants";
import { drawLine } from "asciiflow/client/draw/utils";
import { State } from "asciiflow/client/state";
import { Vector } from "asciiflow/client/vector";

interface IEnd {
  position: Vector;
  clockwise: boolean;
  startIsAlt: boolean;
  midPointIsAlt?: boolean;
  endIsAlt: boolean;
}
export class DrawMove {
  private startPosition: Vector;
  private ends: Array<IEnd> = [];

  constructor(private state: State) {}

  start(position: Vector) {
    this.startPosition = constants.TOUCH_ENABLED
      ? this.snapToNearest(position)
      : position;
    this.ends = [];

    // If this isn't a special cell then quit, or things get weird.
    if (!this.state.getCell(this.startPosition).isSpecial()) {
      return;
    }
    var context = this.state.getContext(this.startPosition);

    var ends: IEnd[] = [];
    for (var i of constants.DIRECTIONS) {
      var midPoints = this.followLine(this.startPosition, i);
      for (var midPoint of midPoints) {
        // Clockwise is a lie, it is true if we move vertically first.
        var clockwise = i.x != 0;
        var startIsAlt =
          constants.ALT_SPECIAL_VALUES.indexOf(
            this.state.getCell(position).getRawValue()
          ) != -1;
        var midPointIsAlt =
          constants.ALT_SPECIAL_VALUES.indexOf(
            this.state.getCell(midPoint).getRawValue()
          ) != -1;

        var midPointContext = this.state.getContext(midPoint);
        // Special case, a straight line with no turns.
        if (midPointContext.sum() == 1) {
          ends.push({
            position: midPoint,
            clockwise,
            startIsAlt,
            endIsAlt: midPointIsAlt,
          });
          continue;
        }
        // Continue following lines from the midpoint.
        for (var j of constants.DIRECTIONS) {
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
          var endIsAlt =
            constants.ALT_SPECIAL_VALUES.indexOf(
              this.state.getCell(secondEnd).getRawValue()
            ) != -1;
          // On the second line we don't care about multiple
          // junctions, just the last.
          ends.push({
            position: secondEnd,
            clockwise,
            startIsAlt,
            midPointIsAlt,
            endIsAlt,
          });
        }
      }
    }
    this.ends = ends;
    // Redraw the new lines after we have cleared the existing ones.
    this.move(this.startPosition);
  }

  move(position: Vector) {
    this.state.clearDraw();
    // Clear all the lines so we can draw them afresh.
    for (var end of this.ends) {
      drawLine(
        this.state,
        this.startPosition,
        end.position,
        end.clockwise,
        " "
      );
    }
    for (var end of this.ends) {
      drawLine(this.state, position, end.position, end.clockwise);
    }
    for (var end of this.ends) {
      // If the ends or midpoint of the line was a alt character (arrow), need to preserve that.
      if (end.startIsAlt) {
        this.state.drawValue(position, constants.ALT_SPECIAL_VALUE);
      }
      if (end.endIsAlt) {
        this.state.drawValue(end.position, constants.ALT_SPECIAL_VALUE);
      }
      if (end.midPointIsAlt) {
        var midX = end.clockwise ? end.position.x : position.x;
        var midY = end.clockwise ? position.y : end.position.y;
        this.state.drawValue(
          new Vector(midX, midY),
          constants.ALT_SPECIAL_VALUE
        );
      }
    }
  }

  end() {
    this.state.commitDraw();
  }

  /**
   * Follows a line in a given direction from the startPosition.
   * Returns a list of positions that were line 'junctions'. This is a bit of a
   * loose definition, but basically means a point around which we resize things.
   */
  followLine(startPosition: Vector, direction: Vector) {
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
   */
  snapToNearest(position: Vector) {
    if (this.state.getCell(position).isSpecial()) {
      return position;
    }
    var allDirections = constants.DIRECTIONS.concat([
      constants.DIR_LEFT.add(constants.DIR_UP),
      constants.DIR_LEFT.add(constants.DIR_DOWN),
      constants.DIR_RIGHT.add(constants.DIR_UP),
      constants.DIR_RIGHT.add(constants.DIR_DOWN),
    ]);

    var bestDirection = null;
    var bestContextSum = 0;
    for (var direction of allDirections) {
      // Find the most connected cell, essentially.
      var newPos = position.add(direction);
      var contextSum = this.state.getContext(newPos).sum();
      if (
        this.state.getCell(newPos).isSpecial() &&
        contextSum > bestContextSum
      ) {
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

  getCursor(position: Vector) {
    if (this.state.getCell(position).isSpecial()) {
      return "pointer";
    } else {
      return "default";
    }
  }

  handleKey(value: string) {}
}
