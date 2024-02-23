import { AbstractDrawFunction } from "#asciiflow/client/draw/function";
import { drawLine } from "#asciiflow/client/draw/utils";
import { store } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";
import { Layer } from "#asciiflow/client/layer";

export class DrawBox extends AbstractDrawFunction {
  private startPosition: Vector;

  start(position: Vector) {
    this.startPosition = position;
  }

  move(position: Vector) {
    const layer = new Layer();
    drawLine(layer, this.startPosition, position, true);
    drawLine(layer, this.startPosition, position, false);
    store.currentCanvas.setScratchLayer(layer);
  }

  end() {
    store.currentCanvas.commitScratch();
  }

  getCursor() {
    return "crosshair";
  }
}
