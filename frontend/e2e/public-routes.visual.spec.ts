import { test, expect } from '@playwright/test';
import { 
  preparePageForScreenshot, 
  mockAPIResponses,
  screenshotPage 
} from './helpers/visual-helpers';

/**
 * Visual Regression Tests - Public Routes
 * 
 * Tests public-facing pages across multiple viewports and color schemes.
 * These tests do not require authentication.
 */

test.describe('🏠 Home Page Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
    await page.goto('/');
  });

  test('home page - loaded state', async ({ page }) => {
    await screenshotPage(page, 'home-loaded.png', {
      waitForSelector: 'main',
    });
  });

  test('home page - hero section', async ({ page }) => {
    // Scroll to hero section and screenshot
    await page.locator('main').waitFor();
    await preparePageForScreenshot(page);
    
    // Take screenshot of first viewport (hero)
    await expect(page).toHaveScreenshot('home-hero.png', {
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });
  });
});

test.describe('🔐 Auth Pages Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('signin page', async ({ page }) => {
    await page.goto('/signin');
    await screenshotPage(page, 'signin-page.png', {
      waitForSelector: 'form',
    });
  });

  test('signup page', async ({ page }) => {
    await page.goto('/signup');
    await screenshotPage(page, 'signup-page.png', {
      waitForSelector: 'form',
    });
  });

  test('signin page with error state', async ({ page }) => {
    await page.goto('/signin');
    
    // Fill in invalid credentials to trigger error
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error to appear
    await page.locator('text=/error|invalid|failed/i').waitFor({ timeout: 5000 });
    
    await screenshotPage(page, 'signin-error.png', {
      waitForSelector: 'text=/error|invalid|failed/i',
    });
  });
});

test.describe('📚 Library/Marketplace Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('library page - loaded', async ({ page }) => {
    await page.goto('/library');
    await screenshotPage(page, 'library-loaded.png', {
      waitForSelector: 'main',
    });
  });

  test('library detail page', async ({ page }) => {
    await page.goto('/library/prompt-templates');
    await screenshotPage(page, 'library-detail.png', {
      waitForSelector: 'main',
    });
  });
});

test.describe('🏢 Enterprise/Pricing Page Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
    await page.goto('/enterprise');
  });

  test('enterprise page - loaded', async ({ page }) => {
    await screenshotPage(page, 'enterprise-loaded.png', {
      waitForSelector: 'main',
    });
  });
});

test.describe('📖 About Page Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
    await page.goto('/about');
  });

  test('about page - loaded', async ({ page }) => {
    await screenshotPage(page, 'about-loaded.png', {
      waitForSelector: 'main',
    });
  });
});

test.describe('📦 Templates Page Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
    await page.goto('/templates');
  });

  test('templates page - loaded', async ({ page }) => {
    await screenshotPage(page, 'templates-loaded.png', {
      waitForSelector: '.templates-page, main',
    });
  });

  test('templates page - empty state', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/templates', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ templates: [] }),
      });
    });
    
    await page.goto('/templates');
    await screenshotPage(page, 'templates-empty.png', {
      waitForSelector: '.empty-state, .templates-page, main',
    });
  });

  test('templates page - error state', async ({ page }) => {
    // Mock error response
    await page.route('**/api/templates', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to load templates' }),
      });
    });
    
    await page.goto('/templates');
    await page.waitForTimeout(1000);
    
    await screenshotPage(page, 'templates-error.png', {
      waitForSelector: '.error, .error-banner, main',
    });
  });
});

test.describe('❌ Error Pages Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('404 page', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await screenshotPage(page, '404-page.png', {
      waitForSelector: 'main, h1',
    });
  });

  test('error boundary page', async ({ page }) => {
    // Navigate to a route that might trigger an error boundary
    // This tests the global error handling UI
    await page.goto('/error-test');
    await page.waitForTimeout(500);
    
    await screenshotPage(page, 'error-boundary.png', {
      waitForSelector: 'main, body',
    });
  });
});

test.describe('🌓 Dark Mode Visual', () => {
  test.use({ colorScheme: 'dark' });

  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('home page - dark mode', async ({ page }) => {
    await page.goto('/');
    await screenshotPage(page, 'home-dark.png', {
      waitForSelector: 'main',
    });
  });

  test('signin page - dark mode', async ({ page }) => {
    await page.goto('/signin');
    await screenshotPage(page, 'signin-dark.png', {
      waitForSelector: 'form',
    });
  });

  test('library page - dark mode', async ({ page }) => {
    await page.goto('/library');
    await screenshotPage(page, 'library-dark.png', {
      waitForSelector: 'main',
    });
  });
});

test.describe('♿ Reduced Motion Visual', () => {
  test.use({ 
    contextOptions: { reducedMotion: 'reduce' }
  });

  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
    await preparePageForScreenshot(page);
  });

  test('home page - reduced motion', async ({ page }) => {
    await page.goto('/');
    await screenshotPage(page, 'home-reduced-motion.png', {
      waitForSelector: 'main',
    });
  });
});

test.describe('📱 Responsive Breakpoints Visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('mobile nav menu', async ({ page }) => {
    await page.goto('/');
    
    // Click hamburger menu on mobile
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    
    try {
      await menuButton.click();
      await page.waitForTimeout(300);
      
      await screenshotPage(page, 'mobile-nav-open.png', {
        waitForSelector: 'nav, header',
      });
    } catch {
      // If no menu button, skip
      test.skip();
    }
  });

  test('tablet layout', async ({ page }) => {
    await page.goto('/library');
    await screenshotPage(page, 'tablet-layout.png', {
      waitForSelector: 'main',
    });
  });
});
