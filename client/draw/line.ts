import { connect, connects, disconnect } from "#asciiflow/client/characters";
import { Direction } from "#asciiflow/client/direction";
import {
  IDrawFunction,
  AbstractDrawFunction,
} from "#asciiflow/client/draw/function";
import { line } from "#asciiflow/client/draw/utils";
import { Layer, LayerView } from "#asciiflow/client/layer";
import { snap } from "#asciiflow/client/snap";
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
    let layer = new Layer();
    // Try to infer line orientation.
    // TODO: Split the line into two lines if we can't satisfy both ends.
    const characters = store.characters;

    const startContext = store.currentCanvas.committed.context(
      this.startPosition
    );
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

    layer = layer.apply(line(this.startPosition, this.endPosition, horizontalFirst))[0];

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
    } else {
      // Start or end characters may not just be lines, if adjacent cells have any incoming connections
      // then we connect to them, and then remove any unnecessary connections (if possible).
      const combined = new LayerView([store.currentCanvas.committed, layer]);
      for (const position of [this.startPosition, this.endPosition]) {
        const incomingConnections = Direction.ALL.filter((direction) =>
          connects(combined.get(position.add(direction)), direction.opposite())
        );
        layer.set(position, connect(layer.get(position), incomingConnections));
        layer.set(
          position,
          disconnect(
            layer.get(position),
            Direction.ALL.filter(
              (direction) => !incomingConnections.includes(direction)
            )
          )
        );
      }
    }

    layer = layer.apply(snap(layer, store.currentCanvas.committed))[0];

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
