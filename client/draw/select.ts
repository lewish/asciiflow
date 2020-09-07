import { Box } from "asciiflow/client/common";
import {
  isSpecial,
  KEY_BACKSPACE,
  KEY_COPY,
  KEY_CUT,
  KEY_DELETE,
  KEY_PASTE,
} from "asciiflow/client/constants";
import { AbstractDrawFunction } from "asciiflow/client/draw/function";
import { DrawMove } from "asciiflow/client/draw/move";
import { Layer } from "asciiflow/client/layer";
import { store } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";

export class DrawSelect extends AbstractDrawFunction {
  private moveTool: DrawMove;

  private copiedLayer: Layer;

  private selectBox: Box;

  private dragStart: Vector;
  private dragEnd: Vector;

  start(position: Vector) {
    if (this.selectBox != null && this.selectBox.contains(position)) {
      // Start a drag.
      this.startDrag(position);
    } else if (isSpecial(store.canvas.committed.get(position))) {
      // Start a resize.
      this.moveTool = new DrawMove();
      this.moveTool.start(position);
    } else {
      // Start a selection.
      this.startSelect(position);
    }
  }

  startSelect(position: Vector) {
    this.selectBox = new Box(position, position);
    store.canvas.setSelection(this.selectBox);
  }

  startDrag(position: Vector) {
    this.dragStart = position;
    this.dragEnd = position;
  }

  move(position: Vector) {
    if (this.dragStart != null) {
      this.moveDrag(position);
    } else if (!!this.moveTool) {
      this.moveTool.move(position);
    } else {
      this.moveSelect(position);
    }
  }

  moveSelect(position: Vector) {
    this.selectBox = new Box(this.selectBox.start, position);

    const selectionLayer = new Layer();

    store.canvas.committed.entries().forEach(([key, value]) => {
      if (this.selectBox.contains(key)) {
        selectionLayer.set(key, value);
      }
    });

    store.canvas.setScratchLayer(selectionLayer);
    store.canvas.setSelection(this.selectBox);
  }

  moveDrag(position: Vector) {
    this.dragEnd = position;
    const moveDelta = this.dragEnd.subtract(this.dragStart);
    store.canvas.setSelection(
      new Box(
        this.selectBox.topLeft().add(moveDelta),
        this.selectBox.bottomRight().add(moveDelta)
      )
    );

    const layer = new Layer();

    // Erase existing drawing.
    store.canvas.committed.entries().forEach(([key]) => {
      if (this.selectBox.contains(key)) {
        layer.set(key, "");
      }
    });
    // Move characters.
    store.canvas.committed.entries().forEach(([key, value]) => {
      if (this.selectBox.contains(key)) {
        layer.set(key.add(moveDelta), value);
      }
    });

    store.canvas.setScratchLayer(layer);
  }

  end() {
    if (this.dragStart != null) {
      store.canvas.commitScratch();
      this.selectBox = null;
      store.canvas.clearSelection();
    } else if (!!this.moveTool) {
      this.moveTool.end();
      this.moveTool = null;
    }
    this.dragStart = null;
    this.dragEnd = null;
  }

  getCursor(position: Vector) {
    if (this.selectBox != null && this.selectBox.contains(position)) {
      return "pointer";
    }
    if (isSpecial(store.canvas.committed.get(position))) {
      return "move";
    }
    return "default";
  }

  handleKey(value: string) {
    if (this.selectBox != null) {
      if (value === KEY_COPY || value === KEY_CUT) {
        this.copiedLayer = new Layer();
        store.canvas.committed.entries().forEach(([key, value]) => {
          if (this.selectBox.contains(key)) {
            this.copiedLayer.set(key, value);
          }
        });
      }
      if (value === KEY_CUT) {
        const layer = new Layer();
        store.canvas.committed.entries().forEach(([key]) => {
          if (this.selectBox.contains(key)) {
            layer.set(key, "");
          }
        });
        store.canvas.setScratchLayer(layer);
        store.canvas.commitScratch();
      }
    }
    if (value === KEY_BACKSPACE || value === KEY_DELETE) {
      const layer = new Layer();
      store.canvas.committed.entries().forEach(([key]) => {
        if (this.selectBox.contains(key)) {
          layer.set(key, "");
        }
      });
      store.canvas.setScratchLayer(layer);
      store.canvas.commitScratch();
    }

    if (value === KEY_PASTE) {
      const offsetLayer = new Layer();
      this.copiedLayer.entries().forEach(([key, value]) => {
        offsetLayer.set(key.add(this.dragEnd.subtract(this.dragStart)), value);
      });
      store.canvas.setScratchLayer(offsetLayer);
      store.canvas.commitScratch();
    }
  }
}
