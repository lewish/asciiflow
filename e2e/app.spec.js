import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a cell offset (relative to grid center) to a screen pixel coordinate.
 * The canvas centers the grid in the viewport; each cell is 9px wide, 16px tall.
 */
function cellToPixel(viewport, cellDx, cellDy) {
  return {
    x: viewport.width / 2 + cellDx * 9,
    y: viewport.height / 2 + cellDy * 16,
  };
}

/** Read the committed layer as text via the test bridge. */
async function getCommittedText(page) {
  return page.evaluate(() => window.__asciiflow__.getCommittedText());
}

/** Read the render-paint counter (incremented after each actual canvas paint). */
async function getRenderedVersion(page) {
  return page.evaluate(() => window.__asciiflow__.getRenderedVersion());
}

/** Read the number of cells in the committed layer. */
async function getCommittedSize(page) {
  return page.evaluate(() => window.__asciiflow__.getCommittedSize());
}

/** Wait for the canvas to actually repaint after a mutation. */
async function waitForRender(page, previousRenderedVersion) {
  await expect
    .poll(() => getRenderedVersion(page), { timeout: 2000 })
    .toBeGreaterThan(previousRenderedVersion);
}

/** Drag on the canvas from one cell offset to another. */
async function drag(page, fromDx, fromDy, toDx, toDy) {
  const vp = page.viewportSize();
  const start = cellToPixel(vp, fromDx, fromDy);
  const end = cellToPixel(vp, toDx, toDy);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 5 });
  await page.mouse.up();
}

/** Click on a specific cell offset. */
async function clickCell(page, cellDx, cellDy) {
  const vp = page.viewportSize();
  const pos = cellToPixel(vp, cellDx, cellDy);
  await page.mouse.click(pos.x, pos.y);
}

/** Select a tool by test id. */
async function selectTool(page, toolName) {
  await page.getByTestId(`tool-${toolName}`).click();
}

// ---------------------------------------------------------------------------
// Basic tests
// ---------------------------------------------------------------------------

test("loads the application", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("ASCIIFlow");
});

test("renders the canvas", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
});

test("test bridge is available", async ({ page }) => {
  await page.goto("/");
  const version = await getRenderedVersion(page);
  expect(version).toBeGreaterThan(0);
  const text = await getCommittedText(page);
  expect(text).toBe("");
});

// ---------------------------------------------------------------------------
// Box tool
// ---------------------------------------------------------------------------

test("draw a box and verify committed state", async ({ page }) => {
  await page.goto("/");
  await selectTool(page, "boxes");

  const rv = await getRenderedVersion(page);
  await drag(page, -2, -1, 2, 2);
  await waitForRender(page, rv);

  const text = await getCommittedText(page);
  expect(text.split("\n")).toEqual(["┌───┐", "│   │", "│   │", "└───┘"]);
});

test("draw multiple boxes", async ({ page }) => {
  await page.goto("/");
  await selectTool(page, "boxes");

  // First box
  await drag(page, -10, -2, -6, 1);

  const textAfterFirst = await getCommittedText(page);
  expect(textAfterFirst).toContain("┌───┐");

  // Second box (well separated horizontally, same vertical range)
  await drag(page, 6, -2, 10, 1);

  const text = await getCommittedText(page);
  // Both boxes should exist — count corners
  const cornerCount = (text.match(/┌/g) || []).length;
  expect(cornerCount).toBe(2);
});

// ---------------------------------------------------------------------------
// Line tool
// ---------------------------------------------------------------------------

test("draw a line", async ({ page }) => {
  await page.goto("/");
  await selectTool(page, "line");

  const rv = await getRenderedVersion(page);
  await drag(page, -3, 0, 3, 0);
  await waitForRender(page, rv);

  const text = await getCommittedText(page);
  // Horizontal line: should be only horizontal segments
  expect(text.split("\n")).toHaveLength(1);
  // Should span multiple characters
  expect(text.length).toBeGreaterThanOrEqual(5);
  // Every character should be a horizontal line segment
  for (const ch of text) {
    expect("─┼").toContain(ch);
  }
});

// ---------------------------------------------------------------------------
// Arrow tool
// ---------------------------------------------------------------------------

