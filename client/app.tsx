import * as React from "react";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import styles from "#asciiflow/client/app.module.css";
import {
  Controller,
  DesktopController,
  TouchController,
} from "#asciiflow/client/controller";
import { Drawer } from "#asciiflow/client/drawer";
import { DrawingId, store, ToolMode } from "#asciiflow/client/store";
import { screenToCell, View } from "#asciiflow/client/view";
import { useObserver } from "mobx-react";
import { HashRouter, Route, useParams } from "react-router-dom";
import * as ReactDOM from "react-dom";
import { Vector } from "#asciiflow/client/vector";
import { textToLayer } from "#asciiflow/client/text_utils";

const controller = new Controller();
const touchController = new TouchController(controller);
const desktopController = new DesktopController(controller);

export interface IRouteProps {
  local: string;
  share: string;
}

export const App = () => {
  return useObserver(() => {
    const routeProps = useParams<IRouteProps>();
    store.setRoute(
      routeProps.share
        ? DrawingId.share(decodeURIComponent(routeProps.share))
        : DrawingId.local(routeProps.local || null)
    );

    const theme = React.useMemo(
      () =>
        createTheme({
          palette: {
            type: store.darkMode.get() ? "dark" : "light",
          },
        }),
      [store.darkMode.get()]
    );
    return (
      <ThemeProvider theme={theme}>
        <div
          className={[styles.app, store.darkMode.get() ? "dark" : ""].join(" ")}
        >
          <Drawer />
          <View
            {...desktopController.getHandlerProps()}
            {...touchController.getHandlerProps()}
          />
        </div>
      </ThemeProvider>
    );
  });
};

async function render() {
  ReactDOM.render(
    <HashRouter>
      <Route exact path="/" component={App} />
      <Route path="/local/:local" component={App} />
      <Route path="/share/:share" component={App} />
    </HashRouter>,
    document.getElementById("root")
  );
}

// tslint:disable-next-line: no-console
render().catch((e) => console.log(e));

document.getElementById("root").addEventListener("keypress", (e) => controller.handleKeyPress(e));
document.getElementById("root").addEventListener("keydown", (e) => controller.handleKeyDown(e));
document.getElementById("root").addEventListener("keyup", (e) => controller.handleKeyUp(e));

document.addEventListener("paste", (e) => {
  e.preventDefault();
  // Text tool manages pasting it's own way.
  const clipboardText = e.clipboardData.getData("text");
  // Default to the center of the screen.
  var position = screenToCell(new Vector(window.innerWidth / 2, window.innerHeight / 2));
  // Use the select tool position if set.
  if (store.selectTool.selectBox) {
    position = store.selectTool.selectBox.topLeft();
  }
  if (store.toolMode === ToolMode.TEXT && store.textTool.currentPosition) {
    position = store.textTool.currentPosition;
  }
  const pastedLayer = textToLayer(clipboardText, position);
  store.currentTool.cleanup();
  store.currentCanvas.setScratchLayer(pastedLayer);
  store.currentCanvas.commitScratch();
});
