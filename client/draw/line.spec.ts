// Must be first import: shims localStorage and window for Node.js.
import "#asciiflow/testing/test_setup";

import {
  DrawingId,
  store,
  ToolMode,
  useAppStore,
} from "#asciiflow/client/store/index";
import { textToLayer } from "#asciiflow/client/text_utils";
import { Vector } from "#asciiflow/client/vector";
import { assert } from "chai";

function reset() {
  localStorage.clear();
  useAppStore.setState(
    {
      route: DrawingId.local(null),
      selectedToolMode: ToolMode.LINES,
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
    },
    true
  );
}

describe("DrawLine onto an existing line", () => {
  beforeEach(reset);

  it("forms a T when a vertical line ends on a horizontal line", () => {
    store.currentCanvas.committed = textToLayer("───"); // (0..2, 0)
    const tool = store.currentTool; // lineTool
    tool.start(new Vector(1, -2), {});
    tool.move(new Vector(1, 0), {}); // draw down onto the middle
    tool.end();
    assert.equal(store.currentCanvas.committed.get(new Vector(1, 0)), "┴");
  });

  it("forms a T when a horizontal line ends on a vertical line", () => {
    store.currentCanvas.committed = textToLayer(["│", "│", "│"].join("\n")); // (0, 0..2)
    const tool = store.currentTool;
    tool.start(new Vector(-2, 1), {});
    tool.move(new Vector(0, 1), {}); // draw right onto the middle
    tool.end();
    assert.equal(store.currentCanvas.committed.get(new Vector(0, 1)), "┤");
  });
});
