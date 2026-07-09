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

const tool = store.selectTool;

function reset() {
  (tool as any).selectedCells = [];
  (tool as any).selectBox = undefined;
  (tool as any).activeBox = null;
  (tool as any).attachments = [];
  (tool as any).lineReshape = null;
  (tool as any).dragStart = null;
  (tool as any).selecting = false;
  localStorage.clear();
  useAppStore.setState(
    {
      route: DrawingId.local(null),
      selectedToolMode: ToolMode.SELECT,
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

describe("2x2 grid move", () => {
  beforeEach(reset);

  it("reflows the shared walls so a moved quadrant stays connected", () => {
    store.currentCanvas.committed = textToLayer(
      [
        "┌──┬──┐",
        "│  │  │",
        "├──┼──┤",
        "│  │  │",
        "└──┴──┘",
      ].join("\n")
    );
    tool.start(new Vector(1, 3), {}); // bottom-left quadrant interior
    tool.move(new Vector(1, 6), {}); // move the divider down 3
    tool.end();
    const c = store.currentCanvas.committed;
    // The shared walls followed, and every junction is clean after snapping:
    // the divider now sits at row 5 with proper ├ ┼ ┤ junctions...
    assert.equal(c.get(new Vector(0, 5)), "├");
    assert.equal(c.get(new Vector(3, 5)), "┼");
    assert.equal(c.get(new Vector(6, 5)), "┤");
    // ...the top-middle junction is untouched...
    assert.equal(c.get(new Vector(3, 0)), "┬");
    // ...and the old divider-right simplified to a plain wall (its arm moved).
    assert.equal(c.get(new Vector(6, 2)), "│");
  });
});
