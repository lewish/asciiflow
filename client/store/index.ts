import * as constants from "asciiflow/client/constants";
import { CanvasStore } from "asciiflow/client/canvas_store";
import { Vector } from "asciiflow/client/vector";
import { action, observable } from "mobx";
import { DrawBox } from "asciiflow/client/draw/box";
import { IDrawFunction } from "asciiflow/client/draw/function";
import { Persistent } from "asciiflow/client/store/persistent";
import { DrawLine } from "asciiflow/client/draw/line";
import { DrawSelect } from "asciiflow/client/draw/select";
import { DrawFreeform } from "asciiflow/client/draw/freeform";
import { DrawText } from "asciiflow/client/draw/text";

export enum ToolMode {
  BOX = 1,
  SELECT = 2,
  FREEFORM = 3,
  ARROWS = 6,
  LINES = 4,
  TEXT = 7,
}

export interface IModifierKeys {
  shift?: boolean;
  ctrl?: boolean;
  meta?: boolean;
}

export class Store {
  public readonly boxTool = new DrawBox();
  public readonly lineTool = new DrawLine(false);
  public readonly arrowTool = new DrawLine(true);
  public readonly selectTool = new DrawSelect();
  public readonly freeformTool = new DrawFreeform();
  public readonly textTool = new DrawText();

  @observable public toolMode = ToolMode.BOX;

  @observable public unicode = Persistent.json("unicode", true);

  @observable public zoom = 1;

  @observable public offset = new Vector(
    (constants.MAX_GRID_WIDTH * constants.CHAR_PIXELS_H) / 2,
    (constants.MAX_GRID_HEIGHT * constants.CHAR_PIXELS_V) / 2
  );

  @observable public currentCursor: string = "default";

  get currentTool(): IDrawFunction {
    return this.toolMode === ToolMode.BOX
      ? this.boxTool
      : this.toolMode === ToolMode.LINES
      ? this.lineTool
      : this.toolMode === ToolMode.ARROWS
      ? this.arrowTool
      : this.toolMode === ToolMode.FREEFORM
      ? this.freeformTool
      : this.toolMode === ToolMode.TEXT
      ? this.textTool
      : this.toolMode === ToolMode.SELECT
      ? this.selectTool
      : (() => {
          throw new Error("Unrecognised tool.");
        })();
  }

  @observable public modifierKeys: IModifierKeys = {};

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

  @action.bound public setToolMode(toolMode: ToolMode) {
    this.toolMode = toolMode;
  }
}

export const store = new Store();
