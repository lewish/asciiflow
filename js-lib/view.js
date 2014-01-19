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
  if (this.dirty) {
    this.dirty = false;
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
        i * CHARACTER_PIXELS - this.offset.x,
        0 - this.offset.y);
    context.lineTo(
        i * CHARACTER_PIXELS - this.offset.x,
        this.state.cells.length * CHARACTER_PIXELS - this.offset.y);
  }
  for (var j = startOffset.y; j < endOffset.y; j++) {
    context.moveTo(
        0 - this.offset.x,
        j * CHARACTER_PIXELS - this.offset.y);
    context.lineTo(
        this.state.cells.length * CHARACTER_PIXELS - this.offset.x,
        j * CHARACTER_PIXELS - this.offset.y);
  }
  this.context.stroke();

  // Render cells.
  this.context.font = '15px Courier New';
  for (var i = startOffset.x; i < endOffset.x; i++) {
    for (var j = startOffset.y; j < endOffset.y; j++) {
      if (this.state.getCell(new ascii.Vector(i, j)).isSpecial()) {
        this.context.fillStyle = '#F5F5F5';
        context.fillRect(
            i * CHARACTER_PIXELS - this.offset.x,
            (j - 1) * CHARACTER_PIXELS - this.offset.y,
            CHARACTER_PIXELS, CHARACTER_PIXELS);
      }
      var cellValue = this.state.getDrawValue(new ascii.Vector(i, j));
      if (cellValue != null) {
        this.context.fillStyle = '#000000';
        context.fillText(cellValue,
            i * CHARACTER_PIXELS - this.offset.x + 3,
            j * CHARACTER_PIXELS - this.offset.y - 2);
      }
    }
  }
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
  return new ascii.Vector(
    Math.round((vector.x - CHARACTER_PIXELS / 2) / CHARACTER_PIXELS),
    Math.round((vector.y + CHARACTER_PIXELS / 2) / CHARACTER_PIXELS));
};

/**
 * Given a screen coordinate, return the indices for the nearest cell.
 * @param {ascii.Vector} vector
 * @return {ascii.Vector}
 */
ascii.View.prototype.screenToCell = function(vector) {
  return this.frameToCell(this.screenToFrame(vector));
};



