/**
 * Application main entry point.
 */
goog.provide('asciiflow.launch');

goog.require('asciiflow.Controller');
goog.require('asciiflow.State');
goog.require('asciiflow.View');

asciiflow.launch = function() {
    var state = new asciiflow.State();
    var view = new asciiflow.View(state);
    var controller = new asciiflow.Controller(view);
    view.animate();
};

asciiflow.launch();
