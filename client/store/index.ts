import { DrawBox } from "#asciiflow/client/draw/box";
import { DrawFreeform } from "#asciiflow/client/draw/freeform";
import { IDrawFunction } from "#asciiflow/client/draw/function";
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
} from "#asciiflow/common/stringifiers";
import { create } from "zustand";

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
    const parts = [this.type, this.type === "local" ? this.localId : this.shareSpec];
    return parts.map((part) => encodeURIComponent(part)).join("/");
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

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function readPersistent<T>(
  key: string,
  defaultValue: T,
  stringifier: IStringifier<T> = new JSONStringifier() as any
): T {
  const raw = localStorage.getItem(key);
  if (raw === null || raw === undefined) {
    return defaultValue;
  }
  try {
    return stringifier.deserialize(raw);
  } catch {
    return defaultValue;
  }
}

function writePersistent<T>(
  key: string,
  value: T,
  stringifier: IStringifier<T> = new JSONStringifier() as any
): void {
  localStorage.setItem(key, stringifier.serialize(value));
}

// ---------------------------------------------------------------------------
// Zustand store
// ---------------------------------------------------------------------------

export interface AppState {
  // Routing
  route: DrawingId;

  // Tool state
  selectedToolMode: ToolMode;
  freeformCharacter: string;
  altPressed: boolean;
  currentCursor: string;
  modifierKeys: IModifierKeys;

  // Persistent UI state (synced to localStorage)
  unicode: boolean;
  controlsOpen: boolean;
  fileControlsOpen: boolean;
  editControlsOpen: boolean;
  helpControlsOpen: boolean;
  exportConfig: IExportConfig;
  localDrawingIds: DrawingId[];
  darkMode: boolean;
  showGrid: boolean;

  // Bumped whenever a CanvasStore mutates, so React can re-render.
  canvasVersion: number;
}

function initialState(): AppState {
  return {
    route: DrawingId.local(null),
    selectedToolMode: ToolMode.BOX,
    freeformCharacter: "x",
    altPressed: false,
    currentCursor: "default",
    modifierKeys: {},
    unicode: readPersistent("unicode", true),
    controlsOpen: readPersistent("controlsOpen", true),
    fileControlsOpen: readPersistent("fileControlsOpen", true),
    editControlsOpen: readPersistent("editControlsOpen", true),
    helpControlsOpen: readPersistent("editControlsOpen", true),
    exportConfig: readPersistent("exportConfig", {} as IExportConfig),
    localDrawingIds: readPersistent(
      "localDrawingIds",
      [],
      new ArrayStringifier(DrawingId.STRINGIFIER)
    ),
    darkMode: readPersistent(
      "darkMode",
      typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ),
    showGrid: readPersistent("showGrid", true),
    canvasVersion: 0,
  };
}

export const useAppStore = create<AppState>(() => initialState());

// Apply the dark class on initial load so CSS custom properties are correct
// before the first React render.
if (typeof document !== "undefined") {
  document.documentElement.classList.toggle("dark", useAppStore.getState().darkMode);
}

// ---------------------------------------------------------------------------
// Tool instances (singletons, stateless enough to live outside the store)
// ---------------------------------------------------------------------------

const boxTool = new DrawBox();
const lineTool = new DrawLine(false);
const arrowTool = new DrawLine(true);
const selectTool = new DrawSelect();
const freeformTool = new DrawFreeform();
const textTool = new DrawText();
const nullTool = new DrawNull();

// ---------------------------------------------------------------------------
// Canvas map (per-drawing CanvasStore instances)
// ---------------------------------------------------------------------------

const canvases = new Map<string, CanvasStore>();

function notifyCanvas() {
  useAppStore.setState((s) => ({ canvasVersion: s.canvasVersion + 1 }));
}

function getCanvas(drawingId: DrawingId): CanvasStore {
  const key = drawingId.toString();
  let canvas = canvases.get(key);
  if (!canvas) {
    canvas = new CanvasStore(drawingId, notifyCanvas);
    canvases.set(key, canvas);
  }
  return canvas;
}

