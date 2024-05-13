import * as constants from "#asciiflow/client/constants";
import { isSpecial } from "#asciiflow/client/constants";
import { AbstractDrawFunction } from "#asciiflow/client/draw/function";
import { line } from "#asciiflow/client/draw/utils";
import { Layer } from "#asciiflow/client/layer";
import { store } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";

const DIR_LEFT = new Vector(-1, 0);
const DIR_RIGHT = new Vector(1, 0);
const DIR_UP = new Vector(0, -1);
const DIR_DOWN = new Vector(0, 1);

const DIRECTIONS = [DIR_LEFT, DIR_RIGHT, DIR_UP, DIR_DOWN];

interface IEnd {
  position: Vector;
  clockwise: boolean;
  startIsAlt: boolean;
  midPointIsAlt?: boolean;
  endIsAlt: boolean;
}

interface IIntersection {
  position: Vector;
  direction: Vector;
}
export class DrawMove extends AbstractDrawFunction {
  private startPosition: Vector;
  private ends: IEnd[] = [];

  start(position: Vector) {
    this.startPosition = constants.TOUCH_ENABLED
      ? this.snapToNearest(position)
      : position;
    this.ends = [];

    // If this isn't a special cell then quit, or things get weird.
    if (!constants.isSpecial(store.currentCanvas.committed.get(position))) {
      return;
    }

    const ends: IEnd[] = [];
    for (const direction of DIRECTIONS) {
      const midPoints = this.followLine(this.startPosition, direction);
      for (const midPoint of midPoints) {
        // Clockwise is a lie, it is true if we move vertically first.
        const clockwise = direction.x !== 0;
        const startIsAlt =
          constants.ALT_SPECIAL_VALUES.indexOf(
            store.currentCanvas.committed.get(position)
          ) !== -1;
        const midPointIsAlt =
          constants.ALT_SPECIAL_VALUES.indexOf(
            store.currentCanvas.committed.get(midPoint)
          ) !== -1;

        const midPointContext = store.currentCanvas.committed.context(midPoint);
        // Special case, a straight line with no turns.
        if (midPointContext.sum() === 1) {
          ends.push({
            position: midPoint,
            clockwise,
            startIsAlt,
            endIsAlt: midPointIsAlt,
          });
          continue;
        }
        // Continue following lines from the midpoint.
        for (const j of DIRECTIONS) {
          if (direction.add(j).length() === 0 || direction.add(j).length() === 2) {
            // Don't go back on ourselves, or don't carry on in same direction.
            continue;
          }
          const secondEnds = this.followLine(midPoint, j);
          // Ignore any directions that didn't go anywhere.
          if (secondEnds.length === 0) {
            continue;
          }
          const secondEnd = secondEnds[0];
          const endIsAlt =
            constants.ALT_SPECIAL_VALUES.indexOf(
              store.currentCanvas.committed.get(secondEnd)
            ) !== -1;
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
    const layer = new Layer();
    // Clear all the lines so we can draw them afresh.
    // for (const end of this.ends) {
    //   drawLine(layer, this.startPosition, end.position, end.clockwise, "");
    // }
    // for (const end of this.ends) {
    //   drawLine(layer, position, end.position, end.clockwise);
    // }
    for (const end of this.ends) {
      // If the ends or midpoint of the line was a alt character (arrow), need to preserve that.
      if (end.startIsAlt) {
        layer.set(position, constants.ALT_SPECIAL_VALUE);
      }
      if (end.endIsAlt) {
        layer.set(end.position, constants.ALT_SPECIAL_VALUE);
      }
      if (end.midPointIsAlt) {
        const midX = end.clockwise ? end.position.x : position.x;
        const midY = end.clockwise ? position.y : end.position.y;
        layer.set(new Vector(midX, midY), constants.ALT_SPECIAL_VALUE);
      }
    }
    store.currentCanvas.setScratchLayer(layer);
  }

  end() {
    store.currentCanvas.commitScratch();
  }

  /**
   * Follows a line in a given direction from the startPosition.
   * Returns a list of positions that were line 'junctions'. This is a bit of a
   * loose definition, but basically means a point around which we resize things.
   */
  followLine(startPosition: Vector, direction: Vector) {
    let endPosition = startPosition.clone();
    const junctions = [];
    while (true) {
      const nextEnd = endPosition.add(direction);
      const nextEndValue = store.currentCanvas.committed.get(nextEnd);
      if (!isSpecial(nextEndValue)) {
        // Junctions: Right angles and end T-Junctions.
        if (!startPosition.equals(endPosition)) {
          junctions.push(endPosition);
        }
        return junctions;
      }

      endPosition = nextEnd;
      const context = store.currentCanvas.committed.context(endPosition);
      // Junctions: Side T-Junctions.
      if (context.sum() === 3) {
        junctions.push(endPosition);
      }
      // Fully connected junctions.
      if (context.sum() === 4) {
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
    if (isSpecial(store.currentCanvas.committed.get(position))) {
      return position;
    }
    const allDirections = DIRECTIONS.concat([
      DIR_LEFT.add(DIR_UP),
      DIR_LEFT.add(DIR_DOWN),
      DIR_RIGHT.add(DIR_UP),
      DIR_RIGHT.add(DIR_DOWN),
    ]);

    let bestDirection = null;
    let bestContextSum = 0;
    for (const direction of allDirections) {
      // Find the most connected cell, essentially.
      const newPos = position.add(direction);
      const contextSum = store.currentCanvas.committed.context(newPos).sum();
      if (
        isSpecial(store.currentCanvas.committed.get(newPos)) &&
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
    if (isSpecial(store.currentCanvas.committed.get(position))) {
      return "move";
    } else {
      return "default";
    }
  }

  handleKey(value: string) {}
}
