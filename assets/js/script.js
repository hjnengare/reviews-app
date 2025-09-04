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
 * header sticky & back top btn active
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");
const alert = document.querySelector(".alert");
const categoryNav = document.querySelector(".category-nav");

const headerActive = function () {
  if (window.scrollY > 150) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
    
    // Hide alert smoothly and make category nav stick to top
    if (alert) {
      alert.classList.add("hidden");
    }
    if (categoryNav) {
      categoryNav.classList.add("scrolled");
    }
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
    
    // Show alert and position category nav below header
    if (alert) {
      alert.classList.remove("hidden");
    }
    if (categoryNav) {
      categoryNav.classList.remove("scrolled");
    }
  }
}

addEventOnElem(window, "scroll", headerActive);


let lastScrolledPos = 0;

const headerSticky = function () {
  if (lastScrolledPos >= window.scrollY) {
    header.classList.remove("header-hide");
  } else {
    header.classList.add("header-hide");
  }

  lastScrolledPos = window.scrollY;
}

addEventOnElem(window, "scroll", headerSticky);



/**
 * scroll reveal effect
 */

const sections = document.querySelectorAll("[data-section]");

const scrollReveal = function () {
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].getBoundingClientRect().top < window.innerHeight / 2) {
      sections[i].classList.add("active");
    }
  }
}

scrollReveal();

addEventOnElem(window, "scroll", scrollReveal);



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
  const container = categoryScrollWrapper;
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  const elementCenter = elementRect.left + elementRect.width / 2;
  const containerCenter = containerRect.left + containerRect.width / 2;
  const scrollOffset = elementCenter - containerCenter;
  
  container.scrollBy({
    left: scrollOffset,
    behavior: 'smooth'
  });
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