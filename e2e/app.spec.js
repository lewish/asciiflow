import { test, expect } from "@playwright/test";

test("loads the application", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("ASCIIFlow");
});

test("renders the canvas", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
});

test("draw box, export, and copy to clipboard", async ({ page, context }) => {
  // Grant clipboard permissions so navigator.clipboard.writeText works.
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto("/");
  await expect(page).toHaveTitle("ASCIIFlow");

  // The canvas coordinate system centers the grid in the viewport.
  // Default zoom=1, offset centers at cell (1000, 300).
  // Each cell is 9px wide and 16px tall.
  // Pixel offset from viewport center = (cellOffsetX * 9, cellOffsetY * 16).
  const viewport = page.viewportSize();
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;

  // Helper: convert cell offset (relative to grid center) to screen pixel.
  function cellToPixel(cellDx, cellDy) {
    return { x: centerX + cellDx * 9, y: centerY + cellDy * 16 };
  }

  // Select the Box tool.
  await page.getByTestId("tool-boxes").click();

  // Draw a 5x4 box by dragging from cell (-2, -1) to cell (2, 2).
  // This creates a box 5 cells wide and 4 cells tall.
  const start = cellToPixel(-2, -1);
  const end = cellToPixel(2, 2);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y);
  await page.mouse.up();

  // Open the export dialog.
  await page.getByTestId("export-button").click();

  // Wait for the export dialog to appear.
  const dialog = page.getByTestId("export-dialog");
  await expect(dialog).toBeVisible();

  // Read the exported text from the textarea.
  const textarea = page.getByTestId("export-text");
  const exportedText = await textarea.inputValue();

  // A 5-wide, 4-tall box in Unicode should look like:
  //   ┌───┐
  //   │   │
  //   │   │
  //   └───┘
  const expectedLines = [
    "┌───┐",
    "│   │",
    "│   │",
    "└───┘",
  ];

  const actualLines = exportedText.split("\n");
  expect(actualLines).toEqual(expectedLines);

  // Click "Copy to clipboard".
  await page.getByTestId("copy-to-clipboard").click();

  // Verify the clipboard contains the exported text.
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe(exportedText);
});
