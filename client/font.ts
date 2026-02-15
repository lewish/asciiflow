/**
 * Font configuration and measurement for the canvas.
 *
 * We load Source Code Pro (or fall back to monospace) and measure the actual
 * character cell size at startup so the grid, hit-testing, and text rendering
 * all agree on exact pixel dimensions.
 */

export const FONT_FAMILY = "'Source Code Pro', monospace";
export const FONT_SIZE = 15;
export const FONT_SPEC = `${FONT_SIZE}px ${FONT_FAMILY}`;

/** Measured character cell dimensions — set by `initFont()`. */
export let CHAR_PIXELS_H = 9; // sensible defaults until measured
export let CHAR_PIXELS_V = 18;
/** Baseline offset: distance from top of cell to the text baseline. */
export let CHAR_BASELINE = 14;

/**
 * Snap a zoom level so that `zoom * CHAR_PIXELS_V` is an integer.
 * This prevents sub-pixel gaps between adjacent cells at certain zooms.
 */
export function snapZoom(zoom: number): number {
  return Math.round(zoom * CHAR_PIXELS_V) / CHAR_PIXELS_V;
}

/**
 * Load the canvas font and measure character cell dimensions.
 * Must be called (and awaited) before the first render.
 */
export async function initFont(): Promise<void> {
  // Wait for the font to be available (loaded via @font-face in index.html).
  // Falls back after timeout — the monospace fallback still works.
  try {
    await Promise.race([
      document.fonts.load(FONT_SPEC),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch {
    // Font loading not supported or failed — continue with fallback.
  }

  // Measure using an off-screen canvas.
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = FONT_SPEC;

  // Width: monospace fonts have uniform advance width.
  const metrics = ctx.measureText("M");
  CHAR_PIXELS_H = Math.ceil(metrics.width);

  // Height: box-drawing characters (│, ┌, etc.) often extend beyond the
  // font's em-box so they tile seamlessly. Measure the actual rendered
  // extents of │ to get the true cell height needed to avoid overlap.
  const boxMetrics = ctx.measureText("│");
  if (
    boxMetrics.actualBoundingBoxAscent !== undefined &&
    boxMetrics.actualBoundingBoxDescent !== undefined
  ) {
    const ascent = Math.ceil(boxMetrics.actualBoundingBoxAscent);
    const descent = Math.ceil(boxMetrics.actualBoundingBoxDescent);
    CHAR_PIXELS_V = ascent + descent;
    CHAR_BASELINE = ascent;
  } else if (
    metrics.fontBoundingBoxAscent !== undefined &&
    metrics.fontBoundingBoxDescent !== undefined
  ) {
    CHAR_PIXELS_V = Math.ceil(
      metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
    );
    CHAR_BASELINE = Math.ceil(metrics.fontBoundingBoxAscent);
  } else {
    // Fallback: estimate from font size.
    CHAR_PIXELS_V = Math.ceil(FONT_SIZE * 1.2);
    CHAR_BASELINE = Math.round(FONT_SIZE);
  }
}
