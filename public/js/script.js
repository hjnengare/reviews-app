'use strict';



/**
 * add event on element
 */

const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
}



/**
 * navbar toggle
 */

const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  const isActive = navbar.classList.contains("active");
  
  if (isActive) {
    // Close navbar
    navbar.classList.remove("active");
    overlay.classList.remove("active");
    // Enable body scroll
    document.body.style.overflow = '';
    // Reset X animation to hamburger
    navTogglers.forEach(toggler => {
      toggler.classList.remove("active");
      toggler.setAttribute("aria-label", "open menu");
    });
  } else {
    // Open navbar
    navbar.classList.add("active");
    overlay.classList.add("active");
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    // Activate X animation
    navTogglers.forEach(toggler => {
      toggler.classList.add("active");
      toggler.setAttribute("aria-label", "close menu");
    });
  }
}

addEventOnElem(navTogglers, "click", toggleNavbar);

const closeNavbar = function () {
  navbar.classList.remove("active");
  overlay.classList.remove("active");
  // Enable body scroll
  document.body.style.overflow = '';
  // Reset X animation to hamburger
  navTogglers.forEach(toggler => {
    toggler.classList.remove("active");
    toggler.setAttribute("aria-label", "open menu");
  });
}

addEventOnElem(navbarLinks, "click", closeNavbar);

// Close navbar when clicking overlay
addEventOnElem(overlay, "click", closeNavbar);



/**
 * alert slider - continuous cycling messages
 */

const alertTexts = document.querySelectorAll(".alert-text");
let currentAlert = 0;

const showNextAlert = function() {
  const currentText = alertTexts[currentAlert];
  
  // Remove any existing animation
  currentText.classList.remove("animate");
  
  // Trigger the animation
  setTimeout(() => {
    currentText.classList.add("animate");
  }, 50);
  
  // Move to next alert after animation completes
  setTimeout(() => {
    currentText.classList.remove("animate");
    currentAlert = (currentAlert + 1) % alertTexts.length;
    showNextAlert(); // Immediately start next animation
  }, 4000); // 4 seconds total animation time
};

// Initialize alert slider
if (alertTexts.length > 0) {
  // Start the continuous cycle immediately
  showNextAlert();
}



/**
 * sophisticated hero slider - continuous premium rotation
 */

const heroSlides = document.querySelectorAll("[data-hero-slide]");
const indicators = document.querySelectorAll(".indicator");
let currentSlide = 0;
let slideInterval;
let isTransitioning = false;

const showSlide = function(index, immediate = false) {
  if (isTransitioning && !immediate) return;
  
  isTransitioning = true;
  
  // Remove all classes from slides
  heroSlides.forEach((slide, i) => {
    slide.classList.remove("active", "next", "prev");
    
    if (i === index) {
      slide.classList.add("active");
    } else if (i === (index + 1) % heroSlides.length) {
      slide.classList.add("next");
    } else if (i === (index - 1 + heroSlides.length) % heroSlides.length) {
      slide.classList.add("prev");
    }
  });
  
  // Update indicators with stagger animation
  indicators.forEach((indicator, i) => {
    indicator.classList.remove("active");
    if (i === index) {
      setTimeout(() => {
        indicator.classList.add("active");
      }, 300);
    }
  });
  
  currentSlide = index;
  
  // Reset transition lock after animation completes
  setTimeout(() => {
    isTransitioning = false;
  }, immediate ? 0 : 2000);
};

const nextSlide = function() {
  const next = (currentSlide + 1) % heroSlides.length;
  showSlide(next);
};

const startContinuousSlideShow = function() {
  slideInterval = setInterval(() => {
    nextSlide();
  }, 6000); // Sophisticated 6-second interval
};

const pauseSlideShow = function() {
  clearInterval(slideInterval);
};

const resumeSlideShow = function() {
  clearInterval(slideInterval);
  startContinuousSlideShow();
};

