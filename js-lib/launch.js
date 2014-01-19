/**
 * Runs the application.
 */
ascii.launch = function() {
    var state = new ascii.State();
    var view = new ascii.View(state);
    var controller = new ascii.Controller(view, state);
    view.animate();
};

ascii.launch();
