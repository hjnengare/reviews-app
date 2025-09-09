/*-----------------------------------*\
  #DISCOVER PAGE FUNCTIONALITY
\*-----------------------------------*/

'use strict';

// State management
const discoverState = {
  section: 'for-you',
  filters: {
    category: null,
    price: null,
    rating: null,
    distance: null,
    openNow: false
  },
  sort: 'relevance',
  page: 1,
  hasMore: true,
  loading: false,
  results: [],
  totalCount: 0,
  sourceParams: {}
};

// DOM Elements
const backBtn = document.getElementById('back-btn');
const sectionTitle = document.getElementById('section-title');
const sectionSubtitle = document.getElementById('section-subtitle');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');
const clearFiltersBtn = document.getElementById('clear-filters');
const activeFiltersContainer = document.getElementById('active-filters');
const resultsCount = document.getElementById('results-count');
const resultsGrid = document.getElementById('results-grid');
const loadMoreBtn = document.getElementById('load-more-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const noMoreResults = document.getElementById('no-more-results');
const emptyState = document.getElementById('empty-state');
const filterDropdowns = document.getElementById('filter-dropdowns');

// Section configurations
const sectionConfigs = {
  'for-you': {
    title: 'For You',
    subtitle: 'Personalized picks based on your interests'
  },
  'trending': {
    title: 'Trending',
    subtitle: 'Popular places everyone is talking about'
  },
  'nearby': {
    title: 'Nearby',
    subtitle: 'Great places within your area'
  },
  'featured': {
    title: 'Featured',
    subtitle: 'Handpicked recommendations from our team'
  }
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  initializePage();
  initializeFilters();
  initializeInfiniteScroll();
  initializeNavigation();
  
  // Load initial results
  loadResults(true);
});

/**
 * Page Initialization
 */
function initializePage() {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const pathSegments = window.location.pathname.split('/');
  
  // Extract section from URL path
  if (pathSegments[1] === 'discover' && pathSegments[2]) {
    discoverState.section = pathSegments[2];
  }
  
  // Parse source parameters
  if (urlParams.has('source')) discoverState.sourceParams.source = urlParams.get('source');
  if (urlParams.has('seed')) discoverState.sourceParams.seed = urlParams.get('seed');
  if (urlParams.has('lat')) discoverState.sourceParams.lat = urlParams.get('lat');
  if (urlParams.has('lng')) discoverState.sourceParams.lng = urlParams.get('lng');
  if (urlParams.has('interests')) discoverState.sourceParams.interests = urlParams.get('interests').split(',');
  
  // Parse filter parameters
  if (urlParams.has('category')) discoverState.filters.category = urlParams.get('category');
  if (urlParams.has('price')) discoverState.filters.price = urlParams.get('price');
  if (urlParams.has('rating')) discoverState.filters.rating = urlParams.get('rating');
  if (urlParams.has('distance')) discoverState.filters.distance = urlParams.get('distance');
  if (urlParams.has('openNow')) discoverState.filters.openNow = urlParams.get('openNow') === 'true';
  if (urlParams.has('sort')) discoverState.sort = urlParams.get('sort');
  
  // Update page elements
  updatePageTitle();
  updateFiltersUI();
  updateSortUI();
  
  // Announce navigation for screen readers
  announceNavigation();
}

function updatePageTitle() {
  const config = sectionConfigs[discoverState.section] || sectionConfigs['for-you'];
  sectionTitle.textContent = config.title;
  sectionSubtitle.textContent = config.subtitle;
  document.title = `${config.title} - Reviews App`;
}

function announceNavigation() {
  const config = sectionConfigs[discoverState.section] || sectionConfigs['for-you'];
  // Create temporary announcement for screen readers
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = `Showing all results for ${config.title}`;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Filter System
 */
function initializeFilters() {
  // Filter button click handlers
  filterBtns.forEach(btn => {
    const filterType = btn.dataset.filter;
    
    if (filterType === 'open-now') {
      // Toggle button
      btn.addEventListener('click', () => {
        toggleOpenNowFilter(btn);
      });
    } else {
      // Dropdown button
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFilterDropdown(filterType, btn);
      });
    }
  });
  
  // Sort select handler
  sortSelect.addEventListener('change', (e) => {
    discoverState.sort = e.target.value;
    updateURL();
    loadResults(true);
  });
  
  // Clear filters handler
  clearFiltersBtn.addEventListener('click', clearAllFilters);
  
  // Filter option handlers
  document.addEventListener('click', handleFilterOptionClick);
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', closeAllDropdowns);
}

