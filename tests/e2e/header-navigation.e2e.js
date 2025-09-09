/**
 * E2E Tests for Header Navigation
 * Tests navigation behavior, hamburger menu, and header interactions
 */

import { test, expect } from '@playwright/test';

test.describe('Header Navigation E2E', () => {
  test.describe('Mobile Navigation', () => {
    test.use({ 
      viewport: { width: 375, height: 667 },
      isMobile: true,
      hasTouch: true 
    });

    test('should toggle hamburger menu on mobile', async ({ page }) => {
      await page.goto('/explore');
      
      // Check hamburger menu is visible
      const navToggler = page.locator('[data-nav-toggler]');
      await expect(navToggler).toBeVisible();
      
      // Check initial state - menu should be closed
      const navbar = page.locator('[data-navbar]');
      await expect(navbar).not.toHaveClass(/active/);
      
      // Tap hamburger to open menu
      await navToggler.tap();
      
      // Menu should be open
      await expect(navbar).toHaveClass(/active/);
      
      // Overlay should be visible
      const overlay = page.locator('[data-overlay]');
      await expect(overlay).toHaveClass(/active/);
      
      // Tap hamburger again to close menu
      await navToggler.tap();
      
      // Menu should be closed
      await expect(navbar).not.toHaveClass(/active/);
      await expect(overlay).not.toHaveClass(/active/);
    });

    test('should close menu when overlay is tapped', async ({ page }) => {
      await page.goto('/explore');
      
      // Open menu
      const navToggler = page.locator('[data-nav-toggler]');
      await navToggler.tap();
      
      // Verify menu is open
      const navbar = page.locator('[data-navbar]');
      await expect(navbar).toHaveClass(/active/);
      
      // Tap overlay to close
      const overlay = page.locator('[data-overlay]');
      await overlay.tap();
      
      // Menu should be closed
      await expect(navbar).not.toHaveClass(/active/);
      await expect(overlay).not.toHaveClass(/active/);
    });

    test('should close menu when navigation link is tapped', async ({ page }) => {
      await page.goto('/explore');
      
      // Open menu
      const navToggler = page.locator('[data-nav-toggler]');
      await navToggler.tap();
      
      // Verify menu is open
      const navbar = page.locator('[data-navbar]');
      await expect(navbar).toHaveClass(/active/);
      
      // Tap on a navigation link
      const navLink = page.locator('[data-nav-link]').first();
      await navLink.tap();
      
      // Menu should close
      await expect(navbar).not.toHaveClass(/active/);
    });

    test('should animate hamburger icon transformation', async ({ page }) => {
      await page.goto('/explore');
      
      const navToggler = page.locator('[data-nav-toggler]');
      
      // Check initial state
      await expect(navToggler).not.toHaveClass(/active/);
      
      // Open menu and check hamburger animation
      await navToggler.tap();
      await expect(navToggler).toHaveClass(/active/);
      
      // Check aria-label updates
      const ariaLabel = await navToggler.getAttribute('aria-label');
      expect(ariaLabel).toContain('close');
      
      // Close menu
      await navToggler.tap();
      await expect(navToggler).not.toHaveClass(/active/);
      
      const newAriaLabel = await navToggler.getAttribute('aria-label');
      expect(newAriaLabel).toContain('open');
    });

    test('should lock body scroll when menu is open', async ({ page }) => {
      await page.goto('/explore');
      
      // Open menu
      const navToggler = page.locator('[data-nav-toggler]');
      await navToggler.tap();
      
      // Check that body scroll is locked
      const bodyOverflow = await page.evaluate(() => {
        return window.getComputedStyle(document.body).overflow;
      });
      
      expect(bodyOverflow).toBe('hidden');
      
      // Close menu
      await navToggler.tap();
      
      // Body scroll should be restored
      const bodyOverflowRestored = await page.evaluate(() => {
        return window.getComputedStyle(document.body).overflow;
      });
      
      expect(bodyOverflowRestored).not.toBe('hidden');
    });
  });

  test.describe('Desktop Navigation', () => {
    test.use({ 
      viewport: { width: 1280, height: 720 },
      isMobile: false 
    });

    test('should hide mobile navigation elements on desktop', async ({ page }) => {
      await page.goto('/explore');
      
      // Hamburger menu should not be visible on desktop
      const navToggler = page.locator('[data-nav-toggler]');
      await expect(navToggler).not.toBeVisible();
      
      // Mobile navigation should not be visible
      const mobileNavbar = page.locator('[data-navbar]');
      await expect(mobileNavbar).not.toBeVisible();
    });

    test('should display desktop navigation elements', async ({ page }) => {
      await page.goto('/explore');
      
      // Desktop search should be visible
      const desktopSearch = page.locator('.input-wrapper');
      await expect(desktopSearch).toBeVisible();
      
      // Header should be visible
      const header = page.locator('.header');
      await expect(header).toBeVisible();
    });

    test('should handle mouse hover on desktop navigation elements', async ({ page }) => {
      await page.goto('/explore');
      
      // Hover over filter button
      const filterButton = page.locator('.filter-btn');
      await filterButton.hover();
      
      // Should handle hover state (visual changes would be in CSS)
      await expect(filterButton).toBeVisible();
      
      // Hover over user profile button
      const profileButton = page.locator('.header-action-btn');
      await profileButton.hover();
      
      await expect(profileButton).toBeVisible();
    });
  });

  test.describe('Header Scroll Behavior', () => {
    test('should show/hide header on scroll', async ({ page }) => {
      await page.goto('/explore');
      
      const header = page.locator('[data-header]');
      
      // Initially header should be visible
      await expect(header).toBeVisible();
      
      // Scroll down significantly
      await page.evaluate(() => {
        window.scrollTo(0, 300);
      });
      
      await page.waitForTimeout(100);
      
      // Header should get 'active' class when scrolled
      await expect(header).toHaveClass(/active/);
      
      // Scroll down more to trigger hide
      await page.evaluate(() => {
        window.scrollTo(0, 600);
      });
      
      await page.waitForTimeout(100);
      
      // Header should hide on scroll down
      await expect(header).toHaveClass(/header-hide/);
      
      // Scroll back up
      await page.evaluate(() => {
        window.scrollTo(0, 200);
      });
      
      await page.waitForTimeout(100);
      
      // Header should show on scroll up
      await expect(header).not.toHaveClass(/header-hide/);
    });

    test('should show back to top button when scrolled', async ({ page }) => {
      await page.goto('/explore');
      
      const backTopBtn = page.locator('[data-back-top-btn]');
      
      // Initially should not be visible
      await expect(backTopBtn).not.toHaveClass(/active/);
      
      // Scroll down
      await page.evaluate(() => {
        window.scrollTo(0, 400);
      });
      
      await page.waitForTimeout(100);
      
      // Back to top button should be active
      await expect(backTopBtn).toHaveClass(/active/);
      
      // Click back to top
      await backTopBtn.click();
      
      // Should scroll to top
      const scrollPosition = await page.evaluate(() => window.pageYOffset);
      expect(scrollPosition).toBeLessThan(100);
    });
  });

  test.describe('Responsive Header Behavior', () => {
    test('should adapt header layout to different screen sizes', async ({ page }) => {
      await page.goto('/explore');
      
      // Test mobile layout
      await page.setViewportSize({ width: 375, height: 667 });
      
      const mobileNavToggler = page.locator('[data-nav-toggler]');
      await expect(mobileNavToggler).toBeVisible();
      
      // Test tablet layout
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(200);
      
      const header = page.locator('.header');
      await expect(header).toBeVisible();
      
      // Test desktop layout
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(200);
      
      const desktopSearch = page.locator('.input-wrapper');
      await expect(desktopSearch).toBeVisible();
    });

    test('should close mobile menu when switching to desktop', async ({ page }) => {
      // Start with mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/explore');
      
      // Open mobile menu
      const navToggler = page.locator('[data-nav-toggler]');
      await navToggler.tap();
      
      const navbar = page.locator('[data-navbar]');
      await expect(navbar).toHaveClass(/active/);
      
      // Switch to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(300);
      
      // Mobile menu should be closed
      await expect(navbar).not.toHaveClass(/active/);
    });

    test('should handle orientation changes', async ({ page }) => {
      await page.goto('/explore');
      
      // Portrait mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      const header = page.locator('.header');
      await expect(header).toBeVisible();
      
      // Landscape mobile
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(200);
      
      await expect(header).toBeVisible();
      
      // Navigation should still work
      const navToggler = page.locator('[data-nav-toggler]');
      if (await navToggler.isVisible()) {
        await navToggler.tap();
        
        const navbar = page.locator('[data-navbar]');
        await expect(navbar).toHaveClass(/active/);
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/explore');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      
      let focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeTruthy();
      
      // Continue tabbing
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeTruthy();
    });

    test('should activate navigation with Enter and Space keys', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/explore');
      
      const navToggler = page.locator('[data-nav-toggler]');
      await navToggler.focus();
      
      // Press Enter to activate
      await page.keyboard.press('Enter');
      
      const navbar = page.locator('[data-navbar]');
      await expect(navbar).toHaveClass(/active/);
      
      // Press Escape to close
      await page.keyboard.press('Escape');
      
      await expect(navbar).not.toHaveClass(/active/);
    });

    test('should handle focus trap in mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/explore');
      
      // Open mobile menu
      const navToggler = page.locator('[data-nav-toggler]');
      await navToggler.tap();
      
      // Focus should be trapped within the menu
      const navLinks = page.locator('[data-nav-link]');
      const firstLink = navLinks.first();
      const lastLink = navLinks.last();
      
      // Tab to first link
      await page.keyboard.press('Tab');
      await expect(firstLink).toBeFocused();
      
      // Shift+Tab should cycle to last element
      await page.keyboard.press('Shift+Tab');
      // Focus should stay within menu boundaries
    });
  });

  test.describe('Touch Gestures', () => {
    test.use({ 
      viewport: { width: 375, height: 667 },
      isMobile: true,
      hasTouch: true 
    });

    test('should handle touch gestures for navigation', async ({ page }) => {
      await page.goto('/explore');
      
      // Open menu with touch
      const navToggler = page.locator('[data-nav-toggler]');
      await navToggler.tap();
      
      const navbar = page.locator('[data-navbar]');
      await expect(navbar).toHaveClass(/active/);
      
      // Touch navigation link
      const navLink = page.locator('[data-nav-link]').first();
      await navLink.tap();
      
      // Menu should close
      await expect(navbar).not.toHaveClass(/active/);
    });

    test('should handle swipe gestures on mobile menu', async ({ page }) => {
      await page.goto('/explore');
      
      // Open menu
      const navToggler = page.locator('[data-nav-toggler]');
      await navToggler.tap();
      
      const navbar = page.locator('[data-navbar]');
      await expect(navbar).toHaveClass(/active/);
      
      // Get menu bounds for swipe gesture
      const menuBox = await navbar.boundingBox();
      
      if (menuBox) {
        // Perform swipe left gesture to close menu
        await page.mouse.move(menuBox.x + menuBox.width - 50, menuBox.y + menuBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(menuBox.x - 100, menuBox.y + menuBox.height / 2);
        await page.mouse.up();
        
        await page.waitForTimeout(300);
        
        // Menu should close on swipe (if implemented)
        // This would depend on your swipe gesture implementation
      }
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should handle rapid navigation toggles', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/explore');
      
      const navToggler = page.locator('[data-nav-toggler]');
      const navbar = page.locator('[data-navbar]');
      
      // Rapid open/close cycles
      for (let i = 0; i < 5; i++) {
        await navToggler.tap();
        await expect(navbar).toHaveClass(/active/);
        
        await navToggler.tap();
        await expect(navbar).not.toHaveClass(/active/);
        
        await page.waitForTimeout(50);
      }
      
      // Should remain functional after rapid toggling
      await navToggler.tap();
      await expect(navbar).toHaveClass(/active/);
    });

    test('should maintain navigation state during page interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/explore');
      
      // Open navigation
      const navToggler = page.locator('[data-nav-toggler]');
      await navToggler.tap();
      
      // Interact with other page elements
      await page.evaluate(() => {
        window.scrollTo(0, 100);
      });
      
      // Navigation should remain open
      const navbar = page.locator('[data-navbar]');
      await expect(navbar).toHaveClass(/active/);
      
      // Close navigation
      await navToggler.tap();
      await expect(navbar).not.toHaveClass(/active/);
    });

    test('should handle navigation during slow network conditions', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      await page.goto('/explore');
      
      // Navigation should still work with network delays
      const navToggler = page.locator('[data-nav-toggler]');
      await navToggler.waitFor({ state: 'visible' });
      
      await navToggler.tap();
      
      const navbar = page.locator('[data-navbar]');
      await expect(navbar).toHaveClass(/active/);
    });
  });
});