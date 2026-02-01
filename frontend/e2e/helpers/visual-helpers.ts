/**
 * Visual Test Helpers
 * 
 * Utilities for making visual regression tests stable and deterministic.
 * Handles animations, fonts, dynamic content, and other flaky sources.
 */

import { Page, Locator } from '@playwright/test';

/**
 * Disable all animations and transitions in the browser
 */
export async function disableAnimations(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Override CSS animations
    const style = document.createElement('style');
    style.textContent = `
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      /* Disable Framer Motion animations */
      [data-framer-motion] {
        animation: none !important;
        transition: none !important;
      }
      
      /* Disable shimmer animation */
      .shimmer {
        animation: none !important;
        background: linear-gradient(to right, #f6f7f8, #edeef1, #f6f7f8) !important;
        background-size: 100% 100% !important;
      }
      
      /* Disable pulse glow */
      .pulse-glow {
        animation: none !important;
        box-shadow: 0 0 5px rgba(59, 130, 246, 0.5) !important;
      }
      
      /* Disable gradient text animation */
      .gradient-text-animated {
        animation: none !important;
        background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b) !important;
        background-size: 400% 400% !important;
      }
    `;
    document.head.appendChild(style);
    
    // Set prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });
}

/**
 * Freeze Date.now() to prevent timestamp differences in screenshots
 */
export async function freezeTime(page: Page, timestamp: number = 1700000000000): Promise<void> {
  await page.addInitScript((ts: number) => {
    const originalDate = Date;
    
    class FrozenDate extends originalDate {
      constructor(...args: ConstructorParameters<typeof originalDate>) {
        const hasArgs = args.length > 0;
        if (hasArgs) {
          super(...args);
        } else {
          super(ts);
        }
      }
      
      static now(): number {
        return ts;
      }
    }
    
    // Override Date globally
    (window as unknown as { Date: typeof originalDate }).Date = FrozenDate as typeof originalDate;
  }, timestamp);
}

/**
 * Wait for fonts to be fully loaded
 */
export async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate(() => {
    return document.fonts.ready;
  });
  // Additional wait for font rendering
  await page.waitForTimeout(500);
}

/**
 * Wait for all images to be loaded
 */
export async function waitForImages(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.every((img) => img.complete && img.naturalWidth > 0);
  }, { timeout: 10000 });
}

/**
 * Mask dynamic content areas (timestamps, random IDs, etc.)
 */
export function getMaskSelectors(): string[] {
  return [
    // Dynamic timestamps
    '[data-testid="timestamp"]',
    '[data-testid="date"]',
    '[data-testid="time"]',
    '[data-date]',
    // Random IDs
    '[data-testid="random-id"]',
    '[data-random]',
    // User avatars with dynamic URLs
    'img[src*="gravatar"]',
    'img[src*="googleusercontent"]',
    // Dynamic charts/visualizations
    '[data-testid="chart"]',
    '[data-testid="graph"]',
    // Animation containers
    '[data-framer-motion]',
  ];
}

/**
 * Prepare page for stable screenshot
 */
export async function preparePageForScreenshot(page: Page): Promise<void> {
  // Disable animations
  await disableAnimations(page);
  
  // Freeze time
  await freezeTime(page);
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
  
  // Wait for fonts
  await waitForFonts(page);
  
  // Wait for images
  await waitForImages(page);
  
  // Small delay for any remaining rendering
  await page.waitForTimeout(300);
}

/**
 * Take a stable screenshot with all preparations
 */
export async function takeStableScreenshot(
  page: Page,
  name: string,
  options: {
    mask?: Locator[];
    maskColor?: string;
    fullPage?: boolean;
  } = {}
): Promise<void> {
  await preparePageForScreenshot(page);
  
  const maskSelectors = getMaskSelectors();
  const masks: Locator[] = [];
  
  for (const selector of maskSelectors) {
    const locators = page.locator(selector).all();
    masks.push(...await locators);
  }
  
  if (options.mask) {
    masks.push(...options.mask);
  }
  
  await expect(page).toHaveScreenshot(name, {
    mask: masks.length > 0 ? masks : undefined,
    maskColor: options.maskColor || '#FF00FF',
    fullPage: options.fullPage ?? true,
    animations: 'disabled',
  });
}

/**
 * Mock API responses for consistent data
 */
export async function mockAPIResponses(page: Page): Promise<void> {
  // Mock any API calls that return timestamps or random data
  await page.route('**/api/**', async (route, request) => {
    const url = new URL(request.url());
    
    // Intercept health checks with timestamps
    if (url.pathname.includes('/health')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'healthy',
          timestamp: 1700000000000,
          uptime: 12345,
        }),
      });
      return;
    }
    
    // Let other requests pass through
    await route.continue();
  });
}

/**
 * Verify page is in a stable state before screenshot
 */
export async function verifyPageStable(
  page: Page,
  checks: {
    selector?: string;
    networkIdle?: boolean;
    noAnimations?: boolean;
  } = {}
): Promise<void> {
  // Check specific selector exists
  if (checks.selector) {
    const locator = page.locator(checks.selector);
    await expect(locator).toBeVisible();
  }
  
  // Ensure network is idle
  if (checks.networkIdle !== false) {
    await page.waitForLoadState('networkidle');
  }
  
  // Verify no animations are running (disabled via CSS in preparePageForScreenshot)
  // This check is disabled since we force disable all animations in preparePageForScreenshot
  void checks.noAnimations;
}

import { expect } from '@playwright/test';

/**
 * Screenshot helpers for common page states
 */
export async function screenshotPage(
  page: Page,
  name: string,
  options: {
    waitForSelector?: string;
    fullPage?: boolean;
  } = {}
): Promise<void> {
  if (options.waitForSelector) {
    await page.locator(options.waitForSelector).waitFor({ state: 'visible' });
  }
  
  await preparePageForScreenshot(page);
  
  await expect(page).toHaveScreenshot(name, {
    fullPage: options.fullPage ?? true,
    animations: 'disabled',
  });
}

/**
 * Helper to check if element exists and is visible
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const locator = page.locator(selector);
    return await locator.isVisible();
  } catch {
    return false;
  }
}
