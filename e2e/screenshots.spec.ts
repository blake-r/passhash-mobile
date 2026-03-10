// E2E Screenshot tests - Generate screenshots for all screens and all supported languages
// Languages: English (en), German (de), Russian (ru)

import { test, expect } from "./fixtures";
import * as path from "path";

// Supported languages for screenshot testing
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "ru", name: "Russian" },
] as const;

// Helper function to change language via picker
async function changeLanguage(page: any, languageCode: string): Promise<void> {
  // Go to Keeper tab where language selector is located
  await page.getByRole("tab", { name: /Keeper|Verwalter|Хранитель/ }).click();
  await page.waitForTimeout(300);

  // Click on the language picker and select the desired language
  // The picker is in the Keeper screen
  await page.locator("select").first().selectOption(languageCode);
  await page.waitForTimeout(500);

  // Go back to Generator tab
  await page.getByRole("tab", { name: /Generator|Генератор/ }).click();
  await page.waitForTimeout(300);
}

// Tests must run serially to avoid storage conflicts between languages
test.describe.configure({ mode: "serial" });

test.describe("Screenshot Tests - All Languages", () => {
  for (const lang of LANGUAGES) {
    test.describe(`Language: ${lang.name} (${lang.code})`, () => {
      test.beforeEach(async ({ page }) => {
        // Navigate to the app
        await page.goto("/");
        // Wait for app to load
        await page.waitForSelector("text=Password Hasher", { timeout: 15000 });
        
        // Change to the target language
        await changeLanguage(page, lang.code);
      });

      test(`should capture generator screen empty (${lang.code})`, async ({ page }) => {
        // Ensure we're on Generator tab
        await page.getByRole("tab", { name: /Generator|Генератор/ }).click();
        await page.waitForTimeout(500);

        // Take screenshot of generator screen with empty fields
        await page.screenshot({
          path: path.join(__dirname, "screenshots", `generator-empty-${lang.code}.png`),
          fullPage: true,
        });
      });

      test(`should capture generator screen with password (${lang.code})`, async ({ page }) => {
        // Ensure we're on Generator tab
        await page.getByRole("tab", { name: /Generator|Генератор/ }).click();
        await page.waitForTimeout(500);

        // Fill in site tag and master key
        await page.getByTestId("site-tag-input").fill("example.com");
        await page.getByTestId("master-key-input").fill("mysecretkey");

        // Wait for password to be generated
        await page.waitForTimeout(1500);

        // Take screenshot with generated password
        await page.screenshot({
          path: path.join(__dirname, "screenshots", `generator-with-password-${lang.code}.png`),
          fullPage: true,
        });
      });

      test(`should capture generator with modified settings (${lang.code})`, async ({ page }) => {
        // Ensure we're on Generator tab
        await page.getByRole("tab", { name: /Generator|Генератор/ }).click();
        await page.waitForTimeout(500);

        // Modify settings - use testid for precise selection
        const digitsSwitch = page.getByTestId("switch-generator.requirements.digits");
        const punctuationSwitch = page.getByTestId("switch-generator.requirements.punctuation");

        // Toggle some settings
        await digitsSwitch.click();
        await page.waitForTimeout(200);
        await punctuationSwitch.click();
        await page.waitForTimeout(200);

        // Take screenshot with modified settings
        await page.screenshot({
          path: path.join(__dirname, "screenshots", `generator-modified-${lang.code}.png`),
          fullPage: true,
        });
      });

      test(`should capture generator restrictions section (${lang.code})`, async ({ page }) => {
        // Ensure we're on Generator tab
        await page.getByRole("tab", { name: /Generator|Генератор/ }).click();
        await page.waitForTimeout(500);

        // Scroll to restrictions section using Playwright's evaluate
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)");
        await page.waitForTimeout(300);

        // Take screenshot focusing on restrictions
        await page.screenshot({
          path: path.join(__dirname, "screenshots", `generator-restrictions-${lang.code}.png`),
          fullPage: false,
        });
      });

      test(`should capture keeper screen empty (${lang.code})`, async ({ page }) => {
        // Switch to Keeper tab
        await page.getByRole("tab", { name: /Keeper|Verwalter|Хранитель/ }).click();
        await page.waitForTimeout(500);

        // Take screenshot of keeper screen
        await page.screenshot({
          path: path.join(__dirname, "screenshots", `keeper-empty-${lang.code}.png`),
          fullPage: true,
        });
      });

      test(`should capture keeper screen with data (${lang.code})`, async ({ page }) => {
        // First generate a password and save settings
        await page.getByRole("tab", { name: /Generator|Генератор/ }).click();
        await page.waitForTimeout(300);

        // Fill in site tag and master key
        await page.getByTestId("site-tag-input").fill("testsite");
        await page.getByTestId("master-key-input").fill("testkey");
        await page.waitForTimeout(300);

        // Click Generate button to generate password (this stores the site tag)
        await page.getByTestId("generate-button").click();
        await page.waitForTimeout(1500);

        // Toggle a setting and save - use testid for precise selection
        const digitsSwitch = page.getByTestId("switch-generator.requirements.digits");
        await digitsSwitch.click();
        await page.waitForTimeout(200);
        await page.getByRole("button", { name: /Save settings|Einstellungen speichern|Сохранить настройки/ }).click();
        await page.waitForTimeout(1000);

        // Switch to Keeper tab
        await page.getByRole("tab", { name: /Keeper|Verwalter|Хранитель/ }).click();
        await page.waitForTimeout(1000);

        // Take screenshot of keeper screen with data
        await page.screenshot({
          path: path.join(__dirname, "screenshots", `keeper-with-data-${lang.code}.png`),
          fullPage: true,
        });
      });
    });
  }
});
