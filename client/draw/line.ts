import {
  IDrawFunction,
  AbstractDrawFunction,
} from "#asciiflow/client/draw/function";
import { drawLine } from "#asciiflow/client/draw/utils";
import { Layer } from "#asciiflow/client/layer";
import { store, IModifierKeys } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";

export class DrawLine extends AbstractDrawFunction {
  private startPosition: Vector;
  private endPosition: Vector;

  constructor(private isArrow: boolean) {
    super();
  }

  start(position: Vector, modifierKeys: IModifierKeys) {
    this.startPosition = position;
    this.endPosition = position;
    this.draw(modifierKeys);
  }

  move(position: Vector, modifierKeys: IModifierKeys) {
    this.endPosition = position;
    this.draw(modifierKeys);
  }

  draw(modifierKeys: IModifierKeys) {
    const layer = new Layer();
    // Try to infer line orientation.
    // TODO: Split the line into two lines if we can't satisfy both ends.
    const characters = store.characters;

    const startContext = store.currentCanvas.committed.context(this.startPosition);
    const endContext = store.currentCanvas.committed.context(this.endPosition);

    const horizontalStart =
      (startContext.up && startContext.down) ||
      (startContext.leftup && startContext.leftdown) ||
      (startContext.rightup && startContext.rightdown);

    const verticalEnd =
      (endContext.left && endContext.right) ||
      (endContext.leftup && endContext.rightup) ||
      (endContext.leftdown && endContext.rightdown);

    const horizontalFirst =
      (horizontalStart || verticalEnd) !==
      (modifierKeys.ctrl || modifierKeys.shift);

    drawLine(layer, this.startPosition, this.endPosition, horizontalFirst);

    if (this.isArrow) {
      layer.set(
        this.endPosition,
        (() => {
          if (this.endPosition.x === this.startPosition.x) {
            return this.endPosition.y < this.startPosition.y
              ? characters.arrowUp
              : characters.arrowDown;
          }
          if (this.endPosition.y === this.startPosition.y) {
            return this.endPosition.x < this.startPosition.x
              ? characters.arrowLeft
              : characters.arrowRight;
          }
          if (horizontalFirst) {
            return this.endPosition.y < this.startPosition.y
              ? characters.arrowUp
              : characters.arrowDown;
          } else {
            return this.endPosition.x > this.startPosition.x
              ? characters.arrowRight
              : characters.arrowLeft;
          }
        })()
      );
    }
    store.currentCanvas.setScratchLayer(layer);
  }

  end() {
    store.currentCanvas.commitScratch();
    this.startPosition = null;
    this.endPosition = null;
  }

  handleKey(_: string, modifierKeys: IModifierKeys) {
    this.draw(modifierKeys);
  }

  getCursor() {
    return "crosshair";
  }
}
