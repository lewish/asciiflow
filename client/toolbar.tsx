import React = require("react");
import {
  AppBar,
  FormControlLabel,
  Switch,
  Toolbar as MaterialToolbar,
} from "@material-ui/core";
import { Controller } from "asciiflow/client/controller";
import { Options } from "asciiflow/client/options";
import { CanvasStore } from "asciiflow/client/canvas_store";
import { useState } from "react";
import { useObserver } from "mobx-react";
import { store } from "asciiflow/client/store";

const TOOLS: {
  [key: string]: { title: string };
} = {
  box: { title: "Draw boxes" },
  line: { title: "Draw connecting lines" },
  arrow: { title: "Draw arrows" },
  freeform: { title: "Freeform drawing" },
  erase: { title: "Erase square areas" },
  move: { title: "Resize/move boxes and lines" },
  text: { title: "Text tool" },
  select: { title: "Select, copy, cut and move" },
};

// handleFileButton(id: string) {
//   $(".dialog").removeClass("visible");
//   $("#" + id + "-dialog").toggleClass("visible");

//   if (id == "import-button") {
//     $("#import-area").val("");
//     $("#import-area").focus();
//   }

//   if (id == "export-button") {
//     $("#export-area").val(this.state.outputText());
//     $("#export-area").select();
//   }
//   if (id == "clear-button") {
//     this.state.clear();
//   }
//   if (id == "undo-button") {
//     this.state.undo();
//   }
//   if (id == "redo-button") {
//     this.state.redo();
//   }
// }

// handleDrawButton(id: string) {
//   // Install the right draw tool based on button pressed.
//   if (id == "box-button") {
//     this.drawFunction = new DrawBox(this.state);
//   }
//   if (id == "line-button") {
//     this.drawFunction = new DrawLine(this.state, false);
//   }
//   if (id == "arrow-button") {
//     this.drawFunction = new DrawLine(this.state, true);
//   }
//   if (id == "freeform-button") {
//     this.drawFunction = new DrawFreeform(this.state, "X");
//   }
//   if (id == "erase-button") {
//     this.drawFunction = new DrawErase(this.state);
//   }
//   if (id == "move-button") {
//     this.drawFunction = new DrawMove(this.state);
//   }
//   if (id == "text-button") {
//     this.drawFunction = new DrawText(this.state, this.view);
//   }
//   if (id == "select-button") {
//     this.drawFunction = new DrawSelect(this.state);
//   }
//   this.state.commitDraw();
//   this.view.canvas.focus();
// }

// $("#draw-tools > button.tool").click((e) => {
//   $("#text-tool-widget").hide(0);
//   this.handleDrawButton(e.target.id);
// });

// $("#file-tools > button.tool").click((e) => {
//   this.handleFileButton(e.target.id);
// });

// $("button.close-dialog-button").click((e) => {
//   $(".dialog").removeClass("visible");
// });

// $("#import-submit-button").click((e) => {
//   this.state.clear();
//   this.state.fromText(
//     /** @type {string} */
//     String($("#import-area").val()),
//     this.view.screenToCell(
//       new Vector(this.view.canvas.width / 2, this.view.canvas.height / 2)
//     )
//   );
//   this.state.commitDraw();
//   $("#import-area").val("");
//   $(".dialog").removeClass("visible");
// });

// // Bit of a hack, just triggers the text tool to get a new value.
// $("#text-tool-input, #freeform-tool-input").keyup(() => {
//   this.drawFunction.handleKey("");
// });
// $("#text-tool-input, #freeform-tool-input").change(() => {
//   this.drawFunction.handleKey("");
// });
// $("#text-tool-close").click(() => {
//   $("#text-tool-widget").hide();
//   this.state.commitDraw();
// });

export const Toolbar = () => {
  return useObserver(() => (
    <AppBar position="fixed">
      <MaterialToolbar variant="dense" className={"toolbar"}>
        <img
          id="logo-bar"
          src="public/images/logo-bar.gif"
          width="88"
          height="24"
        />

        <FormControlLabel
          control={
            <Switch
              checked={store.unicode.value}
              onChange={(e) => store.setUnicode(e.target.checked)}
            />
          }
          label="Unicode"
        />

        <div id="draw-tools">
          {Object.keys(TOOLS).map((tool) => (
            <button
              id={`${tool}-button`}
              className={`tool ${
                store.tool === tool ? "active" : ""
              } ${tool}-image`}
              title={TOOLS[tool].title}
              onClick={() => store.setTool(tool)}
            />
          ))}
        </div>

        <div id="file-tools">
          <button
            id="export-button"
            className="tool export-image"
            title="Export"
          ></button>
          <button
            id="import-button"
            className="tool import-image"
            title="Import"
          ></button>
          <button
            id="clear-button"
            className="tool clear-image"
            title="Clear"
          ></button>
          <button
            id="undo-button"
            className="tool undo-image"
            title="Undo"
          ></button>
          <button
            id="redo-button"
            className="tool redo-image"
            title="Redo"
          ></button>
          <Options />
        </div>

        <div id="export-button-dialog" className="dialog">
          <textarea id="export-area"></textarea>
          <div className="dialog-button-bar">
            <button className="close-dialog-button">Close</button>
          </div>
        </div>

        <div id="import-button-dialog" className="dialog">
          <textarea id="import-area"></textarea>
          <div className="dialog-button-bar">
            <button className="close-dialog-button">Close</button>
            <button id="import-submit-button">Import</button>
          </div>
        </div>
      </MaterialToolbar>
    </AppBar>
  ));
};