// Add click event to indicators with sophisticated transitions
indicators.forEach((indicator, index) => {
  indicator.addEventListener("click", () => {
    if (!isTransitioning) {
      showSlide(index);
      pauseSlideShow();
      setTimeout(resumeSlideShow, 3000); // Resume after 3 seconds
    }
  });
});

// Initialize sophisticated slideshow
if (heroSlides.length > 0) {
  showSlide(0, true); // Show first slide immediately
  
  // Start continuous rotation after initial load
  setTimeout(() => {
    startContinuousSlideShow();
  }, 4000); // Start rotation after 4 seconds
  
  // Sophisticated pause/resume on interaction
  const heroSlider = document.querySelector(".hero-slider");
  if (heroSlider) {
    let pauseTimeout;
    
    heroSlider.addEventListener("mouseenter", () => {
      clearTimeout(pauseTimeout);
      pauseSlideShow();
    });
    
    heroSlider.addEventListener("mouseleave", () => {
      pauseTimeout = setTimeout(() => {
        resumeSlideShow();
      }, 1000); // Resume 1 second after mouse leave
    });
  }
}



/**
 * optimized scroll handler with throttling and performance improvements
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");
const alert = document.querySelector(".alert");
const categoryNav = document.querySelector(".category-nav");
const sections = document.querySelectorAll("[data-section]");

// Performance optimization: cache viewport height
let viewportHeight = window.innerHeight;
let lastScrolledPos = 0;
let scrollThreshold = 150;
let ticking = false;

// Throttled scroll function using requestAnimationFrame
const throttledScroll = function() {
  if (!ticking) {
    requestAnimationFrame(handleScroll);
    ticking = true;
  }
};

const handleScroll = function() {
  const currentScroll = window.scrollY;
  const scrollDirection = currentScroll > lastScrolledPos ? 'down' : 'up';
  
  // Header active state with improved performance
  if (currentScroll > scrollThreshold) {
    if (!header.classList.contains("active")) {
      header.classList.add("active");
      backTopBtn.classList.add("active");
      
      if (alert && !alert.classList.contains("hidden")) {
        alert.classList.add("hidden");
      }
      if (categoryNav && !categoryNav.classList.contains("scrolled")) {
        categoryNav.classList.add("scrolled");
      }
    }
  } else {
    if (header.classList.contains("active")) {
      header.classList.remove("active");
      backTopBtn.classList.remove("active");
      
      if (alert && alert.classList.contains("hidden")) {
        alert.classList.remove("hidden");
      }
      if (categoryNav && categoryNav.classList.contains("scrolled")) {
        categoryNav.classList.remove("scrolled");
      }
    }
  }
  
  // Header hide/show based on scroll direction with hysteresis
  const scrollDelta = Math.abs(currentScroll - lastScrolledPos);
  if (scrollDelta > 10) { // Minimum scroll distance to trigger
    if (scrollDirection === 'down' && currentScroll > scrollThreshold) {
      if (!header.classList.contains("header-hide")) {
        header.classList.add("header-hide");
      }
    } else if (scrollDirection === 'up') {
      if (header.classList.contains("header-hide")) {
        header.classList.remove("header-hide");
      }
    }
  }
  
  // Optimized scroll reveal with intersection observer fallback
  const revealThreshold = viewportHeight * 0.75;
  sections.forEach(section => {
    if (!section.classList.contains("active")) {
      const rect = section.getBoundingClientRect();
      if (rect.top < revealThreshold && rect.bottom > 0) {
        section.classList.add("active");
      }
    }
  });
  
  lastScrolledPos = currentScroll;
  ticking = false;
};

// Use Intersection Observer for better performance where supported
const createIntersectionObserver = function() {
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('active')) {
          entry.target.classList.add('active');
          // Unobserve after activation for better performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    sections.forEach(section => {
      if (!section.classList.contains('active')) {
        observer.observe(section);
      }
    });
    
    return true;
  }
  return false;
};

// Initialize scroll handling
const initializeScrollHandling = function() {
  // Initial scroll reveal check
  handleScroll();
  
  // Try to use Intersection Observer, fallback to scroll listener
  if (!createIntersectionObserver()) {
    addEventOnElem(window, "scroll", throttledScroll);
  } else {
    // Still need scroll listener for header behavior
    addEventOnElem(window, "scroll", throttledScroll);
  }
  
  // Update viewport height on resize
  window.addEventListener('resize', () => {
    viewportHeight = window.innerHeight;
  }, { passive: true });
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScrollHandling);
} else {
  initializeScrollHandling();
}

/**
 * FILTERS MODAL FUNCTIONALITY
 */

