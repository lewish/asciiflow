import { ERASE_CHAR } from "asciiflow/client/constants";
import { AbstractDrawFunction } from "asciiflow/client/draw/function";
import { store } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";

export class DrawErase extends AbstractDrawFunction {
  private startPosition: Vector;
  private endPosition: Vector;

  start(position: Vector) {
    this.startPosition = position;
    this.move(position);
  }

  move(position: Vector) {
    store.canvas.clearDraw();
    this.endPosition = position;

    var startX = Math.min(this.startPosition.x, this.endPosition.x);
    var startY = Math.min(this.startPosition.y, this.endPosition.y);
    var endX = Math.max(this.startPosition.x, this.endPosition.x);
    var endY = Math.max(this.startPosition.y, this.endPosition.y);

    for (var i = startX; i <= endX; i++) {
      for (var j = startY; j <= endY; j++) {
        store.canvas.drawValue(new Vector(i, j), ERASE_CHAR);
      }
    }
    store.canvas.apply();
  }

  end() {
    store.canvas.commitDraw();
  }

  getCursor() {
    return "crosshair";
  }
}
