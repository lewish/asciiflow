import { State } from "asciiflow/client/state";
import { View } from "asciiflow/client/view";
import { Controller } from "asciiflow/client/controller";
import {
  TouchController,
  DesktopController,
} from "asciiflow/client/input-controller";

/**
 * Runs the application.
 */
(function () {
  var state = new State();
  var view = new View(state);
  var controller = new Controller(view, state);
  var touchController = new TouchController(controller);
  var desktopController = new DesktopController(controller);
  view.animate();
})();
