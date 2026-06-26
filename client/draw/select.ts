import {
  connect,
  connectable,
  connects,
  disconnect,
  isBoxDrawing,
} from "#asciiflow/client/characters";
import { Box } from "#asciiflow/client/common";
import { KEY_BACKSPACE, KEY_DELETE, UNICODE } from "#asciiflow/client/constants";
import { Direction } from "#asciiflow/client/direction";
import {
  boundingBox,
  BoxAttachment,
  cellsInBox,
  detectLineTip,
  detectWord,
  findBox,
  moveBoxWithAttachments,
  moveCells,
  traceBoxAttachments,
  traceLineFromTip,
} from "#asciiflow/client/draw/entity";
import { AbstractDrawFunction } from "#asciiflow/client/draw/function";
import { DrawMove } from "#asciiflow/client/draw/move";
import { line } from "#asciiflow/client/draw/utils";
import { Layer, LayerView } from "#asciiflow/client/layer";
import { snap } from "#asciiflow/client/snap";
import { IModifierKeys, store } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";

/**
 * Entity-aware selection / move tool.
 *
 * Grab rules (no modifier):
 *  - a box's empty interior   → move the whole box and its contents; attached
 *                               lines stay connected and reflow
 *  - a box border / line      → resize / move that line (DrawMove), as before
 *  - a free line tip          → extend / retract the line along its axis
 *  - a word (run of text)     → move the word
 *  - empty space              → rubber-band select
 *
 *  - shift-click an entity    → add it to the current selection (multi-select)
 */
export class DrawSelect extends AbstractDrawFunction {
  /** Bounding box of the current selection — kept for the view and copy/paste. */
  public selectBox: Box;

  /** Exact cells making up the current selection (what actually moves). */
  private selectedCells: Vector[] = [];

  // Rubber-band selection.
  private selecting = false;
  private selectAnchor: Vector;

  // Active move drag.
  private dragStart: Vector;
  private dragEnd: Vector;

  // Sub-tools / sub-modes.
  private moveTool: DrawMove;

  // Dragging a line tip: reshape the line like the line tool (free 2D + corners).
  private lineReshape: {
    cells: Vector[];
    anchor: Vector;
    isArrow: boolean;
    horizontalSegment: boolean;
    moved: boolean;
  };

  // When the selection is a single box, we move it with line reflow.
  private activeBox: Box;
  private attachments: BoxAttachment[] = [];

  start(position: Vector, modifierKeys: IModifierKeys) {
    const committed = store.currentCanvas.committed;
    const value = committed.get(position);

    // Drag the existing selection if grabbing inside it.
    if (
      !modifierKeys.shift &&
      this.selectedCells.length > 0 &&
      this.inSelection(position)
    ) {
      this.beginDrag(position);
      return;
    }

    // Shift: add an entity to the selection, or start a rubber-band.
    if (modifierKeys.shift) {
      const cells = this.entityAt(committed, position);
      if (cells) {
        this.addToSelection(cells);
      } else {
        this.startSelect(position);
      }
      return;
    }

    // Free line tip → reshape the line from its anchor (like the line tool).
    const tip = detectLineTip(committed, position);
    if (tip) {
      const { cells, anchor } = traceLineFromTip(
        committed,
        tip.tip,
        tip.bodyDir
      );
      this.lineReshape = {
        cells,
        anchor,
        isArrow: tip.arrow != null,
        horizontalSegment: tip.axis === "horizontal",
        moved: false,
      };
      return;
    }

    // Word (text) → move it.
    const word = detectWord(committed, position);
    if (word) {
      this.setSelection(word);
      this.beginDrag(position);
      return;
    }

    // Box-drawing char (a box border or a free line/connector) → resize /
    // move that line, exactly as before. Box edges stay resizable.
    if (isBoxDrawing(value)) {
      this.moveTool = new DrawMove();
      this.moveTool.start(position);
      return;
    }

    // Empty interior of a box → move the whole box and its contents.
    const box = findBox(committed, position);
    if (box) {
      this.setSelection(cellsInBox(committed, box));
      this.activeBox = box;
      this.beginDrag(position);
      return;
    }

    // Empty space → rubber-band select.
    this.startSelect(position);
  }

  move(position: Vector, modifierKeys: IModifierKeys = {}) {
    if (this.lineReshape != null) {
      this.reshapeTip(position, modifierKeys);
    } else if (this.dragStart != null) {
      this.moveDrag(position);
    } else if (this.moveTool != null) {
      this.moveTool.move(position);
    } else if (this.selecting) {
      this.moveSelect(position);
    }
  }

