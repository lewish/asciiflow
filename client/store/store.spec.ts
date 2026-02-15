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

describe("CanvasStore offset serialization", () => {
  // Offsets are always stored in the original pixel format (H=9, V=16)
  // and converted to/from current pixel sizes on read/write.
  const STORED_H = 9;
  const STORED_V = 16;

  let version: number;
  function notify() { version++; }

  beforeEach(() => {
    localStorage.clear();
    version = 0;
  });

  it("should use default center offset when nothing is stored", () => {
    const canvas = new CanvasStore(DrawingId.local("fresh"), notify);
    const offset = canvas.offset;
    // Default is grid center, converted from stored format to current pixels.
    assert.equal(offset.x, (constants.MAX_GRID_WIDTH * constants.CHAR_PIXELS_H) / 2);
    assert.equal(offset.y, (constants.MAX_GRID_HEIGHT * constants.CHAR_PIXELS_V) / 2);
  });

  it("should convert stored offset (H=9, V=16) to current pixel sizes on read", () => {
    const id = DrawingId.local("read-test");
    const key = storageKey(id, "offset");

    // Stored in original pixel format: cell (100, 100) at H=9, V=16.
    localStorage.setItem(key, JSON.stringify({ x: 900, y: 1600 }));

    const canvas = new CanvasStore(id, notify);
    const offset = canvas.offset;

    // Runtime offset should be cell coords * current pixel sizes.
    assert.equal(offset.x, 100 * constants.CHAR_PIXELS_H);
    assert.equal(offset.y, 100 * constants.CHAR_PIXELS_V);
  });

  it("should convert back to stored pixel format (H=9, V=16) on write", () => {
    const id = DrawingId.local("write-test");
    const key = storageKey(id, "offset");

    const canvas = new CanvasStore(id, notify);
    // setOffset receives current pixel coords.
    // Cell (10, 20) in current pixels:
    const pixelX = 10 * constants.CHAR_PIXELS_H;
    const pixelY = 20 * constants.CHAR_PIXELS_V;
    canvas.setOffset(new Vector(pixelX, pixelY));

    // Should be stored as cell (10, 20) in original pixel format.
    const stored = JSON.parse(localStorage.getItem(key)!);
    assert.equal(stored.x, 10 * STORED_H);
    assert.equal(stored.y, 20 * STORED_V);
  });

  it("should round-trip: read then write preserves stored value", () => {
    const id = DrawingId.local("roundtrip");
    const key = storageKey(id, "offset");

    const original = { x: 450, y: 800 };
    localStorage.setItem(key, JSON.stringify(original));

    const canvas = new CanvasStore(id, notify);
    // Re-persist the loaded offset.
    canvas.setOffset(canvas.offset);

    const stored = JSON.parse(localStorage.getItem(key)!);
    assert.equal(stored.x, original.x);
    assert.equal(stored.y, original.y);
  });
});
