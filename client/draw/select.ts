import { IDrawFunction } from "asciiflow/client/draw/function";
import {
  ERASE_CHAR,
  KEY_COPY,
  KEY_CUT,
  KEY_PASTE,
} from "asciiflow/client/constants";
import { Vector } from "asciiflow/client/vector";
import { CanvasStore } from "asciiflow/client/canvas_store";
import { MappedValue, Box } from "asciiflow/client/common";
import { DrawErase } from "asciiflow/client/draw/erase";

/**
 * @implements {DrawFunction}
 */
export class DrawSelect implements IDrawFunction {
  private startPosition: Vector;
  private endPosition: Vector;
  private dragStart: Vector;
  private dragEnd: Vector;
  private finished = true;
  private selectedCells: MappedValue[] = [];

  constructor(private state: CanvasStore) {}

  start(position: Vector) {
    // Must be dragging.
    if (
      this.startPosition != null &&
      this.endPosition != null &&
      this.getSelectedBox().contains(position)
    ) {
      this.dragStart = position;
      this.copyArea();
      this.dragMove(position);
    } else {
      this.startPosition = position;
      this.endPosition = null;
      this.finished = false;
      this.move(position);
    }
  }

  getSelectedBox() {
    return new Box(this.startPosition, this.endPosition);
  }

  copyArea() {
    const nonEmptyCells = this.state.scratchCells.filter(function (value) {
      const rawValue = value.cell.getRawValue();
      return (
        value.cell.getRawValue() != null &&
        value.cell.getRawValue() != ERASE_CHAR
      );
    });
    const topLeft = this.getSelectedBox().topLeft();
    this.selectedCells = nonEmptyCells.map(function (value) {
      return new MappedValue(
        value.position.subtract(topLeft),
        value.cell.getRawValue()
      );
    });
  }

  move(position: Vector) {
    if (this.dragStart != null) {
      this.dragMove(position);
      return;
    }

    if (this.finished == true) {
      return;
    }
    this.endPosition = position;
    this.state.clearDraw();

    const box = new Box(this.startPosition, position);

    for (let i = box.startX; i <= box.endX; i++) {
      for (let j = box.startY; j <= box.endY; j++) {
        const current = new Vector(i, j);
        // Effectively highlights the cell.
        const currentValue = this.state.getCell(current).getRawValue();
        this.state.drawValue(
          current,
          currentValue == null ? ERASE_CHAR : currentValue
        );
      }
    }
  }

  dragMove(position: Vector) {
    this.dragEnd = position;
    this.state.clearDraw();
    const eraser = new DrawErase();
    eraser.start(this.startPosition);
    eraser.move(this.endPosition);
    const startPos = this.dragEnd
      .subtract(this.dragStart)
      .add(this.getSelectedBox().topLeft());
    this.drawSelected(startPos);
  }

  drawSelected(startPos: Vector) {
    for (const { position, value } of this.selectedCells) {
      this.state.drawValue(position.add(startPos), value);
    }
  }

  end() {
    if (this.dragStart != null) {
      this.state.commitDraw();
      this.startPosition = null;
      this.endPosition = null;
    }
    this.dragStart = null;
    this.dragEnd = null;
    this.finished = true;
  }

  getCursor(position: Vector) {
    if (
      this.startPosition != null &&
      this.endPosition != null &&
      new Box(this.startPosition, this.endPosition).contains(position)
    ) {
      return "pointer";
    }
    return "default";
  }

  handleKey(value: String) {
    if (this.startPosition != null && this.endPosition != null) {
      if (value == KEY_COPY || value == KEY_CUT) {
        this.copyArea();
      }
      if (value == KEY_CUT) {
        const eraser = new DrawErase();
        eraser.start(this.startPosition);
        eraser.move(this.endPosition);
        this.state.commitDraw();
      }
    }
    if (value == KEY_PASTE) {
      this.drawSelected(this.startPosition);
      this.state.commitDraw();
    }
  }
}
