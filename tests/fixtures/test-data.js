/**
 * Test Data Fixtures
 * Provides consistent test data for all test types
 */

export const SEARCH_QUERIES = {
  valid: {
    simple: 'pizza',
    restaurant: 'pizza restaurant',
    location: 'pizza restaurant downtown',
    complex: 'best italian pizza restaurant near me',
    withSpecialChars: 'café & restaurant "downtown"',
    unicode: 'Café François München 北京烤鴨',
    emoji: '🍕 pizza place 🍕',
    long: 'a'.repeat(200),
    numeric: '123 restaurant street',
    mixed: 'Pizza123 & Café!'
  },
  invalid: {
    empty: '',
    whitespaceOnly: '   ',
    tabs: '\t\t\t',
    newlines: '\n\n\n'
  },
  edge: {
    singleChar: 'a',
    maxLength: 'a'.repeat(500),
    htmlTags: '<script>alert("test")</script>',
    sqlInjection: "'; DROP TABLE users; --",
    xss: '<img src=x onerror=alert(1)>'
  }
};

export const VIEWPORT_SIZES = {
  mobile: {
    small: { width: 320, height: 568 }, // iPhone SE (old)
    medium: { width: 375, height: 667 }, // iPhone SE
    large: { width: 414, height: 896 }, // iPhone 11 Pro Max
  },
  tablet: {
    portrait: { width: 768, height: 1024 }, // iPad
    landscape: { width: 1024, height: 768 }, // iPad landscape
    pro: { width: 1024, height: 1366 }, // iPad Pro
  },
  desktop: {
    small: { width: 1024, height: 768 },
    medium: { width: 1280, height: 720 },
    large: { width: 1920, height: 1080 },
    ultrawide: { width: 2560, height: 1440 }
  }
};

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
};

export const USER_INTERACTIONS = {
  clicks: {
    single: 1,
    double: 2,
    rapid: 5
  },
  keystrokes: {
    enter: 'Enter',
    escape: 'Escape',
    tab: 'Tab',
    space: ' ',
    arrowUp: 'ArrowUp',
    arrowDown: 'ArrowDown',
    arrowLeft: 'ArrowLeft',
    arrowRight: 'ArrowRight'
  },
  touch: {
    tap: 'tap',
    doubleTap: 'dblclick',
    longPress: 'longpress',
    swipeLeft: 'swipeleft',
    swipeRight: 'swiperight',
    swipeUp: 'swipeup',
    swipeDown: 'swipedown'
  }
};

export const TIMING = {
  animation: {
    short: 150,
    medium: 300,
    long: 500
  },
  debounce: {
    search: 300,
    scroll: 100,
    resize: 250
  },
  timeout: {
    element: 5000,
    page: 30000,
    network: 10000
  }
};

export const CSS_SELECTORS = {
  header: {
    main: '.header',
    container: '.header .container',
    topRow: '.header-top-row',
    searchRow: '.header-search-row',
    logo: '.logo',
    logoText: '.logo-text'
  },
  navigation: {
    toggler: '[data-nav-toggler]',
    navbar: '[data-navbar]',
    overlay: '[data-overlay]',
    links: '[data-nav-link]',
    closeBtn: '.nav-close-btn'
  },
  search: {
    desktop: {
      wrapper: '.input-wrapper',
      field: '.search-field',
      icon: '.search-icon-left',
      filter: '.filter-btn'
    },
    mobile: {
      wrapper: '[data-mobile-search]',
      field: '.mobile-search-field',
      toggle: '[data-mobile-search-toggle]',
      close: '[data-mobile-search-close]',
      submit: '.mobile-search-submit'
    }
  },
  buttons: {
    headerAction: '.header-action-btn',
    backToTop: '[data-back-top-btn]',
    filter: '[data-filter-toggle]'
  }
};

export const ARIA_ATTRIBUTES = {
  labels: {
    searchIcon: 'search icon',
    userProfile: 'user profile',
    openMenu: 'open menu',
    closeMenu: 'close menu',
    closeSearch: 'close search',
    filterOptions: 'filter options'
  },
  states: {
    expanded: 'aria-expanded',
    hidden: 'aria-hidden',
    label: 'aria-label',
    pressed: 'aria-pressed'
  }
};

export const MOCK_RESPONSES = {
  search: {
    success: {
      results: [
        {
          id: 1,
          name: "Mario's Pizza Palace",
          rating: 4.5,
          category: 'Restaurant',
          location: 'Downtown'
        },
        {
          id: 2,
          name: "Bella's Italian Kitchen",
          rating: 4.8,
          category: 'Restaurant',
          location: 'Midtown'
        }
      ],
      total: 25,
      page: 1
    },
    empty: {
      results: [],
      total: 0,
      page: 1
    },
    error: {
      error: 'Search service temporarily unavailable',
      code: 503
    }
  }
};

export const PERFORMANCE_THRESHOLDS = {
  loadTime: {
    excellent: 1000,
    good: 2000,
    acceptable: 3000
  },
  searchResponse: {
    excellent: 200,
    good: 500,
    acceptable: 1000
  },
  animation: {
    smooth: 16.67, // 60fps
    acceptable: 33.33 // 30fps
  }
};

export const ACCESSIBILITY_REQUIREMENTS = {
  contrast: {
    normal: 4.5,
    large: 3.0
  },
  focus: {
    visible: true,
    logical: true
  },
  keyboard: {
    allInteractive: true,
    noTrap: true
  }
};

// Utility functions for test data
export const createSearchQuery = (type = 'simple') => {
  const queries = SEARCH_QUERIES.valid;
  return queries[type] || queries.simple;
};

export const getViewportForDevice = (device = 'mobile', size = 'medium') => {
  return VIEWPORT_SIZES[device]?.[size] || VIEWPORT_SIZES.mobile.medium;
};

export const getRandomSearchQuery = () => {
  const validQueries = Object.values(SEARCH_QUERIES.valid);
  return validQueries[Math.floor(Math.random() * validQueries.length)];
};

export const createMockUser = (overrides = {}) => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test User',
    email: 'test@example.com',
    preferences: {
      theme: 'light',
      language: 'en'
    },
    ...overrides
  };
};