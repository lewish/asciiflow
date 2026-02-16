import "#asciiflow/client/ui/theme.css";
import * as React from "react";
import styles from "#asciiflow/client/app.module.css";
import {
  Controller,
  InputController,
} from "#asciiflow/client/controller";
import { Toolbar } from "#asciiflow/client/toolbar";
import { DrawingId, store, ToolMode, useAppStore } from "#asciiflow/client/store";
import { renderedVersion, screenToCell, View } from "#asciiflow/client/view";
import { initFont } from "#asciiflow/client/font";

import { HashRouter, Route, useParams } from "react-router-dom";
import * as ReactDOM from "react-dom";
import { Vector } from "#asciiflow/client/vector";
import { layerToText, textToLayer } from "#asciiflow/client/text_utils";
import { CHAR_PIXELS_H, CHAR_PIXELS_V } from "#asciiflow/client/constants";

const controller = new Controller();
const inputController = new InputController(controller);

export interface IRouteProps {
  local: string;
  share: string;
}

export const App = () => {
  const routeProps = useParams<IRouteProps>();
  const darkMode = useAppStore((s) => s.darkMode);

  // Sync route params into the store.
  React.useEffect(() => {
    store.setRoute(
      routeProps.share
        ? DrawingId.share(decodeURIComponent(routeProps.share))
        : DrawingId.local(routeProps.local || null)
    );
  }, [routeProps.share, routeProps.local]);

  return (
    <div className={[styles.app, darkMode ? "dark" : ""].join(" ")}>
      <Toolbar />
      <View
        {...inputController.getHandlerProps()}
      />
    </div>
  );
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

// Expose a test bridge for e2e tests to query store and render state.
(window as any).__asciiflow__ = {
  getCommittedText: () => layerToText(store.currentCanvas.committed),
  getRenderedVersion: () => renderedVersion,
  getToolMode: () => store.toolMode(),
  getDarkMode: () => store.darkMode,
  getCommittedSize: () => store.currentCanvas.committed.size(),
  setDarkMode: (v: boolean) => store.setDarkMode(v),
  getZoom: () => store.currentCanvas.zoom,
  getOffset: () => ({ x: store.currentCanvas.offset.x, y: store.currentCanvas.offset.y }),
  getCellSize: () => ({ w: CHAR_PIXELS_H, h: CHAR_PIXELS_V }),
};

// tslint:disable-next-line: no-console
initFont().then(() => render()).catch((e) => console.log(e));

document.getElementById("root").addEventListener("keypress", (e) => controller.handleKeyPress(e));
document.getElementById("root").addEventListener("keydown", (e) => controller.handleKeyDown(e));
document.getElementById("root").addEventListener("keyup", (e) => controller.handleKeyUp(e));

// Register wheel handler with { passive: false } so preventDefault() can
// suppress browser page zoom on Ctrl+scroll / pinch-to-zoom.
document.getElementById("root").addEventListener(
  "wheel",
  (e) => inputController.handleWheel(e),
  { passive: false }
);

// Use native copy/cut events so the browser handles clipboard permissions.
// This works across Chrome, Safari, and Firefox (including macOS).
document.addEventListener("copy", (e) => {
  if (store.selectTool.selectBox) {
    e.preventDefault();
    const copiedText = layerToText(
      store.currentCanvas.committed,
      store.selectTool.selectBox
    );
    e.clipboardData.setData("text/plain", copiedText);
  }
});

document.addEventListener("cut", (e) => {
  if (store.selectTool.selectBox) {
    e.preventDefault();
    const copiedText = layerToText(
      store.currentCanvas.committed,
      store.selectTool.selectBox
    );
    e.clipboardData.setData("text/plain", copiedText);
    // Perform the cut (erase selected content).
    store.selectTool.cutSelection();
  }
});

document.addEventListener("paste", (e) => {
  e.preventDefault();
  const clipboardText = e.clipboardData.getData("text");
  // Default to the center of the screen.
  var position = screenToCell(new Vector(window.innerWidth / 2, window.innerHeight / 2));
  // Use the select tool position if set.
  if (store.selectTool.selectBox) {
    position = store.selectTool.selectBox.topLeft();
  }
  if (store.toolMode() === ToolMode.TEXT && store.textTool.currentPosition) {
    position = store.textTool.currentPosition;
  }
  const pastedLayer = textToLayer(clipboardText, position);
  store.currentTool.cleanup();
  store.currentCanvas.setScratchLayer(pastedLayer);
  store.currentCanvas.commitScratch();
});
