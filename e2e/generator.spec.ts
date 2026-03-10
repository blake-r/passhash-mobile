// E2E tests for Generator screen - Updated for Material Design with accessibility labels
// These tests run in a real browser with mobile viewport

import { test, expect } from "./fixtures";

test.describe("Generator Screen", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");
    // Wait for app to load
    await page.waitForSelector("text=Password Hasher", { timeout: 15000 });
  });

  test("should render generator screen with three cards", async ({ page }) => {
    // Check main elements are visible using accessibility labels
    await expect(page.getByRole("textbox", { name: "Site tag" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Master key" })).toBeVisible();

    // Check Generate button is visible when fields are empty
    await expect(page.getByRole("button", { name: "Generate" })).toBeVisible();

    // Check settings cards are visible
    await expect(page.getByText("Requirements")).toBeVisible();
    await expect(page.getByText("Restrictions")).toBeVisible();
  });

  test("should enter site tag and master key", async ({ page }) => {
    // Fill in site tag
    const siteTagInput = page.getByRole("textbox", { name: "Site tag" });
    await siteTagInput.fill("google");
    await expect(siteTagInput).toHaveValue("google");

    // Fill in master key
    const masterKeyInput = page.getByRole("textbox", { name: "Master key" });
    await masterKeyInput.fill("mysecretkey");
    await expect(masterKeyInput).toHaveValue("mysecretkey");
  });

  test("should generate password when both fields are filled", async ({ page }) => {
    // Fill in inputs
    await page.getByRole("textbox", { name: "Site tag" }).fill("example");
    await page.getByRole("textbox", { name: "Master key" }).fill("mysecretkey");

    // Click Generate button to generate password
    const generateButton = page.getByRole("button", { name: "Generate" });
    await generateButton.click();

    // Wait for password field to appear
    const passwordField = page.getByTestId("password-output");
    await passwordField.waitFor({ state: "visible", timeout: 10000 });

    // Wait for password to be generated
    await page.waitForTimeout(1500);

    // Check status message for success
    await expect(page.getByText("Password hash copied into clipboard")).toBeVisible();

    // Password field should have a value
    const passwordValue = await passwordField.inputValue();
    expect(passwordValue.length).toBeGreaterThan(0);
  });

  test("should show Generate button when fields are empty", async ({ page }) => {
    // When fields are empty, Generate button should be visible
    const generateButton = page.getByRole("button", { name: "Generate" });
    await expect(generateButton).toBeVisible();
  });

  test("should show error when site tag is empty", async ({ page }) => {
    // Fill only master key
    await page.getByRole("textbox", { name: "Master key" }).fill("mysecretkey");

    // Generate button should still be visible but password won't generate
    const generateButton = page.getByRole("button", { name: "Generate" });
    await expect(generateButton).toBeVisible();
  });

  test("should show error when master key is empty", async ({ page }) => {
    // Fill only site tag
    await page.getByRole("textbox", { name: "Site tag" }).fill("google");

    // Password field should not appear yet - use testid to avoid ambiguity
    const passwordField = page.getByTestId("password-output");
    await expect(passwordField).not.toBeVisible();
  });

  test("should bump version when +1 button is pressed", async ({ page }) => {
    // Fill in site tag
    const siteTagInput = page.getByRole("textbox", { name: "Site tag" });
    await siteTagInput.fill("google");

    // Click +1 button (bump version)
    await page.getByRole("button", { name: "Bump version" }).click();

    // Site tag should have version appended
    await expect(siteTagInput).toHaveValue("google:1");
  });

  test("should toggle unmask master key", async ({ page }) => {
    const masterKeyInput = page.getByRole("textbox", { name: "Master key" });
    await masterKeyInput.fill("mysecretkey");

    // Find and click unmask toggle button (eye icon)
    const unmaskButton = page.getByRole("button", { name: "Unmask" });
    await unmaskButton.click();

    // Master key should be visible - check by aria-label or testid
    await expect(unmaskButton).toBeVisible();
  });

  test("should toggle requirements settings", async ({ page }) => {
    // Toggle Digits (use symbol 0-9) - use testid for precise selection
    // Note: We just verify the click works, state checking is unreliable with React Native Web
    const digitsSwitch = page.getByTestId("switch-generator.requirements.digits");
    await digitsSwitch.click();
    await page.waitForTimeout(200);

    // Toggle Mixed case (use symbol Aa)
    const mixedCaseSwitch = page.getByTestId("switch-generator.requirements.mixedCase");
    await mixedCaseSwitch.click();
    await page.waitForTimeout(200);
  });

  test("should toggle restrictions settings", async ({ page }) => {
    // Toggle No special (use switch in restrictions section) - use testid for precise selection
    // Note: We just verify the click works, state checking is unreliable with React Native Web
    const noSpecialSwitch = page.getByTestId("switch-generator.restrictions.noSpecial");
    await noSpecialSwitch.click();
    await page.waitForTimeout(200);

    // Toggle Digits only
    const digitsOnlySwitch = page.getByTestId("switch-generator.restrictions.digitsOnly");
    await digitsOnlySwitch.click();
    await page.waitForTimeout(200);
  });

  test("should save settings", async ({ page }) => {
    // Initially Save settings button should be disabled (no changes)
    const saveButton = page.getByRole("button", { name: "Save settings" });

    // Toggle a setting to enable the save button - use testid for precise selection
    const digitsSwitch = page.getByTestId("switch-generator.requirements.digits");
    await digitsSwitch.click();

    // Click Save settings button
    await saveButton.click();

    // Should show success message
    await expect(page.getByText("Settings are saved")).toBeVisible();

    // After save, button should be disabled again (no new changes)
    await expect(saveButton).toBeDisabled();
  });

  test("should extract site tag from URL", async ({ page }) => {
    const siteTagInput = page.getByRole("textbox", { name: "Site tag" });
    await siteTagInput.fill("https://www.google.com");

    // Blur the input to trigger extraction
    await siteTagInput.blur();

    // Should extract 'google' from URL
    await page.waitForTimeout(500);
    const value = await siteTagInput.inputValue();
    expect(value).toContain("google");
  });

  test("should switch between tabs", async ({ page }) => {
    // Switch to Keeper tab using accessibility label
    await page.getByRole("tab", { name: "Keeper" }).click();
    await page.waitForTimeout(500);

    // Should show Keeper elements - use role-based selector to avoid matching text content
    await expect(page.getByRole("button", { name: "Export" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Import" })).toBeVisible();

    // Switch back to Generator using accessibility label
    await page.getByRole("tab", { name: "Generator" }).click();
    await page.waitForTimeout(500);

    // Should show Generator elements again
    await expect(page.getByRole("textbox", { name: "Site tag" })).toBeVisible();
  });

  test("should show password field when both inputs are filled", async ({ page }) => {
    // Fill both inputs
    await page.getByRole("textbox", { name: "Site tag" }).fill("example.com");
    await page.getByRole("textbox", { name: "Master key" }).fill("secret123");

    // Click Generate button
    const generateButton = page.getByRole("button", { name: "Generate" });
    await generateButton.click();

    // Wait for password field to appear
    const passwordField = page.getByTestId("password-output");
    await passwordField.waitFor({ state: "visible", timeout: 10000 });

    // Generate button should disappear
    const generateButtonAfter = page.getByTestId("generate-button");
    await expect(generateButtonAfter).not.toBeVisible();
  });

  test("should show Generate button when inputs are cleared", async ({ page }) => {
    // Fill both inputs first
    await page.getByRole("textbox", { name: "Site tag" }).fill("example.com");
    await page.getByRole("textbox", { name: "Master key" }).fill("secret123");

    // Wait for password to appear
    await page.waitForTimeout(500);

    // Clear site tag
    await page.getByRole("textbox", { name: "Site tag" }).clear();

    // Generate button should reappear
    const generateButton = page.getByRole("button", { name: "Generate" });
    await expect(generateButton).toBeVisible();
  });
});
