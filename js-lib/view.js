/**
 * Functions relating to view operations and management of the screen.
 */
goog.provide('asciiflow.View');

goog.require('asciiflow.constants');

/**
 * @constructor
 */
asciiflow.View = function() {
    this.canvasElem = document.getElementById('ascii-canvas');

    this.resizeCanvas();
    // Setup view-port size monitoring.
};

asciiflow.View.prototype.resizeCanvas = function() {
    this.canvasElem.width = document.documentElement.clientWidth;
    this.canvasElem.height = document.documentElement.clientHeight;
};

asciiflow.View.prototype.getContext = function() {
    return this.canvasElem.getContext('2d');
};