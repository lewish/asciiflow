import { connects, isArrow } from "#asciiflow/client/characters";
import * as constants from "#asciiflow/client/constants";
import { isSpecial } from "#asciiflow/client/constants";
import { Direction } from "#asciiflow/client/direction";
import { AbstractDrawFunction } from "#asciiflow/client/draw/function";
import { Layer } from "#asciiflow/client/layer";
import { store } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";

export class DrawMove extends AbstractDrawFunction {
  private trace: ILineTrace;

  start(position: Vector) {
    const value = store.currentCanvas.committed.get(position);
    if (
      value !== constants.UNICODE.lineHorizontal &&
      value !== constants.UNICODE.lineVertical
    ) {
      return;
    }

    this.trace = traceLine(store.currentCanvas.committed, position);
    this.move(position);
  }

  move(position: Vector) {
    if (this.trace == null) {
      return;
    }
    const layer = new Layer();
    // Find the min/max x/y that we can move to.
    const minX = Math.max(
      ...this.trace.attachments
        .filter((a) => a.direction === Direction.LEFT)
        .map((a) => a.end.x)
    );
    const maxX = Math.min(
      ...this.trace.attachments
        .filter((a) => a.direction === Direction.RIGHT)
        .map((a) => a.end.x)
    );
    const minY = Math.max(
      ...this.trace.attachments
        .filter((a) => a.direction === Direction.UP)
        .map((a) => a.end.y)
    );
    const maxY = Math.min(
      ...this.trace.attachments
        .filter((a) => a.direction === Direction.DOWN)
        .map((a) => a.end.y)
    );
    console.log(minX, maxX, minY, maxY);
    console.log(this.trace);
    // Calculate the effective position after calculating bounds.
    const effectivePosition = new Vector(
      Math.min(Math.max(position.x, minX), maxX),
      Math.min(Math.max(position.y, minY), maxY)
    );
    // Work out which direction we're moving in.
    const moveDirection =
      this.trace.orientation === "vertical"
        ? effectivePosition.x < this.trace.positions[0].x
          ? Direction.LEFT
          : Direction.RIGHT
        : effectivePosition.y < this.trace.positions[0].y
        ? Direction.UP
        : Direction.DOWN;
    // Work out how many units/cells we're moving.
    const moveUnits = Math.abs(
      moveDirection === Direction.LEFT || moveDirection === Direction.RIGHT
        ? effectivePosition.x - this.trace.positions[0].x
        : effectivePosition.y - this.trace.positions[0].y
    );
    // Clear any attachments that are in the way.
    for (const attachment of this.trace.attachments) {
      if (attachment.direction === moveDirection) {
        for (let i = 0; i < moveUnits; i++) {
          layer.set(attachment.source.add(attachment.direction.scale(i)), "");
        }
      }
    }
    // Clear the line.
    for (const position of this.trace.positions) {
      layer.set(position, "");
    }
    // Move the line.
    for (const position of this.trace.positions) {
      layer.set(
        position.add(moveDirection.scale(moveUnits)),
        store.currentCanvas.committed.get(position)
      );
    }
    // Extend any attachments that need to be extended.
    for (const attachment of this.trace.attachments) {
      if (attachment.direction === moveDirection.opposite()) {
        for (let i = 1; i <= moveUnits; i++) {
          // TODO: Deal with arrows.
          layer.set(
            attachment.source.add(attachment.direction.scale(-i)),
            attachment.direction === Direction.LEFT ||
              attachment.direction === Direction.RIGHT
              ? constants.UNICODE.lineHorizontal
              : constants.UNICODE.lineVertical
          );
        }
      }
    }
    store.currentCanvas.setScratchLayer(layer);
  }

  end() {
    store.currentCanvas.commitScratch();
  }

  getCursor(position: Vector) {
    const value = store.currentCanvas.committed.get(position);
    if (value === constants.UNICODE.lineHorizontal) {
      return "ns-resize";
    }
    if (value === constants.UNICODE.lineVertical) {
      return "ew-resize";
    }
    if (isSpecial(store.currentCanvas.committed.get(position))) {
      return "move";
    } else {
      return "default";
    }
  }

  handleKey(value: string) {}
}

interface ILineAttachmentTrace {
  source: Vector;
  end: Vector;
  sourceValue: string;
  direction: Direction;
}
interface ILineTrace {
  orientation: "horizontal" | "vertical";
  positions: Vector[];
  attachments: ILineAttachmentTrace[];
}

function traceLine(layer: Layer, position: Vector): ILineTrace {
  const value = layer.get(position);
  if (
    value !== constants.UNICODE.lineHorizontal &&
    value !== constants.UNICODE.lineVertical
  ) {
    throw new Error(`Expected line, got ${value}`);
  }
  const directions =
    value === constants.UNICODE.lineHorizontal
      ? [Direction.LEFT, Direction.RIGHT]
      : [Direction.UP, Direction.DOWN];
  const attachmentDirections =
    value === constants.UNICODE.lineHorizontal
      ? [Direction.UP, Direction.DOWN]
      : [Direction.LEFT, Direction.RIGHT];

  const positions: Vector[] = [position];
  const attachments: ILineAttachmentTrace[] = [];
  for (const direction of directions) {
    let currentPosition = position;
    while (true) {
      const nextPosition = currentPosition.add(direction);
      if (
        !connects(layer.get(currentPosition), direction) ||
        !connects(layer.get(nextPosition), direction.opposite())
      ) {
        break;
      }
      currentPosition = nextPosition;
      positions.push(currentPosition);
    }
  }

  for (const currentPosition of positions) {
    // Find any attachments.
    for (const attachmentDirection of attachmentDirections) {
      if (
        connects(layer.get(currentPosition), attachmentDirection) &&
        connects(
          layer.get(currentPosition.add(attachmentDirection)),
          attachmentDirection.opposite()
        )
      ) {
        attachments.push(
          traceAttachment(
            layer,
            currentPosition.add(attachmentDirection),
            attachmentDirection
          )
        );
      }
      if (
        isArrow(layer.get(currentPosition.add(attachmentDirection))) &&
        connects(
          layer.get(currentPosition.add(attachmentDirection.scale(2))),
          attachmentDirection.opposite()
        )
      ) {
        positions.push(currentPosition.add(attachmentDirection));
        attachments.push(
          traceAttachment(
            layer,
            currentPosition.add(attachmentDirection.scale(2)),
            attachmentDirection
          )
        );
      }
    }
  }

  return {
    orientation:
      value === constants.UNICODE.lineHorizontal ? "horizontal" : "vertical",
    positions,
    attachments,
  };
}

function traceAttachment(
  layer: Layer,
  position: Vector,
  direction: Direction
): ILineAttachmentTrace {
  const traceValue =
    direction === Direction.LEFT || direction === Direction.RIGHT
      ? constants.UNICODE.lineHorizontal
      : constants.UNICODE.lineVertical;
  const sourceValue = layer.get(position);
  let tracePosition = position;
  while (true) {
    const nextPosition = tracePosition.add(direction);
    if (layer.get(nextPosition) !== traceValue) {
      break;
    }
    tracePosition = nextPosition;
  }
  return {
    source: position,
    end: tracePosition,
    sourceValue,
    direction,
  };
}
