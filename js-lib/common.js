/**
 * Common classes.
 */
goog.provide('ascii.Vector');

/**
 * @constructor
 */
ascii.Vector = function(x, y) {
  /** type {Number} */ this.x = x;
  /** type {Number} */ this.y = y;
};

/** @return {boolean} */
ascii.Vector.prototype.equals = function(other) {
  return (this.x == other.x)
      && (this.y == other.y);
};

/** @return {ascii.Vector} */
ascii.Vector.prototype.subtract = function(other) {
  return new ascii.Vector(this.x - other.x, this.y - other.y);
};

/** @return {ascii.Vector} */
ascii.Vector.prototype.add = function(other) {
  return new ascii.Vector(this.x + other.x, this.y + other.y);
};

/** @return {number} */
ascii.Vector.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
