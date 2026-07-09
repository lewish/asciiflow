// Must be first import: shims localStorage and window for Node.js.
import "#asciiflow/testing/test_setup";

import {
  DrawingId,
  store,
  ToolMode,
  useAppStore,
} from "#asciiflow/client/store/index";
import { layerToText, textToLayer } from "#asciiflow/client/text_utils";
import { Vector } from "#asciiflow/client/vector";
import { assert } from "chai";

// Use the singleton tool via the store facade to avoid the store<->select
// circular import (which trips a TDZ error when select.ts is the entry module).
const tool = store.selectTool;

function reset() {
  // Clear any selection left over from a previous test.
  (tool as any).selectedCells = [];
  (tool as any).selectBox = undefined;
  (tool as any).dragStart = null;
  (tool as any).lineTip = null;
  (tool as any).moveTool = null;
  (tool as any).selecting = false;
  (tool as any).activeBox = null;
  (tool as any).attachments = [];
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

function setCommitted(...lines: string[]) {
  store.currentCanvas.committed = textToLayer(lines.join("\n"));
}

function text() {
  return layerToText(store.currentCanvas.committed);
}

describe("DrawSelect", () => {
  beforeEach(reset);

  it("moves a whole box (and contents) by dragging its interior", () => {
    setCommitted("┌───┐", "│ x │", "└───┘");
    tool.start(new Vector(3, 1), {}); // empty interior cell (not the label)
    tool.move(new Vector(13, 6)); // drag by (10, 5)
    tool.end();
    assert.equal(text(), ["┌───┐", "│ x │", "└───┘"].join("\n"));
    assert.equal(store.currentCanvas.committed.get(new Vector(10, 5)), "┌");
    assert.equal(store.currentCanvas.committed.get(new Vector(12, 6)), "x");
    assert.isNull(store.currentCanvas.committed.get(new Vector(0, 0)));
  });

  it("resizes a box edge (not move) when grabbing the border", () => {
    setCommitted("┌───┐", "│   │", "└───┘");
    tool.start(new Vector(2, 0), {}); // top edge
    tool.move(new Vector(2, 1)); // pull the top edge down one row
    tool.end();
    const committed = store.currentCanvas.committed;
    // Top edge moved down; bottom edge stayed put → it resized, not translated.
    assert.isNull(committed.get(new Vector(0, 0)));
    assert.equal(committed.get(new Vector(0, 1)), "┌");
    assert.equal(committed.get(new Vector(0, 2)), "└");
  });

  it("moves a word, leaving the rest of the line", () => {
    setCommitted("hi there");
    tool.start(new Vector(0, 0), {}); // "hi"
    tool.move(new Vector(0, 2)); // down 2
    tool.end();
    const committed = store.currentCanvas.committed;
    assert.equal(committed.get(new Vector(0, 2)), "h");
    assert.equal(committed.get(new Vector(1, 2)), "i");
    assert.equal(committed.get(new Vector(3, 0)), "t"); // "there" stayed
    assert.isNull(committed.get(new Vector(0, 0)));
  });

  it("extends a line tip outward", () => {
    setCommitted("───►");
    tool.start(new Vector(3, 0), {}); // the arrow tip
    tool.move(new Vector(6, 0));
    tool.end();
    const committed = store.currentCanvas.committed;
    assert.equal(committed.get(new Vector(6, 0)), "►");
    assert.equal(committed.get(new Vector(5, 0)), "─");
  });

  it("keeps an attached line connected, shortening it on a parallel move", () => {
    setCommitted("┌─┐", "│ ├──►", "└─┘");
    tool.start(new Vector(1, 1), {}); // box interior
    tool.move(new Vector(2, 1)); // move right by 1
    tool.end();
    const c = store.currentCanvas.committed;
    assert.equal(c.get(new Vector(1, 0)), "┌"); // box moved right
    assert.equal(c.get(new Vector(3, 1)), "├"); // junction moved with it
    assert.equal(c.get(new Vector(4, 1)), "─"); // run shortened to one cell
    assert.equal(c.get(new Vector(5, 1)), "►"); // arrow still there, still pointing right
  });

  it("reflows an attached line with a bend on a perpendicular move", () => {
    setCommitted("┌─┐", "│ ├──►", "└─┘");
    tool.start(new Vector(1, 1), {}); // box interior
    tool.move(new Vector(1, 2)); // move down by 1
    tool.end();
    const c = store.currentCanvas.committed;
    assert.equal(c.get(new Vector(0, 1)), "┌"); // box moved down
    assert.equal(c.get(new Vector(3, 2)), "─"); // line leaves the moved edge
    assert.equal(c.get(new Vector(5, 2)), "┘"); // bends up toward the arrow
    assert.equal(c.get(new Vector(5, 1)), "▲"); // arrow re-pointed to match approach
  });

  it("draws a corner when a tip is dragged out of the line's plane", () => {
    setCommitted("───►");
    tool.start(new Vector(3, 0), {}); // arrow tip (horizontal line)
    tool.move(new Vector(3, 3), {}); // drag straight down
    tool.end();
    const c = store.currentCanvas.committed;
    // Leaves the pivot horizontally (its existing axis), then bends down.
    assert.equal(c.get(new Vector(0, 0)), "─"); // horizontal leg kept
    assert.equal(c.get(new Vector(3, 0)), "┐"); // corner where it turns down
    assert.equal(c.get(new Vector(3, 1)), "│"); // vertical leg
    assert.equal(c.get(new Vector(3, 3)), "▼"); // arrow now points down
  });

  it("turns only the last segment at the first bend, keeping the rest", () => {
    // Vertical leg down to a corner, then right to the arrow tip.
    setCommitted("│", "│", "└──►");
    tool.start(new Vector(3, 2), {}); // arrow tip (horizontal last segment)
    tool.move(new Vector(3, 4), {}); // pull it down
    tool.end();
    const c = store.currentCanvas.committed;
    assert.equal(c.get(new Vector(0, 0)), "│"); // kept leg untouched
    assert.equal(c.get(new Vector(0, 1)), "│"); // kept leg untouched
    assert.equal(c.get(new Vector(0, 2)), "└"); // pivot corner kept
    assert.equal(c.get(new Vector(3, 2)), "┐"); // last segment turns down here
    assert.equal(c.get(new Vector(3, 4)), "▼"); // arrow at the new tip
  });

  it("traces a connector through its corner and reflows the whole path", () => {
    setCommitted(
      "┌─┐",
      "│ ├─┐",
      "└─┘ │",
      "    ▼"
    );
    tool.start(new Vector(1, 1), {}); // box interior
    tool.move(new Vector(1, 2)); // move down by 1
    tool.end();
    const c = store.currentCanvas.committed;
    assert.equal(c.get(new Vector(0, 1)), "┌"); // box moved down
    assert.isNull(c.get(new Vector(4, 1))); // old corner erased
    assert.equal(c.get(new Vector(3, 2)), "─"); // reflowed run
    assert.equal(c.get(new Vector(4, 2)), "┐"); // corner redrawn lower
    assert.equal(c.get(new Vector(4, 3)), "▼"); // far arrow stays put
  });

  it("moves the selection through undo/redo with its content", () => {
    setCommitted("┌─┐", "│ │", "└─┘");
    tool.start(new Vector(1, 1), {}); // select interior
    tool.move(new Vector(1, 4), {}); // move down 3
    tool.end();
    assert.equal(store.currentCanvas.selection.top(), 3); // at moved position
    store.currentCanvas.undo();
    assert.equal(store.currentCanvas.selection.top(), 0); // restored to original
    store.currentCanvas.redo();
    assert.equal(store.currentCanvas.selection.top(), 3); // and back again
  });

  it("purges the selection when switching off the select tool", () => {
    setCommitted("┌─┐", "│ │", "└─┘");
    tool.start(new Vector(1, 1), {});
    tool.end();
    assert.exists(store.currentCanvas.selection);
    tool.cleanup();
    assert.notExists(store.currentCanvas.selection);
  });

  it("reflows a line crossing the selection edge on a rubber-band move", () => {
    setCommitted("───►");
    // Rubber-band the left cells: start on empty, drag across them.
    tool.start(new Vector(1, 1), {}); // empty, below the line
    tool.move(new Vector(0, 0), {}); // selection box (0,0)-(1,1)
    tool.end();
    // Drag the selection down by one.
    tool.start(new Vector(0, 0), {}); // inside the selection
    tool.move(new Vector(0, 1), {});
    tool.end();
    const c = store.currentCanvas.committed;
    assert.equal(c.get(new Vector(0, 1)), "─"); // selected run moved down
    assert.isNull(c.get(new Vector(0, 0))); // old position cleared
    assert.equal(c.get(new Vector(3, 1)), "┘"); // line reflowed with a bend
    assert.equal(c.get(new Vector(3, 0)), "▲"); // arrow stayed put, re-pointed
  });

  it("keeps an arrow pointing into a box attached when the box moves", () => {
    setCommitted("   ┌─┐", " ─►│ │", "   └─┘");
    tool.start(new Vector(4, 1), {}); // box interior
    tool.move(new Vector(4, 3), {}); // move down 2
    tool.end();
    const c = store.currentCanvas.committed;
    assert.equal(c.get(new Vector(3, 2)), "┌"); // box moved down 2
    assert.equal(c.get(new Vector(2, 3)), "►"); // arrow rode along, still pointing in
    assert.isNull(c.get(new Vector(2, 1))); // old arrow position cleared
  });

  it("keeps a line attached at a box corner connected when the box moves", () => {
    setCommitted("┌─┬──►", "│ │", "└─┘");
    tool.start(new Vector(1, 1), {}); // box interior
    tool.move(new Vector(1, 4), {}); // move down 3
    tool.end();
    const c = store.currentCanvas.committed;
    assert.equal(c.get(new Vector(0, 3)), "┌"); // box moved down 3
    assert.equal(c.get(new Vector(2, 3)), "┬"); // corner keeps its branch
    assert.equal(c.get(new Vector(3, 3)), "─"); // line follows out of the corner
    assert.isNull(c.get(new Vector(3, 0))); // old line cleared
  });

  it("shift-clicking adds a second box to the selection and moves both", () => {
    setCommitted(
      "┌─┐ ┌─┐",
      "│ │ │ │",
      "└─┘ └─┘"
    );
    tool.start(new Vector(1, 1), {}); // first box interior, begins a drag
    tool.end(); // ...released without moving — first box selected
    tool.start(new Vector(5, 1), { shift: true }); // add second box's interior
    tool.start(new Vector(1, 1), {}); // grab inside selection
    tool.move(new Vector(1, 6)); // move everything down 5
    tool.end();
    const committed = store.currentCanvas.committed;
    // Both boxes moved down by 5 rows.
    assert.equal(committed.get(new Vector(0, 5)), "┌");
    assert.equal(committed.get(new Vector(4, 5)), "┌");
    assert.isNull(committed.get(new Vector(0, 0)));
  });
});
