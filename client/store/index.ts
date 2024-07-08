import * as constants from "#asciiflow/client/constants";
import { DrawBox } from "#asciiflow/client/draw/box";
import { DrawFreeform } from "#asciiflow/client/draw/freeform";
import {
  AbstractDrawFunction,
  IDrawFunction,
} from "#asciiflow/client/draw/function";
import { DrawLine } from "#asciiflow/client/draw/line";
import { DrawNull } from "#asciiflow/client/draw/null";
import { DrawSelect } from "#asciiflow/client/draw/select";
import { DrawText } from "#asciiflow/client/draw/text";
import { IExportConfig } from "#asciiflow/client/export";
import { CanvasStore } from "#asciiflow/client/store/canvas";
import {
  ArrayStringifier,
  IStringifier,
  JSONStringifier,
} from "#asciiflow/client/store/stringifiers";
import { Persistent } from "#asciiflow/client/store/persistent";
import * as uuid from "uuid";
import { watchableAdapter, watchableValue } from "#asciiflow/common/watchable";

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

  private readonly _route = watchableValue(DrawingId.local(null));

  public get route() {
    return this._route;
  }

  public setRoute(value: DrawingId) {
    this._route.set(value);
  }

  public readonly freeformCharacter = watchableValue("x");

  public readonly selectedToolMode = watchableValue(ToolMode.BOX);

  public toolMode(): ToolMode | undefined {
    if (this.route.get().shareSpec) {
      return undefined;
    }
    return this.selectedToolMode.get();
  }

  public readonly unicode = watchableAdapter(Persistent.json("unicode", true));
  public readonly controlsOpen = watchableAdapter(
    Persistent.json("controlsOpen", true)
  );
  public readonly fileControlsOpen = watchableAdapter(
    Persistent.json("fileControlsOpen", true)
  );
  public readonly editControlsOpen = watchableAdapter(
    Persistent.json("editControlsOpen", true)
  );
  public readonly helpControlsOpen = watchableAdapter(
    Persistent.json("editControlsOpen", true)
  );
  public readonly exportConfig = watchableAdapter(
    Persistent.json("exportConfig", {} as IExportConfig)
  );

  public readonly localDrawingIds = watchableAdapter(
    Persistent.custom(
      "localDrawingIds",
      [],
      new ArrayStringifier(DrawingId.STRINGIFIER)
    )
  );

  public readonly panning = watchableValue(false);

  public readonly altPressed = watchableValue(false);

  public readonly currentCursor = watchableValue("default");

  public readonly darkMode = watchableAdapter(
    Persistent.json(
      "darkMode",
      window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    )
  );

  get currentTool(): IDrawFunction {
    return this.toolMode() === ToolMode.BOX
      ? this.boxTool
      : this.toolMode() === ToolMode.LINES
      ? this.lineTool
      : this.toolMode() === ToolMode.ARROWS
      ? this.arrowTool
      : this.toolMode() === ToolMode.FREEFORM
      ? this.freeformTool
      : this.toolMode() === ToolMode.TEXT
      ? this.textTool
      : this.toolMode() === ToolMode.SELECT
      ? this.selectTool
      : this.nullTool;
  }

  public readonly modifierKeys = watchableValue<IModifierKeys>({});

  private canvases = new Map<string, CanvasStore>();

  get currentCanvas() {
    return this.canvas(this._route.get());
  }

  get drawings(): DrawingId[] {
    if (this.route.get().shareSpec) {
      return [this.route.get(), ...this.localDrawingIds.get()];
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
      // if (
      //   !!drawingId.localId &&
      //   !this.localDrawingIds
      //     .get()
      //     .some(
      //       (otherDrawingId) =>
      //         otherDrawingId.toString() === drawingId.toString()
      //     )
      // ) {
      //   this.localDrawingIds.set([...this.localDrawingIds.get(), drawingId]);
      // }
      canvas = new CanvasStore(drawingId);
      this.canvases.set(drawingId.toString(), canvas);
    }
    return canvas;
  }

  public setUnicode(value: boolean) {
    this.unicode.set(value);
  }

  public setToolMode(toolMode: ToolMode) {
    if (this.selectedToolMode.get() !== toolMode) {
      this.currentTool.cleanup();
      this.selectedToolMode.set(toolMode);
    }
  }

  public deleteDrawing(drawingId: DrawingId) {
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

  public renameDrawing(originalLocalId: string, newLocalId: string) {
    const originalId = DrawingId.local(originalLocalId);
    const newId = DrawingId.local(newLocalId);
    Object.keys(localStorage)
      .filter((key) =>
        key.startsWith(this.canvas(originalId).persistentKey() + "/")
      )
      .forEach((key) => {
        localStorage.setItem(
          key.replace(
            this.canvas(originalId).persistentKey(),
            this.canvas(newId).persistentKey()
          ),
          localStorage.getItem(key)
        );
        localStorage.removeItem(key);
      });
    this.canvases.delete(newId.toString());
    this.canvases.delete(originalId.toString());
    this.localDrawingIds.set([
      ...this.localDrawingIds
        .get()
        .filter((drawingId) => drawingId.toString() !== originalId.toString()),
      newId,
    ]);
    window.location.hash = newId.href;
  }

  public saveDrawing(shareDrawingId: DrawingId, name: string) {
    const sharedDrawing = this.canvas(shareDrawingId);
    const localDrawing = this.canvas(DrawingId.local(name));
    localDrawing.persistentCommitted.set(
      sharedDrawing.persistentCommitted.get()
    );
    this.localDrawingIds.set([
      ...this.localDrawingIds.get(),
      DrawingId.local(name),
    ]);
  }
}

function generateId() {
  const hex = uuid.v4().replace(/\-/g, "");
  return hex.substring(0, 16);
}

export const store = new Store();
