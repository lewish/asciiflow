/**
 * Handles view operations, state and management of the screen.
 *
 * @constructor
 * @param {ascii.State} state
 */
ascii.View = function(state) {
  /** @type {ascii.State} */ this.state = state;

  /** @type {Element} */ this.canvas = document.getElementById('ascii-canvas');
  /** @type {Object} */ this.context = this.canvas.getContext('2d');

  /** @type {number} */ this.zoom = 1;
  /** @type {ascii.Vector} */ this.offset = new ascii.Vector(7500, 7500);
  /** @type {boolean} */ this.dirty = true;

  this.resizeCanvas();
};

/**
 * Resizes the canvas, should be called if the viewport size changes.
 */
ascii.View.prototype.resizeCanvas = function() {
  this.canvas.width = document.documentElement.clientWidth;
  this.canvas.height = document.documentElement.clientHeight;
  this.dirty = true;
};

/**
 * Starts the animation loop for the canvas. Should only be called once.
 */
ascii.View.prototype.animate = function() {
  if (this.dirty || this.state.dirty) {
    this.dirty = false;
    this.state.dirty = false;
    this.render();
  }
  var view = this;
  window.requestAnimationFrame(function() { view.animate(); });
};

/**
 * Renders the given state to the canvas.
 * TODO: Room for efficiency here still. Drawing should be incremental,
 *       however performance is currently very acceptable on test devices.
 */
ascii.View.prototype.render = function() {
  var context = this.context;

  context.setTransform(1, 0, 0, 1, 0, 0);
  // Clear the visible area.
  context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  context.scale(this.zoom, this.zoom);
  context.translate(
      this.canvas.width / 2 / this.zoom,
      this.canvas.height / 2 / this.zoom);

  // Only render grid lines and cells that are visible.
  var startOffset = this.screenToCell(new ascii.Vector(
      -RENDER_PADDING,
      -RENDER_PADDING));
  var endOffset = this.screenToCell(new ascii.Vector(
      this.canvas.width + RENDER_PADDING,
      this.canvas.height + RENDER_PADDING));

  // Render the grid.
  context.lineWidth = '1';
  context.strokeStyle = '#EEEEEE';
  context.beginPath();
  for (var i = startOffset.x; i < endOffset.x; i++) {
    context.moveTo(
        i * CHAR_PIXELS_H - this.offset.x,
        0 - this.offset.y);
    context.lineTo(
        i * CHAR_PIXELS_H - this.offset.x,
        this.state.cells.length * CHAR_PIXELS_V - this.offset.y);
  }
  for (var j = startOffset.y; j < endOffset.y; j++) {
    context.moveTo(
        0 - this.offset.x,
        j * CHAR_PIXELS_V - this.offset.y);
    context.lineTo(
        this.state.cells.length * CHAR_PIXELS_H - this.offset.x,
        j * CHAR_PIXELS_V - this.offset.y);
  }
  this.context.stroke();
  this.renderCellsAsText(context, startOffset, endOffset);
  //TODO: Add flag to control line vs. text drawing of structures.
  //this.renderCellsAsLines(context, startOffset, endOffset);
};

ascii.View.prototype.renderCellsAsText = function(context, startOffset, endOffset) {
  // Render cells.
  context.font = '15px Courier New';
  for (var i = startOffset.x; i < endOffset.x; i++) {
    for (var j = startOffset.y; j < endOffset.y; j++) {
      var cell = this.state.getCell(new ascii.Vector(i, j));
      // Highlight the cell if it is special (grey) or it is part
      // of a visible edit (blue).
      if (cell.isSpecial() ||
          (cell.hasScratch() && cell.getRawValue() != ' ')) {
        this.context.fillStyle = cell.hasScratch() ? '#DEF' : '#F5F5F5';
        context.fillRect(
            i * CHAR_PIXELS_H - this.offset.x,
            (j - 1) * CHAR_PIXELS_V - this.offset.y,
            CHAR_PIXELS_H, CHAR_PIXELS_V);
      }
      var cellValue = this.state.getDrawValue(new ascii.Vector(i, j));
      if (cellValue != null) {
        this.context.fillStyle = '#000000';
        context.fillText(cellValue,
            i * CHAR_PIXELS_H - this.offset.x,
            j * CHAR_PIXELS_V - this.offset.y - 3);
      }
    }
  }
}

