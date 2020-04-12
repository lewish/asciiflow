import { State } from "asciiflow/client/state";
import { Vector } from "asciiflow/client/vector";
import * as constants from "asciiflow/client/constants";

/**
 * Handles view operations, state and management of the screen.
 */
export class View {
  public canvas = document.getElementById("ascii-canvas") as HTMLCanvasElement;
  public context = this.canvas.getContext("2d");

  public zoom = 1;
  public offset = new Vector(
    (constants.MAX_GRID_WIDTH * constants.CHAR_PIXELS_H) / 2,
    (constants.MAX_GRID_HEIGHT * constants.CHAR_PIXELS_V) / 2
  );

  public dirty = true;
  public useLines = false;
 
  constructor(private readonly state: State) {
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
    window.requestAnimationFrame(() => {
      this.animate();
    });
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
      this.canvas.height / 2 / this.zoom
    );

    // Only render grid lines and cells that are visible.
    var startOffset = this.screenToCell(new Vector(0, 0)).subtract(
      new Vector(constants.RENDER_PADDING_CELLS, constants.RENDER_PADDING_CELLS)
    );
    var endOffset = this.screenToCell(
      new Vector(this.canvas.width, this.canvas.height)
    ).add(
      new Vector(constants.RENDER_PADDING_CELLS, constants.RENDER_PADDING_CELLS)
    );

    startOffset.x = Math.max(
      0,
      Math.min(startOffset.x, constants.MAX_GRID_WIDTH)
    );
    endOffset.x = Math.max(0, Math.min(endOffset.x, constants.MAX_GRID_WIDTH));
    startOffset.y = Math.max(
      0,
      Math.min(startOffset.y, constants.MAX_GRID_HEIGHT)
    );
    endOffset.y = Math.max(0, Math.min(endOffset.y, constants.MAX_GRID_HEIGHT));