const filtersModal = document.querySelector('[data-filters-modal]');
const filtersToggle = document.querySelector('[data-filter-toggle]');
const filtersClose = document.querySelector('[data-filters-close]');
const filtersOverlay = document.querySelector('[data-filters-overlay]');
const filtersClear = document.querySelector('[data-filters-clear]');
const filtersForm = document.getElementById('filtersForm');
const distanceRange = document.getElementById('distanceRange');
const distanceValue = document.getElementById('distanceValue');

// Toggle filters modal
const toggleFiltersModal = function() {
  filtersModal.classList.toggle('active');
  document.body.style.overflow = filtersModal.classList.contains('active') ? 'hidden' : '';
};

// Close filters modal
const closeFiltersModal = function() {
  filtersModal.classList.remove('active');
  document.body.style.overflow = '';
};

// Distance range update
const updateDistanceValue = function() {
  if (distanceRange && distanceValue) {
    distanceValue.textContent = `${distanceRange.value} km`;
    
    // Update range background
    const percentage = ((distanceRange.value - distanceRange.min) / (distanceRange.max - distanceRange.min)) * 100;
    distanceRange.style.background = `linear-gradient(to right, var(--orange-crayola) 0%, var(--orange-crayola) ${percentage}%, var(--cultured) ${percentage}%, var(--cultured) 100%)`;
  }
};

// Rating stars functionality
const initializeRatingStars = function() {
  const ratingStars = document.querySelectorAll('.filter-star');
  const ratingText = document.querySelector('.filter-rating-text');
  let selectedRating = 3; // Default rating
  
  // Set initial state
  updateRatingDisplay(selectedRating);
  
  function updateRatingDisplay(rating) {
    ratingStars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active');
        star.querySelector('ion-icon').name = 'star';
      } else {
        star.classList.remove('active');
        star.querySelector('ion-icon').name = 'star-outline';
      }
    });
    
    if (ratingText) {
      ratingText.textContent = `${rating}.0 & up`;
    }
  }
  
  // Add click handlers
  ratingStars.forEach((star, index) => {
    star.addEventListener('click', () => {
      selectedRating = index + 1;
      updateRatingDisplay(selectedRating);
    });
  });
};

// Clear all filters
const clearAllFilters = function() {
  if (!filtersForm) return;
  
  // Reset form
  filtersForm.reset();
  
  // Reset distance range
  if (distanceRange) {
    distanceRange.value = 10;
    updateDistanceValue();
  }
  
  // Reset rating stars
  const ratingStars = document.querySelectorAll('.filter-star');
  ratingStars.forEach((star, index) => {
    if (index < 3) {
      star.classList.add('active');
      star.querySelector('ion-icon').name = 'star';
    } else {
      star.classList.remove('active');
      star.querySelector('ion-icon').name = 'star-outline';
    }
  });
  
  const ratingText = document.querySelector('.filter-rating-text');
  if (ratingText) {
    ratingText.textContent = '3.0 & up';
  }
};

