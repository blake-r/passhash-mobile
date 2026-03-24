import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "line",
  timeout: 60000, // Increase default timeout to 60 seconds

  use: {
    baseURL: "http://localhost:8081",
    trace: "on-first-retry",
    screenshot: "off", // Screenshots handled by fixtures.ts
    // Use clean browser context without extensions
    contextOptions: {
      // Disable browser extensions that might interfere with screenshots
      ignoreHTTPSErrors: true,
    },
    // Launch options for clean browser
    launchOptions: {
      // Disable extensions and addons
      args: [
        "--disable-extensions",
        "--disable-extensions-except",
        "--block-new-web-contents",
        "--disable-features=TranslateUI",
        "--disable-ipc-flooding-protection",
        "--disable-component-extensions-with-background-pages",
        "--disable-default-apps",
        "--no-default-browser-check",
      ],
    },
  },

  projects: [
    {
      name: "Galaxy S24",
      use: {
        ...devices["Galaxy S24"],
      },
    },
  ],

  webServer: {
    command: "npm run web",
    url: "http://localhost:8081",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
