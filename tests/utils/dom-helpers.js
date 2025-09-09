/**
 * DOM Helper utilities for testing
 */

/**
 * Create a mock DOM structure for header testing
 */
export function createHeaderDOM() {
  const headerHTML = `
    <header class="header">
      <div class="header-top" data-header>
        <div class="container">
          <div class="header-top-row">
            <a href="#" class="logo">
              <span class="logo-text">Reviews</span>
            </a>
            <div class="header-actions">
              <button class="nav-open-btn" data-nav-toggler aria-label="open menu">
                <span class="line line-1"></span>
                <span class="line line-2"></span>
                <span class="line line-3"></span>
              </button>
              <button class="header-action-btn" aria-label="user profile">
                <ion-icon name="person-outline" aria-hidden="true"></ion-icon>
              </button>
            </div>
          </div>
          <div class="header-search-row">
            <div class="input-wrapper">
              <button class="search-icon-left" aria-label="search icon">
                <ion-icon name="search-outline" aria-hidden="true"></ion-icon>
              </button>
              <input type="search" name="search" placeholder="Search reviews, places, businesses..." class="search-field">
              <button class="filter-btn" data-filter-toggle aria-label="filter options">
                <ion-icon name="options-outline" aria-hidden="true"></ion-icon>
                <span class="filter-text">Filter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Search Modal -->
    <div class="mobile-search-wrapper" data-mobile-search>
      <button class="mobile-search-close" aria-label="close search" data-mobile-search-close>
        <ion-icon name="close-outline"></ion-icon>
      </button>
      <input type="search" name="mobile-search" placeholder="Search reviews, places, businesses..."
        class="mobile-search-field">
      <button class="mobile-search-submit" aria-label="search">
        <ion-icon name="search-outline" aria-hidden="true"></ion-icon>
      </button>
    </div>

    <!-- Navigation Overlay -->
    <div class="overlay" data-overlay></div>
    
    <!-- Mobile Navigation -->
    <nav class="navbar" data-navbar>
      <div class="navbar-top">
        <button class="nav-close-btn" data-nav-toggler aria-label="close menu">
          <ion-icon name="close-outline" aria-hidden="true"></ion-icon>
        </button>
      </div>
      <ul class="navbar-list">
        <li><a href="#" class="navbar-link" data-nav-link>Home</a></li>
        <li><a href="#" class="navbar-link" data-nav-link>Reviews</a></li>
        <li><a href="#" class="navbar-link" data-nav-link>Categories</a></li>
        <li><a href="#" class="navbar-link" data-nav-link>Profile</a></li>
      </ul>
    </nav>
  `;
  
  document.body.innerHTML = headerHTML;
  return {
    header: document.querySelector('.header'),
    searchField: document.querySelector('.search-field'),
    mobileSearchWrapper: document.querySelector('[data-mobile-search]'),
    mobileSearchField: document.querySelector('.mobile-search-field'),
    navToggler: document.querySelector('[data-nav-toggler]'),
    navbar: document.querySelector('[data-navbar]'),
    overlay: document.querySelector('[data-overlay]')
  };
}

/**
 * Simulate viewport resize
 */
export function resizeViewport(width, height = 800) {
  // Mock window.innerWidth and innerHeight
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
  
  // Update matchMedia mock based on common breakpoints
  window.matchMedia = jest.fn().mockImplementation(query => {
    const mediaQueries = {
      '(max-width: 768px)': width <= 768,
      '(max-width: 992px)': width <= 992,
      '(max-width: 1200px)': width <= 1200,
      '(min-width: 768px)': width >= 768,
      '(min-width: 992px)': width >= 992,
      '(min-width: 1200px)': width >= 1200,
    };
    
    return {
      matches: mediaQueries[query] || false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  });
}

/**
 * Simulate touch events for mobile testing
 */
export function createTouchEvent(type, target, touches = []) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  event.touches = touches;
  event.targetTouches = touches;
  event.changedTouches = touches;
  
  if (target) {
    target.dispatchEvent(event);
  }
  
  return event;
}

/**
 * Wait for animation/transition to complete
 */
export function waitForAnimation(duration = 300) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * Check if element is visually hidden
 */
export function isVisuallyHidden(element) {
  const style = window.getComputedStyle(element);
  return style.display === 'none' || 
         style.visibility === 'hidden' || 
         style.opacity === '0' ||
         element.getAttribute('aria-hidden') === 'true';
}

/**
 * Get computed style property
 */
export function getComputedStyleProperty(element, property) {
  return window.getComputedStyle(element).getPropertyValue(property);
}