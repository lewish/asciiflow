// Must be first import: shims localStorage and window for Node.js.
import "#asciiflow/testing/test_setup";

import { assert } from "chai";
import { Layer } from "#asciiflow/client/layer";
import { Vector } from "#asciiflow/client/vector";
import { useAppStore, store, ToolMode, DrawingId, storageKey } from "#asciiflow/client/store/index";
import * as constants from "#asciiflow/client/constants";
import { CanvasStore } from "#asciiflow/client/store/canvas";

describe("store facade", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState({
      route: DrawingId.local(null),
      selectedToolMode: ToolMode.BOX,
      freeformCharacter: "x",
      altPressed: false,
      currentCursor: "default",
      modifierKeys: {},
      unicode: true,
      controlsOpen: true,
      fileControlsOpen: true,
      editControlsOpen: true,
      helpControlsOpen: true,
      exportConfig: {},
      localDrawingIds: [],
      darkMode: false,
      canvasVersion: 0,
    }, true);
  });

  describe("tool mode", () => {
    it("should default to BOX", () => {
      assert.equal(store.selectedToolMode, ToolMode.BOX);
      assert.equal(store.toolMode(), ToolMode.BOX);
    });

    it("should update when setToolMode is called", () => {
      store.setToolMode(ToolMode.TEXT);
      assert.equal(store.selectedToolMode, ToolMode.TEXT);
      assert.equal(store.toolMode(), ToolMode.TEXT);
    });

    it("should return undefined for shared drawings", () => {
      store.setRoute(DrawingId.share("spec"));
      assert.isUndefined(store.toolMode());
    });
  });

  describe("freeform character", () => {
    it("should default to x", () => {
      assert.equal(store.freeformCharacter, "x");
    });

    it("should update via setFreeformCharacter", () => {
      store.setFreeformCharacter("o");
      assert.equal(store.freeformCharacter, "o");
    });
  });

  describe("persistent state (darkMode)", () => {
    it("should persist to localStorage", () => {
      store.setDarkMode(true);
      assert.isTrue(store.darkMode);
      assert.equal(localStorage.getItem("darkMode"), "true");
    });

    it("should read initial value from localStorage", () => {
      localStorage.setItem("darkMode", "true");
      useAppStore.setState({
        darkMode: JSON.parse(localStorage.getItem("darkMode")!),
      });
      assert.isTrue(store.darkMode);
    });
  });

  describe("localDrawingIds", () => {
    it("should default to empty", () => {
      assert.deepEqual(store.localDrawingIds, []);
    });

    it("should persist drawing ids", () => {
      const id = DrawingId.local("test-drawing");
      store.setLocalDrawingIds([id]);
      assert.lengthOf(store.localDrawingIds, 1);
      assert.equal(store.localDrawingIds[0].localId, "test-drawing");
      const raw = localStorage.getItem("localDrawingIds");
      assert.isNotNull(raw);
    });
  });

  describe("drawings list", () => {
    it("should include default drawing when localDrawingIds is empty", () => {
      store.setRoute(DrawingId.local(null));
      const drawings = store.drawings;
      assert.isAtLeast(drawings.length, 1);
      assert.isNull(drawings[0].localId);
    });

    it("should include share route when viewing a shared drawing", () => {
      store.setRoute(DrawingId.share("test-spec"));
      const drawings = store.drawings;
      assert.equal(drawings[0].shareSpec, "test-spec");
    });
  });

  describe("zustand subscriptions", () => {
    it("should notify subscribers when state changes", () => {
      let callCount = 0;
      const unsub = useAppStore.subscribe(() => {
        callCount++;
      });
      store.setDarkMode(true);
      store.setDarkMode(false);
      assert.equal(callCount, 2);
      unsub();
    });
  });
});

