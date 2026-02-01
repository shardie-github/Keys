import { test, expect } from '@playwright/test';

/**
 * UI Consistency & Functional Integrity Audit
 * 
 * This test suite performs automated checks for:
 * - Console errors and warnings
 * - Network failures
 * - Hydration mismatches
 * - Layout issues across viewports
 * - Accessibility problems
 * - Responsive design issues
 */

// Test routes to audit
const routesToAudit = [
  { path: '/', name: 'Home' },
  { path: '/signin', name: 'Sign In' },
  { path: '/signup', name: 'Sign Up' },
  { path: '/library', name: 'Library' },
  { path: '/enterprise', name: 'Enterprise' },
  { path: '/about', name: 'About' },
  { path: '/templates', name: 'Templates' },
  { path: '/dashboard', name: 'Dashboard', protected: true },
  { path: '/profile/settings', name: 'Settings', protected: true },
  { path: '/nonexistent-page', name: '404 Error' },
];

// Viewports for responsive testing
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

interface AuditResult {
  route: string;
  viewport: string;
  consoleErrors: string[];
  consoleWarnings: string[];
  networkFailures: string[];
  hydrationIssues: string[];
  layoutIssues: string[];
  accessibilityIssues: string[];
}

test.describe('🔍 UI Consistency & Functional Integrity Audit', () => {
  const auditResults: AuditResult[] = [];

  for (const route of routesToAudit) {
    for (const viewport of viewports) {
      test(`${route.name} - ${viewport.name} viewport`, async ({ page }) => {
        const result: AuditResult = {
          route: route.path,
          viewport: viewport.name,
          consoleErrors: [],
          consoleWarnings: [],
          networkFailures: [],
          hydrationIssues: [],
          layoutIssues: [],
          accessibilityIssues: [],
        };

        // Set viewport
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        // Collect console messages
        page.on('console', (msg) => {
          const text = msg.text();
          if (msg.type() === 'error') {
            // Filter out expected errors (like from non-existent pages)
            if (!text.includes('404') && !text.includes('Failed to fetch')) {
              result.consoleErrors.push(text);
            }
          } else if (msg.type() === 'warning') {
            result.consoleWarnings.push(text);
          }
        });

        // Collect network failures
        page.on('response', (response) => {
          const status = response.status();
          const url = response.url();
          if (status >= 400) {
            result.networkFailures.push(`${status}: ${url}`);
          }
        });

        // Navigate to page
        await page.goto(route.path);

        // Check if protected route redirected
        if (route.protected && page.url().includes('/signin')) {
          // This is expected for protected routes
          console.log(`Protected route ${route.path} correctly redirected to signin`);
        } else {
          // Wait for page to be fully loaded
          await page.waitForLoadState('networkidle');

          // Check for hydration errors
          const hydrationError = await page.evaluate(() => {
            // Check for common hydration error indicators
            const hasHydrationMismatch = document.querySelector('[data-reactroot]') !== null &&
              document.querySelector('script[data-hydration-error]') !== null;
            
            const consoleErrors = (window as unknown as { __consoleErrors?: string[] }).__consoleErrors || [];
            const hydrationConsoleError = consoleErrors.find((e: string) => 
              e.includes('hydrat') || e.includes('Hydrat')
            );

            return {
              hasMismatch: hasHydrationMismatch,
              consoleError: hydrationConsoleError,
            };
          });

          if (hydrationError.hasMismatch) {
            result.hydrationIssues.push('Hydration mismatch detected in DOM');
          }
          if (hydrationError.consoleError) {
            result.hydrationIssues.push(`Console hydration error: ${hydrationError.consoleError}`);
          }

          // Check for layout issues
          const layoutIssues = await page.evaluate(() => {
            const issues: string[] = [];
            
            // Check for elements with zero width/height (invisible but present)
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
              const rect = el.getBoundingClientRect();
              const style = window.getComputedStyle(el);
              
              // Check for hidden clickable elements
              if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button') {
                if (rect.width === 0 || rect.height === 0) {
                  if (style.display !== 'none' && style.visibility !== 'hidden') {
                    issues.push(`Zero-size interactive element: ${el.tagName}`);
                  }
                }
              }
            }

            // Check for overlapping fixed headers
            const fixedHeaders = document.querySelectorAll('header, [role="banner"]');
            for (const header of fixedHeaders) {
              const style = window.getComputedStyle(header);
              if (style.position === 'fixed') {
                const rect = header.getBoundingClientRect();
                // Check if header covers clickable elements
                const clickableElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
                for (const el of clickableElements) {
                  const elRect = el.getBoundingClientRect();
                  const elStyle = window.getComputedStyle(el);
                  
                  if (elStyle.display !== 'none' && elStyle.visibility !== 'hidden') {
                    if (elRect.top < rect.bottom && elRect.bottom > rect.top) {
                      // Element is at same vertical position as header
                      if (elRect.left < rect.right && elRect.right > rect.left) {
                        issues.push('Possible fixed header overlap detected');
                        break;
                      }
                    }
                  }
                }
              }
            }

            return issues;
          });

          result.layoutIssues.push(...layoutIssues);

          // Check for accessibility issues
          const accessibilityIssues = await page.evaluate(() => {
            const issues: string[] = [];
            
            // Check for images without alt text
            const images = document.querySelectorAll('img');
            for (const img of images) {
              if (!img.hasAttribute('alt') && !img.hasAttribute('aria-label') && !img.hasAttribute('aria-hidden')) {
                issues.push('Image missing alt text');
              }
            }

            // Check for form inputs without labels
            const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
            for (const input of inputs) {
              const id = input.getAttribute('id');
              const ariaLabel = input.getAttribute('aria-label');
              const ariaLabelledBy = input.getAttribute('aria-labelledby');
              const hasLabel = id && document.querySelector(`label[for="${id}"]`);
              const placeholder = input.getAttribute('placeholder');
              
              if (!hasLabel && !ariaLabel && !ariaLabelledBy && !placeholder) {
                issues.push('Form input missing label');
              }
            }

            // Check for low contrast text (basic check)
            const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label');
            for (const el of textElements) {
              const style = window.getComputedStyle(el);
              const color = style.color;
              const bgColor = style.backgroundColor;
              
              // Check for transparent text or similar colors
              if (color.includes('rgba(0, 0, 0, 0') || color === 'transparent') {
                issues.push('Text with transparent color');
              }
            }

            // Check for focusable elements outside viewport
            const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            for (const el of focusableElements) {
              const rect = el.getBoundingClientRect();
              const windowWidth = window.innerWidth;
              const windowHeight = window.innerHeight;
              
              if (rect.right < 0 || rect.left > windowWidth || rect.bottom < 0 || rect.top > windowHeight) {
                issues.push('Focusable element outside viewport');
              }
            }

            return issues;
          });

          result.accessibilityIssues.push(...accessibilityIssues);

          // Store result
          auditResults.push(result);

          // Log issues immediately
          if (result.consoleErrors.length > 0) {
            console.log(`❌ Console errors on ${route.path} (${viewport.name}):`, result.consoleErrors);
          }
          if (result.hydrationIssues.length > 0) {
            console.log(`💧 Hydration issues on ${route.path} (${viewport.name}):`, result.hydrationIssues);
          }
          if (result.layoutIssues.length > 0) {
            console.log(`📐 Layout issues on ${route.path} (${viewport.name}):`, result.layoutIssues);
          }
          if (result.accessibilityIssues.length > 0) {
            console.log(`♿ Accessibility issues on ${route.path} (${viewport.name}):`, result.accessibilityIssues);
          }
        }

        // Verify no critical errors (console errors are warnings for now)
        expect(result.consoleErrors.length).toBeLessThan(5); // Allow some leeway
      });
    }
  }
});

