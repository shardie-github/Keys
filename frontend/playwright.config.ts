import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * 
 * Contains both functional E2E tests and visual regression tests.
 * Visual tests are configured to be stable and deterministic:
 * - Frozen time/timezone
 * - Disabled animations
 * - Consistent fonts
 * - Fixed viewports
 */

// Viewport configurations for visual testing
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

// Device scale factor for consistent pixel rendering
const deviceScaleFactor = 1;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  
  // Snapshot configuration
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}/{projectName}{ext}',
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: 'disabled',
    },
  },
  
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Freeze time for consistent screenshots
    timezoneId: 'America/New_York',
    locale: 'en-US',
    colorScheme: 'light',
  },

  projects: [
    // Functional E2E projects
    {
      name: 'chromium',
      testMatch: /.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: /.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: /.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
    
    // Visual regression projects - Mobile
    {
      name: 'visual-mobile',
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: viewports.mobile,
        deviceScaleFactor,
        // Disable all animations
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },
    // Visual regression projects - Tablet
    {
      name: 'visual-tablet',
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: viewports.tablet,
        deviceScaleFactor,
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },
    // Visual regression projects - Desktop
    {
      name: 'visual-desktop',
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: viewports.desktop,
        deviceScaleFactor,
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },
    // Dark mode visual tests
    {
      name: 'visual-mobile-dark',
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: viewports.mobile,
        deviceScaleFactor,
        colorScheme: 'dark',
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },
    {
      name: 'visual-desktop-dark',
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: viewports.desktop,
        deviceScaleFactor,
        colorScheme: 'dark',
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },
    // Audit project for UI consistency checks
    {
      name: 'audit',
      testMatch: /.*\.audit\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: viewports.desktop,
        deviceScaleFactor,
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
