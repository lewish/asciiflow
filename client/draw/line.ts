import {
  SPECIAL_ARROW_DOWN,
  SPECIAL_ARROW_LEFT,
  SPECIAL_ARROW_RIGHT,
  SPECIAL_ARROW_UP,
} from "asciiflow/client/constants";
import { IDrawFunction } from "asciiflow/client/draw/function";
import { drawLine } from "asciiflow/client/draw/utils";
import { Layer } from "asciiflow/client/layer";
import { store } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";
import * as constants from "asciiflow/client/constants";

export class DrawLine implements IDrawFunction {
  private startPosition: Vector;

  constructor(private isArrow: boolean) {}

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

    const getArrowHead = () => {
      if (horizontalFirst || position.x === this.startPosition.x) {
        return position.y < this.startPosition.y
          ? characters.arrowUp
          : characters.arrowDown;
      } else {
        return position.x > this.startPosition.x
          ? characters.arrowRight
          : characters.arrowLeft;
      }
    };

    if (this.isArrow) {
      layer.set(position, getArrowHead());
    }
    store.canvas.setScratchLayer(layer);
  }

  end() {
    store.canvas.commitScratch();
  }

  getCursor(position: Vector) {
    return "crosshair";
  }

  handleKey(value: string) {}
}
