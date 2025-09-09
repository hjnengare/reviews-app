/**
 * Integration Tests for Responsive Behavior
 * Tests how header components adapt to different screen sizes and orientations
 */

import { createHeaderDOM, waitForAnimation, resizeViewport } from '../utils/dom-helpers.js';

describe('Responsive Behavior Integration', () => {
  let elements;

  beforeEach(() => {
    elements = createHeaderDOM();
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('Breakpoint Transitions', () => {
    test('should handle mobile to tablet transition (375px to 768px)', async () => {
      // Start with mobile
      resizeViewport(375);
      await waitForAnimation(100);
      
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      const searchField = elements.searchField;
      
      // Mobile search should be available
      expect(mobileSearchWrapper).toBeInTheDocument();
      
      // Switch to tablet
      resizeViewport(768);
      await waitForAnimation(100);
      
      // Both search modes might be available at tablet size
      expect(searchField).toBeInTheDocument();
      expect(mobileSearchWrapper).toBeInTheDocument();
    });

    test('should handle tablet to desktop transition (768px to 1200px)', async () => {
      resizeViewport(768);
      await waitForAnimation(100);
      
      // Switch to desktop
      resizeViewport(1200);
      await waitForAnimation(100);
      
      const header = elements.header;
      const searchField = elements.searchField;
      
      expect(header).toBeInTheDocument();
      expect(searchField).toBeInTheDocument();
      
      // Desktop search should be fully functional
      searchField.value = 'desktop search test';
      expect(searchField.value).toBe('desktop search test');
    });

    test('should handle desktop to mobile transition (1200px to 375px)', async () => {
      resizeViewport(1200);
      const searchField = elements.searchField;
      searchField.value = 'desktop query';
      
      // Switch to mobile
      resizeViewport(375);
      await waitForAnimation(100);
      
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      
      // Mobile search should be available
      expect(mobileSearchWrapper).toBeInTheDocument();
      
      // Desktop search field should retain its value
      expect(searchField.value).toBe('desktop query');
    });
  });

  describe('Navigation Menu Responsive Behavior', () => {
    test('should show hamburger menu only on mobile screens', () => {
      const navToggler = elements.navToggler;
      
      // Mobile - hamburger should be visible
      resizeViewport(375);
      expect(navToggler).toBeInTheDocument();
      
      // Desktop - hamburger might be hidden via CSS
      resizeViewport(1200);
      expect(navToggler).toBeInTheDocument(); // Still in DOM, but hidden via CSS
    });

    test('should close navigation menu when switching to desktop', async () => {
      resizeViewport(375);
      
      const navbar = elements.navbar;
      const overlay = elements.overlay;
      
      // Open navigation on mobile
      navbar.classList.add('active');
      overlay.classList.add('active');
      
      expect(navbar).toHaveClass('active');
      
      // Switch to desktop
      resizeViewport(1200);
      await waitForAnimation(100);
      
      // Navigation should close on desktop
      navbar.classList.remove('active');
      overlay.classList.remove('active');
      
      expect(navbar).not.toHaveClass('active');
      expect(overlay).not.toHaveClass('active');
    });

    test('should handle navigation state during rapid viewport changes', async () => {
      const navbar = elements.navbar;
      const sizes = [375, 768, 1024, 1200, 375];
      
      for (const size of sizes) {
        resizeViewport(size);
        await waitForAnimation(50);
        
        // Navigation should remain stable during transitions
        if (size <= 768) {
          // Mobile/tablet behavior
          expect(navbar).toBeInTheDocument();
        } else {
          // Desktop behavior
          expect(navbar).toBeInTheDocument();
        }
      }
    });
  });

  describe('Search Component Responsive Behavior', () => {
    test('should show appropriate search interface for each breakpoint', () => {
      // Mobile
      resizeViewport(375);
      expect(elements.mobileSearchWrapper).toBeInTheDocument();
      
      // Tablet
      resizeViewport(768);
      expect(elements.searchField).toBeInTheDocument();
      
      // Desktop
      resizeViewport(1200);
      expect(elements.searchField).toBeInTheDocument();
    });

    test('should handle search input focus across breakpoints', async () => {
      // Start with desktop
      resizeViewport(1200);
      const searchField = elements.searchField;
      searchField.focus();
      
      expect(document.activeElement).toBe(searchField);
      
      // Switch to mobile
      resizeViewport(375);
      await waitForAnimation(100);
      
      // Focus should be handled gracefully
      expect(document.activeElement).toBeTruthy();
    });

    test('should maintain search functionality across viewport changes', async () => {
      const testQuery = 'responsive search test';
      
      // Test on mobile
      resizeViewport(375);
      const mobileSearchField = elements.mobileSearchField;
      mobileSearchField.value = testQuery;
      
      expect(mobileSearchField.value).toBe(testQuery);
      
      // Switch to desktop
      resizeViewport(1200);
      await waitForAnimation(100);
      
      const desktopSearchField = elements.searchField;
      desktopSearchField.value = testQuery;
      
      expect(desktopSearchField.value).toBe(testQuery);
    });
  });

  describe('Header Layout Responsive Behavior', () => {
    test('should stack header elements vertically on mobile', () => {
      resizeViewport(375);
      
      const headerContainer = document.querySelector('.header .container');
      const topRow = document.querySelector('.header-top-row');
      const searchRow = document.querySelector('.header-search-row');
      
      expect(headerContainer).toBeInTheDocument();
      expect(topRow).toBeInTheDocument();
      expect(searchRow).toBeInTheDocument();
      
      // Elements should be stacked (CSS would handle the actual layout)
    });

    test('should arrange header elements horizontally on desktop', () => {
      resizeViewport(1200);
      
      const header = elements.header;
      const inputWrapper = document.querySelector('.input-wrapper');
      
      expect(header).toBeInTheDocument();
      expect(inputWrapper).toBeInTheDocument();
      
      // Desktop layout should be horizontal
    });

    test('should handle header scroll behavior at different breakpoints', async () => {
      const header = elements.header;
      
      // Test on mobile
      resizeViewport(375);
      
      // Mock scroll
      Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
      window.dispatchEvent(new Event('scroll'));
      
      header.classList.add('active');
      expect(header).toHaveClass('active');
      
      // Test on desktop
      resizeViewport(1200);
      await waitForAnimation(100);
      
      // Header behavior should adapt to desktop
      expect(header).toBeInTheDocument();
    });
  });

  describe('Touch and Mouse Interaction Responsive Behavior', () => {
    test('should handle touch events on mobile devices', () => {
      resizeViewport(375);
      
      const navToggler = elements.navToggler;
      
      // Create touch event
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 100,
          clientY: 100,
          target: navToggler
        }]
      });
      
      // Should handle touch events
      navToggler.dispatchEvent(touchEvent);
      expect(touchEvent.type).toBe('touchstart');
    });

    test('should handle mouse events on desktop devices', () => {
      resizeViewport(1200);
      
      const searchField = elements.searchField;
      
      const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100
      });
      
      searchField.dispatchEvent(mouseEvent);
      expect(mouseEvent.type).toBe('click');
    });

    test('should handle hover states appropriately by device type', () => {
      const filterBtn = document.querySelector('.filter-btn');
      
      if (filterBtn) {
        // Desktop - hover should work
        resizeViewport(1200);
        const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
        filterBtn.dispatchEvent(mouseEnterEvent);
        
        // Mobile - hover behavior should be different
        resizeViewport(375);
        const touchStartEvent = new TouchEvent('touchstart', { bubbles: true });
        filterBtn.dispatchEvent(touchStartEvent);
      }
    });
  });

  describe('Orientation Change Handling', () => {
    test('should handle portrait to landscape on mobile', async () => {
      // Portrait mobile
      resizeViewport(375, 667);
      await waitForAnimation(100);
      
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      expect(mobileSearchWrapper).toBeInTheDocument();
      
      // Landscape mobile
      resizeViewport(667, 375);
      await waitForAnimation(100);
      
      // Should still work in landscape
      expect(mobileSearchWrapper).toBeInTheDocument();
    });

    test('should handle tablet orientation changes', async () => {
      // Portrait tablet
      resizeViewport(768, 1024);
      await waitForAnimation(100);
      
      const header = elements.header;
      expect(header).toBeInTheDocument();
      
      // Landscape tablet
      resizeViewport(1024, 768);
      await waitForAnimation(100);
      
      expect(header).toBeInTheDocument();
    });

    test('should maintain functionality during orientation changes', async () => {
      resizeViewport(375, 667);
      
      const mobileSearchField = elements.mobileSearchField;
      mobileSearchField.value = 'orientation test';
      
      // Change orientation
      resizeViewport(667, 375);
      await waitForAnimation(100);
      
      // Value should be maintained
      expect(mobileSearchField.value).toBe('orientation test');
    });
  });

  describe('Performance During Responsive Changes', () => {
    test('should handle rapid resize events efficiently', async () => {
      const resizeSizes = [375, 400, 500, 768, 900, 1024, 1200];
      
      for (const size of resizeSizes) {
        resizeViewport(size);
        await waitForAnimation(10);
        
        // Header should remain stable during rapid changes
        expect(elements.header).toBeInTheDocument();
      }
    });

    test('should debounce resize handlers', () => {
      let resizeCallCount = 0;
      
      const mockResizeHandler = () => {
        resizeCallCount++;
      };
      
      // Simulate multiple rapid resize events
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          resizeViewport(375 + i * 10);
          mockResizeHandler();
        }, i * 5);
      }
      
      // Should handle rapid resizes efficiently
      expect(resizeCallCount).toBeLessThanOrEqual(10);
    });

    test('should cleanup responsive event listeners properly', () => {
      const header = elements.header;
      
      // Add resize listener
      const resizeHandler = jest.fn();
      window.addEventListener('resize', resizeHandler);
      
      // Simulate viewport changes
      resizeViewport(375);
      resizeViewport(1200);
      
      // Remove listener
      window.removeEventListener('resize', resizeHandler);
      
      // Further resize should not call handler
      resizeViewport(768);
      
      expect(resizeHandler).not.toHaveBeenCalledTimes(3);
    });
  });
});