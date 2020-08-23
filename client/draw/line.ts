import {
  IDrawFunction,
  AbstractDrawFunction,
} from "asciiflow/client/draw/function";
import { drawLine } from "asciiflow/client/draw/utils";
import { Layer } from "asciiflow/client/layer";
import { store } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";

export class DrawLine extends AbstractDrawFunction {
  private startPosition: Vector;

  constructor(private isArrow: boolean) {
    super();
  }

  start(position: Vector) {
    this.startPosition = position;
  }

  move(position: Vector) {
    const layer = new Layer();
    // Try to infer line orientation.
    // TODO: Split the line into two lines if we can't satisfy both ends.
    const characters = store.characters;

    const startContext = store.canvas.committed.context(this.startPosition);
    const endContext = store.canvas.committed.context(position);

    const horizontalStart =
      (startContext.up && startContext.down) ||
      (startContext.leftup && startContext.leftdown) ||
      (startContext.rightup && startContext.rightdown);

    const verticalEnd =
      (endContext.left && endContext.right) ||
      (endContext.leftup && endContext.rightup) ||
      (endContext.leftdown && endContext.rightdown);

    const horizontalFirst = horizontalStart || verticalEnd;

    drawLine(layer, this.startPosition, position, horizontalFirst);

    if (this.isArrow) {
      layer.set(
        position,
        (() => {
          if (position.x === this.startPosition.x) {
            return position.y < this.startPosition.y
              ? characters.arrowUp
              : characters.arrowDown;
          }
          if (position.y === this.startPosition.y) {
            return position.x < this.startPosition.x
              ? characters.arrowLeft
              : characters.arrowRight;
          }
          if (horizontalFirst) {
            return position.y < this.startPosition.y
              ? characters.arrowUp
              : characters.arrowDown;
          } else {
            return position.x > this.startPosition.x
              ? characters.arrowRight
              : characters.arrowLeft;
          }
        })()
      );
    }
    store.canvas.setScratchLayer(layer);
  }

  end() {
    store.canvas.commitScratch();
  }

  getCursor(position: Vector) {
    return "crosshair";
  }
}
