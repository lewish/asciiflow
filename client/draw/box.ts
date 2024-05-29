import { Box } from "#asciiflow/client/common";
import { UNICODE } from "#asciiflow/client/constants";
import { AbstractDrawFunction } from "#asciiflow/client/draw/function";
import { Layer } from "#asciiflow/client/layer";
import { store } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";

export class DrawBox extends AbstractDrawFunction {
  private startPosition: Vector;

  start(position: Vector) {
    this.startPosition = position;
  }

  move(position: Vector) {
    const layer = new Layer();
    const box = new Box(this.startPosition, position);

    if (box.right() != box.left()) {
      for (let x = box.left(); x <= box.right(); x++) {
        layer.set(new Vector(x, box.top()), UNICODE.lineHorizontal);
        layer.set(new Vector(x, box.bottom()), UNICODE.lineHorizontal);
      }
    }
    if (box.top() != box.bottom()) {
      for (let y = box.top(); y <= box.bottom(); y++) {
        layer.set(new Vector(box.left(), y), UNICODE.lineVertical);
        layer.set(new Vector(box.right(), y), UNICODE.lineVertical);
      }
    }

    if (box.left() != box.right() && box.top() != box.bottom()) {
      layer.set(box.topLeft(), UNICODE.cornerTopLeft);
      layer.set(box.topRight(), UNICODE.cornerTopRight);
      layer.set(box.bottomRight(), UNICODE.cornerBottomRight);
      layer.set(box.bottomLeft(), UNICODE.cornerBottomLeft);
    }

    store.currentCanvas.setScratchLayer(layer);
  }

  end() {
    store.currentCanvas.commitScratch();
  }

  getCursor() {
    return "crosshair";
  }
}
