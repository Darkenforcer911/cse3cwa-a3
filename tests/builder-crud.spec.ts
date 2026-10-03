import { test, expect } from "@playwright/test";

test("teacher can create, edit and delete a word", async ({
  page,
  request,
}) => {
  const activityName = `Playwright CRUD ${Date.now()}`;

  // Create a clean activity for this test
  const createResponse = await request.post("/api/activities", {
    data: {
      name: activityName,
      type: "WORD_SEARCH",
      difficulty: "medium",
      showHints: true,
      gridSize: 9,
      words: [
        {
          englishWord: "thin",
          hint: null,
          phonemes: ["θ", "ɪ", "n"],
        },
      ],
    },
  });

  expect(createResponse.ok()).toBeTruthy();

  const activity = await createResponse.json();

  // Handle prompts in the order they appear
  const answers = [
    "church",
    "tʃ ɜː tʃ",
    "church-test",
    "tʃ ɜː tʃ",
  ];

  page.on("dialog", async (dialog) => {
    if (dialog.type() === "confirm") {
      await dialog.accept();
      return;
    }

    const answer = answers.shift() ?? "";
    await dialog.accept(answer);
  });

  try {
    await page.goto("/activities");

    const card = page
      .locator(".builder-panel")
      .filter({
        has: page.getByRole("heading", {
          name: activityName,
        }),
      });

    await expect(card).toBeVisible();

    // CREATE
    await card
      .getByRole("button", { name: "Add Word" })
      .click();

    await expect(
      card.getByText("church", { exact: true })
    ).toBeVisible();

    // UPDATE
    await card
      .getByRole("button", { name: "Edit Word" })
      .last()
      .click();

    await expect(
      card.getByText("church-test", { exact: true })
    ).toBeVisible();

    // DELETE
    await card
      .getByRole("button", { name: "Delete Word" })
      .last()
      .click();

    await expect(
      card.getByText("church-test", { exact: true })
    ).toHaveCount(0);

    // Confirm deletion persisted
    await page.reload();

    await expect(
      page.getByText("church-test", { exact: true })
    ).toHaveCount(0);
  } finally {
    // Remove the test activity afterwards
    await request.delete(`/api/activities/${activity.id}`);
  }
});