ascii.View.prototype.renderCellsAsLines = function(context, startOffset, endOffset) {
  context.lineWidth = '1';
  context.strokeStyle = '#000000';
  context.beginPath();
  for (var i = startOffset.x; i < endOffset.x; i++) {
    var startY = false;
    for (var j = startOffset.y; j < endOffset.y; j++) {
      var cell = this.state.getCell(new ascii.Vector(i, j));
      if (!cell.isSpecial() && startY) {
        context.moveTo(
            i * CHAR_PIXELS_H - this.offset.x + CHAR_PIXELS_H/2,
            startY * CHAR_PIXELS_V - this.offset.y - CHAR_PIXELS_V/2);
        context.lineTo(
            i * CHAR_PIXELS_H - this.offset.x + CHAR_PIXELS_H/2,
            (j - 1) * CHAR_PIXELS_V - this.offset.y - CHAR_PIXELS_V/2);
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
      var cell = this.state.getCell(new ascii.Vector(i, j));
      if (!cell.isSpecial() && startX) {
        context.moveTo(
            startX * CHAR_PIXELS_H - this.offset.x + CHAR_PIXELS_H/2,
            j * CHAR_PIXELS_V - this.offset.y - CHAR_PIXELS_V/2);
        context.lineTo(
            (i -1) * CHAR_PIXELS_H - this.offset.x + CHAR_PIXELS_H/2,
            j * CHAR_PIXELS_V - this.offset.y - CHAR_PIXELS_V/2);
        startX = false;
      }
      if (cell.isSpecial() && !startX) {
        startX = i;
      }
    }
  }
  this.context.stroke();
};

/**
 * @param {number} zoom
 */
ascii.View.prototype.setZoom = function(zoom) {
  this.zoom = zoom;
  this.dirty = true;
};

/**
 * @param {ascii.Vector} offset
 */
ascii.View.prototype.setOffset = function(offset) {
  this.offset = offset;
  this.dirty = true;
};

/**
 * Given a screen coordinate, find the frame coordinates.
 * @param {ascii.Vector} vector
 * @return {ascii.Vector}
 */
ascii.View.prototype.screenToFrame = function(vector) {
  return new ascii.Vector(
      (vector.x - this.canvas.width / 2) / this.zoom + this.offset.x,
      (vector.y - this.canvas.height / 2) / this.zoom + this.offset.y);
};

/**
 * Given a frame coordinate, find the screen coordinates.
 * @param {ascii.Vector} vector
 * @return {ascii.Vector}
 */
ascii.View.prototype.frameToScreen = function(vector) {
  return new ascii.Vector(
      (vector.x - this.offset.x) * this.zoom + this.canvas.width / 2,
      (vector.y - this.offset.y) * this.zoom + this.canvas.height / 2);
};

/**
 * Given a frame coordinate, return the indices for the nearest cell.
 * @param {ascii.Vector} vector
 * @return {ascii.Vector}
 */
ascii.View.prototype.frameToCell = function(vector) {
  // We limit the edges in a bit, as most drawing needs a full context to work.
  return new ascii.Vector(
    Math.min(Math.max(1,
        Math.round((vector.x - CHAR_PIXELS_H / 2) / CHAR_PIXELS_H)),
        MAX_GRID_WIDTH - 2),
    Math.min(Math.max(1,
        Math.round((vector.y + CHAR_PIXELS_V / 2) / CHAR_PIXELS_V)),
        MAX_GRID_HEIGHT - 2));
};

/**
 * Given a screen coordinate, return the indices for the nearest cell.
 * @param {ascii.Vector} vector
 * @return {ascii.Vector}
 */
ascii.View.prototype.screenToCell = function(vector) {
  return this.frameToCell(this.screenToFrame(vector));
};



