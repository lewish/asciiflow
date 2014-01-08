/**
 * Classes holding the state of the ascii-diagram.
 */
goog.provide('asciiflow.State');

/**
 * @constructor
 */
asciiflow.Cell = function() {
  /** @type {string|null} */ // Uses the string "#" for lines.
  this.value = null;
};

asciiflow.Cell.prototype.setValue = function(value) {
  this.value = value;
};

/**
 * @constructor
 */
asciiflow.State = function() {
  /** @type {Array.<Array.<asciiflow.Cell>>} */
  this.cells = new Array(asciiflow.State.MAX_SIZE);

  for (var i = 0; i < this.cells.length; i++) {
    this.cells[i] = new Array(asciiflow.State.MAX_SIZE);
    for (var j = 0; j < this.cells[i].length; j++) {
      this.cells[i][j] = new asciiflow.Cell();
      // Hack: Just fill image with random stuff for now.
      if ((i % 10 == 0) && (j % 10 == 0)) {
        var jstr = ("" + j);
        this.cells[i][j].setValue(jstr.substring(jstr.length-1,jstr.length));
      }
    }
  }
};

/** @const */ asciiflow.State.MAX_SIZE = 1000;

asciiflow.State.prototype.blah = function() {
};
