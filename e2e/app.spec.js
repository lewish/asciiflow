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
