/**
 * Jest setup file for Reviews App tests
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
  localStorage.clear();
  sessionStorage.clear();
});

// Custom matchers
expect.extend({
  toBeVisible(element) {
    const pass = element && getComputedStyle(element).display !== 'none' && 
                 getComputedStyle(element).visibility !== 'hidden' &&
                 getComputedStyle(element).opacity !== '0';
    
    return {
      message: () => `Expected element to ${pass ? 'not ' : ''}be visible`,
      pass,
    };
  },
  
  toHaveAriaLabel(element, expectedLabel) {
    const actualLabel = element.getAttribute('aria-label');
    const pass = actualLabel === expectedLabel;
    
    return {
      message: () => `Expected element to have aria-label "${expectedLabel}", but got "${actualLabel}"`,
      pass,
    };
  }
});