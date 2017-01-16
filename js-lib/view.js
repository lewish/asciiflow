import State from './state';
import Vector from './vector';
import * as c from './constants';

/**
 * Handles view operations, state and management of the screen.
 */
export default class View {
  /**
   * @param {State} state
   */
  constructor(state) {
    /** @type {State} */ this.state = state;

    /** @type {Element} */ this.canvas = document.getElementById('ascii-canvas');
    /** @type {Object} */ this.context = this.canvas.getContext('2d');

    /** @type {number} */ this.zoom = 1;
    /** @type {Vector} */ this.offset = new Vector(
        c.MAX_GRID_WIDTH * c.CHAR_PIXELS_H / 2,
        c.MAX_GRID_HEIGHT * c.CHAR_PIXELS_V / 2);

    /** @type {boolean} */ this.dirty = true;
    // TODO: Should probably save this setting in a cookie or something.
    /** @type {boolean} */ this.useLines = false;

    this.resizeCanvas();
  }

  /**
   * Resizes the canvas, should be called if the viewport size changes.
   */
  resizeCanvas() {
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;
    this.dirty = true;
  }

  /**
   * Starts the animation loop for the canvas. Should only be called once.
   */
  animate() {
    if (this.dirty || this.state.dirty) {
      this.dirty = false;
      this.state.dirty = false;
      this.render();
    }
    var view = this;
    window.requestAnimationFrame(function() { view.animate(); });
  }

  /**
   * Renders the given state to the canvas.
   * TODO: Room for efficiency here still. Drawing should be incremental,
   *       however performance is currently very acceptable on test devices.
   */
  render() {
    var context = this.context;

    context.setTransform(1, 0, 0, 1, 0, 0);
    // Clear the visible area.
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    context.scale(this.zoom, this.zoom);
    context.translate(
        this.canvas.width / 2 / this.zoom,
        this.canvas.height / 2 / this.zoom);

    // Only render grid lines and cells that are visible.
    var startOffset = this.screenToCell(new Vector(
        0,
        0))
        .subtract(new Vector(
        c.RENDER_PADDING_CELLS, c.RENDER_PADDING_CELLS));
    var endOffset = this.screenToCell(new Vector(
        this.canvas.width,
        this.canvas.height))
        .add(new Vector(
        c.RENDER_PADDING_CELLS, c.RENDER_PADDING_CELLS));

    startOffset.x = Math.max(0, Math.min(startOffset.x, c.MAX_GRID_WIDTH));
    endOffset.x = Math.max(0, Math.min(endOffset.x, c.MAX_GRID_WIDTH));
    startOffset.y = Math.max(0, Math.min(startOffset.y, c.MAX_GRID_HEIGHT));
    endOffset.y = Math.max(0, Math.min(endOffset.y, c.MAX_GRID_HEIGHT));

    // Render the grid.
    context.lineWidth = '1';
    context.strokeStyle = '#EEEEEE';
    context.beginPath();
    for (var i = startOffset.x; i < endOffset.x; i++) {
      context.moveTo(
          i * c.CHAR_PIXELS_H - this.offset.x,
          0 - this.offset.y);
      context.lineTo(
          i * c.CHAR_PIXELS_H - this.offset.x,
          this.state.cells.length * c.CHAR_PIXELS_V - this.offset.y);
    }
    for (var j = startOffset.y; j < endOffset.y; j++) {
      context.moveTo(
          0 - this.offset.x,
          j * c.CHAR_PIXELS_V - this.offset.y);
      context.lineTo(
          this.state.cells.length * c.CHAR_PIXELS_H - this.offset.x,
          j * c.CHAR_PIXELS_V - this.offset.y);
    }
    this.context.stroke();
    this.renderText(context, startOffset, endOffset, !this.useLines);
    if (this.useLines) {
      this.renderCellsAsLines(context, startOffset, endOffset);
    }
  }

  renderText(context, startOffset, endOffset, drawSpecials) {
    // Render cells.
    context.font = '15px Courier New';
    for (var i = startOffset.x; i < endOffset.x; i++) {
      for (var j = startOffset.y; j < endOffset.y; j++) {
        var cell = this.state.getCell(new Vector(i, j));
        // Highlight the cell if it is special (grey) or it is part
        // of a visible edit (blue).
        if (cell.isSpecial() ||
            (cell.hasScratch() && cell.getRawValue() != ' ')) {
          this.context.fillStyle = cell.hasScratch() ? '#DEF' : '#F5F5F5';
          context.fillRect(
              i * c.CHAR_PIXELS_H - this.offset.x,
              (j - 1) * c.CHAR_PIXELS_V - this.offset.y,
              c.CHAR_PIXELS_H, c.CHAR_PIXELS_V);
        }
        var cellValue = this.state.getDrawValue(new Vector(i, j));
        if (cellValue != null && (!cell.isSpecial() || drawSpecials)) {
          this.context.fillStyle = '#000000';
          context.fillText(cellValue,
              i * c.CHAR_PIXELS_H - this.offset.x,
              j * c.CHAR_PIXELS_V - this.offset.y - 3);
        }
      }
    }
  }

