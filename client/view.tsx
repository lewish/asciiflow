import * as constants from "#asciiflow/client/constants";
import { FONT_SPEC, CHAR_BASELINE } from "#asciiflow/client/font";
import { store, useAppStore, ToolMode } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";
import * as React from "react";
import { useEffect, useState, useCallback } from "react";

/**
 * Handles view operations, state and management of the screen.
 */

/** Counter incremented after each actual canvas paint. */
export let renderedVersion = 0;

function getColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    background: style.getPropertyValue("--color-canvas-bg").trim() || "#eceff4",
    grid: style.getPropertyValue("--color-canvas-grid").trim() || "#d8dee9",
    text: style.getPropertyValue("--color-canvas-text").trim() || "#2e3440",
    highlight: style.getPropertyValue("--color-canvas-highlight").trim() || "#e5e9f0",
    selection: style.getPropertyValue("--color-canvas-selection").trim() || "#81a1c1",
  };
}

export function setCanvasCursor(cursor: string) {
  const element = document.getElementById("ascii-canvas");
  if (element) {
    element.style.cursor = cursor;
  }
}

export const View = ({ ...rest }: React.HTMLAttributes<HTMLCanvasElement>) => {
  const darkMode = useAppStore((s) => s.darkMode);
  const showGrid = useAppStore((s) => s.showGrid);
  const canvasVersion = useAppStore((s) => s.canvasVersion);
  const route = useAppStore((s) => s.route);

  const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
  const [dims, setDims] = useState({
    w: document.documentElement.clientWidth,
    h: document.documentElement.clientHeight,
  });

  const colors = getColors();

  useEffect(() => {
    const canvas = document.getElementById(
      "ascii-canvas"
    ) as HTMLCanvasElement;
    render(canvas);
  });

  useEffect(() => {
    const handler = () => {
      setDims({
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
      });
    };
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  return (
    <canvas
      width={dims.w * dpr}
      height={dims.h * dpr}
      tabIndex={0}
      style={{
        backgroundColor: colors.background,
        touchAction: "none",
        position: "fixed",
        left: 0,
        top: 0,
        width: dims.w,
        height: dims.h,
      }}
      id="ascii-canvas"
      {...rest}
    />
  );
};

/**
 * Renders the given state to the canvas.
 * TODO: Room for efficiency here still. Drawing should be incremental,
 *       however performance is currently very acceptable on test devices.
 */
function render(canvas: HTMLCanvasElement) {
  const committed = store.currentCanvas.committed;
  const scratch = store.currentCanvas.scratch;
  const selection = store.currentCanvas.selection;
  const showGrid = store.showGrid;

  const dpr = window.devicePixelRatio || 1;
  const context = canvas.getContext("2d");
  context.setTransform(1, 0, 0, 1, 0, 0);
  // Clear the visible area.
  context.clearRect(0, 0, canvas.width, canvas.height);

  const zoom = store.currentCanvas.zoom;
  const offset = store.currentCanvas.offset;

  // Scale for device pixel ratio first, then apply zoom.
  context.scale(dpr * zoom, dpr * zoom);
  // Use CSS dimensions (not canvas.width which includes DPR) for centering.
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;
  context.translate(cssWidth / 2 / zoom, cssHeight / 2 / zoom);

  // Only render grid lines and cells that are visible.
  const startOffset = screenToCell(new Vector(0, 0)).subtract(
    new Vector(constants.RENDER_PADDING_CELLS, constants.RENDER_PADDING_CELLS)
  );
  const endOffset = screenToCell(new Vector(cssWidth, cssHeight)).add(
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

  const colors = getColors();

  // Render the grid.
  if (showGrid) {
    context.lineWidth = 1;
    context.strokeStyle = colors.grid;
    context.beginPath();
    for (let i = startOffset.x; i < endOffset.x; i++) {
      context.moveTo(i * constants.CHAR_PIXELS_H - offset.x, 0 - offset.y);
      context.lineTo(
        i * constants.CHAR_PIXELS_H - offset.x,
        2000 * constants.CHAR_PIXELS_V - offset.y
      );
    }
    for (let j = startOffset.y; j < endOffset.y; j++) {
      context.moveTo(0 - offset.x, j * constants.CHAR_PIXELS_V - offset.y);
      context.lineTo(
        2000 * constants.CHAR_PIXELS_H - offset.x,
        j * constants.CHAR_PIXELS_V - offset.y
      );
    }
    context.stroke();
  }
  context.font = FONT_SPEC;

  function highlight(position: Vector, color: string) {
    context.fillStyle = color;
    context.fillRect(
      position.x * constants.CHAR_PIXELS_H - offset.x + 0.5,
      (position.y - 1) * constants.CHAR_PIXELS_V - offset.y + 0.5,
      constants.CHAR_PIXELS_H - 1,
      constants.CHAR_PIXELS_V - 1
    );
  }

  function text(position: Vector, value: string) {
    if (value !== null && value !== "" && value !== " ") {
      context.fillStyle = colors.text;
      context.fillText(
        value,
        position.x * constants.CHAR_PIXELS_H - offset.x,
        (position.y - 1) * constants.CHAR_PIXELS_V - offset.y + CHAR_BASELINE
      );
    }
  }

  if (!!selection) {
    // Fill the selection box.
    const topLeft = selection.topLeft();
    const bottomRight = selection.bottomRight();
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
      for (let y = topLeft.y; y <= bottomRight.y; y++) {
        highlight(new Vector(x, y), colors.selection);
      }
    }
  }
  for (const [position, value] of committed.entries()) {
    const cellValue = committed.get(position);
    text(position, cellValue);
  }
  for (const [position] of scratch.entries()) {
    highlight(position, colors.highlight);
    const cellValue = scratch.get(position);
    text(position, cellValue);
  }

  // Show dimensions label while dragging with box, line, or arrow tools.
  const toolMode = store.selectedToolMode;
  if (
    scratch.size() > 0 &&
    (toolMode === ToolMode.BOX ||
      toolMode === ToolMode.LINES ||
      toolMode === ToolMode.ARROWS ||
      toolMode === ToolMode.SELECT)
  ) {
    const scratchKeys = scratch.keys();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const key of scratchKeys) {
      if (key.x < minX) minX = key.x;
      if (key.x > maxX) maxX = key.x;
      if (key.y < minY) minY = key.y;
      if (key.y > maxY) maxY = key.y;
    }
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const label = `${w}\u00d7${h}`;

    // Position the label just below and right of the scratch bounds.
    const labelX = (maxX + 1) * constants.CHAR_PIXELS_H - offset.x + 4;
    const labelY = (maxY) * constants.CHAR_PIXELS_V - offset.y + 4;

    context.font = FONT_SPEC;
    const metrics = context.measureText(label);
    const padding = 3;
    const bgX = labelX - padding;
    const bgY = labelY - constants.CHAR_PIXELS_V + padding;
    const bgW = metrics.width + padding * 2;
    const bgH = constants.CHAR_PIXELS_V;

    context.fillStyle = colors.selection;
    context.fillRect(bgX, bgY, bgW, bgH);
    context.fillStyle = colors.background;
    context.fillText(label, labelX, labelY);
  }

  if (!!selection) {
    // Outline the selection box.
    const topLeft = selection.topLeft();
    const bottomRight = selection.bottomRight();
    context.lineWidth = 1;
    context.strokeStyle = colors.selection;
    context.beginPath();
    context.moveTo(
      topLeft.x * constants.CHAR_PIXELS_H - offset.x,
      (topLeft.y - 1) * constants.CHAR_PIXELS_V - offset.y
    );
    context.lineTo(
      topLeft.x * constants.CHAR_PIXELS_H - offset.x,
      bottomRight.y * constants.CHAR_PIXELS_V - offset.y
    );
    context.lineTo(
      (bottomRight.x + 1) * constants.CHAR_PIXELS_H - offset.x,
      bottomRight.y * constants.CHAR_PIXELS_V - offset.y
    );
    context.lineTo(
      (bottomRight.x + 1) * constants.CHAR_PIXELS_H - offset.x,
      (topLeft.y - 1) * constants.CHAR_PIXELS_V - offset.y
    );
    context.lineTo(
      topLeft.x * constants.CHAR_PIXELS_H - offset.x,
      (topLeft.y - 1) * constants.CHAR_PIXELS_V - offset.y
    );
    context.stroke();
  }
  renderedVersion++;
}

/**
 * Given a screen coordinate, find the frame coordinates.
 */
export function screenToFrame(vector: Vector) {
  const zoom = store.currentCanvas.zoom;
  const offset = store.currentCanvas.offset;
  return new Vector(
    (vector.x - document.documentElement.clientWidth / 2) / zoom + offset.x,
    (vector.y - document.documentElement.clientHeight / 2) / zoom + offset.y
  );
}

/**
 * Given a frame coordinate, find the screen coordinates.
 */
export function frameToScreen(vector: Vector) {
  const zoom = store.currentCanvas.zoom;
  const offset = store.currentCanvas.offset;
  return new Vector(
    (vector.x - offset.x) * zoom + document.documentElement.clientWidth / 2,
    (vector.y - offset.y) * zoom + document.documentElement.clientHeight / 2
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
