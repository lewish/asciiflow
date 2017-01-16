import * as c from './constants';
import Controller from './controller';
import Vector from './vector';

/**
 * Handles desktop inputs, and passes them onto the main controller.
 */
export class DesktopController {
  /**
   * @param {Controller} controller
   */
  constructor(controller) {
    /** @type {Controller} */ this.controller = controller;
    /** @type {boolean} */ this.isDragging = false;

    this.installBindings();
  };

  /**
   * @param {number} delta
   */
  handleZoom(delta) {
    var newzoom = this.controller.view.zoom * (delta > 0 ? 1.1 : 0.9);
    newzoom = Math.max(Math.min(newzoom, 5), 0.2);
    this.controller.view.setZoom(newzoom);
  }

  /**
   * Installs input bindings associated with keyboard controls.
   */
  installBindings() {
    var canvas = this.controller.view.canvas;
    $(canvas).on('mousewheel', e => {
        this.handleZoom(e.originalEvent.wheelDelta);
    });

    $(canvas).mousedown(e => {
        // Can drag by holding either the control or meta (Apple) key.
        if (e.ctrlKey || e.metaKey) {
          this.controller.startDrag(new Vector(e.clientX, e.clientY));
        } else {
          this.controller.startDraw(new Vector(e.clientX, e.clientY));
        }
    });

    // Pass these events through to the main controller.
    $(canvas).mouseup(e => {
        this.controller.endAll();
    });

    $(canvas).mouseleave(e => {
        this.controller.endAll();
    });

    $(canvas).mousemove(e => {
        this.controller.handleMove(new Vector(e.clientX, e.clientY));
    });
  }
}

/**
 * Handles touch inputs, and passes them onto the main controller.
 */
export class TouchController {
  /**
   * @param {Controller} controller
   */
  constructor(controller) {
    /** @type {Controller} */ this.controller = controller;

    /** @type {Vector} */ this.pressVector;

    /** @type {number} */ this.originalZoom;
    /** @type {number} */ this.zoomLength;

    /** @type {number} */ this.pressTimestamp;
    /** @type {boolean} */ this.dragStarted = false;
    /** @type {boolean} */ this.zoomStarted = false;

    this.installBindings();
  }

  /**
   * @param {Vector} position
   */
  handlePress(position) {
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

  /**
   * The multi-touch version of handlePress.
   * @param {Vector} positionOne
   * @param {Vector} positionTwo
   */
  handlePressMulti(positionOne, positionTwo) {
    // A second finger as been placed, cancel whatever we were doing.
    this.controller.endAll();
    this.zoomStarted = true;
    this.dragStarted = false;
    this.zoomLength = positionOne.subtract(positionTwo).length();
    this.originalZoom = this.controller.view.zoom;
  }

  /**
   * @param {Vector} position
   */
  handleMove(position) {
    // Initiate a drag if we have moved enough, quickly enough.
    if (!this.dragStarted &&
        ($.now() - this.pressTimestamp) < c.DRAG_LATENCY &&
        position.subtract(this.pressVector).length() > c.DRAG_ACCURACY) {
        this.dragStarted = true;
        this.controller.startDrag(position);
    }
    // Pass on the event.
    this.controller.handleMove(position);
  }

  /**
   * The multi-touch version of handleMove, effectively only deals with zooming.
   * @param {Vector} positionOne
   * @param {Vector} positionTwo
   */
  handleMoveMulti(positionOne, positionTwo) {
    if (this.zoomStarted) {
      var newZoom = this.originalZoom *
          positionOne.subtract(positionTwo).length() / this.zoomLength;
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
    var canvas = this.controller.view.canvas;

    $(canvas).on('touchstart', e => {
        e.preventDefault();
        if (e.originalEvent.touches.length == 1) {
          this.handlePress(new Vector(
            e.originalEvent.touches[0].pageX,
            e.originalEvent.touches[0].pageY));
        } else if (e.originalEvent.touches.length > 1) {
          this.handlePressMulti(new Vector(
            e.originalEvent.touches[0].pageX,
            e.originalEvent.touches[0].pageY),
            new Vector(
                e.originalEvent.touches[1].pageX,
                e.originalEvent.touches[1].pageY));
        }
    });

    $(canvas).on('touchmove', e => {
        e.preventDefault();
        if (e.originalEvent.touches.length == 1) {
          this.handleMove(new Vector(
            e.originalEvent.touches[0].pageX,
            e.originalEvent.touches[0].pageY));
        } else if (e.originalEvent.touches.length > 1) {
          this.handleMoveMulti(new Vector(
            e.originalEvent.touches[0].pageX,
            e.originalEvent.touches[0].pageY),
            new Vector(
                e.originalEvent.touches[1].pageX,
                e.originalEvent.touches[1].pageY));
        }
    });

    // Pass through, no special handling.
    $(canvas).on('touchend', e => {
        e.preventDefault();
        this.reset();
        this.controller.endAll();
    });
  }
}