  renderCellsAsLines(context, startOffset, endOffset) {
    context.lineWidth = '1';
    context.strokeStyle = '#000000';
    context.beginPath();
    for (var i = startOffset.x; i < endOffset.x; i++) {
      var startY = false;
      for (var j = startOffset.y; j < endOffset.y; j++) {
        var cell = this.state.getCell(new Vector(i, j));
        if ((!cell.isSpecial() || j == endOffset.y - 1) && startY) {
          context.moveTo(
              i * c.CHAR_PIXELS_H - this.offset.x + c.CHAR_PIXELS_H/2,
              startY * c.CHAR_PIXELS_V - this.offset.y - c.CHAR_PIXELS_V/2);
          context.lineTo(
              i * c.CHAR_PIXELS_H - this.offset.x + c.CHAR_PIXELS_H/2,
              (j - 1) * c.CHAR_PIXELS_V - this.offset.y - c.CHAR_PIXELS_V/2);
          startY = false;
        }
        if (cell.isSpecial() && !startY) {
          startY = j;
        }
      }
    }
    for (var j = startOffset.y; j < endOffset.y; j++) {
      var startX = false;
      for (var i = startOffset.x; i < endOffset.x; i++) {
        var cell = this.state.getCell(new Vector(i, j));
        if ((!cell.isSpecial() || i == endOffset.x - 1) && startX) {
          context.moveTo(
              startX * c.CHAR_PIXELS_H - this.offset.x + c.CHAR_PIXELS_H/2,
              j * c.CHAR_PIXELS_V - this.offset.y - c.CHAR_PIXELS_V/2);
          context.lineTo(
              (i -1) * c.CHAR_PIXELS_H - this.offset.x + c.CHAR_PIXELS_H/2,
              j * c.CHAR_PIXELS_V - this.offset.y - c.CHAR_PIXELS_V/2);
          startX = false;
        }
        if (cell.isSpecial() && !startX) {
          startX = i;
        }
      }
    }
    this.context.stroke();
  }

  /**
   * @param {number} zoom
   */
  setZoom(zoom) {
    this.zoom = zoom;
    this.dirty = true;
  }

  /**
   * @param {Vector} offset
   */
  setOffset(offset) {
    this.offset = offset;
    this.dirty = true;
  };

  /**
   * @param {boolean} useLines
   */
  setUseLines(useLines) {
    this.useLines = useLines;
    this.dirty = true;
  }

  /**
   * Given a screen coordinate, find the frame coordinates.
   * @param {Vector} vector
   * @return {Vector}
   */
  screenToFrame(vector) {
    return new Vector(
        (vector.x - this.canvas.width / 2) / this.zoom + this.offset.x,
        (vector.y - this.canvas.height / 2) / this.zoom + this.offset.y);
  }

  /**
   * Given a frame coordinate, find the screen coordinates.
   * @param {Vector} vector
   * @return {Vector}
   */
  frameToScreen(vector) {
    return new Vector(
        (vector.x - this.offset.x) * this.zoom + this.canvas.width / 2,
        (vector.y - this.offset.y) * this.zoom + this.canvas.height / 2);
  }

  /**
   * Given a frame coordinate, return the indices for the nearest cell.
   * @param {Vector} vector
   * @return {Vector}
   */
  frameToCell(vector) {
    // We limit the edges in a bit, as most drawing needs a full context to work.
    return new Vector(
      Math.min(Math.max(1,
          Math.round((vector.x - c.CHAR_PIXELS_H / 2) / c.CHAR_PIXELS_H)),
          c.MAX_GRID_WIDTH - 2),
      Math.min(Math.max(1,
          Math.round((vector.y + c.CHAR_PIXELS_V / 2) / c.CHAR_PIXELS_V)),
          c.MAX_GRID_HEIGHT - 2));
  }

  /**
   * Given a cell coordinate, return the frame coordinates.
   * @param {Vector} vector
   * @return {Vector}
   */
  cellToFrame(vector) {
    return new Vector(
        Math.round(vector.x * c.CHAR_PIXELS_H),
        Math.round(vector.y * c.CHAR_PIXELS_V));
  }

  /**
   * Given a screen coordinate, return the indices for the nearest cell.
   * @param {Vector} vector
   * @return {Vector}
   */
  screenToCell(vector) {
    return this.frameToCell(this.screenToFrame(vector));
  }

  /**
   * Given a cell coordinate, return the on screen coordinates.
   * @param {Vector} vector
   * @return {Vector}
   */
  cellToScreen(vector) {
    return this.frameToScreen(this.cellToFrame(vector));
  }
}
