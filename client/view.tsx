import * as constants from "asciiflow/client/constants";
import { store } from "asciiflow/client/store";
import { Vector } from "asciiflow/client/vector";
import { useObserver } from "mobx-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { autorun } from "mobx";

/**
 * Handles view operations, state and management of the screen.
 */

export const View = ({ ...rest }: React.HTMLAttributes<HTMLCanvasElement>) =>
  useObserver(() => {
    useEffect(() => {
      const canvas = document.getElementById(
        "ascii-canvas"
      ) as HTMLCanvasElement;
      const disposer = autorun(() => render(canvas));
      return () => disposer();
    });

    // Add an cleanup an event listener on the window.
    useEffect(() => {
      const handler = () => {
        const canvas = document.getElementById(
          "ascii-canvas"
        ) as HTMLCanvasElement;
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;
        render(canvas);
      };
      window.addEventListener("resize", handler);
      return () => {
        window.removeEventListener("resize", handler);
      };
    });
    return (
      <canvas
        width={document.documentElement.clientWidth}
        height={document.documentElement.clientHeight}
        style={{ cursor: store.currentCursor }}
        id="ascii-canvas"
        {...rest}
      />
    );
  });

/**
 * Renders the given state to the canvas.
 * TODO: Room for efficiency here still. Drawing should be incremental,
 *       however performance is currently very acceptable on test devices.
 */
function render(canvas: HTMLCanvasElement) {
  const comitted = store.canvas.committed;
  const scratch = store.canvas.scratch;

  const context = canvas.getContext("2d");
  context.setTransform(1, 0, 0, 1, 0, 0);
  // Clear the visible area.
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.scale(store.zoom, store.zoom);
  context.translate(
    canvas.width / 2 / store.zoom,
    canvas.height / 2 / store.zoom
  );

  // Only render grid lines and cells that are visible.
  const startOffset = screenToCell(new Vector(0, 0)).subtract(
    new Vector(constants.RENDER_PADDING_CELLS, constants.RENDER_PADDING_CELLS)
  );
  const endOffset = screenToCell(new Vector(canvas.width, canvas.height)).add(
    new Vector(constants.RENDER_PADDING_CELLS, constants.RENDER_PADDING_CELLS)
  );

  startOffset.x = Math.max(
    0,
    Math.min(startOffset.x, constants.MAX_GRID_WIDTH)
  );
  endOffset.x = Math.max(0, Math.min(endOffset.x, constants.MAX_GRID_WIDTH));
  startOffset.y = Math.max(
    0,
    Math.min(startOffset.y, constants.MAX_GRID_HEIGHT)
  );
  endOffset.y = Math.max(0, Math.min(endOffset.y, constants.MAX_GRID_HEIGHT));

  // Render the grid.
  context.lineWidth = 1;
  context.strokeStyle = "#EEEEEE";
  context.beginPath();
  for (let i = startOffset.x; i < endOffset.x; i++) {
    context.moveTo(
      i * constants.CHAR_PIXELS_H - store.offset.x,
      0 - store.offset.y
    );
    context.lineTo(
      i * constants.CHAR_PIXELS_H - store.offset.x,
      2000 * constants.CHAR_PIXELS_V - store.offset.y
    );
  }
  for (let j = startOffset.y; j < endOffset.y; j++) {
    context.moveTo(
      0 - store.offset.x,
      j * constants.CHAR_PIXELS_V - store.offset.y
    );
    context.lineTo(
      2000 * constants.CHAR_PIXELS_H - store.offset.x,
      j * constants.CHAR_PIXELS_V - store.offset.y
    );
  }
  context.stroke();
  context.font = "15px Courier New";
  for (let i = startOffset.x; i < endOffset.x; i++) {
    for (let j = startOffset.y; j < endOffset.y; j++) {
      const position = new Vector(i, j);
      const value = comitted.get(position);
      const scratchValue = scratch.get(position);
      // Highlight the cell if it is special (grey) or it is part
      // of a visible edit (blue).
      if (constants.ALL_SPECIAL_VALUES.includes(value) || scratchValue) {
        context.fillStyle = scratchValue ? "#DEF" : "#F5F5F5";
        context.fillRect(
          i * constants.CHAR_PIXELS_H - store.offset.x,
          (j - 1) * constants.CHAR_PIXELS_V - store.offset.y,
          constants.CHAR_PIXELS_H,
          constants.CHAR_PIXELS_V
        );
      }
      const cellValue = store.canvas.getDrawValue(new Vector(i, j));
      if (cellValue != null) {
        context.fillStyle = "#000000";
        context.fillText(
          cellValue,
          i * constants.CHAR_PIXELS_H - store.offset.x,
          j * constants.CHAR_PIXELS_V - store.offset.y - 3
        );
      }
    }
  }
}

/**
 * Given a screen coordinate, find the frame coordinates.
 */
export function screenToFrame(vector: Vector) {
  return new Vector(
    (vector.x - document.documentElement.clientWidth / 2) / store.zoom +
      store.offset.x,
    (vector.y - document.documentElement.clientHeight / 2) / store.zoom +
      store.offset.y
  );
}

/**
 * Given a frame coordinate, find the screen coordinates.
 */
export function frameToScreen(vector: Vector) {
  return new Vector(
    (vector.x - store.offset.x) * store.zoom +
      document.documentElement.clientWidth / 2,
    (vector.y - store.offset.y) * store.zoom +
      document.documentElement.clientHeight / 2
  );
}

/**
 * Given a frame coordinate, return the indices for the nearest cell.
 */
export function frameToCell(vector: Vector) {
  // We limit the edges in a bit, as most drawing needs a full context to work.
  return new Vector(
    Math.min(
      Math.max(
        1,
        Math.round(
          (vector.x - constants.CHAR_PIXELS_H / 2) / constants.CHAR_PIXELS_H
        )
      ),
      constants.MAX_GRID_WIDTH - 2
    ),
    Math.min(
      Math.max(
        1,
        Math.round(
          (vector.y + constants.CHAR_PIXELS_V / 2) / constants.CHAR_PIXELS_V
        )
      ),
      constants.MAX_GRID_HEIGHT - 2
    )
  );
}

/**
 * Given a cell coordinate, return the frame coordinates.
 */
export function cellToFrame(vector: Vector) {
  return new Vector(
    Math.round(vector.x * constants.CHAR_PIXELS_H),
    Math.round(vector.y * constants.CHAR_PIXELS_V)
  );
}

/**
 * Given a screen coordinate, return the indices for the nearest cell.
 */
export function screenToCell(vector: Vector) {
  return frameToCell(screenToFrame(vector));
}

/**
 * Given a cell coordinate, return the on screen coordinates.
 */
export function cellToScreen(vector: Vector) {
  return frameToScreen(cellToFrame(vector));
}
