import { Box } from "asciiflow/client/common";
import { AbstractDrawFunction } from "asciiflow/client/draw/function";
import { Layer } from "asciiflow/client/layer";
import { store, IModifierKeys } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";

export class DrawText extends AbstractDrawFunction {
  private currentPosition: Vector;
  private textLayer: Layer;
  private newLineAlignment: Vector;

  start(position: Vector) {
    this.currentPosition = position;
    this.newLineAlignment = position;
    if (!this.textLayer) {
      this.textLayer = new Layer();
    }
    store.canvas.setScratchLayer(this.textLayer);
    store.canvas.setSelection(new Box(position, position));
  }

  getCursor() {
    return "text";
  }

  handleKey(value: string, modifierKeys: IModifierKeys) {
    let newLayer = new Layer();
    if (!!this.textLayer) {
      [newLayer] = newLayer.apply(this.textLayer);
    }
    this.textLayer = newLayer;

    // Handle special characters.
    if (value.startsWith("<") && value.endsWith(">")) {
      if (value === "<enter>") {
        if (modifierKeys.shift || modifierKeys.ctrl || modifierKeys.meta) {
          this.currentPosition = new Vector(
            this.newLineAlignment.x,
            this.currentPosition.y + 1
          );
        } else {
          store.canvas.commitScratch();
          this.textLayer = null;
        }
      }
      if (value === "<backspace>") {
        this.currentPosition = this.currentPosition.left();
        this.textLayer.delete(this.currentPosition);
        store.canvas.setScratchLayer(this.textLayer);
      }
      if (value === "<left>") {
        this.currentPosition = this.currentPosition.left();
      }
      if (value === "<right>") {
        this.currentPosition = this.currentPosition.right();
      }
      if (value === "<up>") {
        this.currentPosition = this.currentPosition.up();
      }
      if (value === "<down>") {
        this.currentPosition = this.currentPosition.down();
      }
      store.canvas.setSelection(
        new Box(this.currentPosition, this.currentPosition)
      );
      return;
    }

    // Add the new text to the layer and move to the right.
    this.textLayer.set(this.currentPosition, value);
    this.currentPosition = this.currentPosition.right();
    store.canvas.setScratchLayer(this.textLayer);
    store.canvas.setSelection(
      new Box(this.currentPosition, this.currentPosition)
    );
  }

  cleanup() {
    if (!!this.textLayer) {
      store.canvas.commitScratch();
      this.textLayer = null;
    }
  }
}