function toggleOpenNowFilter(btn) {
  discoverState.filters.openNow = !discoverState.filters.openNow;
  btn.setAttribute('aria-pressed', discoverState.filters.openNow.toString());
  
  if (discoverState.filters.openNow) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
  
  updateActiveFilters();
  updateURL();
  loadResults(true);
}

function toggleFilterDropdown(filterType, btn) {
  const dropdown = document.getElementById(`${filterType}-dropdown`);
  const isOpen = btn.getAttribute('aria-expanded') === 'true';
  
  // Close all other dropdowns
  closeAllDropdowns();
  
  if (!isOpen) {
    // Open this dropdown
    btn.setAttribute('aria-expanded', 'true');
    dropdown.classList.add('visible');
    positionDropdown(dropdown, btn);
    
    // Focus first option
    const firstOption = dropdown.querySelector('.filter-option');
    if (firstOption) firstOption.focus();
  }
}

function positionDropdown(dropdown, trigger) {
  const triggerRect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  
  dropdown.style.left = 'auto';
  dropdown.style.right = 'auto';
  
  if (triggerRect.left + 300 > viewportWidth) {
    // Position on the right
    dropdown.style.right = '0px';
  } else {
    // Position on the left
    dropdown.style.left = `${triggerRect.left}px`;
  }
}

function closeAllDropdowns() {
  filterBtns.forEach(btn => {
    if (btn.dataset.filter !== 'open-now') {
      btn.setAttribute('aria-expanded', 'false');
    }
  });
  
  document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
    dropdown.classList.remove('visible');
  });
}

function handleFilterOptionClick(e) {
  const option = e.target.closest('.filter-option');
  if (!option) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const dropdown = option.closest('.filter-dropdown');
  const filterType = dropdown.id.replace('-dropdown', '');
  const value = option.dataset.value;
  
  // Update filter state
  if (discoverState.filters[filterType] === value) {
    // Deselect if already selected
    discoverState.filters[filterType] = null;
  } else {
    discoverState.filters[filterType] = value;
  }
  
  // Update UI
  updateFilterOptionSelection(dropdown, value);
  updateActiveFilters();
  closeAllDropdowns();
  updateURL();
  loadResults(true);
}

