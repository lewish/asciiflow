import * as constants from "#asciiflow/client/constants";
import { snapZoom } from "#asciiflow/client/font";
import { store, IModifierKeys, ToolMode } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";
import { screenToCell, setCanvasCursor } from "#asciiflow/client/view";

import * as React from "react";

function isInputTarget(event: KeyboardEvent) {
  const t = event.target;
  return (
    t instanceof HTMLInputElement ||
    t instanceof HTMLTextAreaElement ||
    (t instanceof HTMLElement && t.isContentEditable)
  );
}

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
  | React.PointerEvent
  | PointerEvent;

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
    // Don't intercept keypresses when an input or textarea is focused.
    if (isInputTarget(event)) return;
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
    // Don't intercept keypresses when an input or textarea is focused.
    if (isInputTarget(event)) return;
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
 * Unified input controller — handles mouse, touch, and stylus via Pointer Events.
 *
 * - Single pointer (mouse left-click or one finger): draw with the active tool.
 * - Middle mouse button: drag/pan.
 * - Two touch pointers: pan + pinch-to-zoom.
 * - Wheel: scroll to pan, Ctrl/Cmd+scroll to zoom.
 */
export class InputController {
  // Track active pointers for multi-touch gestures.
  private pointers = new Map<number, Vector>();
  private pinchStartLength: number = 0;
  private pinchStartZoom: number = 0;
  private panOrigin: Vector = null;
  private panOriginOffset: Vector = null;

  constructor(private controller: Controller) {}

  public getHandlerProps(): React.HTMLAttributes<any> {
    return {
      onPointerDown: this.handlePointerDown,
      onPointerMove: this.handlePointerMove,
      onPointerUp: this.handlePointerUp,
      onPointerCancel: this.handlePointerUp,
      onPointerLeave: this.handlePointerLeave,
      onAuxClick: this.handleAuxClick,
    };
  }

  handlePointerDown = (e: React.PointerEvent<any>) => {
    // Capture this pointer so we get move/up events even if it leaves the element.
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pos = Vector.fromPointerEvent(e);
    this.pointers.set(e.pointerId, pos);

    if (this.pointers.size === 2) {
      // Second pointer: switch to pinch/pan, cancel any in-progress draw.
      this.controller.endAll();
      const [a, b] = [...this.pointers.values()];
      this.pinchStartLength = a.subtract(b).length();
      this.pinchStartZoom = store.currentCanvas.zoom;
      // Use midpoint as pan origin.
      this.panOrigin = new Vector((a.x + b.x) / 2, (a.y + b.y) / 2);
      this.panOriginOffset = store.currentCanvas.offset;
    } else if (this.pointers.size === 1) {
      // Single pointer: middle mouse pans, everything else draws.
      if (e.button === 1) {
        e.preventDefault();
        this.controller.startDrag(pos);
      } else {
        this.controller.startDraw(pos, e);
      }
    }
  };

  handlePointerMove = (e: React.PointerEvent<any>) => {
    const pos = Vector.fromPointerEvent(e);
    this.pointers.set(e.pointerId, pos);

    if (this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      // Pinch-to-zoom.
      const currentLength = a.subtract(b).length();
      if (this.pinchStartLength > 0) {
        let newZoom = (this.pinchStartZoom * currentLength) / this.pinchStartLength;
        newZoom = snapZoom(Math.max(Math.min(newZoom, 5), 0.2));
        store.currentCanvas.setZoom(newZoom);
      }
      // Two-finger pan.
      if (this.panOrigin) {
        const midpoint = new Vector((a.x + b.x) / 2, (a.y + b.y) / 2);
        const delta = this.panOrigin.subtract(midpoint).scale(1 / store.currentCanvas.zoom);
        store.currentCanvas.setOffset(this.panOriginOffset.add(delta));
      }
    } else {
      // Single pointer: pass to controller for draw or drag.
      this.controller.handleMove(pos, e);
    }
  };

  handlePointerUp = (e: React.PointerEvent<any>) => {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size === 0) {
      this.controller.endAll();
      this.resetMultiTouch();
    } else if (this.pointers.size === 1) {
      // Went from 2 pointers to 1: don't start drawing, just reset multi-touch.
      this.resetMultiTouch();
    }
  };

  handlePointerLeave = (e: React.PointerEvent<any>) => {
    // Only end if this pointer isn't captured (captured pointers fire pointerup instead).
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.delete(e.pointerId);
    if (this.pointers.size === 0) {
      this.controller.endAll();
      this.resetMultiTouch();
    }
  };

  // Suppress middle-click paste (X11 primary selection) on Linux.
  handleAuxClick = (e: React.MouseEvent<any>) => {
    if (e.button === 1) {
      e.preventDefault();
    }
  };

  /**
   * Scroll = pan, Ctrl/Cmd+scroll = zoom (Figma-style).
   * Trackpad pinch-to-zoom fires synthetic wheel events with ctrlKey=true.
   * Registered via addEventListener({ passive: false }) in app.tsx so that
   * preventDefault() can suppress browser page zoom on Ctrl+scroll.
   */
  handleWheel = (e: WheelEvent) => {
    // Only handle wheel events that originate on the canvas itself.
    const target = e.target as HTMLElement;
    if (target.id !== "ascii-canvas") return;

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

  private resetMultiTouch() {
    this.pinchStartLength = 0;
    this.pinchStartZoom = 0;
    this.panOrigin = null;
    this.panOriginOffset = null;
  }
}
