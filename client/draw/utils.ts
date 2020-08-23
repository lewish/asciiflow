import { CanvasStore } from "asciiflow/client/canvas_store";
import { Box } from "asciiflow/client/common";
import { SPECIAL_VALUE } from "asciiflow/client/constants";
import { Layer } from "asciiflow/client/layer";
import { Vector } from "asciiflow/client/vector";

/**
 * Draws a line on the diagram state.
 */
export function drawLine(
  layer: Layer,
  startPosition: Vector,
  endPosition: Vector,
  clockwise: boolean,
  value = SPECIAL_VALUE
) {
  const box = new Box(startPosition, endPosition);
  let startX = box.topLeft().x;
  let startY = box.topLeft().y;
  const endX = box.bottomRight().x;
  const endY = box.bottomRight().y;

  const midX = clockwise ? endPosition.x : startPosition.x;
  const midY = clockwise ? startPosition.y : endPosition.y;

  while (startX++ < endX) {
    const position = new Vector(startX, midY);
    layer.set(position, value);
  }
  while (startY++ < endY) {
    const position = new Vector(midX, startY);
    layer.set(position, value);
  }

  layer.set(startPosition, value);
  layer.set(endPosition, value);
  layer.set(new Vector(midX, midY), value);
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
