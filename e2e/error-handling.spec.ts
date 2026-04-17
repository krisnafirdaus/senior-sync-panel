import { test, expect } from "@playwright/test";

test.describe("Error handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("displays 500 error message", async ({ page }) => {
    await page.route("https://portier-takehometest.onrender.com/api/v1/data/sync", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ code: "ERROR", message: "Internal server error" }),
      });
    });

    await page.goto("/integrations/stripe/");
    await page.getByRole("button", { name: "Sync Now" }).click();

    await expect(page.getByRole("alert").getByText(/Internal server error/i)).toBeVisible();
    await expect(page.getByText("Error").first()).toBeVisible();
  });

  test("displays 502 error message", async ({ page }) => {
    await page.route("https://portier-takehometest.onrender.com/api/v1/data/sync", (route) => {
      route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ code: "ERROR", message: "Bad Gateway" }),
      });
    });

    await page.goto("/integrations/stripe/");
    await page.getByRole("button", { name: "Sync Now" }).click();

    await expect(page.getByRole("alert").getByText(/Integration server is unreachable/i)).toBeVisible();
    await expect(page.getByText("Error").first()).toBeVisible();
  });

  test("displays 4xx error message", async ({ page }) => {
    await page.route("https://portier-takehometest.onrender.com/api/v1/data/sync", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ code: "ERROR", message: "Bad Request" }),
      });
    });

    await page.goto("/integrations/stripe/");
    await page.getByRole("button", { name: "Sync Now" }).click();

    await expect(page.getByRole("alert").getByText(/Missing or invalid configuration/i)).toBeVisible();
    await expect(page.getByText("Error").first()).toBeVisible();
  });
});
