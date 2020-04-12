import { TOUCH_ENABLED } from "asciiflow/client/constants";
import { State } from "asciiflow/client/state";
import { DrawFunction } from "asciiflow/client/draw/function";
import { Vector } from "asciiflow/client/vector";

export class DrawFreeform implements DrawFunction {
  constructor(private state: State, private value: string) {
    if (TOUCH_ENABLED) {
      // $("#freeform-tool-input").val("");
      // $("#freeform-tool-input").hide(0, function () {
      //   $("#freeform-tool-input").show(0, function () {
      //     $("#freeform-tool-input").focus();
      //   });
      // });
    }
  }

  start(position: Vector) {
    this.state.drawValue(position, this.value);
  }

  move(position: Vector) {
    this.state.drawValue(position, this.value);
  }

  end() {
    this.state.commitDraw();
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
    if (value.length == 1) {
      // The value is not a special character, so lets use it.
      this.value = value;
    }
  }
}