describe("CanvasStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState({
      route: DrawingId.local(null),
      canvasVersion: 0,
    }, true);
  });

  it("should create a canvas and bump canvasVersion on mutations", () => {
    const drawingId = DrawingId.local("test");
    store.setRoute(drawingId);
    const canvas = store.currentCanvas;
    const initialVersion = useAppStore.getState().canvasVersion;
    canvas.setZoom(2);
    assert.equal(canvas.zoom, 2);
    assert.isAbove(useAppStore.getState().canvasVersion, initialVersion);
  });

  it("should support undo/redo", () => {
    const drawingId = DrawingId.local("undo-test");
    store.setRoute(drawingId);
    const canvas = store.currentCanvas;

    const scratch = new Layer();
    scratch.set(new Vector(5, 5), "X");
    canvas.setScratchLayer(scratch);
    canvas.commitScratch();

    assert.equal(canvas.committed.get(new Vector(5, 5)), "X");

    canvas.undo();
    assert.isNull(canvas.committed.get(new Vector(5, 5)));

    canvas.redo();
    assert.equal(canvas.committed.get(new Vector(5, 5)), "X");
  });

  it("should clear the canvas", () => {
    const drawingId = DrawingId.local("clear-test");
    store.setRoute(drawingId);
    const canvas = store.currentCanvas;

    const scratch = new Layer();
    scratch.set(new Vector(3, 3), "A");
    canvas.setScratchLayer(scratch);
    canvas.commitScratch();

    assert.equal(canvas.committed.get(new Vector(3, 3)), "A");

    canvas.clear();
    assert.isNull(canvas.committed.get(new Vector(3, 3)));
  });
});

describe("CanvasStore offset migration", () => {
  // The old hardcoded pixel sizes before dynamic font measurement.
  const LEGACY_H = 9;
  const LEGACY_V = 16;

  let version: number;
  function notify() { version++; }

  beforeEach(() => {
    localStorage.clear();
    version = 0;
  });

  it("should use default center offset when nothing is stored", () => {
    const canvas = new CanvasStore(DrawingId.local("fresh"), notify);
    const offset = canvas.offset;
    assert.equal(offset.x, (constants.MAX_GRID_WIDTH * constants.CHAR_PIXELS_H) / 2);
    assert.equal(offset.y, (constants.MAX_GRID_HEIGHT * constants.CHAR_PIXELS_V) / 2);
  });

  it("should migrate legacy offset (no v field) to new pixel coords", () => {
    const id = DrawingId.local("legacy");
    const key = storageKey(id, "offset");

    // Simulate old-format offset stored with H=9, V=16.
    const legacyOffset = { x: 900, y: 1600 };
    localStorage.setItem(key, JSON.stringify(legacyOffset));

    const canvas = new CanvasStore(id, notify);
    const offset = canvas.offset;

    // Legacy offset in cell coords: (900/9, 1600/16) = (100, 100).
    // New offset: (100 * CHAR_PIXELS_H, 100 * CHAR_PIXELS_V).
    assert.equal(offset.x, (legacyOffset.x / LEGACY_H) * constants.CHAR_PIXELS_H);
    assert.equal(offset.y, (legacyOffset.y / LEGACY_V) * constants.CHAR_PIXELS_V);

    // Should have persisted the migrated offset with v: 2.
    const stored = JSON.parse(localStorage.getItem(key)!);
    assert.equal(stored.v, 2);
    assert.equal(stored.x, offset.x);
    assert.equal(stored.y, offset.y);
  });

  it("should not re-migrate an already-migrated offset (v: 2)", () => {
    const id = DrawingId.local("migrated");
    const key = storageKey(id, "offset");

    const migratedOffset = { x: 500, y: 700, v: 2 };
    localStorage.setItem(key, JSON.stringify(migratedOffset));

    const canvas = new CanvasStore(id, notify);
    const offset = canvas.offset;

    // Should use the stored values as-is.
    assert.equal(offset.x, 500);
    assert.equal(offset.y, 700);
  });

  it("should write v: 2 on setOffset", () => {
    const id = DrawingId.local("write-test");
    const key = storageKey(id, "offset");

    const canvas = new CanvasStore(id, notify);
    canvas.setOffset(new Vector(123, 456));

    const stored = JSON.parse(localStorage.getItem(key)!);
    assert.equal(stored.v, 2);
    assert.equal(stored.x, 123);
    assert.equal(stored.y, 456);
  });
});