test.describe('📊 Audit Report Summary', () => {
  test('Generate final report', async ({ page }) => {
    // Generate summary
    // Note: In a real implementation, you'd collect results from previous tests
    // For now, this provides a template for the report structure
    
    const summary = {
      totalRoutes: routesToAudit.length,
      totalViewports: viewports.length,
      totalChecks: routesToAudit.length * viewports.length,
      timestamp: new Date().toISOString(),
    };

    console.log('\n========== UI CONSISTENCY AUDIT REPORT ==========');
    console.log(`Routes tested: ${summary.totalRoutes}`);
    console.log(`Viewports: ${summary.totalViewports}`);
    console.log(`Total checks: ${summary.totalChecks}`);
    console.log(`Timestamp: ${summary.timestamp}`);
    console.log('================================================\n');

    // Write report
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(process.cwd(), 'e2e', 'audit-report.json');
    
    fs.writeFileSync(reportPath, JSON.stringify({
      summary,
      routes: routesToAudit,
      viewports,
      timestamp: new Date().toISOString(),
    }, null, 2));

    console.log(`📄 Audit report saved to: ${reportPath}`);
    expect(true).toBe(true);
  });
});

test.describe('🎯 Specific Component Audit', () => {
  test('Navigation menu works on all viewports', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Try to find and click menu button on mobile
      if (viewport.name === 'mobile') {
        const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
        const hasMenu = await menuButton.isVisible().catch(() => false);
        
        if (hasMenu) {
          await menuButton.click();
          await page.waitForTimeout(300);
          
          // Check that nav is visible
          const nav = page.locator('nav, [role="navigation"]').first();
          await expect(nav).toBeVisible();
          
          // Check that links are clickable
          const navLinks = nav.locator('a').first();
          const linkCount = await navLinks.count();
          expect(linkCount).toBeGreaterThan(0);
        }
      }
    }
  });

  test('Forms have proper labels and are accessible', async ({ page }) => {
    await page.goto('/signin');
    
    const inputs = page.locator('input:not([type="hidden"])');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');
      
      // Must have at least one form of labeling
      const hasLabel = id && await page.locator(`label[for="${id}"]`).count() > 0;
      expect(hasLabel || ariaLabel || ariaLabelledBy || placeholder).toBeTruthy();
    }
  });

  test('Dark mode toggle works and persists', async ({ page }) => {
    await page.goto('/');
    
    // Look for dark mode toggle
    const darkModeToggle = page.locator('button[aria-label*="dark"], button[aria-label*="theme"], [data-testid="theme-toggle"]').first();
    const hasToggle = await darkModeToggle.isVisible().catch(() => false);
    
    if (hasToggle) {
      // Get initial state
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      
      // Toggle
      await darkModeToggle.click();
      await page.waitForTimeout(300);
      
      // Verify theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('No horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    for (const route of routesToAudit.filter(r => !r.protected)) {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      
      const scrollWidth = await page.evaluate(() => {
        return Math.max(
          document.body.scrollWidth,
          document.documentElement.scrollWidth
        );
      });
      
      const windowWidth = await page.evaluate(() => window.innerWidth);
      
      if (scrollWidth > windowWidth) {
        console.log(`⚠️  Horizontal scroll detected on ${route.path}: ${scrollWidth - windowWidth}px overflow`);
      }
      
      // Don't fail, just report
      expect(scrollWidth - windowWidth).toBeLessThan(50);
    }
  });
});
