/**
 * Functions relating to view operations and management of the screen.
 */
goog.provide('ascii.View');

goog.require('ascii.Vector');

/** @const */ ascii.CHARACTER_PIXELS = 15;

/**
 * @constructor
 */
ascii.View = function(state) {
  /** @type {Element} */ this.canvas = document.getElementById('ascii-canvas');
  /** @type {Object} */ this.context = this.canvas.getContext('2d');
  /** @type {number} */ this.zoom = 1;
  /** @type {ascii.Vector} */ this.offset = new ascii.Vector(2000, 2000);
  /** @type {ascii.State} */ this.state = state;
  this.resizeCanvas();
};

ascii.View.prototype.resizeCanvas = function() {
  this.canvas.width = document.documentElement.clientWidth;
  this.canvas.height = document.documentElement.clientHeight;
};

ascii.View.prototype.animate = function() {
  this.render();
  var view = this;
  window.requestAnimationFrame(function() { view.animate(); });
};

ascii.View.prototype.render = function() {
  this.context.setTransform(1, 0, 0, 1, 0, 0);
  // Clear the visible area.
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  this.context.scale(this.zoom, this.zoom);
  this.context.translate(this.canvas.width/2/this.zoom, this.canvas.height/2/this.zoom);

  // Render the grid.
  this.context.lineWidth="1";
  this.context.strokeStyle="#DDDDDD";
  this.context.beginPath();
  for (var i = 0; i < this.state.cells.length; i++) {
    this.context.moveTo(
        i*ascii.CHARACTER_PIXELS - this.offset.x,
        0 - this.offset.y);
    this.context.lineTo(
        i*ascii.CHARACTER_PIXELS - this.offset.x,
        ascii.MAX_GRID_SIZE*ascii.CHARACTER_PIXELS - this.offset.y);
  }
  for (var j = 0; j < this.state.cells[0].length; j++) {
    this.context.moveTo(
        0 - this.offset.x,
        j*ascii.CHARACTER_PIXELS - this.offset.y);
    this.context.lineTo(
        ascii.MAX_GRID_SIZE*ascii.CHARACTER_PIXELS - this.offset.x,
        j*ascii.CHARACTER_PIXELS - this.offset.y);
  }
  this.context.stroke();

  // Render cells.
  this.context.font = '15px Courier New';
  for (var i = 0; i < this.state.cells.length; i++) {
    for (var j = 0; j < this.state.cells[i].length; j++) {
      if (this.state.cells[i][j].value != null) {
        this.context.fillText(this.state.cells[i][j].value,
            i*ascii.CHARACTER_PIXELS - this.offset.x,
            j*ascii.CHARACTER_PIXELS - this.offset.y);
      }
    }
  }
};

/**
 * Given a screen coordinate, find the frame coordinates.
 * @param {ascii.Vector} vector
 * @return {ascii.Vector}
 */
ascii.View.prototype.screenToFrame = function(vector) {
  return new ascii.Vector(
      (vector.x - this.canvas.width/2)/this.zoom + this.offset.x,
      (vector.y - this.canvas.height/2)/this.zoom + this.offset.y);
};

/**
 * Given a frame coordinate, find the screen coordinates.
 * @param {ascii.Vector} vector
 * @return {ascii.Vector}
 */
ascii.View.prototype.frameToScreen = function(vector) {
  return new ascii.Vector(
      (vector.x - this.offset.x) * this.zoom + this.canvas.width/2,
      (vector.y - this.offset.y) * this.zoom + this.canvas.height/2);
};


