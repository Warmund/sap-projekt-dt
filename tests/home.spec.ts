import { expect, test } from "@playwright/test";

test("shows the application header above empty content without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("SAP Projekt");
  await expect(page.locator("main")).toBeEmpty();
  await expect(page.getByRole("heading", { name: "SAP-Project-DT" })).toBeVisible();
  expect(errors).toEqual([]);
});
