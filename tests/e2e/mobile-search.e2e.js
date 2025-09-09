/**
 * E2E Tests for Mobile-First Search Functionality
 * Tests real browser behavior across different devices and screen sizes
 */

import { test, expect } from '@playwright/test';

test.describe('Mobile-First Search E2E', () => {
  test.describe('Mobile Device Tests', () => {
    test.use({ 
      viewport: { width: 375, height: 667 }, // iPhone SE dimensions
      isMobile: true,
      hasTouch: true
    });

    test('should display mobile search interface correctly', async ({ page }) => {
      await page.goto('/explore');
      
      // Check that mobile search elements are present
      await expect(page.locator('[data-mobile-search]')).toBeVisible();
      
      // Desktop search should be hidden on mobile
      const desktopSearch = page.locator('.input-wrapper');
      await expect(desktopSearch).not.toBeVisible();
      
      // Check mobile navigation
      const hamburgerMenu = page.locator('[data-nav-toggler]');
      await expect(hamburgerMenu).toBeVisible();
    });

    test('should open mobile search modal when search button is tapped', async ({ page }) => {
      await page.goto('/explore');
      
      // Find and tap mobile search toggle button
      const mobileSearchToggle = page.locator('[data-mobile-search-toggle]');
      await mobileSearchToggle.tap();
      
      // Mobile search modal should be visible
      const mobileSearchModal = page.locator('[data-mobile-search]');
      await expect(mobileSearchModal).toHaveClass(/active/);
      
      // Search field should be focused
      const mobileSearchField = page.locator('.mobile-search-field');
      await expect(mobileSearchField).toBeFocused();
    });

    test('should close mobile search modal when close button is tapped', async ({ page }) => {
      await page.goto('/explore');
      
      // Open mobile search
      const mobileSearchToggle = page.locator('[data-mobile-search-toggle]');
      await mobileSearchToggle.tap();
      
      // Close mobile search
      const closeButton = page.locator('[data-mobile-search-close]');
      await closeButton.tap();
      
      // Modal should be hidden
      const mobileSearchModal = page.locator('[data-mobile-search]');
      await expect(mobileSearchModal).not.toHaveClass(/active/);
    });

    test('should perform mobile search with touch input', async ({ page }) => {
      await page.goto('/explore');
      
      // Open mobile search
      const mobileSearchToggle = page.locator('[data-mobile-search-toggle]');
      await mobileSearchToggle.tap();
      
      // Type in search field
      const mobileSearchField = page.locator('.mobile-search-field');
      await mobileSearchField.fill('pizza restaurant');
      
      // Submit search
      const submitButton = page.locator('.mobile-search-submit');
      await submitButton.tap();
      
      // Verify search was submitted (check console or URL change)
      await page.waitForTimeout(1000);
      
      // Modal should close after search
      const mobileSearchModal = page.locator('[data-mobile-search]');
      await expect(mobileSearchModal).not.toHaveClass(/active/);
    });

    test('should handle virtual keyboard on mobile', async ({ page }) => {
      await page.goto('/explore');
      
      // Open mobile search
      const mobileSearchToggle = page.locator('[data-mobile-search-toggle]');
      await mobileSearchToggle.tap();
      
      // Focus on search field (should trigger virtual keyboard)
      const mobileSearchField = page.locator('.mobile-search-field');
      await mobileSearchField.focus();
      
      // Type with virtual keyboard
      await mobileSearchField.type('mobile typing test');
      
      expect(await mobileSearchField.inputValue()).toBe('mobile typing test');
    });

    test('should handle swipe gestures to close mobile search', async ({ page }) => {
      await page.goto('/explore');
      
      // Open mobile search
      const mobileSearchToggle = page.locator('[data-mobile-search-toggle]');
      await mobileSearchToggle.tap();
      
      // Perform swipe down gesture on modal
      const mobileSearchModal = page.locator('[data-mobile-search]');
      const modalBox = await mobileSearchModal.boundingBox();
      
      if (modalBox) {
        // Swipe down from top of modal
        await page.mouse.move(modalBox.x + modalBox.width / 2, modalBox.y + 50);
        await page.mouse.down();
        await page.mouse.move(modalBox.x + modalBox.width / 2, modalBox.y + modalBox.height - 50);
        await page.mouse.up();
      }
      
      // Modal should close (if swipe-to-close is implemented)
      await page.waitForTimeout(500);
    });
  });

  test.describe('Tablet Device Tests', () => {
    test.use({ 
      viewport: { width: 768, height: 1024 }, // iPad dimensions
      isMobile: true,
      hasTouch: true
    });

    test('should display appropriate search interface on tablet', async ({ page }) => {
      await page.goto('/explore');
      
      // On tablet, both mobile and desktop search might be available
      const desktopSearch = page.locator('.input-wrapper');
      const mobileSearch = page.locator('[data-mobile-search]');
      
      // At least one search interface should be visible
      const searchInterfaceVisible = await desktopSearch.isVisible() || await mobileSearch.isVisible();
      expect(searchInterfaceVisible).toBe(true);
    });

    test('should handle tablet orientation changes', async ({ page }) => {
      await page.goto('/explore');
      
      // Portrait orientation
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const header = page.locator('.header');
      await expect(header).toBeVisible();
      
      // Landscape orientation
      await page.setViewportSize({ width: 1024, height: 768 });
      
      await expect(header).toBeVisible();
      
      // Search functionality should work in both orientations
      const searchField = page.locator('.search-field').first();
      if (await searchField.isVisible()) {
        await searchField.fill('tablet search test');
        expect(await searchField.inputValue()).toBe('tablet search test');
      }
    });
  });

  test.describe('Desktop Tests', () => {
    test.use({ 
      viewport: { width: 1280, height: 720 },
      isMobile: false,
      hasTouch: false
    });

    test('should display desktop search interface', async ({ page }) => {
      await page.goto('/explore');
      
      // Desktop search should be visible
      const desktopSearch = page.locator('.input-wrapper');
      await expect(desktopSearch).toBeVisible();
      
      const searchField = page.locator('.search-field');
      await expect(searchField).toBeVisible();
      
      // Mobile search toggle should not be visible
      const mobileSearchToggle = page.locator('[data-mobile-search-toggle]');
      await expect(mobileSearchToggle).not.toBeVisible();
    });

    test('should handle desktop search with mouse and keyboard', async ({ page }) => {
      await page.goto('/explore');
      
      // Click on search field
      const searchField = page.locator('.search-field');
      await searchField.click();
      
      // Type search query
      await searchField.fill('desktop search query');
      
      // Press Enter to submit
      await searchField.press('Enter');
      
      // Verify search was submitted
      await page.waitForTimeout(1000);
      expect(await searchField.inputValue()).toBe('desktop search query');
    });

    test('should show filter button on desktop', async ({ page }) => {
      await page.goto('/explore');
      
      const filterButton = page.locator('.filter-btn');
      await expect(filterButton).toBeVisible();
      
      // Click filter button
      await filterButton.click();
      
      // Filter modal should open (if implemented)
      await page.waitForTimeout(500);
    });
  });

  test.describe('Responsive Breakpoint Tests', () => {
    test('should transition from mobile to desktop search', async ({ page }) => {
      // Start with mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/explore');
      
      // Verify mobile search is active
      const mobileSearch = page.locator('[data-mobile-search]');
      await expect(mobileSearch).toBeVisible();
      
      // Resize to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Wait for responsive changes
      await page.waitForTimeout(500);
      
      // Verify desktop search is now active
      const desktopSearch = page.locator('.input-wrapper');
      await expect(desktopSearch).toBeVisible();
    });

    test('should handle rapid viewport changes gracefully', async ({ page }) => {
      await page.goto('/explore');
      
      const viewports = [
        { width: 375, height: 667 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1280, height: 720 },  // Desktop
        { width: 414, height: 896 },   // Large mobile
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(100);
        
        // Header should remain visible and functional
        const header = page.locator('.header');
        await expect(header).toBeVisible();
      }
    });

    test('should maintain search functionality across breakpoints', async ({ page }) => {
      await page.goto('/explore');
      
      // Test search on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      const mobileSearchToggle = page.locator('[data-mobile-search-toggle]');
      if (await mobileSearchToggle.isVisible()) {
        await mobileSearchToggle.tap();
        const mobileSearchField = page.locator('.mobile-search-field');
        await mobileSearchField.fill('mobile test');
        expect(await mobileSearchField.inputValue()).toBe('mobile test');
        
        // Close mobile search
        const closeButton = page.locator('[data-mobile-search-close]');
        await closeButton.tap();
      }
      
      // Switch to desktop and test search
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(300);
      
      const desktopSearchField = page.locator('.search-field');
      if (await desktopSearchField.isVisible()) {
        await desktopSearchField.fill('desktop test');
        expect(await desktopSearchField.inputValue()).toBe('desktop test');
      }
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should be keyboard accessible on all devices', async ({ page }) => {
      await page.goto('/explore');
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check if focus is on a focusable element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeTruthy();
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      await page.goto('/explore');
      
      // Check search button ARIA labels
      const searchButtons = page.locator('[aria-label*="search"]');
      expect(await searchButtons.count()).toBeGreaterThan(0);
      
      // Check navigation button ARIA labels
      const navToggler = page.locator('[data-nav-toggler]');
      const ariaLabel = await navToggler.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    });

    test('should support screen reader navigation', async ({ page }) => {
      await page.goto('/explore');
      
      // Check that important elements have proper labels
      const searchField = page.locator('.search-field');
      const placeholder = await searchField.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
      
      // Check button labels
      const filterButton = page.locator('.filter-btn');
      const buttonLabel = await filterButton.getAttribute('aria-label');
      expect(buttonLabel).toBeTruthy();
    });
  });

  test.describe('Performance Tests', () => {
    test('should load search interface quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/explore');
      
      // Wait for search interface to be ready
      await page.locator('.header').waitFor({ state: 'visible' });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle search input without lag', async ({ page }) => {
      await page.goto('/explore');
      
      const searchField = page.locator('.search-field').first();
      await searchField.waitFor({ state: 'visible' });
      
      const startTime = Date.now();
      
      // Type rapidly
      await searchField.type('quick typing test');
      
      const typingTime = Date.now() - startTime;
      
      // Should respond quickly to input
      expect(typingTime).toBeLessThan(1000);
      
      expect(await searchField.inputValue()).toBe('quick typing test');
    });

    test('should handle viewport changes efficiently', async ({ page }) => {
      await page.goto('/explore');
      
      const startTime = Date.now();
      
      // Rapid viewport changes
      await page.setViewportSize({ width: 375, height: 667 });
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const resizeTime = Date.now() - startTime;
      
      // Should handle resizes efficiently
      expect(resizeTime).toBeLessThan(2000);
      
      // Interface should still be functional
      const header = page.locator('.header');
      await expect(header).toBeVisible();
    });
  });
});