test("draw an arrow", async ({ page }) => {
  await page.goto("/");
  await selectTool(page, "arrow");

  const rv = await getRenderedVersion(page);
  await drag(page, -3, 0, 3, 0);
  await waitForRender(page, rv);

  const text = await getCommittedText(page);
  // Should be a single horizontal line
  expect(text.split("\n")).toHaveLength(1);
  // Should have a shaft of line segments and an arrowhead at the end
  expect(text).toMatch(/[─]+[►>→]/);
});

// ---------------------------------------------------------------------------
// Freeform tool
// ---------------------------------------------------------------------------

test("freeform draw default character", async ({ page }) => {
  await page.goto("/");
  await selectTool(page, "freeform");

  const rv = await getRenderedVersion(page);
  await drag(page, 0, 0, 2, 0);
  await waitForRender(page, rv);

  const text = await getCommittedText(page);
  // Default freeform character is "x", should have placed multiple
  const xCount = (text.match(/x/g) || []).length;
  expect(xCount).toBeGreaterThanOrEqual(2);
});

test("freeform draw trail of characters", async ({ page }) => {
  await page.goto("/");
  await selectTool(page, "freeform");

  // Draw a horizontal trail across 5 cells
  await drag(page, -2, 0, 2, 0);

  const text = await getCommittedText(page);
  const xCount = (text.match(/x/g) || []).length;
  // Dragging across 5 cells should produce at least 3 characters
  expect(xCount).toBeGreaterThanOrEqual(3);
  // Should be a single row
  expect(text.split("\n")).toHaveLength(1);
});

// ---------------------------------------------------------------------------
// Text tool
// ---------------------------------------------------------------------------

test("type text on canvas", async ({ page }) => {
  await page.goto("/");
  await selectTool(page, "text");

  await clickCell(page, 0, 0);

  const rv = await getRenderedVersion(page);
  await page.keyboard.type("Hello");
  await page.keyboard.press("Enter");
  await waitForRender(page, rv);

  const text = await getCommittedText(page);
  expect(text).toBe("Hello");
});

test("type multiline text", async ({ page }) => {
  await page.goto("/");
  await selectTool(page, "text");

  await clickCell(page, 0, 0);

  await page.keyboard.type("AB");
  await page.keyboard.press("Shift+Enter");
  await page.keyboard.type("CD");
  await page.keyboard.press("Enter");

  const text = await getCommittedText(page);
  expect(text.split("\n")).toEqual(["AB", "CD"]);
});

// ---------------------------------------------------------------------------
// Select tool
// ---------------------------------------------------------------------------

test("select and delete region", async ({ page }) => {
  await page.goto("/");

  // First draw a box
  await selectTool(page, "boxes");
  await drag(page, -2, -1, 2, 2);

  const textBefore = await getCommittedText(page);
  expect(textBefore).toContain("┌───┐");

  // Switch to select tool
  await selectTool(page, "select---move");

  // Select the entire box area
  await drag(page, -3, -2, 3, 3);

  // Delete the selection
  const rv = await getRenderedVersion(page);
  await page.keyboard.press("Delete");
  await waitForRender(page, rv);

  const textAfter = await getCommittedText(page);
  expect(textAfter).toBe("");
});

// ---------------------------------------------------------------------------
// Undo / Redo
// ---------------------------------------------------------------------------

test("undo and redo a drawing", async ({ page }) => {
  await page.goto("/");
  await selectTool(page, "boxes");

  await drag(page, -2, -1, 2, 2);
  const textAfterDraw = await getCommittedText(page);
  expect(textAfterDraw.split("\n")).toEqual([
    "┌───┐",
    "│   │",
    "│   │",
    "└───┘",
  ]);

  // Undo
  const rvUndo = await getRenderedVersion(page);
  await page.keyboard.press("Control+z");
  await waitForRender(page, rvUndo);

  const textAfterUndo = await getCommittedText(page);
  expect(textAfterUndo).toBe("");

  // Redo
  const rvRedo = await getRenderedVersion(page);
  await page.keyboard.press("Control+Shift+z");
  await waitForRender(page, rvRedo);

  const textAfterRedo = await getCommittedText(page);
  expect(textAfterRedo.split("\n")).toEqual([
    "┌───┐",
    "│   │",
    "│   │",
    "└───┘",
  ]);
});

