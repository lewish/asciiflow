import * as c from "asciiflow/client/constants";
import { Controller } from "asciiflow/client/controller";
import { Vector } from "asciiflow/client/vector";
import * as $ from "jquery";

/**
 * Handles desktop inputs, and passes them onto the main controller.
 */
export class DesktopController {
  private isDragging = false;

  constructor(private controller: Controller) {
    this.installBindings();
  }

  handleZoom(delta: number) {
    var newzoom = this.controller.view.zoom * (delta > 0 ? 1.1 : 0.9);
    newzoom = Math.max(Math.min(newzoom, 5), 0.2);
    this.controller.view.setZoom(newzoom);
  }

  /**
   * Installs input bindings associated with keyboard controls.
   */
  installBindings() {
    var canvas = $(this.controller.view.canvas);
    canvas.on("mousewheel", (e: any) => {
      this.handleZoom(e.originalEvent.wheelDelta);
    });

    canvas.mousedown((e: any) => {
      // Can drag by holding either the control or meta (Apple) key.
      if (e.ctrlKey || e.metaKey) {
        this.controller.startDrag(Vector.fromMouseEvent(e));
      } else {
        this.controller.startDraw(Vector.fromMouseEvent(e));
      }
    });

    // Pass these events through to the main controller.
    canvas.mouseup((e) => {
      this.controller.endAll();
    });

    canvas.mouseleave((e) => {
      this.controller.endAll();
    });

    canvas.mousemove((e: any) => {
      this.controller.handleMove(Vector.fromMouseEvent(e));
    });
  }
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

  constructor(private controller: Controller) {
    this.installBindings();
  }

  handlePress(position: Vector) {
    this.pressVector = position;
    this.pressTimestamp = $.now();
    this.dragStarted = false;

    // If a drag or zoom didn't start and if we didn't release already, then handle it as a draw.
    window.setTimeout(() => {
      if (!this.dragStarted && !this.zoomStarted && this.pressVector != null) {
        this.controller.startDraw(position);
      }
    }, c.DRAG_LATENCY);
  }

  handlePressMulti(positionOne: Vector, positionTwo: Vector) {
    // A second finger as been placed, cancel whatever we were doing.
    this.controller.endAll();
    this.zoomStarted = true;
    this.dragStarted = false;
    this.zoomLength = positionOne.subtract(positionTwo).length();
    this.originalZoom = this.controller.view.zoom;
  }

  handleMove(position: Vector) {
    // Initiate a drag if we have moved enough, quickly enough.
    if (
      !this.dragStarted &&
      $.now() - this.pressTimestamp < c.DRAG_LATENCY &&
      position.subtract(this.pressVector).length() > c.DRAG_ACCURACY
    ) {
      this.dragStarted = true;
      this.controller.startDrag(position);
    }
    // Pass on the event.
    this.controller.handleMove(position);
  }

  handleMoveMulti(positionOne: Vector, positionTwo: Vector) {
    if (this.zoomStarted) {
      var newZoom =
        (this.originalZoom * positionOne.subtract(positionTwo).length()) /
        this.zoomLength;
      newZoom = Math.max(Math.min(newZoom, 5), 0.5);
      this.controller.view.setZoom(newZoom);
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

  /**
   * Installs input bindings associated with touch controls.
   */
  installBindings() {
    var canvas = $(this.controller.view.canvas);

    canvas.on("touchstart", (e: any) => {
      e.preventDefault();
      if (e.originalEvent.touches.length == 1) {
        this.handlePress(Vector.fromTouchEvent(e));
      } else if (e.originalEvent.touches.length > 1) {
        this.handlePressMulti(
          Vector.fromTouchEvent(e, 0),
          Vector.fromTouchEvent(e, 1)
        );
      }
    });

    canvas.on("touchmove", (e: any) => {
      e.preventDefault();
      if (e.originalEvent.touches.length == 1) {
        this.handleMove(Vector.fromTouchEvent(e));
      } else if (e.originalEvent.touches.length > 1) {
        this.handleMoveMulti(
          Vector.fromTouchEvent(e, 0),
          Vector.fromTouchEvent(e, 1)
        );
      }
    });

    // Pass through, no special handling.
    canvas.on("touchend", (e) => {
      e.preventDefault();
      this.reset();
      this.controller.endAll();
    });
  }
}