  end() {
    if (this.lineReshape != null) {
      if (this.lineReshape.moved) {
        store.currentCanvas.commitScratch();
      } else {
        store.currentCanvas.clearScratch();
      }
      this.lineReshape = null;
    } else if (this.dragStart != null) {
      const delta = this.dragEnd.subtract(this.dragStart);
      const box = this.activeBox;
      store.currentCanvas.commitScratch();
      // Follow the content to its new home so it stays selected.
      if (box) {
        const moved = new Box(
          box.topLeft().add(delta),
          box.bottomRight().add(delta)
        );
        // Keep the whole rectangle highlighted (its content may not fill it),
        // and keep the cell list for cut/copy. Stay an active box for re-drags.
        this.selectedCells = cellsInBox(store.currentCanvas.committed, moved);
        this.selectBox = moved;
        this.activeBox = moved;
        store.currentCanvas.setSelection(moved);
      } else {
        this.setSelection(
          this.selectedCells.map((cell) => cell.add(delta)),
          /* keepScratch */ true
        );
      }
    } else if (this.moveTool != null) {
      this.moveTool.end();
      this.moveTool = null;
    } else if (this.selecting) {
      this.finishSelect();
    }
    this.dragStart = null;
    this.dragEnd = null;
    this.selecting = false;
  }

  // -- selection helpers ----------------------------------------------------

  /** Resolve the entity under a position into a set of cells, if any. */
  private entityAt(committed: Layer, position: Vector): Vector[] | null {
    const word = detectWord(committed, position);
    if (word) {
      return word;
    }
    const box = findBox(committed, position);
    if (box) {
      return cellsInBox(committed, box);
    }
    return null;
  }

  private setSelection(cells: Vector[], keepScratch = false) {
    this.selectedCells = dedupe(cells);
    this.selectBox = boundingBox(this.selectedCells);
    // Any selection that isn't an explicit single box falls back to block move.
    this.activeBox = null;
    if (!keepScratch) {
      store.currentCanvas.clearScratch();
    }
    store.currentCanvas.setSelection(this.selectBox);
  }

  private addToSelection(cells: Vector[]) {
    this.setSelection([...this.selectedCells, ...cells]);
  }

  private inSelection(position: Vector) {
    // Only when a selection is actually live (it gets cleared on undo/redo).
    return (
      this.selectBox != null &&
      store.currentCanvas.selection != null &&
      this.selectBox.contains(position)
    );
  }

  private startSelect(position: Vector) {
    this.selecting = true;
    this.selectAnchor = position;
    this.selectBox = new Box(position, position);
    this.selectedCells = [];
    this.activeBox = null;
    store.currentCanvas.setSelection(this.selectBox);
  }

  private moveSelect(position: Vector) {
    this.selectBox = new Box(this.selectAnchor, position);
    store.currentCanvas.setSelection(this.selectBox);
  }

  private finishSelect() {
    this.selectedCells = cellsInBox(
      store.currentCanvas.committed,
      this.selectBox
    );
    // Treat the selection rectangle like a box: moving it reflows any lines
    // that cross its edge, and keeps the whole rectangle highlighted.
    this.activeBox = this.selectBox;
  }

  // -- move drag ------------------------------------------------------------

  private beginDrag(position: Vector) {
    this.dragStart = position;
    this.dragEnd = position;
    this.attachments = this.activeBox
      ? traceBoxAttachments(store.currentCanvas.committed, this.activeBox)
      : [];
  }

  private moveDrag(position: Vector) {
    this.dragEnd = position;
    const delta = this.dragEnd.subtract(this.dragStart);
    const committed = store.currentCanvas.committed;
    if (this.activeBox) {
      store.currentCanvas.setScratchLayer(
        moveBoxWithAttachments(committed, this.activeBox, this.attachments, delta)
      );
      store.currentCanvas.setSelection(
        new Box(
          this.activeBox.topLeft().add(delta),
          this.activeBox.bottomRight().add(delta)
        )
      );
    } else {
      store.currentCanvas.setScratchLayer(
        moveCells(committed, this.selectedCells, delta)
      );
      store.currentCanvas.setSelection(
        boundingBox(this.selectedCells.map((cell) => cell.add(delta)))
      );
    }
  }

  // -- line tip reshape -----------------------------------------------------

