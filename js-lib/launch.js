/**
 * Runs the application.
 */
ascii.launch = function() {
    var state = new ascii.State();
    var view = new ascii.View(state);
    var controller = new ascii.Controller(view, state);
    var touchController = new ascii.TouchController(controller);
    var desktopController = new ascii.DesktopController(controller);
    view.animate();
};

ascii.launch();
