import { AbstractDrawFunction } from "asciiflow/client/draw/function";
import { Layer } from "asciiflow/client/layer";
import { store } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";

export class DrawText extends AbstractDrawFunction {
  private lastClickedPosition: Vector;
  private currentPosition: Vector;
  private textLayer: Layer;

  start(position: Vector) {
    this.lastClickedPosition = position;
    this.currentPosition = position;
  }

  move(position: Vector) {}

  end() {}

  getCursor(position: Vector) {
    return "pointer";
  }

  handleKey(value: string) {
    let newLayer = new Layer();
    if (!!this.textLayer) {
      [newLayer] = newLayer.apply(this.textLayer);
    }
    this.textLayer = newLayer;

    // Handle special characters.
    if (value.startsWith("<") && value.endsWith(">")) {
      if (value === "<enter>") {
        this.currentPosition = new Vector(
          this.lastClickedPosition.x,
          this.currentPosition.y + 1
        );
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