  private reshapeTip(target: Vector, modifierKeys: IModifierKeys) {
    this.lineReshape.moved = true;
    const { cells, anchor, isArrow, horizontalSegment } = this.lineReshape;
    const committed = store.currentCanvas.committed;

    // A view of the canvas with the old line removed, so reconnection and
    // snapping don't latch onto the cells we're about to erase.
    const base = new Layer();
    base.map = new Map(committed.map);
    for (const cell of cells) {
      base.map.delete(cell.toString());
    }

    const layer = new Layer();
    for (const cell of cells) {
      layer.set(cell, "");
    }

    if (!anchor.equals(target)) {
      // Leave the pivot along the line's existing axis, then bend toward the
      // cursor — Alt/Ctrl/Shift flips it. This matches what you expect when
      // "turning" a line, rather than the generic line-tool heuristic.
      const flip = Boolean(modifierKeys.ctrl || modifierKeys.shift);
      const horizontalFirst = horizontalSegment !== flip;

      layer.setFrom(line(anchor, target, horizontalFirst));
      if (isArrow) {
        layer.set(target, arrowFor(anchor, target, horizontalFirst));
      }

      // Connect the endpoints to their neighbours, then trim stray connections.
      const combined = new LayerView([base, layer]);
      const ends = isArrow ? [anchor] : [anchor, target];
      for (const pos of ends) {
        const incoming = Direction.ALL.filter(
          (d) =>
            connects(combined.get(pos.add(d)), d.opposite()) &&
            connectable(layer.get(pos), d)
        );
        layer.set(pos, connect(layer.get(pos), incoming));
        layer.set(
          pos,
          disconnect(
            layer.get(pos),
            Direction.ALL.filter((d) => !incoming.includes(d))
          )
        );
      }
    }

    layer.setFrom(snap(layer, base));
    store.currentCanvas.setScratchLayer(layer);
    store.currentCanvas.clearSelection();
  }

  // -- cursor ---------------------------------------------------------------

  getCursor(position: Vector, modifierKeys: IModifierKeys) {
    const committed = store.currentCanvas.committed;
    if (this.selectedCells.length > 0 && this.inSelection(position)) {
      return "move";
    }
    const value = committed.get(position);
    if (detectLineTip(committed, position)) {
      return "crosshair";
    }
    if (detectWord(committed, position)) {
      return "move";
    }
    // Box border / line → resize cursor; empty interior of a box → move.
    if (isBoxDrawing(value)) {
      return new DrawMove().getCursor(position);
    }
    if (findBox(committed, position)) {
      return "move";
    }
    return "default";
  }

  // -- clipboard / keyboard (used by app.tsx) -------------------------------

  /** Erases the selected content (called from the native cut event). */
  cutSelection() {
    if (this.selectedCells.length === 0) {
      return;
    }
    const layer = new Layer();
    for (const cell of this.selectedCells) {
      layer.set(cell, "");
    }
    layer.setFrom(snap(layer, store.currentCanvas.committed));
    store.currentCanvas.setScratchLayer(layer);
    store.currentCanvas.commitScratch();
  }

  handleKey(value: string) {
    if (value === KEY_BACKSPACE || value === KEY_DELETE) {
      this.cutSelection();
    }
  }

  /** Switching away from the select tool — drop the selection and any state. */
  cleanup() {
    this.selectedCells = [];
    this.selectBox = undefined;
    this.activeBox = null;
    this.attachments = [];
    this.lineReshape = null;
    this.moveTool = null;
    this.dragStart = null;
    this.dragEnd = null;
    this.selecting = false;
    store.currentCanvas.clearSelection();
    store.currentCanvas.clearScratch();
  }
}

function arrowFor(start: Vector, end: Vector, horizontalFirst: boolean) {
  if (end.x === start.x) {
    return end.y < start.y ? UNICODE.arrowUp : UNICODE.arrowDown;
  }
  if (end.y === start.y) {
    return end.x < start.x ? UNICODE.arrowLeft : UNICODE.arrowRight;
  }
  if (horizontalFirst) {
    return end.y < start.y ? UNICODE.arrowUp : UNICODE.arrowDown;
  }
  return end.x > start.x ? UNICODE.arrowRight : UNICODE.arrowLeft;
}

function dedupe(cells: Vector[]): Vector[] {
  const seen = new Set<string>();
  const result: Vector[] = [];
  for (const cell of cells) {
    const key = cell.toString();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(cell);
    }
  }
  return result;
}
