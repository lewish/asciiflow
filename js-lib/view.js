/**
 * Functions relating to view operations and management of the screen.
 */
goog.provide('asciiflow.View');

/**
 * @constructor
 */
asciiflow.View = function(state) {
  /** type {Element} */ this.canvas = document.getElementById('ascii-canvas');
  /** type {Object} */ this.context = this.canvas.getContext('2d');
  /** type {number} */ this.zoom = 1;
  /** type {number} */ this.offsetX = 0;
  /** type {number} */ this.offsetY = 0;
  /** type {asciiflow.State} */ this.state = state;
  this.resizeCanvas();
};

asciiflow.View.prototype.resizeCanvas = function() {
  this.canvas.width = document.documentElement.clientWidth;
  this.canvas.height = document.documentElement.clientHeight;
};

asciiflow.View.prototype.getContext = function() {
  return this.context;
};

asciiflow.View.prototype.drawState = function() {
  this.context.setTransform(1, 0, 0, 1, 0, 0);
  // Clear the visible area.
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  this.context.translate(-this.offsetX/this.zoom, -this.offsetY/this.zoom);
  this.context.scale(this.zoom, this.zoom);
  this.context.translate(this.canvas.width/2/this.zoom, this.canvas.height/2/this.zoom);

  this.context.font = '15px Courier New';
  for (var i = 0; i < this.state.cells.length; i++) {
    for (var j = 0; j < this.state.cells[i].length; j++) {
      if (this.state.cells[i][j].value != null) {
        this.context.fillText(this.state.cells[i][j].value, i*15, j*15);
      }
    }
  }
};
 
