import * as constants from "asciiflow/client/constants";
import { Vector } from "asciiflow/client/vector";
import { action, observable } from "mobx";
import { DrawBox } from "asciiflow/client/draw/box";
import { IDrawFunction } from "asciiflow/client/draw/function";
import {
  ArrayStringifier,
  IStringifier,
  JSONStringifier,
  Persistent,
} from "asciiflow/client/store/persistent";
import { DrawLine } from "asciiflow/client/draw/line";
import { DrawSelect } from "asciiflow/client/draw/select";
import { DrawFreeform } from "asciiflow/client/draw/freeform";
import { DrawText } from "asciiflow/client/draw/text";
import * as uuid from "uuid";
import { CanvasStore } from "asciiflow/client/store/canvas";

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

export interface IDrawing {
  id: string;
  name: string;
}

export class DrawingId {
  public static local(id: string) {
    return new DrawingId("local", id, null);
  }

  public static share(spec: string) {
    return new DrawingId("local", null, spec);
  }

  constructor(
    public readonly type: "local" | "share",
    public readonly localId: string,
    public readonly shareSpec: string
  ) {}

  public get persistentKey() {
    return Persistent.key(
      this.type,
      this.type === "local" ? this.localId : this.shareSpec
    );
  }

  public toString() {
    return DrawingId.STRINGIFIER.serialize(this);
  }

  public static fromString(value: string) {
    return DrawingId.STRINGIFIER.deserialize(value);
  }

  public static readonly STRINGIFIER: IStringifier<DrawingId> = {
    deserialize(value: string) {
      const object = new JSONStringifier<any>().deserialize(value);
      return new DrawingId(object.type, object.localId, object.shareSpec);
    },
    serialize(value: DrawingId) {
      return new JSONStringifier().serialize(value);
    },
  };
}

export class Store {
  public readonly boxTool = new DrawBox();
  public readonly lineTool = new DrawLine(false);
  public readonly arrowTool = new DrawLine(true);
  public readonly selectTool = new DrawSelect();
  public readonly freeformTool = new DrawFreeform();
  public readonly textTool = new DrawText();

  @observable private _route: DrawingId = DrawingId.local(null);

  public get route() {
    return this._route;
  }

  @action.bound public setRoute(value: DrawingId) {
    if (JSON.stringify(value) !== JSON.stringify(store.route)) {
      this._route = value;
    }
  }

  @observable public freeformCharacter = "x";

  @observable public toolMode = ToolMode.BOX;
  @observable public unicode = Persistent.json("unicode", true);
  @observable public controlsOpen = Persistent.json("controlsOpen", false);

  @observable drawings = Persistent.custom(
    "localDrawingIds",
    [],
    new ArrayStringifier(DrawingId.STRINGIFIER)
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

  private canvases = new Map<string, CanvasStore>();

  get currentCanvas() {
    return this.canvas(this._route);
  }

  public canvas(drawingId: DrawingId) {
    let canvas = this.canvases.get(drawingId.toString());
    if (!canvas) {
      // Add the drawing ID to the list of all drawing IDs.
      if (
        !this.drawings
          .get()
          .some(
            (otherDrawingId) =>
              otherDrawingId.toString() === drawingId.toString()
          )
      ) {
        this.drawings.set([...this.drawings.get(), drawingId]);
      }
      canvas = new CanvasStore(drawingId);
      this.canvases.set(drawingId.toString(), canvas);
    }
    return canvas;
  }

  @action.bound public setFreeformCharacter(value: string) {
    this.freeformCharacter = value;
  }

  @action.bound public setUnicode(value: boolean) {
    this.unicode.set(value);
  }

  @action.bound public setToolMode(toolMode: ToolMode) {
    this.toolMode = toolMode;
  }
}

function generateId() {
  const hex = uuid.v4().replace(/\-/g, "");
  return hex.substr(0, 16);
}

export const store = new Store();