// ---------------------------------------------------------------------------
// Canvas rendering responds to store changes
// ---------------------------------------------------------------------------

test("canvas renders after drawing", async ({ page }) => {
  await page.goto("/");
  await selectTool(page, "boxes");

  const rv1 = await getRenderedVersion(page);
  await drag(page, -2, -1, 2, 2);
  await waitForRender(page, rv1);

  const rv2 = await getRenderedVersion(page);
  // Draw a second box
  await drag(page, 5, -1, 9, 2);
  await waitForRender(page, rv2);

  const rv3 = await getRenderedVersion(page);
  // Each drawing action should have caused additional paints
  expect(rv2).toBeGreaterThan(rv1);
  expect(rv3).toBeGreaterThan(rv2);
});

test("canvas committed size matches box perimeter", async ({ page }) => {
  await page.goto("/");
  const sizeBefore = await getCommittedSize(page);
  expect(sizeBefore).toBe(0);

  await selectTool(page, "boxes");
  // Draw a 5-wide x 4-tall box (cells -2..2 x -1..2)
  await drag(page, -2, -1, 2, 2);

  const sizeAfter = await getCommittedSize(page);
  // 5x4 box border = 2*(5+4) - 4 corners counted once = 14 cells
  expect(sizeAfter).toBe(14);
});

// ---------------------------------------------------------------------------
// Dark mode toggle
// ---------------------------------------------------------------------------

test("toggle dark mode", async ({ page }) => {
  await page.goto("/");

  // Verify starts in light mode
  const darkBefore = await page.evaluate(() =>
    window.__asciiflow__.getDarkMode()
  );
  expect(darkBefore).toBe(false);

  const canvas = page.locator("canvas");
  const bgBefore = await canvas.evaluate((el) => el.style.backgroundColor);
  expect(bgBefore).toBe("rgb(255, 255, 255)");

  // Toggle dark mode via bridge
  const rv = await getRenderedVersion(page);
  await page.evaluate(() => window.__asciiflow__.setDarkMode(true));
  await waitForRender(page, rv);

  const darkAfter = await page.evaluate(() =>
    window.__asciiflow__.getDarkMode()
  );
  expect(darkAfter).toBe(true);

  // Canvas background should be dark (#333 = rgb(51, 51, 51))
  const bgAfter = await canvas.evaluate((el) => el.style.backgroundColor);
  expect(bgAfter).toBe("rgb(51, 51, 51)");
});

// ---------------------------------------------------------------------------
// Export with box tool
// ---------------------------------------------------------------------------

test("draw box, export, and copy to clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto("/");
  await expect(page).toHaveTitle("ASCIIFlow");

  await selectTool(page, "boxes");
  await drag(page, -2, -1, 2, 2);

  // Verify via test bridge
  const committedText = await getCommittedText(page);
  expect(committedText.split("\n")).toEqual([
    "┌───┐",
    "│   │",
    "│   │",
    "└───┘",
  ]);

  // Verify via export dialog
  await page.getByTestId("export-button").click();
  const dialog = page.getByTestId("export-dialog");
  await expect(dialog).toBeVisible();

  const textarea = page.getByTestId("export-text");
  const exportedText = await textarea.inputValue();
  expect(exportedText.split("\n")).toEqual([
    "┌───┐",
    "│   │",
    "│   │",
    "└───┘",
  ]);

  // Copy to clipboard
  await page.getByTestId("copy-to-clipboard").click();
  const clipboardText = await page.evaluate(() =>
    navigator.clipboard.readText()
  );
  expect(clipboardText).toBe(exportedText);
});

// ---------------------------------------------------------------------------
// Tool switching via keyboard shortcuts
// ---------------------------------------------------------------------------

