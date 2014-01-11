/**
 * Application main entry point.
 */
goog.provide('ascii.launch');

goog.require('ascii.Controller');
goog.require('ascii.State');
goog.require('ascii.View');

/**
 * @private
 */
ascii.launch = function() {
    var state = new ascii.State();
    var view = new ascii.View(state);
    var controller = new ascii.Controller(view, state);
    view.animate();
};

ascii.launch();
