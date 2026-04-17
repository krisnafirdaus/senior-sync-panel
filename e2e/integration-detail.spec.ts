import { test, expect } from "@playwright/test";

const mockSyncResponse = {
  code: "SUCCESS",
  message: "successfully retrieve the data",
  data: {
    sync_approval: {
      application_name: "Slack",
      changes: [
        {
          id: "change_test_001",
          field_name: "user.status",
          change_type: "UPDATE",
          current_value: "active",
          new_value: "suspended",
        },
      ],
    },
    metadata: {},
  },
};

const mockConflictResponse = {
  code: "SUCCESS",
  message: "successfully retrieve the data",
  data: {
    sync_approval: {
      application_name: "HubSpot",
      changes: [
        {
          id: "change_conflict_001",
          field_name: "user.email",
          change_type: "UPDATE",
          current_value: "john@company.com",
          new_value: "j.smith@newdomain.com",
        },
      ],
    },
    metadata: {},
  },
};

test.describe("Integration detail - Sync Now", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("happy path: sync preview then apply clean changes", async ({ page }) => {
    await page.route("https://portier-takehometest.onrender.com/api/v1/data/sync**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSyncResponse),
      });
    });

    await page.goto("/integrations/slack/");

    await page.getByRole("button", { name: "Sync Now" }).click();

    // Preview should appear
    await expect(page.getByRole("heading", { name: "Sync Preview" })).toBeVisible();
    await expect(page.getByText("user.status")).toBeVisible();

    // Apply clean changes
    await page.getByRole("button", { name: "Apply Changes" }).click();

    // After apply, status badge should be Synced
    await expect(page.getByText("Synced").first()).toBeVisible();

    // History should show the new event
    await expect(page.getByText("1 change").first()).toBeVisible();
  });

  test("conflict path: shows conflict resolver and allows resolution", async ({ page }) => {
    await page.route("https://portier-takehometest.onrender.com/api/v1/data/sync**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockConflictResponse),
      });
    });

    await page.goto("/integrations/hubspot/");

    await page.getByRole("button", { name: "Sync Now" }).click();

    // Wait for conflict UI
    await expect(page.getByText("Conflicts Detected")).toBeVisible();
    await expect(page.getByText("user.email")).toBeVisible();

    // Default is Local; choose External value
    await page.getByRole("button", { name: /External/i }).first().click();

    // Resolve
    await page.getByRole("button", { name: "Resolve & Continue" }).click();

    // Should return to synced
    await expect(page.getByText("Synced").first()).toBeVisible();
  });

  test("back navigation works", async ({ page }) => {
    await page.goto("/integrations/slack/");
    await page.getByRole("link", { name: /Back to Integrations/i }).click();
    await expect(page.getByRole("heading", { name: "Integrations" })).toBeVisible();
  });
});
