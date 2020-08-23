import { TOUCH_ENABLED } from "asciiflow/client/constants";
import {
  IDrawFunction,
  AbstractDrawFunction,
} from "asciiflow/client/draw/function";
import { store } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";

export class DrawFreeform extends AbstractDrawFunction {
  constructor(private value: string) {
    super();
  }

  start(position: Vector) {
    store.canvas.scratch.set(position, this.value);
  }

  move(position: Vector) {
    store.canvas.scratch.set(position, this.value);
  }

  end() {
    store.canvas.commitScratch();
  }

  getCursor(position: Vector) {
    return "crosshair";
  }

  handleKey(value: string) {
    if (TOUCH_ENABLED) {
      // this.value = $("#freeform-tool-input").val().substr(0, 1);
      // $("#freeform-tool-input").blur();
      // $("#freeform-tool-input").hide(0);
    }
    if (value.length === 1) {
      // The value is not a special character, so lets use it.
      this.value = value;
    }
  }
}
