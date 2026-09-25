import { expect, test } from "@playwright/test";

test("todo add, edit, and delete persist across reloads", async ({ page }) => {
  const title = `e2e-todo-${Date.now()}`;
  const editedTitle = `${title}-edited`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pokedachi" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Prisma setup test" }),
  ).toHaveCount(0);

  await page.getByRole("textbox", { name: "Title" }).fill(title);
  await page.getByRole("button", { name: "Add" }).click();
  await expect(
    page.getByRole("listitem").filter({ hasText: title }),
  ).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByRole("listitem").filter({ hasText: title }),
  ).toBeVisible();

  await page
    .getByRole("listitem")
    .filter({ hasText: title })
    .getByRole("button", { name: "Edit" })
    .click();
  const editingRow = page.getByRole("listitem").filter({
    has: page.getByRole("button", { name: "Save" }),
  });
  await editingRow.getByRole("textbox", { name: "Title" }).fill(editedTitle);
  await editingRow.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByRole("listitem").filter({ hasText: editedTitle }),
  ).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByRole("listitem").filter({ hasText: editedTitle }),
  ).toBeVisible();

  await page
    .getByRole("listitem")
    .filter({ hasText: editedTitle })
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(
    page.getByRole("listitem").filter({ hasText: editedTitle }),
  ).toHaveCount(0);

  await page.goto("/");
  await expect(
    page.getByRole("listitem").filter({ hasText: editedTitle }),
  ).toHaveCount(0);
});
