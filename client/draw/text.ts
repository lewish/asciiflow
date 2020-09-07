import { AbstractDrawFunction } from "asciiflow/client/draw/function";
import { Layer } from "asciiflow/client/layer";
import { store, IModifierKeys } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";

export class DrawText extends AbstractDrawFunction {
  private currentPosition: Vector;
  private textLayer: Layer;

  start(position: Vector) {
    this.currentPosition = position;
    this.textLayer = new Layer();
    this.textLayer.set(position, store.canvas.committed.get(position));
    store.canvas.setScratchLayer(this.textLayer);
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
            this.currentPosition.x,
            this.currentPosition.y + 1
          );
        } else {
          store.canvas.commitScratch();
        }
      }
      if (value === "<backspace>") {
        this.currentPosition = this.currentPosition.left();
        this.textLayer.delete(this.currentPosition);
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
      return;
    }

    // Add the new text to the layer and move to the right.
    this.textLayer.set(this.currentPosition, value);
    this.currentPosition = this.currentPosition.right();
    store.canvas.setScratchLayer(this.textLayer);
  }

  cleanup() {
    if (!!this.textLayer) {
      store.canvas.commitScratch();
    }
  }
}
