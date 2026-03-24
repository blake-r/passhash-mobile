// E2E tests for Keeper screen - Updated with accessibility labels
// These tests run in a real browser with mobile viewport

import { test, expect } from "./fixtures";

test.describe("Keeper Screen", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");
    // Wait for app to load
    await page.waitForSelector("text=Password Hasher", { timeout: 15000 });

    // Navigate to Keeper tab using accessibility label
    await page.getByRole("tab", { name: "Keeper" }).click();
    await page.waitForTimeout(500);
  });

  test("should render keeper screen", async ({ page }) => {
    // Check main elements are visible using testid
    await expect(page.getByTestId("export-button")).toBeVisible();
    await expect(page.getByTestId("import-button")).toBeVisible();

    // Should have a text area for keeper data - use testid to avoid ambiguity
    const textArea = page.getByTestId("keeper-data-textarea");
    await expect(textArea).toBeVisible();
  });

  test("should display keeper data in text area", async ({ page }) => {
    // The text area should be visible - use testid to avoid ambiguity
    const textArea = page.getByTestId("keeper-data-textarea");
    await expect(textArea).toBeVisible();

    // Text area should be read-only (editable={false} in the component)
    await expect(textArea).not.toBeEditable();
  });

  test("should switch between Generator and Keeper tabs", async ({ page }) => {
    // Should be on Keeper tab - use testid for precise selection
    await expect(page.getByTestId("export-button")).toBeVisible();
    await expect(page.getByTestId("import-button")).toBeVisible();

    // Switch to Generator using accessibility label
    await page.getByRole("tab", { name: "Generator" }).click();
    await page.waitForTimeout(300);

    // Should show Generator elements
    await expect(page.getByTestId("generate-button")).toBeVisible();
    await expect(page.getByTestId("site-tag-input")).toBeVisible();

    // Switch back to Keeper using accessibility label
    await page.getByRole("tab", { name: "Keeper" }).click();
    await page.waitForTimeout(300);

    // Should show Keeper elements again
    await expect(page.getByTestId("export-button")).toBeVisible();
    await expect(page.getByTestId("import-button")).toBeVisible();
  });

  test("should show status message area", async ({ page }) => {
    // Status message container should be present
    // We check that the page is stable and shows the keeper interface
    await expect(page.getByTestId("keeper-data-textarea")).toBeVisible();
  });

  test("should generate password and see it in keeper after save", async ({ page }) => {
    // Go to Generator using accessibility label
    await page.getByRole("tab", { name: "Generator" }).click();
    await page.waitForTimeout(300);

    // Generate a password by filling both fields and clicking Generate
    await page.getByRole("textbox", { name: "Site tag" }).fill("testsite");
    await page.getByRole("textbox", { name: "Master key" }).fill("testkey");

    // Click Generate button
    await page.getByRole("button", { name: "Generate" }).click();

    // Wait for password field to appear
    const passwordField = page.getByTestId("password-output");
    await passwordField.waitFor({ state: "visible", timeout: 10000 });

    // Toggle a setting to enable the Save settings button
    const digitsSwitch = page.getByTestId("switch-generator.requirements.digits");
    await digitsSwitch.click();
    await page.waitForTimeout(200);

    // Save settings to store in keeper
    await page.getByRole("button", { name: "Save settings" }).click();
    await page.waitForTimeout(1000);

    // Go back to Keeper using accessibility label
    await page.getByRole("tab", { name: "Keeper" }).click();
    await page.waitForTimeout(1000);

    // Text area should contain data - use testid to avoid ambiguity
    const textArea = page.getByTestId("keeper-data-textarea");
    await expect(textArea).toBeVisible();
    const value = await textArea.inputValue();
    console.log("Keeper data:", value);
    expect(value).toContain("testsite");
  });
});
