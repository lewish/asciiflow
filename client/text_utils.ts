import { StayCurrentLandscape } from "@material-ui/icons";
import { Box } from "asciiflow/client/common";
import { ILayerView, Layer } from "asciiflow/client/layer";
import { Vector } from "asciiflow/client/vector";

export function layerToText(layer: ILayerView, box?: Box) {
  if (layer.keys().length === 0) {
    return "";
  }
  if (!box) {
    // Find the first/last cells in the diagram so we don't output everything.
    const start = new Vector(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    const end = new Vector(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

    layer.keys().forEach((position) => {
      start.x = Math.min(start.x, position.x);
      start.y = Math.min(start.y, position.y);
      end.x = Math.max(end.x, position.x);
      end.y = Math.max(end.y, position.y);
    });
    box = new Box(start, end);
  }

  const lineArrays = [
    ...new Array(box.bottomRight().y - box.topLeft().y + 1),
  ].map((x) =>
    [...new Array(box.bottomRight().x - box.topLeft().x + 1)].fill(" ")
  ) as string[][];

  layer
    .entries()
    .filter(([key]) => box.contains(key))
    .forEach(([key, value]) => {
      lineArrays[key.y - box.topLeft().y][key.x - box.topLeft().x] = value;
    });
  return lineArrays
    .map((lineValues) => lineValues.reduce((acc, curr) => acc + curr, ""))
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n");
}

/**
 * Loads the given text into the diagram starting at the given offset (centered).
 */
export function textToLayer(value: string, offset?: Vector) {
  if (!offset) {
    offset = new Vector(0, 0);
  }
  const layer = new Layer();
  const lines = value.split("\n");

  for (let j = 0; j < lines.length; j++) {
    const line = lines[j];
    for (let i = 0; i < line.length; i++) {
      const char = line.charAt(i);
      if (char !== " ") {
        layer.set(new Vector(i, j).add(offset), char);
      }
    }
  }
  return layer;
}