// ---------------------------------------------------------------------------
// Helper: persist a value to localStorage whenever it's set in the store
// ---------------------------------------------------------------------------

function setPersistent<K extends keyof AppState>(
  key: K,
  value: AppState[K],
  storageKey: string = key,
  stringifier?: any
) {
  useAppStore.setState({ [key]: value } as any);
  writePersistent(storageKey, value, stringifier);
}

// ---------------------------------------------------------------------------
// Imperative store facade (used by controllers, draw tools, and non-React code)
// ---------------------------------------------------------------------------

export const store = {
  // Tool instances
  boxTool,
  lineTool,
  arrowTool,
  selectTool,
  freeformTool,
  textTool,
  nullTool,

  // Route
  get route() {
    return useAppStore.getState().route;
  },
  setRoute(value: DrawingId) {
    useAppStore.setState({ route: value });
  },

  // Freeform character
  get freeformCharacter() {
    return useAppStore.getState().freeformCharacter;
  },
  setFreeformCharacter(value: string) {
    useAppStore.setState({ freeformCharacter: value });
  },

  // Selected tool mode
  get selectedToolMode() {
    return useAppStore.getState().selectedToolMode;
  },

  toolMode(): ToolMode | undefined {
    if (useAppStore.getState().route.shareSpec) {
      return undefined;
    }
    return useAppStore.getState().selectedToolMode;
  },

  setToolMode(toolMode: ToolMode) {
    const state = useAppStore.getState();
    if (state.selectedToolMode !== toolMode) {
      store.currentTool.cleanup();
      useAppStore.setState({ selectedToolMode: toolMode });
    }
  },

  // Current tool (derived)
  get currentTool(): IDrawFunction {
    const mode = store.toolMode();
    return mode === ToolMode.BOX
      ? boxTool
      : mode === ToolMode.LINES
      ? lineTool
      : mode === ToolMode.ARROWS
      ? arrowTool
      : mode === ToolMode.FREEFORM
      ? freeformTool
      : mode === ToolMode.TEXT
      ? textTool
      : mode === ToolMode.SELECT
      ? selectTool
      : nullTool;
  },

  // Alt pressed
  get altPressed() {
    return useAppStore.getState().altPressed;
  },
  setAltPressed(value: boolean) {
    useAppStore.setState({ altPressed: value });
  },

  // Cursor
  get currentCursor() {
    return useAppStore.getState().currentCursor;
  },
  setCurrentCursor(value: string) {
    useAppStore.setState({ currentCursor: value });
  },

  // Modifier keys
  get modifierKeys() {
    return useAppStore.getState().modifierKeys;
  },
  setModifierKeys(value: IModifierKeys) {
    useAppStore.setState({ modifierKeys: value });
  },

  // Dark mode (persistent)
  get darkMode() {
    return useAppStore.getState().darkMode;
  },
  setDarkMode(value: boolean) {
    // Toggle the class synchronously so CSS custom properties are available
    // before React re-renders (getColors() reads them during render).
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", value);
    }
    setPersistent("darkMode", value);
  },

  // Show grid (persistent)
  get showGrid() {
    return useAppStore.getState().showGrid;
  },
  setShowGrid(value: boolean) {
    setPersistent("showGrid", value);
  },

  // Unicode (persistent)
  get unicode() {
    return useAppStore.getState().unicode;
  },
  setUnicode(value: boolean) {
    setPersistent("unicode", value);
  },

  // Controls open (persistent)
  get controlsOpen() {
    return useAppStore.getState().controlsOpen;
  },
  setControlsOpen(value: boolean) {
    setPersistent("controlsOpen", value);
  },

  // File controls open (persistent)
  get fileControlsOpen() {
    return useAppStore.getState().fileControlsOpen;
  },
  setFileControlsOpen(value: boolean) {
    setPersistent("fileControlsOpen", value);
  },

  // Edit controls open (persistent)
  get editControlsOpen() {
    return useAppStore.getState().editControlsOpen;
  },
  setEditControlsOpen(value: boolean) {
    setPersistent("editControlsOpen", value);
  },

  // Help controls open (persistent)
  get helpControlsOpen() {
    return useAppStore.getState().helpControlsOpen;
  },
  setHelpControlsOpen(value: boolean) {
    setPersistent("helpControlsOpen", value);
  },

  // Export config (persistent)
  get exportConfig() {
    return useAppStore.getState().exportConfig;
  },
  setExportConfig(value: IExportConfig) {
    setPersistent("exportConfig", value);
  },

  // Local drawing IDs (persistent with custom stringifier)
  get localDrawingIds() {
    return useAppStore.getState().localDrawingIds;
  },
  setLocalDrawingIds(value: DrawingId[]) {
    setPersistent(
      "localDrawingIds",
      value,
      "localDrawingIds",
      new ArrayStringifier(DrawingId.STRINGIFIER)
    );
  },

  // Canvas access
  canvas(drawingId: DrawingId) {
    return getCanvas(drawingId);
  },

  get currentCanvas() {
    return getCanvas(useAppStore.getState().route);
  },

  // Derived: drawings list
  get drawings(): DrawingId[] {
    const state = useAppStore.getState();
    if (state.route.shareSpec) {
      return [state.route, ...state.localDrawingIds];
    }
    const localDrawingIds = state.localDrawingIds;
    if (
      !localDrawingIds.some(
        (drawingId) => !drawingId.localId && !drawingId.shareSpec
      )
    ) {
      return [DrawingId.local(null), ...localDrawingIds];
    }
    return localDrawingIds;
  },

  // Actions
  deleteDrawing(drawingId: DrawingId) {
    const filtered = useAppStore
      .getState()
      .localDrawingIds.filter(
        (subDrawingId) => subDrawingId.toString() !== drawingId.toString()
      );
    store.setLocalDrawingIds(filtered);
    // Also delete other local storage.
    Object.keys(localStorage)
      .filter((key) => key.startsWith(storagePrefix(drawingId)))
      .forEach((key) => localStorage.removeItem(key));
    canvases.delete(drawingId.toString());
    // Force re-render so the UI updates even if the route doesn't change
    // (e.g. deleting the default drawing navigates back to the same route).
    notifyCanvas();
  },

  renameDrawing(originalLocalId: string, newLocalId: string) {
    const originalId = DrawingId.local(originalLocalId);
    const newId = DrawingId.local(newLocalId);
    Object.keys(localStorage)
      .filter((key) => key.startsWith(storagePrefix(originalId)))
      .forEach((key) => {
        localStorage.setItem(
          key.replace(storagePrefix(originalId), storagePrefix(newId)),
          localStorage.getItem(key)
        );
        localStorage.removeItem(key);
      });
    const updated = [
      ...useAppStore
        .getState()
        .localDrawingIds.filter(
          (drawingId) => drawingId.toString() !== originalId.toString()
        ),
      newId,
    ];
    store.setLocalDrawingIds(updated);
    canvases.delete(originalId.toString());
    window.location.hash = newId.href;
  },

  saveDrawing(shareDrawingId: DrawingId, name: string) {
    const sharedDrawing = getCanvas(shareDrawingId);
    const localDrawing = getCanvas(DrawingId.local(name));
    localDrawing.committed = sharedDrawing.committed;
    store.setLocalDrawingIds([
      ...useAppStore.getState().localDrawingIds,
      DrawingId.local(name),
    ]);
  },
};

export function storagePrefix(drawingId: DrawingId) {
  return `drawing/${encodeURIComponent(drawingId.persistentKey)}/`;
}

export function storageKey(drawingId: DrawingId, key: string) {
  return storagePrefix(drawingId) + key;
}
