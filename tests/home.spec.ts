import { expect, test } from "@playwright/test";

test("opens an empty page without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("SAP Projekt");
  await expect(page.locator("main")).toBeEmpty();
  expect(await page.locator("body").innerText()).toBe("");
  expect(errors).toEqual([]);
});
