import * as constants from "#asciiflow/client/constants";
import { snapZoom } from "#asciiflow/client/font";
import { store, IModifierKeys, ToolMode } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";
import { screenToCell, setCanvasCursor } from "#asciiflow/client/view";
import { HTMLAttributes } from "react";

import * as React from "react";

/**
 * Different modes of control.
 */
const Mode = {
  NONE: 0,
  DRAG: 1,
  DRAW: 2,
};

type EventWithModifierKeys =
  | KeyboardEvent
  | React.MouseEvent
  | React.TouchEvent;

/**
 * Handles user input events and modifies state.
 */
export class Controller {
  private mode = Mode.NONE;
  private dragOrigin: Vector;
  private dragOriginCell: Vector;
  private lastMoveCell: Vector;

  startDraw(position: Vector, e: EventWithModifierKeys) {
    this.mode = Mode.DRAW;
    store.currentTool.start(screenToCell(position), getModifierKeys(e));
  }

  startDrag(position: Vector) {
    this.mode = Mode.DRAG;
    this.dragOrigin = position;
    this.dragOriginCell = store.currentCanvas.offset;
  }

  endAll() {
    if (this.mode === Mode.DRAW) {
      store.currentTool.end();
    }
    // Cleanup state.
    this.mode = Mode.NONE;
    this.dragOrigin = null;
    this.dragOriginCell = null;
    this.lastMoveCell = null;
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.keyCode == 8) {
      // Disable navigation back action on backspace.
      event.preventDefault();
    }
    if (!event.ctrlKey && !event.metaKey && event.keyCode !== 13) {
      // Prevent browser default for all printable characters we handle
      // (e.g. ' and / trigger Firefox Quick Find: #202).
      event.preventDefault();
      store.currentTool.handleKey(
        String.fromCharCode(event.keyCode),
        getModifierKeys(event)
      );
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    // Override some special characters so that they can be handled in one place.
    let specialKeyCode = null;

    if (event.altKey) {
      store.setAltPressed(true);
      if (event.keyCode === "1".charCodeAt(0)) {
        store.setToolMode(ToolMode.BOX);
        event.preventDefault();
      } else if (event.keyCode === "2".charCodeAt(0)) {
        store.setToolMode(ToolMode.SELECT);
        event.preventDefault();
      } else if (event.keyCode === "3".charCodeAt(0)) {
        store.setToolMode(ToolMode.FREEFORM);
        event.preventDefault();
      } else if (event.keyCode === "4".charCodeAt(0)) {
        store.setToolMode(ToolMode.ARROWS);
        event.preventDefault();
      } else if (event.keyCode === "5".charCodeAt(0)) {
        store.setToolMode(ToolMode.LINES);
        event.preventDefault();
      } else if (event.keyCode === "6".charCodeAt(0)) {
        store.setToolMode(ToolMode.TEXT);
        event.preventDefault();
      }
    }
    if (event.ctrlKey || event.metaKey) {
      // Copy (Ctrl+C), Cut (Ctrl+X), and Paste (Ctrl+V) are handled by
      // native copy/cut/paste events in app.tsx — don't intercept them here
      // so the browser fires those events with proper clipboard permissions.
      if (event.keyCode === 90) {
        if (event.shiftKey) {
          store.currentCanvas.redo();
        } else {
          // If there's active scratch content (e.g. text being typed), discard it
          // instead of undoing the previous committed action (#332).
          if (store.currentCanvas.scratch.size() > 0) {
            store.currentTool.cleanup();
            store.currentCanvas.clearScratch();
            store.currentCanvas.clearSelection();
          } else {
            store.currentCanvas.undo();
          }
        }
        // Disable browser-specific behavior on Cmd/Ctrl+Z: https://github.com/lewish/asciiflow/issues/189
        event.preventDefault();
      }
      if (event.keyCode === 89) {
        store.currentCanvas.redo();
        // Disable browser-specific behavior on Cmd/Ctrl+Y: https://github.com/lewish/asciiflow/issues/189
        event.preventDefault();
      }
    }

    if (event.keyCode === 8) {
      specialKeyCode = constants.KEY_BACKSPACE;
      // Disable navigation back action on backspace.
      event.preventDefault();
    }
    if (event.keyCode === 46) {
      specialKeyCode = constants.KEY_DELETE;
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
      store.currentTool.handleKey(specialKeyCode, getModifierKeys(event));
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    if (!event.altKey) {
      store.setAltPressed(false);
    }
  }

  public handleMove(position: Vector, e: EventWithModifierKeys) {
    const moveCell = screenToCell(position);

    // First move event, make sure we don't blow up here.
    if (this.lastMoveCell == null) {
      this.lastMoveCell = moveCell;
    }

    // Update the cursor pointer, depending on the draw function.
    if (!moveCell.equals(this.lastMoveCell)) {
      setCanvasCursor(
        store.currentTool.getCursor(moveCell, getModifierKeys(e))
      );
    }

    // In drawing mode, so pass the mouse move on, but remove duplicates.
    if (this.mode === Mode.DRAW && !moveCell.equals(this.lastMoveCell)) {
      store.currentTool.move(moveCell, getModifierKeys(e));
    }

    // Drag in progress, update the view origin.
    if (this.mode === Mode.DRAG && !moveCell.equals(this.lastMoveCell)) {
      store.currentCanvas.setOffset(
        this.dragOriginCell.add(
          this.dragOrigin.subtract(position).scale(1 / store.currentCanvas.zoom)
        )
      );
    }
    this.lastMoveCell = moveCell;
  }
}

function getModifierKeys(event: EventWithModifierKeys): IModifierKeys {
  return {
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    meta: event.metaKey,
  };
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
      onMouseMove: this.handleMouseMove,
      onAuxClick: this.handleAuxClick,
    };
  }

  handleMouseDown = (e: React.MouseEvent<any>) => {
    // Middle mouse button (button === 1) pans the canvas (Figma-style).
    if (e.button === 1) {
      e.preventDefault();
      this.controller.startDrag(Vector.fromMouseEvent(e));
    } else {
      this.controller.startDraw(Vector.fromMouseEvent(e), e);
    }
  };

  // Suppress middle-click paste (X11 primary selection) on Linux.
  handleAuxClick = (e: React.MouseEvent<any>) => {
    if (e.button === 1) {
      e.preventDefault();
    }
  };

  handleMouseUp = (e: React.MouseEvent<any>) => {
    this.controller.endAll();
  };

  handleMouseLeave = (e: React.MouseEvent<any>) => {
    this.controller.endAll();
  };

  /**
   * Scroll = pan, Ctrl/Cmd+scroll = zoom (Figma-style).
   * Trackpad pinch-to-zoom fires synthetic wheel events with ctrlKey=true,
   * so this also handles pinch gestures automatically.
   * Registered via addEventListener({ passive: false }) in app.tsx so that
   * preventDefault() can suppress browser page zoom on Ctrl+scroll.
   */
  handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom: Ctrl/Cmd + scroll (also captures trackpad pinch).
      e.preventDefault();
      const rawDelta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      if (rawDelta === 0) return;
      const delta = -rawDelta;
      const rawZoom = store.currentCanvas.zoom * (delta > 0 ? 1.1 : 0.9);
      const newZoom = snapZoom(Math.max(Math.min(rawZoom, 5), 0.2));
      store.currentCanvas.setZoom(newZoom);
    } else {
      // Pan: plain scroll moves the canvas.
      // Shift+scroll converts vertical scroll to horizontal pan, for mice
      // without a horizontal scroll wheel.
      const zoom = store.currentCanvas.zoom;
      const offset = store.currentCanvas.offset;
      const dx = e.shiftKey ? (e.deltaX || e.deltaY) : e.deltaX;
      const dy = e.shiftKey ? 0 : e.deltaY;
      store.currentCanvas.setOffset(
        new Vector(
          offset.x + dx / zoom,
          offset.y + dy / zoom
        )
      );
    }
  };

  handleMouseMove = (e: React.MouseEvent<any>) => {
    this.controller.handleMove(Vector.fromMouseEvent(e), e);
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

  private handlePress(position: Vector, e: EventWithModifierKeys) {
    this.pressVector = position;
    this.pressTimestamp = Date.now();
    this.dragStarted = false;

    // If a drag or zoom didn't start and if we didn't release already, then handle it as a draw.
    window.setTimeout(() => {
      if (!this.dragStarted && !this.zoomStarted && this.pressVector != null) {
        this.controller.startDraw(position, e);
      }
    }, constants.DRAG_LATENCY);
  }

  private handlePressMulti(positionOne: Vector, positionTwo: Vector) {
    // A second finger as been placed, cancel whatever we were doing.
    this.controller.endAll();
    this.zoomStarted = true;
    this.dragStarted = false;
    this.zoomLength = positionOne.subtract(positionTwo).length();
    this.originalZoom = store.currentCanvas.zoom;
  }

  private handleMove(position: Vector, e: EventWithModifierKeys) {
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
    this.controller.handleMove(position, e);
  }

  private handleMoveMulti(positionOne: Vector, positionTwo: Vector) {
    if (this.zoomStarted) {
      let newZoom =
        (this.originalZoom * positionOne.subtract(positionTwo).length()) /
        this.zoomLength;
      newZoom = snapZoom(Math.max(Math.min(newZoom, 5), 0.5));
      store.currentCanvas.setZoom(newZoom);
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
      this.handlePress(Vector.fromTouchEvent(e), e);
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
      this.handleMove(Vector.fromTouchEvent(e), e);
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
