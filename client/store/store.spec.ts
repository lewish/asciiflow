// Must be first import: shims localStorage and window for Node.js.
import "#asciiflow/testing/test_setup";

import { assert } from "chai";
import { Layer } from "#asciiflow/client/layer";
import { Vector } from "#asciiflow/client/vector";
import { useAppStore, store, ToolMode, DrawingId } from "#asciiflow/client/store/index";

describe("store facade", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState({
      route: DrawingId.local(null),
      selectedToolMode: ToolMode.BOX,
      freeformCharacter: "x",
      panning: false,
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

  describe("panning", () => {
    it("should default to false", () => {
      assert.isFalse(store.panning);
    });

    it("should toggle via setPanning", () => {
      store.setPanning(true);
      assert.isTrue(store.panning);
      store.setPanning(false);
      assert.isFalse(store.panning);
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
