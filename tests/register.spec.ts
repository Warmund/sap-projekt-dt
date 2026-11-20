import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";

test("authenticated register uses imported database rows after reload", async ({ page }) => {
  test.skip(process.env.RUN_REGISTER_E2E !== "1", "Requires the migrated database and a temporary login.");
  test.setTimeout(120_000);
  const username = `smoke_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const password = randomUUID();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const fixture = (mode: string) => execFileSync(process.execPath, ["--import", "tsx", "tests/helpers/register-fixture.ts", mode], {
    env: { ...process.env, REGISTER_SMOKE_USERNAME: username, REGISTER_SMOKE_PASSWORD: password }, encoding: "utf8",
  });
  try {
    const { partner, count, sr, cloudMissing } = JSON.parse(fixture("create")) as { partner: { bpId: string; name: string; region: string }; count: number; sr: number; cloudMissing: number };
    await page.goto("/login");
    await page.getByLabel("Benutzername").fill(username);
    await page.getByLabel("Passwort", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Anmelden", exact: true }).click();
    await expect(page).toHaveURL("http://127.0.0.1:3000/", { timeout: 60_000 });
    await expect(page.getByRole("heading", { name: "Sanktionsregister", exact: true })).toBeVisible();
    await expect(page.locator('ui5-side-navigation-item[data-key="rg-dashboard"]')).toHaveCount(1);
    await expect(page.locator('ui5-side-navigation-item[data-key="home"], ui5-side-navigation-item[data-key="todos"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Kunden im Register/ }).getByText(String(count), { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Cloud-Kunden ohne Tenant-Daten/ }).getByText(String(cloudMissing), { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /Sonderkategorie SR/ }).click();
    await expect(page.locator("ui5-table-row")).toHaveCount(sr);
    await page.locator('ui5-side-navigation-item[data-key="rg-dashboard"]').click();
    await page.getByRole("button", { name: /Cloud-Kunden ohne Tenant-Daten/ }).click();
    await expect(page.locator("ui5-table-row")).toHaveCount(cloudMissing);
    await page.locator('ui5-side-navigation-item[data-key="rg-dashboard"]').click();
    await page.getByRole("button", { name: /Kunden im Register/ }).click();
    await expect(page.getByRole("heading", { name: `Geschäftspartner (${count})`, exact: true })).toBeVisible();
    await page.getByRole("searchbox", { name: "Suche", exact: true }).or(page.getByRole("textbox", { name: "Suche", exact: true })).fill(partner.bpId);
    await expect(page.getByText(partner.name, { exact: true })).toBeVisible();
    await page.getByText(partner.name, { exact: true }).click();
    await expect(page.getByText("Cloud-Kunde laut Quelldatei.", { exact: false })).toBeVisible();
    await expect(page.getByText(partner.region, { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: partner.name, exact: true })).toBeVisible();
    await expect(page.getByText(partner.region, { exact: true })).toBeVisible();
    await page.locator("ui5-shellbar-branding").click();
    await expect(page.getByRole("heading", { name: "Sanktionsregister", exact: true })).toBeVisible();
    await page.reload();
    await page.locator('ui5-side-navigation-item[data-key="rg-register"]').click();
    await expect(page.getByRole("heading", { name: `Geschäftspartner (${count})`, exact: true })).toBeVisible();
    await page.locator('ui5-side-navigation-item[data-key="rg-contacts"]').click();
    await expect(page.getByText("Noch nicht geprüft", { exact: true }).first()).toBeVisible();
    await page.locator("ui5-shellbar [data-profile-btn]").click();
    await page.locator('ui5-user-menu-item[text="Administration"]').click();
    await expect(page.getByRole("heading", { name: "Administration" })).toBeVisible();
    await page.getByRole("tab", { name: "Cloud-Tenants" }).click();
    await expect(page.getByText(`${cloudMissing} Cloud-Kunden ohne Tenant-Daten.`, { exact: false })).toBeVisible();
    await page.getByRole("tab", { name: "Länder-Kontakte" }).click();
    await expect(page.getByText("Noch nicht geprüft", { exact: true }).first()).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    fixture("cleanup");
  }
});