    // Render the grid.
    context.lineWidth = 1;
    context.strokeStyle = "#EEEEEE";
    context.beginPath();
    for (var i = startOffset.x; i < endOffset.x; i++) {
      context.moveTo(
        i * constants.CHAR_PIXELS_H - this.offset.x,
        0 - this.offset.y
      );
      context.lineTo(
        i * constants.CHAR_PIXELS_H - this.offset.x,
        this.state.cells.length * constants.CHAR_PIXELS_V - this.offset.y
      );
    }
    for (var j = startOffset.y; j < endOffset.y; j++) {
      context.moveTo(
        0 - this.offset.x,
        j * constants.CHAR_PIXELS_V - this.offset.y
      );
      context.lineTo(
        this.state.cells.length * constants.CHAR_PIXELS_H - this.offset.x,
        j * constants.CHAR_PIXELS_V - this.offset.y
      );
    }
    this.context.stroke();
    this.renderText(startOffset, endOffset, !this.useLines);
    if (this.useLines) {
      this.renderCellsAsLines(startOffset, endOffset);
    }
  }

  renderText(startOffset: Vector, endOffset: Vector, drawSpecials: boolean) {
    // Render cells.
    this.context.font = "15px Courier New";
    for (var i = startOffset.x; i < endOffset.x; i++) {
      for (var j = startOffset.y; j < endOffset.y; j++) {
        var cell = this.state.getCell(new Vector(i, j));
        // Highlight the cell if it is special (grey) or it is part
        // of a visible edit (blue).
        if (
          cell.isSpecial() ||
          (cell.hasScratch() && cell.getRawValue() != " ")
        ) {
          this.context.fillStyle = cell.hasScratch() ? "#DEF" : "#F5F5F5";
          this.context.fillRect(
            i * constants.CHAR_PIXELS_H - this.offset.x,
            (j - 1) * constants.CHAR_PIXELS_V - this.offset.y,
            constants.CHAR_PIXELS_H,
            constants.CHAR_PIXELS_V
          );
        }
        var cellValue = this.state.getDrawValue(new Vector(i, j));
        if (cellValue != null && (!cell.isSpecial() || drawSpecials)) {
          this.context.fillStyle = "#000000";
          this.context.fillText(
            cellValue,
            i * constants.CHAR_PIXELS_H - this.offset.x,
            j * constants.CHAR_PIXELS_V - this.offset.y - 3
          );
        }
      }
    }
  }

  renderCellsAsLines(startOffset: Vector, endOffset: Vector) {
    this.context.lineWidth = 1;
    this.context.strokeStyle = "#000000";
    this.context.beginPath();
    for (var i = startOffset.x; i < endOffset.x; i++) {
      var startY = 0;
      for (var j = startOffset.y; j < endOffset.y; j++) {
        var cell = this.state.getCell(new Vector(i, j));
        if ((!cell.isSpecial() || j == endOffset.y - 1) && startY) {
          this.context.moveTo(
            i * constants.CHAR_PIXELS_H -
              this.offset.x +
              constants.CHAR_PIXELS_H / 2,
            +startY * constants.CHAR_PIXELS_V -
              this.offset.y -
              constants.CHAR_PIXELS_V / 2
          );
          this.context.lineTo(
            i * constants.CHAR_PIXELS_H -
              this.offset.x +
              constants.CHAR_PIXELS_H / 2,
            (j - 1) * constants.CHAR_PIXELS_V -
              this.offset.y -
              constants.CHAR_PIXELS_V / 2
          );
          startY = 0;
        }
        if (cell.isSpecial() && !startY) {
          startY = j;
        }
      }
    }
    for (var j = startOffset.y; j < endOffset.y; j++) {
      var startX = 0;
      for (var i = startOffset.x; i < endOffset.x; i++) {
        var cell = this.state.getCell(new Vector(i, j));
        if ((!cell.isSpecial() || i == endOffset.x - 1) && startX) {
          this.context.moveTo(
            startX * constants.CHAR_PIXELS_H -
              this.offset.x +
              constants.CHAR_PIXELS_H / 2,
            j * constants.CHAR_PIXELS_V -
              this.offset.y -
              constants.CHAR_PIXELS_V / 2
          );
          this.context.lineTo(
            (i - 1) * constants.CHAR_PIXELS_H -
              this.offset.x +
              constants.CHAR_PIXELS_H / 2,
            j * constants.CHAR_PIXELS_V -
              this.offset.y -
              constants.CHAR_PIXELS_V / 2
          );
          startX = 0;
        }
        if (cell.isSpecial() && !startX) {
          startX = i;
        }
      }
    }
    this.context.stroke();
  }

  setZoom(zoom: number) {
    this.zoom = zoom;
    this.dirty = true;
  }

  setOffset(offset: Vector) {
    this.offset = offset;
    this.dirty = true;
  }

  setUseLines(useLines: boolean) {
    this.useLines = useLines;
    this.dirty = true;
  }

  /**
   * Given a screen coordinate, find the frame coordinates.
   */
  screenToFrame(vector: Vector) {
    return new Vector(
      (vector.x - this.canvas.width / 2) / this.zoom + this.offset.x,
      (vector.y - this.canvas.height / 2) / this.zoom + this.offset.y
    );
  }

  /**
   * Given a frame coordinate, find the screen coordinates.
   */
  frameToScreen(vector: Vector) {
    return new Vector(
      (vector.x - this.offset.x) * this.zoom + this.canvas.width / 2,
      (vector.y - this.offset.y) * this.zoom + this.canvas.height / 2
    );
  }

  /**
   * Given a frame coordinate, return the indices for the nearest cell.
   */
  frameToCell(vector: Vector) {
    // We limit the edges in a bit, as most drawing needs a full context to work.
    return new Vector(
      Math.min(
        Math.max(
          1,
          Math.round(
            (vector.x - constants.CHAR_PIXELS_H / 2) / constants.CHAR_PIXELS_H
          )
        ),
        constants.MAX_GRID_WIDTH - 2
      ),
      Math.min(
        Math.max(
          1,
          Math.round(
            (vector.y + constants.CHAR_PIXELS_V / 2) / constants.CHAR_PIXELS_V
          )
        ),
        constants.MAX_GRID_HEIGHT - 2
      )
    );
  }

  /**
   * Given a cell coordinate, return the frame coordinates.
   */
  cellToFrame(vector: Vector) {
    return new Vector(
      Math.round(vector.x * constants.CHAR_PIXELS_H),
      Math.round(vector.y * constants.CHAR_PIXELS_V)
    );
  }

  /**
   * Given a screen coordinate, return the indices for the nearest cell.
   */
  screenToCell(vector: Vector) {
    return this.frameToCell(this.screenToFrame(vector));
  }

  /**
   * Given a cell coordinate, return the on screen coordinates.
   */
  cellToScreen(vector: Vector) {
    return this.frameToScreen(this.cellToFrame(vector));
  }
}
