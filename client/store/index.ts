import * as constants from "asciiflow/client/constants";
import { CanvasStore } from "asciiflow/client/canvas_store";
import { Vector } from "asciiflow/client/vector";
import { action, observable } from "mobx";
import { DrawBox } from "asciiflow/client/draw/box";
import { IDrawFunction } from "asciiflow/client/draw/function";
import { Persistent } from "asciiflow/client/store/persistent";

export class Store {
  @observable public unicode = Persistent.json("unicode", true);
  @observable public zoom = 1;
  @observable public offset = new Vector(
    (constants.MAX_GRID_WIDTH * constants.CHAR_PIXELS_H) / 2,
    (constants.MAX_GRID_HEIGHT * constants.CHAR_PIXELS_V) / 2
  );

  @observable public currentCursor: string = "default";

  @observable public drawFunction: IDrawFunction = new DrawBox();

  get characters() {
    return this.unicode.get() ? constants.UNICODE : constants.ASCII;
  }

  public canvas = new CanvasStore();

  @action.bound public setUnicode(value: boolean) {
    this.unicode.set(value);
  }

  @action.bound public setZoom(value: number) {
    this.zoom = value;
  }

  @action.bound public setOffset(value: Vector) {
    this.offset = value;
  }

  @action.bound public setDrawFunction(fn: IDrawFunction) {
    this.drawFunction = fn;
  }
}

export const store = new Store();
