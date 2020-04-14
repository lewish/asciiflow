import {
  SPECIAL_ARROW_DOWN,
  SPECIAL_ARROW_LEFT,
  SPECIAL_ARROW_RIGHT,
  SPECIAL_ARROW_UP,
} from "asciiflow/client/constants";
import { drawLine } from "asciiflow/client/draw/utils";
import { CanvasStore } from "asciiflow/client/canvas_store";
import { Vector } from "asciiflow/client/vector";
import { IDrawFunction } from "asciiflow/client/draw/function";

export class DrawLine implements IDrawFunction {
  private startPosition: Vector;

  constructor(private state: CanvasStore, private isArrow: boolean) {}

  start(position: Vector) {
    this.startPosition = position;
  }

  move(position: Vector) {
    this.state.clearDraw();

    // Try to infer line orientation.
    // TODO: Split the line into two lines if we can't satisfy both ends.
    const startContext = this.state.getContext(this.startPosition);
    const endContext = this.state.getContext(position);
    const clockwise =
      (startContext.up && startContext.down) ||
      (endContext.left && endContext.right);

    drawLine(this.state, this.startPosition, position, clockwise);
    if (this.isArrow) {
      let endValue;

      if (endContext.up) {
        endValue = SPECIAL_ARROW_UP;
      } else if (endContext.down) {
        endValue = SPECIAL_ARROW_DOWN;
      } else if (endContext.left) {
        endValue = SPECIAL_ARROW_LEFT;
      } else {
        endValue = SPECIAL_ARROW_RIGHT;
      }

      this.state.drawValue(position, endValue);
    }
  }

  end() {
    this.state.commitDraw();
  }

  getCursor(position: Vector) {
    return "crosshair";
  }

  handleKey(value: string) {}
}
