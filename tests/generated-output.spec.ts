import { test, expect } from "@playwright/test";

test("user can generate a Wordle activity", async ({ page }) => {
  await page.goto("/wordle");

  await page.getByLabel("Phoneme word").fill("tʃ ɪ p");
  await page.getByLabel("English equivalent").fill("chip");

  const downloadPromise = page.waitForEvent("download");

  await page
    .getByRole("button", { name: "Generate HTML" })
    .click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe(
    "phoneme-wordle.html"
  );

  await expect(
    page.getByText("Playable Preview")
  ).toBeVisible();

  await expect(
    page.getByText("tʃ ɪ p")
  ).toBeVisible();
});