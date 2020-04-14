import { AbstractDrawFunction } from "asciiflow/client/draw/function";
import { drawLine } from "asciiflow/client/draw/utils";
import { store } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";

export class DrawBox extends AbstractDrawFunction {
  private startPosition: Vector;

  start(position: Vector) {
    this.startPosition = position;
  }

  move(position: Vector) {
    store.canvas.clearDraw();
    drawLine(store.canvas, this.startPosition, position, true);
    drawLine(store.canvas, this.startPosition, position, false);
    store.canvas.apply();
  }

  end() {
    store.canvas.commitDraw();
  }

  getCursor() {
    return "crosshair";
  }
}