test("alt+number switches tools", async ({ page }) => {
  await page.goto("/");

  // Click on the canvas to ensure focus is within #root for keyboard events
  await clickCell(page, 0, 0);

  // alt+1 = BOX(1), alt+2 = SELECT(2), alt+3 = FREEFORM(3),
  // alt+4 = ARROWS(6), alt+5 = LINES(4), alt+6 = TEXT(7)

  let mode = await page.evaluate(() => window.__asciiflow__.getToolMode());
  expect(mode).toBe(1); // BOX

  await page.keyboard.press("Alt+6");
  mode = await page.evaluate(() => window.__asciiflow__.getToolMode());
  expect(mode).toBe(7); // TEXT

  await page.keyboard.press("Alt+2");
  mode = await page.evaluate(() => window.__asciiflow__.getToolMode());
  expect(mode).toBe(2); // SELECT

  await page.keyboard.press("Alt+3");
  mode = await page.evaluate(() => window.__asciiflow__.getToolMode());
  expect(mode).toBe(3); // FREEFORM

  await page.keyboard.press("Alt+4");
  mode = await page.evaluate(() => window.__asciiflow__.getToolMode());
  expect(mode).toBe(6); // ARROWS

  await page.keyboard.press("Alt+5");
  mode = await page.evaluate(() => window.__asciiflow__.getToolMode());
  expect(mode).toBe(4); // LINES

  await page.keyboard.press("Alt+1");
  mode = await page.evaluate(() => window.__asciiflow__.getToolMode());
  expect(mode).toBe(1); // BOX
});

// ---------------------------------------------------------------------------
// Composite: draw with multiple tools
// ---------------------------------------------------------------------------

test("draw box then add text inside", async ({ page }) => {
  await page.goto("/");

  // Draw a large box
  await selectTool(page, "boxes");
  await drag(page, -4, -2, 4, 2);

  // Switch to text tool and type inside the box
  await selectTool(page, "text");
  await clickCell(page, -2, 0);
  await page.keyboard.type("Hi!");
  await page.keyboard.press("Enter");

  const text = await getCommittedText(page);
  expect(text).toContain("Hi!");
  expect(text).toContain("┌───────┐");
  expect(text).toContain("└───────┘");
});

test("draw box then arrow into it", async ({ page }) => {
  await page.goto("/");

  // Draw a box on the right side
  await selectTool(page, "boxes");
  await drag(page, 2, -1, 6, 2);

  // Draw an arrow pointing into the box from the left
  await selectTool(page, "arrow");
  await drag(page, -3, 0, 1, 0);

  const text = await getCommittedText(page);
  // Should have the box structure
  expect(text).toContain("┌───┐");
  expect(text).toContain("└───┘");
  // Should have an arrow shaft and arrowhead
  expect(text).toMatch(/[─]+[►>→]/);
});

// ---------------------------------------------------------------------------
// Zoom (mouse wheel)
// ---------------------------------------------------------------------------

test("mouse wheel changes zoom", async ({ page }) => {
  await page.goto("/");

  const initialZoom = await page.evaluate(() =>
    window.__asciiflow__.getZoom()
  );
  expect(initialZoom).toBe(1);

  // Draw a box first so we have content
  await selectTool(page, "boxes");
  await drag(page, -2, -1, 2, 2);

  const rv = await getRenderedVersion(page);

  // Scroll to zoom in
  const vp = page.viewportSize();
  await page.mouse.move(vp.width / 2, vp.height / 2);
  await page.mouse.wheel(0, -300);

  // Wait for the canvas to actually repaint
  await waitForRender(page, rv);

  const newZoom = await page.evaluate(() =>
    window.__asciiflow__.getZoom()
  );
  expect(newZoom).toBeGreaterThan(1);

  // Content should still be there
  const text = await getCommittedText(page);
  expect(text.split("\n")).toEqual(["┌───┐", "│   │", "│   │", "└───┘"]);
});

// ---------------------------------------------------------------------------
// Sidebar collapse / expand
// ---------------------------------------------------------------------------

test("sidebar can be collapsed and expanded", async ({ page }) => {
  await page.goto("/");

  // The "File" text should be visible when controls are open
  await expect(page.getByText("File")).toBeVisible();

  // Click the collapse button — it's the IconButton with ChevronLeft SVG
  // in the drawer header. Find it by the logo image's sibling button.
  await page.locator('img[src="/public/logo_full.svg"]').locator("..").locator("button").click();

  // After collapsing, "File" should not be visible
  await expect(page.getByText("File")).not.toBeVisible();

  // The FAB button with the small logo should now be visible
  const fab = page.locator('img[src="/public/logo_min.svg"]');
  await expect(fab).toBeVisible();

  // Click the FAB to re-open
  await fab.click();

  // "File" should be visible again
  await expect(page.getByText("File")).toBeVisible();
});
