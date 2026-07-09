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
    },
    true
  );
}

describe("DrawBox snapping", () => {
  beforeEach(reset);

  it("draws a clean box when nothing is adjacent", () => {
    const tool = store.currentTool; // boxTool
    tool.start(new Vector(0, 0), {});
    tool.move(new Vector(2, 2), {});
    tool.end();
    const c = store.currentCanvas.committed;
    assert.equal(c.get(new Vector(0, 0)), "┌");
    assert.equal(c.get(new Vector(2, 0)), "┐");
    assert.equal(c.get(new Vector(0, 2)), "└");
    assert.equal(c.get(new Vector(2, 2)), "┘");
  });

  it("connects to a line that terminates on an edge", () => {
    store.currentCanvas.committed = textToLayer("\n──"); // ─ at (0,1),(1,1)
    const tool = store.currentTool;
    tool.start(new Vector(2, 0), {});
    tool.move(new Vector(4, 2), {}); // box (2,0)-(4,2); left edge at x=2
    tool.end();
    const c = store.currentCanvas.committed;
    assert.equal(c.get(new Vector(2, 1)), "┤"); // edge became a junction
    assert.equal(c.get(new Vector(1, 1)), "─"); // line still there, connected
  });
});
