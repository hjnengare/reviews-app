/**
 * Mock API Responses for Testing
 * Provides realistic mock data for API endpoints
 */

export const mockSearchResponses = {
  // Successful search with results
  success: (query = 'pizza') => ({
    success: true,
    data: {
      query,
      results: [
        {
          id: 1,
          name: "Mario's Pizza Palace",
          rating: 4.5,
          reviewCount: 124,
          category: 'Italian Restaurant',
          address: '123 Main St, Downtown',
          distance: '0.2 miles',
          image: '/images/product-01.jpg',
          tags: ['pizza', 'italian', 'family-friendly'],
          isOpen: true,
          priceRange: '$$'
        },
        {
          id: 2,
          name: "Bella's Wood Fired Pizza",
          rating: 4.8,
          reviewCount: 89,
          category: 'Pizza Restaurant',
          address: '456 Oak Ave, Midtown',
          distance: '0.5 miles',
          image: '/images/product-02.jpg',
          tags: ['pizza', 'wood-fired', 'artisan'],
          isOpen: false,
          priceRange: '$$$'
        },
        {
          id: 3,
          name: "Tony's New York Pizza",
          rating: 4.2,
          reviewCount: 156,
          category: 'Pizza Restaurant',
          address: '789 Broadway, Uptown',
          distance: '1.2 miles',
          image: '/images/product-03.jpg',
          tags: ['pizza', 'new-york-style', 'casual'],
          isOpen: true,
          priceRange: '$'
        }
      ],
      totalResults: 23,
      page: 1,
      totalPages: 8,
      searchTime: 0.045,
      filters: {
        category: 'all',
        rating: 0,
        distance: 5,
        priceRange: 'all'
      }
    }
  }),

  // Empty search results
  empty: (query = 'nonexistent') => ({
    success: true,
    data: {
      query,
      results: [],
      totalResults: 0,
      page: 1,
      totalPages: 0,
      searchTime: 0.021,
      suggestions: [
        'Try different keywords',
        'Check your spelling',
        'Use more general terms',
        'Try searching for "restaurants near me"'
      ]
    }
  }),

  // Search with pagination
  paginated: (query = 'restaurant', page = 2) => ({
    success: true,
    data: {
      query,
      results: [
        {
          id: 11,
          name: "The Garden Bistro",
          rating: 4.6,
          reviewCount: 78,
          category: 'Fine Dining',
          address: '321 Garden St, Central',
          distance: '0.8 miles',
          image: '/images/product-04.jpg',
          tags: ['fine-dining', 'romantic', 'reservations'],
          isOpen: true,
          priceRange: '$$$$'
        }
      ],
      totalResults: 45,
      page,
      totalPages: 15,
      searchTime: 0.038
    }
  }),

  // Search error response
  error: (query = 'test') => ({
    success: false,
    error: {
      message: 'Search service temporarily unavailable',
      code: 'SEARCH_SERVICE_DOWN',
      statusCode: 503,
      details: 'Please try again in a few moments'
    },
    data: {
      query,
      fallbackSuggestions: [
        'Browse popular categories',
        'Check our featured restaurants',
        'Try searching again later'
      ]
    }
  }),

  // Network timeout error
  timeout: (query = 'test') => ({
    success: false,
    error: {
      message: 'Request timed out',
      code: 'TIMEOUT',
      statusCode: 408,
      details: 'The search request took too long to complete'
    },
    data: { query }
  }),

  // Rate limit error
  rateLimited: (query = 'test') => ({
    success: false,
    error: {
      message: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      details: 'Please wait a moment before searching again',
      retryAfter: 60
    },
    data: { query }
  })
};