// Apply filters (form submission)
const applyFilters = function(e) {
  e.preventDefault();
  
  // Collect form data
  const formData = new FormData(filtersForm);
  const filters = {};
  
  // Get all form values
  for (let [key, value] of formData.entries()) {
    if (filters[key]) {
      // Handle multiple values (checkboxes)
      if (Array.isArray(filters[key])) {
        filters[key].push(value);
      } else {
        filters[key] = [filters[key], value];
      }
    } else {
      filters[key] = value;
    }
  }
  
  // Get rating value
  const activeStars = document.querySelectorAll('.filter-star.active').length;
  filters.rating = activeStars;
  
  console.log('Applied filters:', filters);
  
  // Here you would typically:
  // 1. Send filters to your backend API
  // 2. Update the displayed results
  // 3. Update URL parameters
  // 4. Close the modal
  
  closeFiltersModal();
  
  // Show a temporary notification (optional)
  // You could implement a toast notification here
  alert(`Filters applied! Found ${Math.floor(Math.random() * 50) + 10} results.`);
};

// Initialize filters modal functionality
const initializeFiltersModal = function() {
  if (!filtersModal || !filtersToggle) return;
  
  // Event listeners for modal toggle
  addEventOnElem(filtersToggle, 'click', toggleFiltersModal);
  
  if (filtersClose) {
    addEventOnElem(filtersClose, 'click', closeFiltersModal);
  }
  
  if (filtersOverlay) {
    addEventOnElem(filtersOverlay, 'click', closeFiltersModal);
  }
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filtersModal.classList.contains('active')) {
      closeFiltersModal();
    }
  });
  
  // Distance range functionality
  if (distanceRange) {
    addEventOnElem(distanceRange, 'input', updateDistanceValue);
    updateDistanceValue(); // Set initial value
  }
  
  // Initialize rating stars
  initializeRatingStars();
  
  // Clear filters button
  if (filtersClear) {
    addEventOnElem(filtersClear, 'click', clearAllFilters);
  }
  
  // Form submission
  if (filtersForm) {
    addEventOnElem(filtersForm, 'submit', applyFilters);
  }
};

// Initialize filters modal when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFiltersModal);
} else {
  initializeFiltersModal();
}



/**
 * category navigation functionality
 */

const categoryItems = document.querySelectorAll('.category-item');
const categoryScrollWrapper = document.getElementById('categoryScrollWrapper');

let activeCategory = document.querySelector('.category-item.active');

const updateActiveCategory = function(newActiveItem) {
  // Remove active class from current active item
  if (activeCategory) {
    activeCategory.classList.remove('active');
    activeCategory.setAttribute('aria-selected', 'false');
  }
  
  // Set new active item
  activeCategory = newActiveItem;
  activeCategory.classList.add('active');
  activeCategory.setAttribute('aria-selected', 'true');
  
  // Scroll to center the active item
  scrollToCenter(activeCategory);
};

const scrollToCenter = function(element) {
  if (!categoryScrollWrapper || !element) return;
  
  const container = categoryScrollWrapper;
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  const elementCenter = elementRect.left + elementRect.width / 2;
  const containerCenter = containerRect.left + containerRect.width / 2;
  const scrollOffset = elementCenter - containerCenter;
  
  // Use requestAnimationFrame for smoother scrolling
  const startTime = performance.now();
  const startScrollLeft = container.scrollLeft;
  const targetScrollLeft = startScrollLeft + scrollOffset;
  const duration = 300;
  
  const animateScroll = function(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    
    container.scrollLeft = startScrollLeft + (scrollOffset * easeOutCubic);
    
    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };
  
  // Fallback to native smooth scrolling for better browser support
  if ('scrollBehavior' in document.documentElement.style) {
    container.scrollBy({
      left: scrollOffset,
      behavior: 'smooth'
    });
  } else {
    requestAnimationFrame(animateScroll);
  }
};

// Add click handlers to category items
categoryItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    updateActiveCategory(item);
  });
  
  // Add keyboard navigation
  item.addEventListener('keydown', (e) => {
    let targetIndex = index;
    
    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        targetIndex = index > 0 ? index - 1 : categoryItems.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        targetIndex = index < categoryItems.length - 1 ? index + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        targetIndex = categoryItems.length - 1;
        break;
      default:
        return;
    }
    
    categoryItems[targetIndex].focus();
    updateActiveCategory(categoryItems[targetIndex]);
  });
});

