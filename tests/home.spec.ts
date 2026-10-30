import { expect, test } from "@playwright/test";

test("redirects unauthenticated visitors to the login page", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "SAP-Project-DT" })).toBeVisible();
  await expect(page.getByLabel("Benutzername")).toBeVisible();
  await expect(page.getByLabel("Passwort")).toBeVisible();
  expect(errors).toEqual([]);
});
