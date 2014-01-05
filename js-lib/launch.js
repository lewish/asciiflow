/**
 * 
 */

goog.provide('asciiflow.launch');
goog.require('asciiflow.View');

asciiflow.launch = function() {
    var view = new asciiflow.View();
    var context = view.getContext();
    context.font = 'italic 10pt Calibri';
    context.fillText('Hello World!', 150, 100);
};

asciiflow.launch();
