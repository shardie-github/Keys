import { test, expect } from '@playwright/test';
import { 
  preparePageForScreenshot, 
  mockAPIResponses,
  screenshotPage 
} from './helpers/visual-helpers';

/**
 * Visual Regression Tests - Protected Routes
 * 
 * Tests pages that require authentication. 
 * These tests will be skipped if no auth credentials are provided.
 */

// Helper to check if authenticated
async function checkAuth(page: any): Promise<boolean> {
  await page.goto('/dashboard');
  const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
  return !isSigninPage;
}

test.describe('🏠 Dashboard Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('dashboard - loaded state', async ({ page }) => {
    const isAuth = await checkAuth(page);
    if (!isAuth) {
      test.skip();
      return;
    }
    await screenshotPage(page, 'dashboard-loaded.png', {
      waitForSelector: 'main',
    });
  });

  test('dashboard - empty state', async ({ page }) => {
    const isAuth = await checkAuth(page);
    if (!isAuth) {
      test.skip();
      return;
    }
    
    // Mock empty dashboard data
    await page.route('**/api/dashboard/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], stats: {} }),
      });
    });
    
    await page.goto('/dashboard');
    await screenshotPage(page, 'dashboard-empty.png', {
      waitForSelector: 'main, .empty-state',
    });
  });
});

test.describe('💬 Chat Page Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('chat - loaded state', async ({ page }) => {
    await page.goto('/chat');
    const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (isSigninPage) {
      test.skip();
      return;
    }
    await screenshotPage(page, 'chat-loaded.png', {
      waitForSelector: 'main',
    });
  });
});

test.describe('⚙️ Settings/Profile Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('profile settings - loaded', async ({ page }) => {
    await page.goto('/profile/settings');
    const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (isSigninPage) {
      test.skip();
      return;
    }
    await screenshotPage(page, 'profile-settings-loaded.png', {
      waitForSelector: 'main, form',
    });
  });
});

test.describe('💳 Billing Page Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('billing - loaded state', async ({ page }) => {
    await page.goto('/account/billing');
    const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (isSigninPage) {
      test.skip();
      return;
    }
    await screenshotPage(page, 'billing-loaded.png', {
      waitForSelector: 'main',
    });
  });

  test('billing - subscription active', async ({ page }) => {
    await page.goto('/account/billing');
    const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (isSigninPage) {
      test.skip();
      return;
    }
    
    // Mock subscription data
    await page.route('**/api/billing/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          subscription: {
            status: 'active',
            plan: 'pro',
            currentPeriodEnd: 1700000000000,
          },
        }),
      });
    });
    
    await page.goto('/account/billing');
    await screenshotPage(page, 'billing-active.png', {
      waitForSelector: 'main',
    });
  });

  test('billing - no subscription', async ({ page }) => {
    await page.goto('/account/billing');
    const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (isSigninPage) {
      test.skip();
      return;
    }
    
    // Mock no subscription
    await page.route('**/api/billing/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          subscription: null,
        }),
      });
    });
    
    await page.goto('/account/billing');
    await screenshotPage(page, 'billing-none.png', {
      waitForSelector: 'main',
    });
  });
});

test.describe('🔑 API Keys Page Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('api keys - loaded', async ({ page }) => {
    await page.goto('/account/keys');
    const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (isSigninPage) {
      test.skip();
      return;
    }
    await screenshotPage(page, 'api-keys-loaded.png', {
      waitForSelector: 'main',
    });
  });

  test('api keys - empty state', async ({ page }) => {
    await page.goto('/account/keys');
    const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (isSigninPage) {
      test.skip();
      return;
    }
    
    await page.route('**/api/keys/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ keys: [] }),
      });
    });
    
    await page.goto('/account/keys');
    await screenshotPage(page, 'api-keys-empty.png', {
      waitForSelector: 'main, .empty-state',
    });
  });
});

test.describe('🎯 Onboarding Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('onboarding - step 1', async ({ page }) => {
    await page.goto('/onboarding');
    const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (isSigninPage) {
      test.skip();
      return;
    }
    await screenshotPage(page, 'onboarding-step1.png', {
      waitForSelector: 'main, form, [data-testid="onboarding"]',
    });
  });
});

test.describe('🎮 Playground Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('playground - loaded', async ({ page }) => {
    await page.goto('/playground');
    const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (isSigninPage) {
      test.skip();
      return;
    }
    await screenshotPage(page, 'playground-loaded.png', {
      waitForSelector: 'main',
    });
  });
});

test.describe('🛡️ Protected Routes - Dark Mode', () => {
  test.use({ colorScheme: 'dark' });

  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('dashboard - dark mode', async ({ page }) => {
    await page.goto('/dashboard');
    const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (isSigninPage) {
      test.skip();
      return;
    }
    await screenshotPage(page, 'dashboard-dark.png', {
      waitForSelector: 'main',
    });
  });

  test('profile settings - dark mode', async ({ page }) => {
    await page.goto('/profile/settings');
    const isSigninPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (isSigninPage) {
      test.skip();
      return;
    }
    await screenshotPage(page, 'profile-settings-dark.png', {
      waitForSelector: 'main, form',
    });
  });
});
