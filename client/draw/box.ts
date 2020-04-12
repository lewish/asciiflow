import { State } from "asciiflow/client/state";
import { Vector } from "asciiflow/client/vector";
import { DrawFunction } from "asciiflow/client/draw/function";
import { drawLine } from "asciiflow/client/draw/utils";

/**
 * @implements {DrawFunction}
 */
export class DrawBox implements DrawFunction {
  private startPosition: Vector;
  private endPosition: Vector;

  constructor(private readonly state: State) {
    this.state = state;
  }

  start(position: Vector) {
    this.startPosition = position;
  }

  move(position: Vector) {
    this.endPosition = position;
    this.state.clearDraw();
    drawLine(this.state, this.startPosition, position, true);
    drawLine(this.state, this.startPosition, position, false);
  }

  end() {
    this.state.commitDraw();
  }

  getCursor(position: Vector) {
    return "crosshair";
  }

  handleKey(value: string) {}
}
