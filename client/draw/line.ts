import {
  connect,
  connectable,
  connects,
  disconnect,
} from "#asciiflow/client/characters";
import { UNICODE } from "#asciiflow/client/constants";
import { Direction } from "#asciiflow/client/direction";
import { AbstractDrawFunction } from "#asciiflow/client/draw/function";
import { line } from "#asciiflow/client/draw/utils";
import { Layer, LayerView } from "#asciiflow/client/layer";
import { cellContext } from "#asciiflow/client/render_layer";
import { snap } from "#asciiflow/client/snap";
import { IModifierKeys, store } from "#asciiflow/client/store";
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
    if (!this.startPosition || !this.endPosition) {
      return;
    }
    const layer = new Layer();
    // Try to infer line orientation.
    const characters = UNICODE;
    const startContext = cellContext(
      this.startPosition,
      store.currentCanvas.committed
    );
    const endContext = cellContext(
      this.endPosition,
      store.currentCanvas.committed
    );

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

    layer.setFrom(line(this.startPosition, this.endPosition, horizontalFirst));

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
    // Start or end characters may not just be lines, if adjacent cells have any incoming connections
    // then we connect to them, and then remove any unnecessary connections (if possible).
    const combined = new LayerView([store.currentCanvas.committed, layer]);
    for (const position of this.isArrow
      ? [this.startPosition]
      : [this.startPosition, this.endPosition]) {
      const incomingConnections = Direction.ALL.filter(
        (direction) =>
          connects(
            combined.get(position.add(direction)),
            direction.opposite()
          ) && connectable(layer.get(position), direction)
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

    layer.setFrom(snap(layer, store.currentCanvas.committed));

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
