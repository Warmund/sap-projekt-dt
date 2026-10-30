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
  const logo = page.getByRole("img", { name: "SAP", exact: true });
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "SSO", exact: true })).toBeDisabled();
  await page.screenshot({ path: ".scratch/login-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: ".scratch/login-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});
