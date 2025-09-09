# Test Suite for Reviews App

## Overview
Comprehensive automated test suite for the vanilla HTML + JS Reviews App, focusing on header functionality and mobile-first search features.

## Test Structure
- **unit/**: Unit tests for individual functions and components
- **integration/**: Integration tests for component interactions
- **e2e/**: End-to-end tests using Playwright
- **fixtures/**: Test data and mock responses
- **utils/**: Test utilities and helpers

## Running Tests
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Categories
1. **Header Component Tests**
   - Navigation toggle functionality
   - Responsive behavior
   - Accessibility compliance

2. **Search Functionality Tests**
   - Desktop search implementation
   - Mobile search modal behavior
   - Search input validation
   - Search submission handling

3. **Mobile-First Responsive Tests**
   - Viewport-based behavior changes
   - Touch interactions
   - Mobile search overlay
   - Navigation drawer functionality

4. **Accessibility Tests**
   - Keyboard navigation
   - ARIA attributes
   - Screen reader compatibility
   - Focus management