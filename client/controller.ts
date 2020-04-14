import * as constants from "asciiflow/client/constants";
import { store } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";
import { screenToCell } from "asciiflow/client/view";
import { HTMLAttributes } from "react";

import React = require("react");

/**
 * Different modes of control.
 */
const Mode = {
  NONE: 0,
  DRAG: 1,
  DRAW: 2,
};

/**
 * Handles user input events and modifies state.
 */
export class Controller {
  private mode = Mode.NONE;
  private dragOrigin: Vector;
  private dragOriginCell: Vector;
  private lastMoveCell: Vector;

  startDraw(position: Vector) {
    this.mode = Mode.DRAW;
    store.drawFunction.start(screenToCell(position));
  }

  startDrag(position: Vector) {
    this.mode = Mode.DRAG;
    this.dragOrigin = position;
    this.dragOriginCell = store.offset;
  }

  endAll() {
    if (this.mode === Mode.DRAW) {
      store.drawFunction.end();
    }
    // Cleanup state.
    this.mode = Mode.NONE;
    this.dragOrigin = null;
    this.dragOriginCell = null;
    this.lastMoveCell = null;
  }

  handleKeyPress(event: KeyboardEvent) {
    if (!event.ctrlKey && !event.metaKey && event.keyCode !== 13) {
      store.drawFunction.handleKey(String.fromCharCode(event.keyCode));
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    // Override some special characters so that they can be handled in one place.
    let specialKeyCode = null;

    if (event.ctrlKey || event.metaKey) {
      if (event.keyCode === 67) {
        specialKeyCode = constants.KEY_COPY;
      }
      if (event.keyCode === 86) {
        specialKeyCode = constants.KEY_PASTE;
      }
      if (event.keyCode === 90) {
        store.canvas.undo();
      }
      if (event.keyCode === 89) {
        store.canvas.redo();
      }
      if (event.keyCode === 88) {
        specialKeyCode = constants.KEY_CUT;
      }
    }

    if (event.keyCode === 8) {
      specialKeyCode = constants.KEY_BACKSPACE;
    }
    if (event.keyCode === 13) {
      specialKeyCode = constants.KEY_RETURN;
    }
    if (event.keyCode === 38) {
      specialKeyCode = constants.KEY_UP;
    }
    if (event.keyCode === 40) {
      specialKeyCode = constants.KEY_DOWN;
    }
    if (event.keyCode === 37) {
      specialKeyCode = constants.KEY_LEFT;
    }
    if (event.keyCode === 39) {
      specialKeyCode = constants.KEY_RIGHT;
    }
    if (specialKeyCode != null) {
      store.drawFunction.handleKey(specialKeyCode);
    }
  }

  public handleMove(position: Vector) {
    const moveCell = screenToCell(position);

    // First move event, make sure we don't blow up here.
    if (this.lastMoveCell == null) {
      this.lastMoveCell = moveCell;
    }

    // Update the cursor pointer, depending on the draw function.
    if (!moveCell.equals(this.lastMoveCell)) {
      store.currentCursor = store.drawFunction.getCursor(moveCell);
    }

    // In drawing mode, so pass the mouse move on, but remove duplicates.
    if (this.mode == Mode.DRAW && !moveCell.equals(this.lastMoveCell)) {
      store.drawFunction.move(moveCell);
    }

    // Drag in progress, update the view origin.
    if (this.mode == Mode.DRAG) {
      store.setOffset(
        this.dragOriginCell.add(
          this.dragOrigin.subtract(position).scale(1 / store.zoom)
        )
      );
    }
    this.lastMoveCell = moveCell;
  }
}

/**
 * Handles desktop inputs, and passes them onto the main controller.
 */
export class DesktopController {
  constructor(private controller: Controller) {}

  public getHandlerProps(): HTMLAttributes<any> {
    return {
      onMouseDown: this.handleMouseDown,
      onMouseUp: this.handleMouseUp,
      onWheel: this.handleWheel,
      onMouseMove: this.handleMouseMove,
    };
  }