function updateFilterOptionSelection(dropdown, selectedValue) {
  const options = dropdown.querySelectorAll('.filter-option');
  options.forEach(option => {
    if (option.dataset.value === selectedValue) {
      option.classList.toggle('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

function updateFiltersUI() {
  // Update filter buttons
  filterBtns.forEach(btn => {
    const filterType = btn.dataset.filter;
    
    if (filterType === 'open-now') {
      const isActive = discoverState.filters.openNow;
      btn.setAttribute('aria-pressed', isActive.toString());
      btn.classList.toggle('active', isActive);
    } else {
      const hasFilter = discoverState.filters[filterType] !== null;
      btn.classList.toggle('active', hasFilter);
    }
  });
  
  // Update dropdown selections
  Object.keys(discoverState.filters).forEach(filterType => {
    if (filterType === 'openNow') return;
    
    const dropdown = document.getElementById(`${filterType}-dropdown`);
    if (dropdown) {
      const options = dropdown.querySelectorAll('.filter-option');
      const selectedValue = discoverState.filters[filterType];
      
      options.forEach(option => {
        option.classList.toggle('selected', option.dataset.value === selectedValue);
      });
    }
  });
  
  updateActiveFilters();
}

function updateSortUI() {
  sortSelect.value = discoverState.sort;
}

function updateActiveFilters() {
  activeFiltersContainer.innerHTML = '';
  
  const activeFilters = [];
  
  // Add filter chips
  Object.entries(discoverState.filters).forEach(([key, value]) => {
    if (value && key !== 'openNow') {
      activeFilters.push(createFilterChip(key, value));
    } else if (key === 'openNow' && value) {
      activeFilters.push(createFilterChip('open-now', 'Open Now'));
    }
  });
  
  activeFilters.forEach(chip => {
    activeFiltersContainer.appendChild(chip);
  });
  
  // Show/hide clear filters button
  const hasFilters = activeFilters.length > 0;
  clearFiltersBtn.style.display = hasFilters ? 'block' : 'none';
}

function createFilterChip(filterType, displayValue) {
  const chip = document.createElement('button');
  chip.className = 'active-filter-chip';
  chip.setAttribute('data-filter', filterType);
  chip.setAttribute('aria-label', `Remove ${displayValue} filter`);
  
  // Format display value
  let display = displayValue;
  if (filterType === 'rating') display = `${displayValue} rating`;
  if (filterType === 'price') display = getPriceDisplay(displayValue);
  if (filterType === 'distance') display = `Within ${displayValue}`;
  
  chip.innerHTML = `
    <span>${display}</span>
    <ion-icon name="close" aria-hidden="true"></ion-icon>
  `;
  
  chip.addEventListener('click', () => {
    removeFilter(filterType);
  });
  
  return chip;
}

function getPriceDisplay(value) {
  const displays = {
    'budget': '$',
    'moderate': '$$',
    'expensive': '$$$',
    'luxury': '$$$$'
  };
  return displays[value] || value;
}

function removeFilter(filterType) {
  if (filterType === 'open-now') {
    discoverState.filters.openNow = false;
  } else {
    discoverState.filters[filterType] = null;
  }
  
  updateFiltersUI();
  updateURL();
  loadResults(true);
}

function clearAllFilters() {
  discoverState.filters = {
    category: null,
    price: null,
    rating: null,
    distance: null,
    openNow: false
  };
  
  updateFiltersUI();
  updateURL();
  loadResults(true);
}

/**
 * Results Loading
 */
function loadResults(reset = false) {
  if (discoverState.loading) return;
  
  if (reset) {
    discoverState.page = 1;
    discoverState.hasMore = true;
    discoverState.results = [];
    resultsGrid.innerHTML = '';
    emptyState.style.display = 'none';
  }
  
  discoverState.loading = true;
  showLoadingState();
  
  // Simulate API call
  setTimeout(() => {
    const mockResults = generateMockResults();
    
    if (reset) {
      discoverState.results = mockResults;
    } else {
      discoverState.results = [...discoverState.results, ...mockResults];
    }
    
    renderResults(mockResults, reset);
    updateResultsCount();
    
    discoverState.page += 1;
    discoverState.hasMore = mockResults.length === 20; // Assume page size of 20
    discoverState.loading = false;
    
    hideLoadingState();
    
    // Announce to screen readers
    if (reset) {
      announceResults(discoverState.results.length);
    } else {
      announceLoadMore(mockResults.length);
    }
    
  }, 800); // Simulate network delay
}

function generateMockResults() {
  // Generate mock data based on current filters and sort
  const mockData = [];
  const resultCount = Math.floor(Math.random() * 20) + 1;
  
  for (let i = 0; i < resultCount; i++) {
    mockData.push({
      id: Date.now() + i,
      name: `Business ${discoverState.page}-${i + 1}`,
      category: 'Restaurant',
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 200) + 10,
      distance: `${(Math.random() * 10 + 0.5).toFixed(1)} km`,
      price: '$'.repeat(Math.floor(Math.random() * 4) + 1),
      image: `/images/product-0${(i % 5) + 1}.jpg`,
      isOpen: Math.random() > 0.3
    });
  }
  
  return mockData;
}

function renderResults(results, reset) {
  if (reset && results.length === 0) {
    showEmptyState();
    return;
  }
  
  results.forEach(result => {
    const card = createResultCard(result);
    resultsGrid.appendChild(card);
  });
}

function createResultCard(result) {
  const card = document.createElement('div');
  card.className = 'review-card';
  card.innerHTML = `
    <div class="review-card__image">
      <img src="${result.image}" alt="${result.name}" class="review-card__img">
      <span class="total-rating">${result.rating}</span>
      <div class="card-actions">
        <button class="action-btn" aria-label="write review">
          <ion-icon name="create-outline" aria-hidden="true"></ion-icon>
        </button>
        <button class="action-btn" aria-label="add to favorites">
          <ion-icon name="heart-outline" aria-hidden="true"></ion-icon>
        </button>
        <button class="action-btn" aria-label="share">
          <ion-icon name="share-outline" aria-hidden="true"></ion-icon>
        </button>
      </div>
    </div>
    <div class="review-card__content">
      <h3 class="review-card__title">${result.name}</h3>
      <div class="review-card__meta">
        <span class="category">${result.category}</span>
        <span class="price">${result.price}</span>
        <span class="distance">${result.distance}</span>
      </div>
      <div class="review-card__rating">
        <div class="rating-stars">
          ${generateStarRating(parseFloat(result.rating))}
        </div>
        <span class="review-count">(${result.reviewCount})</span>
      </div>
    </div>
  `;
  
  return card;
}

function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '<ion-icon name="star" aria-hidden="true"></ion-icon>';
  }
  
  if (hasHalfStar) {
    stars += '<ion-icon name="star-half" aria-hidden="true"></ion-icon>';
  }
  
  for (let i = 0; i < emptyStars; i++) {
    stars += '<ion-icon name="star-outline" aria-hidden="true"></ion-icon>';
  }
  
  return stars;
}

function updateResultsCount() {
  const count = discoverState.results.length;
  resultsCount.textContent = count === 1 ? '1 result' : `${count} results`;
}

function showEmptyState() {
  emptyState.style.display = 'block';
  loadMoreBtn.style.display = 'none';
  noMoreResults.style.display = 'none';
}

function announceResults(count) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Showing ${count} results`;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

function announceLoadMore(count) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Loaded ${count} more items`;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Infinite Scroll
 */
function initializeInfiniteScroll() {
  loadMoreBtn.addEventListener('click', () => {
    loadResults(false);
  });
  
  // Intersection Observer for infinite scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && discoverState.hasMore && !discoverState.loading) {
        loadResults(false);
      }
    });
  }, {
    rootMargin: '100px'
  });
  
  observer.observe(loadingSpinner);
}

