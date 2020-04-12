import { ERASE_CHAR } from "asciiflow/client/constants";
import { DrawFunction } from "asciiflow/client/draw/function";
import { State } from "asciiflow/client/state";
import { Vector } from "asciiflow/client/vector";

export class DrawErase implements DrawFunction {
  private startPosition: Vector;
  private endPosition: Vector;

  constructor(private state: State) {}

  start(position: Vector) {
    this.startPosition = position;
    this.move(position);
  }

  move(position: Vector) {
    this.state.clearDraw();
    this.endPosition = position;

    var startX = Math.min(this.startPosition.x, this.endPosition.x);
    var startY = Math.min(this.startPosition.y, this.endPosition.y);
    var endX = Math.max(this.startPosition.x, this.endPosition.x);
    var endY = Math.max(this.startPosition.y, this.endPosition.y);

    for (var i = startX; i <= endX; i++) {
      for (var j = startY; j <= endY; j++) {
        this.state.drawValue(new Vector(i, j), ERASE_CHAR);
      }
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
