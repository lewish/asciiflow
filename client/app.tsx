import React = require("react");
import {
  Controller,
  DesktopController,
  TouchController,
} from "asciiflow/client/controller";
import { Toolbar } from "asciiflow/client/toolbar";
import { View } from "asciiflow/client/view";
import { BrowserRouter, Route } from "react-router-dom";
import ReactDOM = require("react-dom");
import { Drawer } from "asciiflow/client/drawer";

const controller = new Controller();
const touchController = new TouchController(controller);
const desktopController = new DesktopController(controller);

export const App = () => {
  return (
    <>
      <Drawer />
      <Toolbar />
      <View
        {...desktopController.getHandlerProps()}
        {...touchController.getHandlerProps()}
      />
    </>
  );
};

async function render() {
  ReactDOM.render(
    <BrowserRouter>
      <Route path="/" component={() => <App />} />
    </BrowserRouter>,
    document.getElementById("root")
  );
}

// tslint:disable-next-line: no-console
render().catch((e) => console.log(e));

window.addEventListener("keypress", (e) => controller.handleKeyPress(e));
window.addEventListener("keydown", (e) => controller.handleKeyDown(e));
window.addEventListener("keyup", (e) => controller.handleKeyUp(e));
