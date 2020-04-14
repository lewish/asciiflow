import React = require("react");
import { Popover, Button } from "@material-ui/core";
import { useState } from "react";

export const Options = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  return (
    <>
      <button
        id="options-button"
        className="tool info-image"
        title="Info"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      />
      <Popover
        open={!!anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <img
          id="options-logo"
          src="public/images/logo-options.gif"
          width="176"
          height="48"
        />
        <br />
        <button id="use-lines-button">Lines Mode</button>
        <button id="use-ascii-button">ASCII Mode</button>
        <br />
        <p>
          Moving around.
          <br />
          Desktop Windows: <span>Hold CTRL and drag the screen.</span>
          <br />
          Desktop OSX: <span>Hold CMD and drag the screen.</span>
          <br />
          Mobile:
          <span>
            Drag quickly to move. Press and hold to start drawing. Pinch to zoom
            in/out.
          </span>
        </p>
        <div className="info-icon box-image"></div>
        <div className="info-description">
          Draw boxes.
          <span>You can resize them later with the Resize tool.</span>
        </div>
        <br />
        <div className="info-icon line-image"></div>
        <div className="info-description">
          Draw lines.
          <span>Connect it to another line to change the orientation.</span>
        </div>
        <br />
        <div className="info-icon arrow-image"></div>
        <div className="info-description">
          Draw arrows.
          <span>Connect it to another line to change the orientation.</span>
        </div>
        <br />
        <div className="info-icon freeform-image"></div>
        <div className="info-description">
          Draw freehand.
          <span>Press a character on the keyboard and draw with it.</span>
        </div>
        <br />
        <div className="info-icon erase-image"></div>
        <div className="info-description">
          Erase.
          <span>Drag out an area to remove its contents from the canvas.</span>
        </div>
        <br />
        <div className="info-icon move-image"></div>
        <div className="info-description">
          Resize boxes and lines.
          <span>Drag a line to change its size/shape.</span>
        </div>
        <br />
        <div className="info-icon text-image"></div>
        <div className="info-description">
          Type text.
          <span>
            Click and type where you'd like to add text to the canvas.
          </span>
        </div>
        <br />
        <br />
        <div className="info-icon-file drive-image"></div>
        <div className="info-description">
          Save.
          <span>Connect to Google Drive to save your work automatically.</span>
        </div>
        <br />
        <div className="info-icon-file export-image"></div>
        <div className="info-description">
          Export. <span>Copy your work to use it outside of ASCIIFlow.</span>
        </div>
        <br />
        <div className="info-icon-file import-image"></div>
        <div className="info-description">
          Import. <span>Paste ASCII/text to import it onto the canvas.</span>
        </div>
        <br />
        <div className="info-icon-file clear-image"></div>
        <div className="info-description">
          Clear.
          <span>
            Remove the entire contents from the canvas. Can be undone.
          </span>
        </div>
        <br />
        <div className="info-icon-file undo-image"></div>
        <div className="info-description">
          Undo. <br />
          <span>Made a mistake? Undo!</span>
        </div>
        <br />
        <div className="info-icon-file redo-image"></div>
        <div className="info-description">
          Redo. <br />
          <span>Too many Undo's? Redo!</span>
        </div>
        <br />
        <br />
        <div>
          File issues as bugs
          <a href="https://github.com/lewish/asciiflow2/issues" target="_blank">
            here
          </a>
          .
        </div>
        <br />
        <div>
          Return to the original
          <a href="http://stable.ascii-flow.appspot.com/">ASCIIFlow</a>.
        </div>
        <br />
        Developed by
        <a href="https://plus.google.com/+LewisHemens/about">Lewis</a>, Designed
        by <a href="mailto:info@samirvine.co.uk">Sam</a> and
        <a href="mailto:ryangilbanks@gmail.com">Ryan</a>.
        <br />
        <br />
        <div className="dialog-button-bar">
          <Button
            className="close-dialog-button"
            onClick={() => setAnchorEl(null)}
          >
            Close
          </Button>
        </div>
      </Popover>
    </>
  );
};
