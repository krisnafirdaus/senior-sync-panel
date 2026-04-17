import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("displays integrations list", async ({ page }) => {
    await page.reload();
    await expect(page.getByRole("heading", { name: "Integrations" })).toBeVisible();

    await expect(page.getByText("Salesforce")).toBeVisible();
    await expect(page.getByText("HubSpot")).toBeVisible();
    await expect(page.getByText("Stripe")).toBeVisible();
    await expect(page.getByText("Slack")).toBeVisible();
  });

  test("navigates to integration detail", async ({ page }) => {
    await page.reload();
    await page.getByRole("link", { name: /HubSpot/i }).click();
    await expect(page.getByRole("heading", { name: "HubSpot" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sync Now" })).toBeVisible();
  });

  test("search filters integrations", async ({ page }) => {
    await page.reload();
    const search = page.getByPlaceholder("Search integrations...");
    await search.fill("slack");
    await expect(page.getByText("Slack")).toBeVisible();
    await expect(page.getByText("Salesforce")).not.toBeVisible();
  });

  test("status filter works", async ({ page }) => {
    await page.reload();
    const select = page.locator("select");
    await select.selectOption("error");
    await expect(page.getByText("Stripe")).toBeVisible();
    await expect(page.getByText("Slack")).not.toBeVisible();
  });
});
