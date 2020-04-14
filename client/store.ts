import * as constants from "asciiflow/client/constants";
import { CanvasStore } from "asciiflow/client/canvas_store";
import { Vector } from "asciiflow/client/vector";
import { action, observable } from "mobx";
import { DrawBox } from "asciiflow/client/draw/box";
import { IDrawFunction } from "asciiflow/client/draw/function";

export class LocalStorageItem<T> {
  @observable public value: T = null;

  constructor(public readonly key: string, defaultValue: T) {
    const localStorageValue = localStorage.getItem(key);
    if (
      typeof localStorageValue === "undefined" ||
      localStorageValue === null
    ) {
      this.value = defaultValue;
    } else {
      this.value = JSON.parse(localStorageValue) as T;
    }
  }

  set(value: T) {
    this.value = value;
    localStorage.setItem(this.key, JSON.stringify(value));
  }
}

export class Store {
  @observable public unicode = new LocalStorageItem("unicode", true);
  @observable public tool = "box";
  @observable public zoom = 1;
  @observable public offset = new Vector(
    (constants.MAX_GRID_WIDTH * constants.CHAR_PIXELS_H) / 2,
    (constants.MAX_GRID_HEIGHT * constants.CHAR_PIXELS_V) / 2
  );

  @observable public currentCursor: string = "default";

  @observable public drawFunction: IDrawFunction = new DrawBox();

  public canvas = new CanvasStore();

  @action.bound public setUnicode(value: boolean) {
    this.unicode.set(value);
  }

  @action.bound public setTool(value: string) {
    this.tool = value;
  }

  @action.bound public setZoom(value: number) {
    this.zoom = value;
  }

  @action.bound public setOffset(value: Vector) {
    this.offset = value;
  }
}

export const store = new Store();