function showLoadingState() {
  loadingSpinner.style.display = 'flex';
  loadMoreBtn.style.display = 'none';
  noMoreResults.style.display = 'none';
}

function hideLoadingState() {
  loadingSpinner.style.display = 'none';
  
  if (discoverState.hasMore) {
    loadMoreBtn.style.display = 'block';
  } else {
    noMoreResults.style.display = 'block';
  }
}

/**
 * Navigation & URL Management
 */
function initializeNavigation() {
  backBtn.addEventListener('click', goBackToHome);
  
  // Handle browser back/forward
  window.addEventListener('popstate', handlePopState);
}

function goBackToHome() {
  // Check if there's a stored scroll position
  const scrollPosition = sessionStorage.getItem('homeScrollPosition');
  
  if (scrollPosition) {
    // Navigate back with scroll restoration
    window.location.href = '/?restore=true';
  } else {
    // Simple back navigation
    window.location.href = '/';
  }
}

function handlePopState(event) {
  // Handle browser back/forward navigation
  initializePage();
  loadResults(true);
}

function updateURL() {
  const params = new URLSearchParams();
  
  // Add filter parameters
  Object.entries(discoverState.filters).forEach(([key, value]) => {
    if (value && key !== 'openNow') {
      params.set(key, value);
    } else if (key === 'openNow' && value) {
      params.set('openNow', 'true');
    }
  });
  
  // Add sort parameter
  if (discoverState.sort !== 'relevance') {
    params.set('sort', discoverState.sort);
  }
  
  // Add source parameters
  Object.entries(discoverState.sourceParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, Array.isArray(value) ? value.join(',') : value);
    }
  });
  
  const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.replaceState(null, '', newURL);
}