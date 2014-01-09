/**
 * Functions relating to view operations and management of the screen.
 */
goog.provide('ascii.View');

goog.require('ascii.Position');

/**
 * @constructor
 */
ascii.View = function(state) {
  /** type {Element} */ this.canvas = document.getElementById('ascii-canvas');
  /** type {Object} */ this.context = this.canvas.getContext('2d');
  /** type {number} */ this.zoom = 1;
  /** type {ascii.Position} */ this.offset = new ascii.Position(0, 0);
  /** type {ascii.State} */ this.state = state;
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

  this.context.font = '15px Courier New';
  for (var i = 0; i < this.state.cells.length; i++) {
    for (var j = 0; j < this.state.cells[i].length; j++) {
      if (this.state.cells[i][j].value != null) {
        this.context.fillText(this.state.cells[i][j].value, i*15 - this.offset.x, j*15 - this.offset.y);
      }
    }
  }
};

/**
 * Given a screen coordinate, find the integer cell position that it relates to.
 */
ascii.View.prototype.getCell = function(x, y) {
  
};


