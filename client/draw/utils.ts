import { UNICODE } from "#asciiflow/client/constants";
import { Layer } from "#asciiflow/client/layer";
import { Vector } from "#asciiflow/client/vector";

export function line(
  startPosition: Vector,
  endPosition: Vector,
  horizontalFirst?: boolean
) {
  if (startPosition.x === endPosition.x || startPosition.y === endPosition.y) {
    return straightLine(startPosition, endPosition);
  } else {
    return cornerLine(startPosition, endPosition, horizontalFirst);
  }
}

/**
 * Draws a line on the diagram state.
 */
export function cornerLine(
  startPosition: Vector,
  endPosition: Vector,
  horizontalFirst?: boolean
) {
  const cornerPosition = horizontalFirst
    ? new Vector(endPosition.x, startPosition.y)
    : new Vector(startPosition.x, endPosition.y);

  let layer = new Layer();
  layer = layer.apply(straightLine(startPosition, cornerPosition))[0];
  layer = layer.apply(straightLine(cornerPosition, endPosition))[0];

  layer.set(
    cornerPosition,
    horizontalFirst
      ? startPosition.x < endPosition.x
        ? startPosition.y < endPosition.y
          ? UNICODE.cornerTopRight
          : UNICODE.cornerBottomRight
        : startPosition.y < endPosition.y
        ? UNICODE.cornerTopLeft
        : UNICODE.cornerBottomLeft
      : startPosition.y < endPosition.y
      ? startPosition.x < endPosition.x
        ? UNICODE.cornerBottomLeft
        : UNICODE.cornerBottomRight
      : startPosition.x < endPosition.x
      ? UNICODE.cornerTopLeft
      : UNICODE.cornerTopRight
  );
  return layer;
}

function straightLine(startPosition: Vector, endPosition: Vector) {
  const layer = new Layer();
  if (startPosition.x !== endPosition.x && startPosition.y !== endPosition.y) {
    throw new Error(
      `Can't draw a straight line between points ${startPosition} and ${endPosition}`
    );
  }
  if (startPosition.x === endPosition.x) {
    const top = Math.min(startPosition.y, endPosition.y);
    const bottom = Math.max(startPosition.y, endPosition.y);
    for (let y = top; y <= bottom; y++) {
      layer.set(new Vector(startPosition.x, y), UNICODE.lineVertical);
    }
  }
  if (startPosition.y === endPosition.y) {
    const left = Math.min(startPosition.x, endPosition.x);
    const right = Math.max(startPosition.x, endPosition.x);
    for (let x = left; x <= right; x++) {
      layer.set(new Vector(x, startPosition.y), UNICODE.lineHorizontal);
    }
  }
  return layer;
}

/**
 * Sets the cells scratch (uncommitted) values to the given text.
 * Handles newlines appropriately.
 */
export function drawText(layer: Layer, position: Vector, text: string) {
  let x = 0;
  let y = 0;
  for (const char of text) {
    if (char === "\n") {
      y++;
      x = 0;
      continue;
    }
    layer.set(position.add(new Vector(x, y)), char);
    x++;
  }
}
