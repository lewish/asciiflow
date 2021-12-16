import * as constants from "asciiflow/client/constants";
import { DrawBox } from "asciiflow/client/draw/box";
import { DrawFreeform } from "asciiflow/client/draw/freeform";
import {
  AbstractDrawFunction,
  IDrawFunction,
} from "asciiflow/client/draw/function";
import { DrawLine } from "asciiflow/client/draw/line";
import { DrawNull } from "asciiflow/client/draw/null";
import { DrawSelect } from "asciiflow/client/draw/select";
import { DrawText } from "asciiflow/client/draw/text";
import { IExportConfig } from "asciiflow/client/export";
import { CanvasStore } from "asciiflow/client/store/canvas";
import {
  ArrayStringifier,
  IStringifier,
  JSONStringifier,
  Persistent,
} from "asciiflow/client/store/persistent";
import { action, computed, observable } from "mobx";
import * as uuid from "uuid";

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
    return new DrawingId("share", null, spec);
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

  public get href() {
    if (!!this.shareSpec) {
      return `/share/${encodeURIComponent(this.shareSpec)}`;
    } else {
      if (this.localId === null) {
        return `/`;
      }
      return `/local/${encodeURIComponent(this.localId)}`;
    }
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
  public readonly nullTool = new DrawNull();

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

  @observable private selectedToolMode = ToolMode.BOX;

  public get toolMode() {
    if (this.route.shareSpec) {
      return null;
    }
    return this.selectedToolMode;
  }

  @observable public unicode = Persistent.json("unicode", true);
  @observable public controlsOpen = Persistent.json("controlsOpen", true);
  @observable public fileControlsOpen = Persistent.json(
    "fileControlsOpen",
    true
  );
  @observable public editControlsOpen = Persistent.json(
    "editControlsOpen",
    true
  );
  @observable public helpControlsOpen = Persistent.json(
    "editControlsOpen",
    true
  );
  @observable public exportConfig = Persistent.json(
    "exportConfig",
    {} as IExportConfig
  );

  @observable localDrawingIds = Persistent.custom(
    "localDrawingIds",
    [],
    new ArrayStringifier(DrawingId.STRINGIFIER)
  );

  @observable public panning = false;

  @observable public currentCursor: string = "default";

  public readonly darkMode = Persistent.json(
    "darkMode",
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

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
      : this.nullTool;
  }

  @computed
  get computedCurrentCursor() {
    return this.panning ? 'move' : this.currentCursor
  }

  @observable public modifierKeys: IModifierKeys = {};

  get characters() {
    return this.unicode.get() ? constants.UNICODE : constants.ASCII;
  }

  private canvases = new Map<string, CanvasStore>();

  get currentCanvas() {
    return this.canvas(this._route);
  }

  get drawings() {
    if (this.route.shareSpec) {
      return [this.route, ...this.localDrawingIds.get()];
    }

    const localDrawingIds = this.localDrawingIds.get();
    if (
      !localDrawingIds.some(
        (drawingId) => !drawingId.localId && !drawingId.shareSpec
      )
    ) {
      return [DrawingId.local(null), ...localDrawingIds];
    }
    return localDrawingIds;
  }

  public canvas(drawingId: DrawingId) {
    let canvas = this.canvases.get(drawingId.toString());
    if (!canvas) {
      // Add the drawing ID to the list of all drawing IDs if it's a local one.
      if (
        !!drawingId.localId &&
        !this.localDrawingIds
          .get()
          .some(
            (otherDrawingId) =>
              otherDrawingId.toString() === drawingId.toString()
          )
      ) {
        this.localDrawingIds.set([...this.localDrawingIds.get(), drawingId]);
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
    if (this.selectedToolMode !== toolMode) {
      this.currentTool.cleanup();
      this.selectedToolMode = toolMode;
    }
  }

  @action.bound public deleteDrawing(drawingId: DrawingId) {
    this.localDrawingIds.set(
      this.localDrawingIds
        .get()
        .filter(
          (subDrawingId) => subDrawingId.toString() !== drawingId.toString()
        )
    );
    // Also delete other local storage.
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.canvas(drawingId).persistentKey()))
      .forEach((key) => localStorage.removeItem(key));
  }

  @action.bound public renameDrawing(
    originalLocalId: string,
    newLocalId: string
  ) {
    const originalId = DrawingId.local(originalLocalId);
    const newId = DrawingId.local(newLocalId);
    this.localDrawingIds.set(
      this.localDrawingIds
        .get()
        .map((drawingId) =>
          drawingId.toString() === originalId.toString() ? newId : drawingId
        )
    );

    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.canvas(originalId).persistentKey()))
      .forEach((key) => {
        localStorage.removeItem(key);
        localStorage.setItem(
          key.replace(
            this.canvas(originalId).persistentKey(),
            this.canvas(newId).persistentKey()
          ),
          localStorage.getItem(key)
        );
      });
    this.canvases.delete(newId.toString());
  }

  @action.bound public saveDrawing(shareDrawingId: DrawingId, name: string) {
    const sharedDrawing = this.canvas(shareDrawingId);
    const localDrawing = this.canvas(DrawingId.local(name));
    localDrawing.persistentCommitted.set(
      sharedDrawing.persistentCommitted.get()
    );
  }
}

function generateId() {
  const hex = uuid.v4().replace(/\-/g, "");
  return hex.substr(0, 16);
}

export const store = new Store();
