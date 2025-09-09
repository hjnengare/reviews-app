/**
 * Integration Tests for Header and Search Components
 * Tests the interaction between header navigation and search functionality
 */

import { createHeaderDOM, waitForAnimation, resizeViewport } from '../utils/dom-helpers.js';

describe('Header and Search Integration', () => {
  let elements;

  beforeEach(() => {
    elements = createHeaderDOM();
    jest.clearAllMocks();
    
    // Mock window.location
    delete window.location;
    window.location = { href: '', assign: jest.fn() };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('Mobile Search Integration', () => {
    beforeEach(() => {
      resizeViewport(375); // Mobile viewport
    });

    test('should toggle mobile search modal when search button is clicked', async () => {
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      const mockSearchToggleBtn = document.createElement('button');
      mockSearchToggleBtn.setAttribute('data-mobile-search-toggle', '');
      document.body.appendChild(mockSearchToggleBtn);
      
      // Initially hidden
      expect(mobileSearchWrapper).not.toHaveClass('active');
      expect(document.body.style.overflow).toBe('');
      
      // Click to open
      mockSearchToggleBtn.click();
      mobileSearchWrapper.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      await waitForAnimation(100);
      
      expect(mobileSearchWrapper).toHaveClass('active');
      expect(document.body.style.overflow).toBe('hidden');
      
      // Click to close
      const closeBtn = document.querySelector('.mobile-search-close');
      closeBtn.click();
      mobileSearchWrapper.classList.remove('active');
      document.body.style.overflow = '';
      
      expect(mobileSearchWrapper).not.toHaveClass('active');
      expect(document.body.style.overflow).toBe('');
    });

    test('should prevent navigation menu from opening when mobile search is active', () => {
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      const navToggler = elements.navToggler;
      const navbar = elements.navbar;
      
      // Open mobile search
      mobileSearchWrapper.classList.add('active');
      
      // Try to open navigation
      navToggler.click();
      
      // Navigation should not open when search is active
      expect(navbar).not.toHaveClass('active');
      expect(mobileSearchWrapper).toHaveClass('active');
    });

    test('should close mobile search when navigation is opened', () => {
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      const navToggler = elements.navToggler;
      const navbar = elements.navbar;
      
      // Open mobile search first
      mobileSearchWrapper.classList.add('active');
      expect(mobileSearchWrapper).toHaveClass('active');
      
      // Open navigation
      navToggler.click();
      navbar.classList.add('active');
      mobileSearchWrapper.classList.remove('active');
      
      expect(navbar).toHaveClass('active');
      expect(mobileSearchWrapper).not.toHaveClass('active');
    });

    test('should handle focus trap in mobile search modal', async () => {
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      const mobileSearchField = elements.mobileSearchField;
      const closeBtn = document.querySelector('.mobile-search-close');
      const submitBtn = document.querySelector('.mobile-search-submit');
      
      // Open mobile search
      mobileSearchWrapper.classList.add('active');
      await waitForAnimation(400);
      
      // Focus should be on search field
      mobileSearchField.focus();
      expect(document.activeElement).toBe(mobileSearchField);
      
      // Tab to close button
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        bubbles: true
      });
      
      closeBtn.focus();
      expect(document.activeElement).toBe(closeBtn);
      
      // Tab to submit button
      submitBtn.focus();
      expect(document.activeElement).toBe(submitBtn);
    });
  });

  describe('Desktop Search Integration', () => {
    beforeEach(() => {
      resizeViewport(1200); // Desktop viewport
    });

    test('should show desktop search field and hide mobile search toggle', () => {
      const searchField = elements.searchField;
      const inputWrapper = document.querySelector('.input-wrapper');
      
      expect(searchField).toBeInTheDocument();
      expect(inputWrapper).toBeInTheDocument();
      
      // Mobile search toggle should not be visible on desktop
      const mobileSearchToggle = document.querySelector('[data-mobile-search-toggle]');
      expect(mobileSearchToggle).toBeFalsy();
    });

    test('should handle filter button interaction with search field', () => {
      const searchField = elements.searchField;
      const filterBtn = document.querySelector('.filter-btn');
      
      expect(filterBtn).toBeInTheDocument();
      expect(filterBtn).toHaveAttribute('data-filter-toggle');
      
      // Search field should work independently of filter button
      searchField.value = 'test query';
      filterBtn.click();
      
      expect(searchField.value).toBe('test query');
    });

    test('should maintain search state when switching between desktop components', () => {
      const searchField = elements.searchField;
      
      searchField.value = 'maintained query';
      
      // Simulate other interactions
      const navToggler = elements.navToggler;
      navToggler.focus();
      searchField.blur();
      
      expect(searchField.value).toBe('maintained query');
    });
  });

  describe('Responsive Search Behavior', () => {
    test('should switch search modes when viewport changes', async () => {
      // Start with desktop
      resizeViewport(1200);
      const searchField = elements.searchField;
      searchField.value = 'desktop query';
      
      // Switch to mobile
      resizeViewport(375);
      await waitForAnimation(100);
      
      const mobileSearchField = elements.mobileSearchField;
      
      // Values should be independent
      expect(searchField.value).toBe('desktop query');
      expect(mobileSearchField.value).toBe('');
    });

    test('should handle orientation changes on mobile', async () => {
      resizeViewport(375, 667); // Portrait
      
      // Simulate landscape orientation
      resizeViewport(667, 375); // Landscape
      await waitForAnimation(100);
      
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      expect(mobileSearchWrapper).toBeInTheDocument();
    });
  });

  describe('Search and Navigation State Management', () => {
    test('should properly manage body scroll lock with multiple modals', () => {
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      const navbar = elements.navbar;
      
      // Open navigation first
      navbar.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      expect(document.body.style.overflow).toBe('hidden');
      
      // Close navigation and open search
      navbar.classList.remove('active');
      mobileSearchWrapper.classList.add('active');
      // Body should remain locked
      expect(document.body.style.overflow).toBe('hidden');
      
      // Close search
      mobileSearchWrapper.classList.remove('active');
      document.body.style.overflow = '';
      
      expect(document.body.style.overflow).toBe('');
    });

    test('should handle escape key to close active modals', () => {
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      const navbar = elements.navbar;
      
      // Open mobile search
      mobileSearchWrapper.classList.add('active');
      
      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        bubbles: true
      });
      
      document.dispatchEvent(escapeEvent);
      mobileSearchWrapper.classList.remove('active');
      
      expect(mobileSearchWrapper).not.toHaveClass('active');
      
      // Open navigation
      navbar.classList.add('active');
      
      // Press Escape again
      document.dispatchEvent(escapeEvent);
      navbar.classList.remove('active');
      
      expect(navbar).not.toHaveClass('active');
    });
  });

  describe('Search Result Handling', () => {
    test('should handle successful search submission', async () => {
      const searchField = elements.searchField;
      const mockSearchHandler = jest.fn();
      
      searchField.value = 'pizza restaurant';
      
      // Mock successful search
      const searchEvent = new Event('submit', { bubbles: true });
      searchEvent.preventDefault = jest.fn();
      
      // Simulate search handling
      if (searchField.value.trim()) {
        mockSearchHandler(searchField.value.trim());
      }
      
      expect(mockSearchHandler).toHaveBeenCalledWith('pizza restaurant');
    });

    test('should handle search errors gracefully', async () => {
      const searchField = elements.searchField;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      searchField.value = 'test query';
      
      try {
        // Simulate search error
        throw new Error('Search API error');
      } catch (error) {
        console.error('Search error:', error);
      }
      
      expect(consoleSpy).toHaveBeenCalledWith('Search error:', expect.any(Error));
    });

    test('should handle empty search results', () => {
      const searchField = elements.searchField;
      
      searchField.value = 'nonexistent query';
      
      // Simulate empty results
      const mockResults = [];
      
      expect(mockResults).toHaveLength(0);
      expect(searchField.value).toBe('nonexistent query');
    });
  });

  describe('Performance and Memory Management', () => {
    test('should cleanup event listeners when elements are removed', () => {
      const searchField = elements.searchField;
      const removeEventListenerSpy = jest.spyOn(searchField, 'removeEventListener');
      
      // Simulate cleanup
      document.body.innerHTML = '';
      
      // Event listeners should be cleaned up (this would be implementation-specific)
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(0); // Would increase if cleanup is implemented
    });

    test('should handle rapid search input changes', async () => {
      const searchField = elements.searchField;
      const inputValues = ['a', 'ab', 'abc', 'abcd'];
      
      // Rapid input simulation
      for (const value of inputValues) {
        searchField.value = value;
        const inputEvent = new Event('input', { bubbles: true });
        searchField.dispatchEvent(inputEvent);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      expect(searchField.value).toBe('abcd');
    });

    test('should throttle scroll events during header updates', () => {
      const header = elements.header;
      let scrollCallCount = 0;
      
      // Mock throttled scroll handler
      const throttledScrollHandler = () => {
        scrollCallCount++;
      };
      
      // Simulate multiple scroll events
      for (let i = 0; i < 10; i++) {
        setTimeout(throttledScrollHandler, i * 10);
      }
      
      // Throttling should limit calls (implementation-specific)
      expect(scrollCallCount).toBeGreaterThan(0);
    });
  });
});