// Touch/swipe support for mobile
let isScrolling = false;
let scrollTimeout;

categoryScrollWrapper.addEventListener('scroll', () => {
  isScrolling = true;
  clearTimeout(scrollTimeout);
  
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 150);
});

// Smooth scroll behavior enhancement
categoryScrollWrapper.style.scrollBehavior = 'smooth';



/**
 * mobile search functionality
 */

const mobileSearchBtn = document.querySelector("[data-mobile-search-toggle]");
const mobileSearchWrapper = document.querySelector("[data-mobile-search]");
const mobileSearchClose = document.querySelector("[data-mobile-search-close]");
const mobileSearchField = document.querySelector(".mobile-search-field");

const toggleMobileSearch = function () {
  const isActive = mobileSearchWrapper.classList.contains("active");
  
  if (isActive) {
    // Close mobile search with smooth animation
    mobileSearchWrapper.classList.remove("active");
    document.body.style.overflow = '';
    // Clear focus
    if (document.activeElement) {
      document.activeElement.blur();
    }
  } else {
    // Open mobile search with super smooth animation
    mobileSearchWrapper.classList.add("active");
    document.body.style.overflow = 'hidden';
    // Focus on the input field after smooth animation completes
    setTimeout(() => {
      mobileSearchField.focus();
      // Add a subtle pulse to indicate focus
      mobileSearchField.style.transform = 'scale(1.02)';
      setTimeout(() => {
        mobileSearchField.style.transform = 'scale(1)';
      }, 150);
    }, 400);
  }
};

const closeMobileSearch = function () {
  mobileSearchWrapper.classList.remove("active");
  document.body.style.overflow = '';
  // Clear focus smoothly
  if (document.activeElement) {
    document.activeElement.blur();
  }
};

// Add event listeners
if (mobileSearchBtn) {
  mobileSearchBtn.addEventListener("click", toggleMobileSearch);
}

if (mobileSearchClose) {
  mobileSearchClose.addEventListener("click", closeMobileSearch);
}

// Close search when clicking outside
if (mobileSearchWrapper) {
  mobileSearchWrapper.addEventListener("click", (e) => {
    if (e.target === mobileSearchWrapper) {
      closeMobileSearch();
    }
  });
}

// Mobile search submit functionality
const mobileSearchSubmit = document.querySelector(".mobile-search-submit");

const handleMobileSearch = function (e) {
  e.preventDefault();
  const searchQuery = mobileSearchField.value.trim();
  
  if (searchQuery) {
    // Here you would typically handle the search
    // For now, we'll just log it and close the modal
    console.log('Mobile search query:', searchQuery);
    
    // Close the mobile search modal
    closeMobileSearch();
    
    // You can add actual search functionality here
    // For example: window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  }
};

// Add click event for mobile search submit button
if (mobileSearchSubmit) {
  mobileSearchSubmit.addEventListener("click", handleMobileSearch);
}

// Add enter key support for mobile search field
if (mobileSearchField) {
  mobileSearchField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleMobileSearch(e);
    }
  });
}

/**
 * Desktop search functionality
 */
const searchIconLeft = document.querySelector(".search-icon-left");
const desktopSearchField = document.querySelector(".search-field");

const handleDesktopSearch = function (e) {
  e.preventDefault();
  const searchQuery = desktopSearchField.value.trim();
  
  if (searchQuery) {
    // Here you would typically handle the search
    // For now, we'll just log it
    console.log('Desktop search query:', searchQuery);
    
    // You can add actual search functionality here
    // For example: window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  }
};

// Add click event for desktop search icon
if (searchIconLeft) {
  searchIconLeft.addEventListener("click", handleDesktopSearch);
}

// Add enter key support for desktop search field
if (desktopSearchField) {
  desktopSearchField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleDesktopSearch(e);
    }
  });
}