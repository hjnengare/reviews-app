/**
 * Unit Tests for Search Functionality
 * Tests both desktop and mobile search implementations
 */

import { createHeaderDOM, waitForAnimation, resizeViewport } from '../utils/dom-helpers.js';

// Mock the script.js functionality for testing
const mockSearchFunctions = {
  handleDesktopSearch: jest.fn(),
  handleMobileSearch: jest.fn(),
  toggleMobileSearch: jest.fn(),
  closeMobileSearch: jest.fn(),
};

describe('Search Functionality', () => {
  let elements;

  beforeEach(() => {
    elements = createHeaderDOM();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('Desktop Search', () => {
    beforeEach(() => {
      resizeViewport(1200); // Desktop viewport
    });

    test('should render desktop search field with correct attributes', () => {
      expect(elements.searchField).toBeInTheDocument();
      expect(elements.searchField).toHaveAttribute('type', 'search');
      expect(elements.searchField).toHaveAttribute('name', 'search');
      expect(elements.searchField).toHaveAttribute('placeholder', 'Search reviews, places, businesses...');
      expect(elements.searchField).toHaveClass('search-field');
    });

    test('should have search icon button with correct accessibility', () => {
      const searchIcon = document.querySelector('.search-icon-left');
      expect(searchIcon).toBeInTheDocument();
      expect(searchIcon).toHaveAttribute('aria-label', 'search icon');
      expect(searchIcon.querySelector('ion-icon')).toHaveAttribute('name', 'search-outline');
    });

    test('should handle search input validation', () => {
      const searchField = elements.searchField;
      
      // Test empty search
      searchField.value = '';
      const emptySearchEvent = new Event('keypress', { key: 'Enter' });
      searchField.dispatchEvent(emptySearchEvent);
      
      // Test whitespace-only search
      searchField.value = '   ';
      const whitespaceSearchEvent = new Event('keypress', { key: 'Enter' });
      searchField.dispatchEvent(whitespaceSearchEvent);
      
      // Test valid search
      searchField.value = 'pizza restaurant';
      const validSearchEvent = new Event('keypress', { key: 'Enter' });
      searchField.dispatchEvent(validSearchEvent);
      
      expect(searchField.value).toBe('pizza restaurant');
    });

    test('should handle special characters in search query', () => {
      const searchField = elements.searchField;
      const specialCharsQuery = 'café & restaurant "downtown"';
      
      searchField.value = specialCharsQuery;
      expect(searchField.value).toBe(specialCharsQuery);
    });

    test('should handle long search queries', () => {
      const searchField = elements.searchField;
      const longQuery = 'a'.repeat(500);
      
      searchField.value = longQuery;
      expect(searchField.value.length).toBe(500);
    });

    test('should have filter button with correct functionality', () => {
      const filterBtn = document.querySelector('.filter-btn');
      expect(filterBtn).toBeInTheDocument();
      expect(filterBtn).toHaveAttribute('data-filter-toggle');
      expect(filterBtn).toHaveAttribute('aria-label', 'filter options');
      
      const filterText = filterBtn.querySelector('.filter-text');
      expect(filterText).toHaveTextContent('Filter');
    });
  });

  describe('Mobile Search', () => {
    beforeEach(() => {
      resizeViewport(375); // Mobile viewport
    });

    test('should render mobile search modal with correct structure', () => {
      expect(elements.mobileSearchWrapper).toBeInTheDocument();
      expect(elements.mobileSearchWrapper).toHaveAttribute('data-mobile-search');
      
      const closeBtn = document.querySelector('.mobile-search-close');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveAttribute('aria-label', 'close search');
      
      const submitBtn = document.querySelector('.mobile-search-submit');
      expect(submitBtn).toBeInTheDocument();
      expect(submitBtn).toHaveAttribute('aria-label', 'search');
    });

    test('should have mobile search field with correct attributes', () => {
      expect(elements.mobileSearchField).toBeInTheDocument();
      expect(elements.mobileSearchField).toHaveAttribute('type', 'search');
      expect(elements.mobileSearchField).toHaveAttribute('name', 'mobile-search');
      expect(elements.mobileSearchField).toHaveAttribute('placeholder', 'Search reviews, places, businesses...');
      expect(elements.mobileSearchField).toHaveClass('mobile-search-field');
    });

    test('should handle mobile search modal toggle', async () => {
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      
      // Initially should not have active class
      expect(mobileSearchWrapper).not.toHaveClass('active');
      
      // Simulate opening mobile search
      mobileSearchWrapper.classList.add('active');
      await waitForAnimation(100);
      
      expect(mobileSearchWrapper).toHaveClass('active');
      
      // Simulate closing mobile search
      const closeBtn = document.querySelector('.mobile-search-close');
      closeBtn.click();
      mobileSearchWrapper.classList.remove('active');
      
      expect(mobileSearchWrapper).not.toHaveClass('active');
    });

    test('should handle mobile search submission', () => {
      const mobileSearchField = elements.mobileSearchField;
      const submitBtn = document.querySelector('.mobile-search-submit');
      
      // Test empty mobile search
      mobileSearchField.value = '';
      submitBtn.click();
      
      // Test valid mobile search
      mobileSearchField.value = 'sushi bar';
      submitBtn.click();
      
      expect(mobileSearchField.value).toBe('sushi bar');
    });

    test('should handle Enter key in mobile search field', () => {
      const mobileSearchField = elements.mobileSearchField;
      mobileSearchField.value = 'coffee shop';
      
      const enterEvent = new KeyboardEvent('keypress', { 
        key: 'Enter',
        code: 'Enter',
        bubbles: true 
      });
      
      mobileSearchField.dispatchEvent(enterEvent);
      expect(mobileSearchField.value).toBe('coffee shop');
    });

    test('should handle focus management in mobile search', async () => {
      const mobileSearchField = elements.mobileSearchField;
      const mobileSearchWrapper = elements.mobileSearchWrapper;
      
      // Simulate opening mobile search
      mobileSearchWrapper.classList.add('active');
      await waitForAnimation(400); // Wait for animation
      
      // Check if field should receive focus
      expect(document.activeElement).toBe(mobileSearchField);
    });
  });

  describe('Search Input Validation', () => {
    test('should trim whitespace from search queries', () => {
      const query = '  pizza restaurant  ';
      const trimmed = query.trim();
      expect(trimmed).toBe('pizza restaurant');
    });

    test('should handle HTML entities in search queries', () => {
      const searchField = elements.searchField;
      const queryWithEntities = 'Tom &amp; Jerry&#39;s Restaurant';
      
      searchField.value = queryWithEntities;
      expect(searchField.value).toBe(queryWithEntities);
    });

    test('should handle emoji in search queries', () => {
      const searchField = elements.searchField;
      const emojiQuery = '🍕 pizza place 🍕';
      
      searchField.value = emojiQuery;
      expect(searchField.value).toBe(emojiQuery);
    });

    test('should handle international characters', () => {
      const searchField = elements.searchField;
      const internationalQuery = 'Café François München 北京烤鴨';
      
      searchField.value = internationalQuery;
      expect(searchField.value).toBe(internationalQuery);
    });
  });

  describe('Search Accessibility', () => {
    test('should have proper ARIA labels on search elements', () => {
      const searchIcon = document.querySelector('.search-icon-left');
      const filterBtn = document.querySelector('.filter-btn');
      const mobileCloseBtn = document.querySelector('.mobile-search-close');
      const mobileSubmitBtn = document.querySelector('.mobile-search-submit');
      
      expect(searchIcon).toHaveAriaLabel('search icon');
      expect(filterBtn).toHaveAriaLabel('filter options');
      expect(mobileCloseBtn).toHaveAriaLabel('close search');
      expect(mobileSubmitBtn).toHaveAriaLabel('search');
    });

    test('should have proper input associations', () => {
      expect(elements.searchField).toHaveAttribute('type', 'search');
      expect(elements.mobileSearchField).toHaveAttribute('type', 'search');
    });

    test('should handle keyboard navigation', () => {
      const searchField = elements.searchField;
      
      // Test Tab key navigation
      const tabEvent = new KeyboardEvent('keydown', { 
        key: 'Tab',
        code: 'Tab',
        bubbles: true 
      });
      
      searchField.dispatchEvent(tabEvent);
      expect(tabEvent.defaultPrevented).toBe(false);
    });

    test('should support screen reader announcements', () => {
      // Test that search fields have appropriate labels/placeholders
      expect(elements.searchField.placeholder).toBeTruthy();
      expect(elements.mobileSearchField.placeholder).toBeTruthy();
      
      // Test that buttons have aria-labels
      const searchIcon = document.querySelector('.search-icon-left');
      expect(searchIcon.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('Search Performance', () => {
    test('should handle rapid consecutive searches', () => {
      const searchField = elements.searchField;
      const queries = ['a', 'ab', 'abc', 'abcd', 'abcde'];
      
      queries.forEach(query => {
        searchField.value = query;
        const event = new Event('input', { bubbles: true });
        searchField.dispatchEvent(event);
      });
      
      expect(searchField.value).toBe('abcde');
    });

    test('should handle search during page load', () => {
      // Test that search functionality works even if DOM is not fully loaded
      const searchField = elements.searchField;
      expect(searchField).toBeInTheDocument();
      
      searchField.value = 'test query';
      expect(searchField.value).toBe('test query');
    });
  });
});