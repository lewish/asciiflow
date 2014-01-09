/**
 * Common classes.
 */
goog.provide('ascii.Position');

/**
 * @constructor
 */
ascii.Position = function(x, y) {
  /** type {Number} */ this.x = x;
  /** type {Number} */ this.y = y;
};

ascii.Position.prototype.equals = function(other) {
  return (this.x == other.x)
      && (this.y == other.y);
};
