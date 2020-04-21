import { ERASE_CHAR } from "asciiflow/client/constants";
import { AbstractDrawFunction } from "asciiflow/client/draw/function";
import { store } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";
import { Layer } from "asciiflow/client/layer";

export class DrawErase extends AbstractDrawFunction {
  private startPosition: Vector;
  private endPosition: Vector;

  start(position: Vector) {
    this.startPosition = position;
    this.move(position);
  }

  move(position: Vector) {
    const layer = new Layer();
    this.endPosition = position;

    const startX = Math.min(this.startPosition.x, this.endPosition.x);
    const startY = Math.min(this.startPosition.y, this.endPosition.y);
    const endX = Math.max(this.startPosition.x, this.endPosition.x);
    const endY = Math.max(this.startPosition.y, this.endPosition.y);

    for (let i = startX; i <= endX; i++) {
      for (let j = startY; j <= endY; j++) {
        layer.set(new Vector(i, j), ERASE_CHAR);
      }
    }
    store.canvas.setScratchLayer(layer);
  }

  end() {
    store.canvas.commitScratch();
  }

  getCursor() {
    return "crosshair";
  }
}