export const mockFilterResponses = {
  // Available filter options
  options: () => ({
    success: true,
    data: {
      categories: [
        { id: 'restaurant', name: 'Restaurants', count: 234 },
        { id: 'cafe', name: 'Cafés', count: 89 },
        { id: 'bar', name: 'Bars & Pubs', count: 156 },
        { id: 'fastfood', name: 'Fast Food', count: 67 },
        { id: 'bakery', name: 'Bakeries', count: 23 }
      ],
      priceRanges: [
        { id: '$', name: 'Budget ($)', count: 123 },
        { id: '$$', name: 'Moderate ($$)', count: 198 },
        { id: '$$$', name: 'Expensive ($$$)', count: 87 },
        { id: '$$$$', name: 'Very Expensive ($$$$)', count: 34 }
      ],
      ratings: [
        { id: '4+', name: '4+ Stars', count: 156 },
        { id: '3+', name: '3+ Stars', count: 287 },
        { id: '2+', name: '2+ Stars', count: 398 },
        { id: '1+', name: '1+ Stars', count: 442 }
      ],
      distance: [
        { id: '0.5', name: 'Within 0.5 miles', count: 45 },
        { id: '1', name: 'Within 1 mile', count: 123 },
        { id: '2', name: 'Within 2 miles', count: 234 },
        { id: '5', name: 'Within 5 miles', count: 442 }
      ]
    }
  }),

  // Filtered search results
  filtered: (filters = {}) => ({
    success: true,
    data: {
      results: [
        {
          id: 21,
          name: "Premium Steakhouse",
          rating: 4.9,
          reviewCount: 245,
          category: 'Fine Dining',
          address: '555 Elite Blvd, Downtown',
          distance: '0.3 miles',
          image: '/images/product-05.jpg',
          tags: ['steakhouse', 'fine-dining', 'wine'],
          isOpen: true,
          priceRange: '$$$$'
        }
      ],
      appliedFilters: filters,
      totalResults: 12,
      page: 1,
      totalPages: 4
    }
  })
};

export const mockLocationResponses = {
  // User location detected
  detected: () => ({
    success: true,
    data: {
      latitude: 40.7128,
      longitude: -74.0060,
      city: 'New York',
      state: 'NY',
      country: 'US',
      accuracy: 10,
      address: 'New York, NY, USA'
    }
  }),

  // Location permission denied
  denied: () => ({
    success: false,
    error: {
      message: 'Location access denied',
      code: 'LOCATION_DENIED',
      details: 'Please enable location access to see nearby results'
    }
  }),

  // Location not available
  unavailable: () => ({
    success: false,
    error: {
      message: 'Location unavailable',
      code: 'LOCATION_UNAVAILABLE',
      details: 'Unable to determine your current location'
    }
  })
};

export const mockUserResponses = {
  // Authenticated user
  authenticated: () => ({
    success: true,
    data: {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '/images/avatar.jpg',
      preferences: {
        theme: 'light',
        notifications: true,
        location: 'New York, NY'
      },
      stats: {
        reviewsWritten: 15,
        placesVisited: 87,
        helpfulVotes: 234
      }
    }
  }),

  // Not authenticated
  anonymous: () => ({
    success: false,
    error: {
      message: 'Not authenticated',
      code: 'AUTH_REQUIRED',
      statusCode: 401
    }
  })
};

// Utility function to create response with delay
export const createDelayedResponse = (response, delay = 100) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(response), delay);
  });
};

// Create response based on query characteristics
export const createSmartSearchResponse = (query) => {
  if (!query || query.trim().length === 0) {
    return mockSearchResponses.error('empty query');
  }
  
  if (query.includes('nonexistent') || query.includes('zzz')) {
    return mockSearchResponses.empty(query);
  }
  
  if (query.length > 200) {
    return mockSearchResponses.error('query too long');
  }
  
  return mockSearchResponses.success(query);
};

// Mock network conditions
export const networkConditions = {
  fast: { delay: 50, errorRate: 0 },
  normal: { delay: 200, errorRate: 0.01 },
  slow: { delay: 1000, errorRate: 0.05 },
  unreliable: { delay: 500, errorRate: 0.15 },
  offline: { delay: 0, errorRate: 1 }
};