import React = require("react");
import {
  AppBar,
  FormControlLabel,
  Switch,
  Toolbar as MaterialToolbar,
} from "@material-ui/core";
import { Options } from "asciiflow/client/options";
import { store } from "asciiflow/client/store";
import { useObserver } from "mobx-react";
import { useState } from "react";

export const Toolbar = () => {
  const [currentTool, setCurrentTool] = useState("box");
  return useObserver(() => (
    <AppBar position="relative">
      <MaterialToolbar className={"toolbar"}>
        <img
          id="logo-bar"
          src="public/images/logo-bar.gif"
          width="88"
          height="24"
        />

        <FormControlLabel
          control={
            <Switch
              checked={store.unicode.get()}
              onChange={(e) => store.setUnicode(e.target.checked)}
            />
          }
          label="Unicode"
        />

        <div id="file-tools">
          <button
            id="export-button"
            className="tool export-image"
            title="Export"
          />
          <button
            id="import-button"
            className="tool import-image"
            title="Import"
          />
          <button
            id="clear-button"
            className="tool clear-image"
            title="Clear"
          />
          <button id="undo-button" className="tool undo-image" title="Undo" />
          <button id="redo-button" className="tool redo-image" title="Redo" />
          <Options />
        </div>

        <div id="export-button-dialog" className="dialog">
          <textarea id="export-area" />
          <div className="dialog-button-bar">
            <button className="close-dialog-button">Close</button>
          </div>
        </div>

        <div id="import-button-dialog" className="dialog">
          <textarea id="import-area" />
          <div className="dialog-button-bar">
            <button className="close-dialog-button">Close</button>
            <button id="import-submit-button">Import</button>
          </div>
        </div>
      </MaterialToolbar>
    </AppBar>
  ));
};