  handleMouseDown = (e: React.MouseEvent<any>) => {
    // Can drag by holding either the control or meta (Apple) key.
    if (e.ctrlKey || e.metaKey) {
      this.controller.startDrag(Vector.fromMouseEvent(e));
    } else {
      this.controller.startDraw(Vector.fromMouseEvent(e));
    }
  };

  handleMouseUp = (e: React.MouseEvent<any>) => {
    this.controller.endAll();
  };

  handleMouseLeave = (e: React.MouseEvent<any>) => {
    this.controller.endAll();
  };

  handleWheel = (e: React.WheelEvent<any>) => {
    const delta = (-e.deltaY);
    const newZoom = store.zoom * (delta > 0 ? 1.1 : 0.9);
    store.setZoom(Math.max(Math.min(newZoom, 5), 0.2));
  };

  handleMouseMove = (e: React.MouseEvent<any>) => {
    this.controller.handleMove(Vector.fromMouseEvent(e));
  };
}

/**
 * Handles touch inputs, and passes them onto the main controller.
 */
export class TouchController {
  private pressVector: Vector;
  private originalZoom: number;
  private zoomLength: number;
  private pressTimestamp: number;
  private dragStarted = false;
  private zoomStarted = false;

  constructor(private controller: Controller) {}

  public getHandlerProps(): HTMLAttributes<any> {
    return {
      onTouchStart: this.handleTouchStart,
      onTouchMove: this.handleTouchMove,
      onTouchEnd: this.handleTouchEnd,
    };
  }

  private handlePress(position: Vector) {
    this.pressVector = position;
    this.pressTimestamp = Date.now();
    this.dragStarted = false;

    // If a drag or zoom didn't start and if we didn't release already, then handle it as a draw.
    window.setTimeout(() => {
      if (!this.dragStarted && !this.zoomStarted && this.pressVector != null) {
        this.controller.startDraw(position);
      }
    }, constants.DRAG_LATENCY);
  }

  private handlePressMulti(positionOne: Vector, positionTwo: Vector) {
    // A second finger as been placed, cancel whatever we were doing.
    this.controller.endAll();
    this.zoomStarted = true;
    this.dragStarted = false;
    this.zoomLength = positionOne.subtract(positionTwo).length();
    this.originalZoom = store.zoom;
  }

  private handleMove(position: Vector) {
    // Initiate a drag if we have moved enough, quickly enough.
    if (
      !this.dragStarted &&
      Date.now() - this.pressTimestamp < constants.DRAG_LATENCY &&
      position.subtract(this.pressVector).length() > constants.DRAG_ACCURACY
    ) {
      this.dragStarted = true;
      this.controller.startDrag(position);
    }
    // Pass on the event.
    this.controller.handleMove(position);
  }

  private handleMoveMulti(positionOne: Vector, positionTwo: Vector) {
    if (this.zoomStarted) {
      let newZoom =
        (this.originalZoom * positionOne.subtract(positionTwo).length()) /
        this.zoomLength;
      newZoom = Math.max(Math.min(newZoom, 5), 0.5);
      store.setZoom(newZoom);
    }
  }

  /**
   * Ends all current actions, cleans up any state.
   */
  reset() {
    this.dragStarted = false;
    this.zoomStarted = false;
    this.pressVector = null;
  }

  public handleTouchStart = (e: React.TouchEvent<any>) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.handlePress(Vector.fromTouchEvent(e));
    } else if (e.touches.length > 1) {
      this.handlePressMulti(
        Vector.fromTouchEvent(e, 0),
        Vector.fromTouchEvent(e, 1)
      );
    }
  };

  public handleTouchMove = (e: React.TouchEvent<any>) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.handleMove(Vector.fromTouchEvent(e));
    } else if (e.touches.length > 1) {
      this.handleMoveMulti(
        Vector.fromTouchEvent(e, 0),
        Vector.fromTouchEvent(e, 1)
      );
    }
  };
  public handleTouchEnd = (e: React.TouchEvent<any>) => {
    e.preventDefault();
    this.reset();
    this.controller.endAll();
  };
}
