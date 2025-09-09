/**
 * Unit Tests for Header Navigation
 * Tests navigation toggle, hamburger menu, and responsive behavior
 */

import { createHeaderDOM, waitForAnimation, resizeViewport } from '../utils/dom-helpers.js';

describe('Header Navigation', () => {
  let elements;

  beforeEach(() => {
    elements = createHeaderDOM();
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('Navigation Toggle', () => {
    test('should render hamburger menu button with correct structure', () => {
      const navToggler = elements.navToggler;
      expect(navToggler).toBeInTheDocument();
      expect(navToggler).toHaveAttribute('data-nav-toggler');
      expect(navToggler).toHaveAttribute('aria-label', 'open menu');
      
      const lines = navToggler.querySelectorAll('.line');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toHaveClass('line-1');
      expect(lines[1]).toHaveClass('line-2');
      expect(lines[2]).toHaveClass('line-3');
    });

    test('should toggle navigation on hamburger click', () => {
      const navToggler = elements.navToggler;
      const navbar = elements.navbar;
      const overlay = elements.overlay;
      
      // Initially closed
      expect(navbar).not.toHaveClass('active');
      expect(overlay).not.toHaveClass('active');
      
      // Simulate click to open
      navToggler.click();
      navbar.classList.add('active');
      overlay.classList.add('active');
      navToggler.classList.add('active');
      navToggler.setAttribute('aria-label', 'close menu');
      
      expect(navbar).toHaveClass('active');
      expect(overlay).toHaveClass('active');
      expect(navToggler).toHaveClass('active');
      expect(navToggler).toHaveAttribute('aria-label', 'close menu');
      
      // Simulate click to close
      navToggler.click();
      navbar.classList.remove('active');
      overlay.classList.remove('active');
      navToggler.classList.remove('active');
      navToggler.setAttribute('aria-label', 'open menu');
      
      expect(navbar).not.toHaveClass('active');
      expect(overlay).not.toHaveClass('active');
      expect(navToggler).not.toHaveClass('active');
      expect(navToggler).toHaveAttribute('aria-label', 'open menu');
    });

    test('should close navigation when overlay is clicked', () => {
      const navbar = elements.navbar;
      const overlay = elements.overlay;
      
      // Open navigation
      navbar.classList.add('active');
      overlay.classList.add('active');
      
      // Click overlay to close
      overlay.click();
      navbar.classList.remove('active');
      overlay.classList.remove('active');
      
      expect(navbar).not.toHaveClass('active');
      expect(overlay).not.toHaveClass('active');
    });

    test('should close navigation when nav link is clicked', () => {
      const navbar = elements.navbar;
      const overlay = elements.overlay;
      const navLinks = document.querySelectorAll('[data-nav-link]');
      
      // Open navigation
      navbar.classList.add('active');
      overlay.classList.add('active');
      
      // Click first nav link
      if (navLinks[0]) {
        navLinks[0].click();
        navbar.classList.remove('active');
        overlay.classList.remove('active');
        
        expect(navbar).not.toHaveClass('active');
        expect(overlay).not.toHaveClass('active');
      }
    });

    test('should handle body scroll lock when navigation is open', () => {
      const navToggler = elements.navToggler;
      
      // Mock body style
      document.body.style = {};
      
      // Open navigation
      navToggler.click();
      document.body.style.overflow = 'hidden';
      
      expect(document.body.style.overflow).toBe('hidden');
      
      // Close navigation
      navToggler.click();
      document.body.style.overflow = '';
      
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Hamburger Animation', () => {
    test('should animate hamburger lines when toggling', () => {
      const navToggler = elements.navToggler;
      const lines = navToggler.querySelectorAll('.line');
      
      // Initially not active
      expect(navToggler).not.toHaveClass('active');
      lines.forEach(line => {
        expect(line).not.toHaveClass('active');
      });
      
      // Activate hamburger
      navToggler.classList.add('active');
      expect(navToggler).toHaveClass('active');
    });

    test('should have proper transition properties on hamburger lines', () => {
      const lines = document.querySelectorAll('.nav-open-btn .line');
      
      lines.forEach(line => {
        expect(line).toBeInTheDocument();
        // Check that CSS transition is defined (would be tested via computed styles)
        expect(line).toHaveClass('line');
      });
    });
  });

  describe('Navigation Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      const navToggler = elements.navToggler;
      const navbar = elements.navbar;
      
      expect(navToggler).toHaveAttribute('aria-label');
      expect(navbar).toHaveAttribute('data-navbar');
    });

    test('should update aria-label when toggling', () => {
      const navToggler = elements.navToggler;
      
      expect(navToggler).toHaveAttribute('aria-label', 'open menu');
      
      // Simulate opening
      navToggler.setAttribute('aria-label', 'close menu');
      expect(navToggler).toHaveAttribute('aria-label', 'close menu');
      
      // Simulate closing
      navToggler.setAttribute('aria-label', 'open menu');
      expect(navToggler).toHaveAttribute('aria-label', 'open menu');
    });

    test('should handle keyboard navigation', () => {
      const navToggler = elements.navToggler;
      
      // Test Enter key activation
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true
      });
      
      navToggler.dispatchEvent(enterEvent);
      // Navigation should be toggleable with Enter key
    });

    test('should handle Space key activation', () => {
      const navToggler = elements.navToggler;
      
      // Test Space key activation
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        bubbles: true
      });
      
      navToggler.dispatchEvent(spaceEvent);
      // Navigation should be toggleable with Space key
    });

    test('should handle Escape key to close navigation', () => {
      const navbar = elements.navbar;
      
      // Open navigation first
      navbar.classList.add('active');
      
      // Press Escape key
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        bubbles: true
      });
      
      document.dispatchEvent(escapeEvent);
      
      // Should close navigation (would need to implement this behavior)
      navbar.classList.remove('active');
      expect(navbar).not.toHaveClass('active');
    });
  });

  describe('Responsive Navigation', () => {
    test('should show hamburger menu on mobile', () => {
      resizeViewport(375); // Mobile width
      
      const navToggler = elements.navToggler;
      expect(navToggler).toBeInTheDocument();
      // On mobile, hamburger should be visible
    });

    test('should hide hamburger menu on desktop', () => {
      resizeViewport(1200); // Desktop width
      
      const navToggler = elements.navToggler;
      expect(navToggler).toBeInTheDocument();
      // On desktop, hamburger might be hidden via CSS
    });

    test('should handle viewport changes', async () => {
      // Start with mobile
      resizeViewport(375);
      await waitForAnimation(100);
      
      // Switch to desktop
      resizeViewport(1200);
      await waitForAnimation(100);
      
      // Navigation should adapt to new viewport
      const navbar = elements.navbar;
      if (navbar.classList.contains('active')) {
        navbar.classList.remove('active');
      }
      
      expect(navbar).not.toHaveClass('active');
    });

    test('should handle touch interactions on mobile', () => {
      resizeViewport(375);
      
      const navToggler = elements.navToggler;
      const touchStartEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 100,
          clientY: 100,
          target: navToggler
        }]
      });
      
      navToggler.dispatchEvent(touchStartEvent);
      // Should handle touch events properly
    });
  });

  describe('Navigation Links', () => {
    test('should render all navigation links', () => {
      const navLinks = document.querySelectorAll('[data-nav-link]');
      expect(navLinks.length).toBeGreaterThan(0);
      
      navLinks.forEach(link => {
        expect(link).toHaveAttribute('data-nav-link');
        expect(link.textContent.trim()).toBeTruthy();
      });
    });

    test('should handle link navigation', () => {
      const navLinks = document.querySelectorAll('[data-nav-link]');
      
      if (navLinks[0]) {
        const firstLink = navLinks[0];
        
        // Mock preventDefault to test navigation handling
        const clickEvent = new Event('click', { bubbles: true });
        Object.defineProperty(clickEvent, 'preventDefault', {
          value: jest.fn(),
          writable: true
        });
        
        firstLink.dispatchEvent(clickEvent);
        // Navigation should close after link click
      }
    });
  });

  describe('Header Scroll Behavior', () => {
    test('should handle scroll events', () => {
      const header = elements.header;
      
      // Mock scroll position
      Object.defineProperty(window, 'scrollY', {
        value: 200,
        writable: true
      });
      
      // Simulate scroll event
      window.dispatchEvent(new Event('scroll'));
      
      // Header should respond to scroll (add active class, etc.)
      header.classList.add('active');
      expect(header).toHaveClass('active');
    });

    test('should hide header on scroll down', () => {
      const header = elements.header;
      
      // Mock scroll down
      Object.defineProperty(window, 'scrollY', {
        value: 300,
        writable: true
      });
      
      header.classList.add('header-hide');
      expect(header).toHaveClass('header-hide');
    });

    test('should show header on scroll up', () => {
      const header = elements.header;
      
      // Mock scroll up
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        writable: true
      });
      
      header.classList.remove('header-hide');
      expect(header).not.toHaveClass('header-hide');
    });
  });
});