import { TOUCH_ENABLED } from "asciiflow/client/constants";
import {
  IDrawFunction,
  AbstractDrawFunction,
} from "asciiflow/client/draw/function";
import { store } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";
import { Layer } from "asciiflow/client/layer";

export class DrawFreeform extends AbstractDrawFunction {
  private value = "x";

  private currentLayer: Layer;

  start(position: Vector) {
    this.currentLayer = new Layer();
    this.currentLayer.set(position, this.value);
    store.canvas.setScratchLayer(this.currentLayer);
  }

  move(position: Vector) {
    [this.currentLayer] = new Layer().apply(this.currentLayer);
    this.currentLayer.set(position, this.value);
    store.canvas.setScratchLayer(this.currentLayer);
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
