/*-----------------------------------*\
  #PROFILE.JS - UNSPLASH INSPIRED
\*-----------------------------------*/

// User data
const userData = {
  name: 'Jessica Leigh',
  username: '@JessCLeigh',
  bio: 'Food enthusiast sharing authentic reviews from Cape Town\'s vibrant culinary scene. Always hunting for the perfect meal.',
  location: 'Cape Town, South Africa',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
  stats: {
    reviews: 124,
    followers: '2.1k',
    following: 89,
    badges: 3
  },
  reviews: [
    {
      id: 1,
      title: 'Mama\'s Kitchen',
      excerpt: 'Authentic Ethiopian cuisine with incredible flavors. The injera was perfectly sour and the berbere spice blend was...',
      image: 'assets/images/product-01.jpg',
      rating: 5,
      date: '2 days ago',
      likes: 23
    },
    {
      id: 2,
      title: 'Ocean View Restaurant',
      excerpt: 'Stunning seafood with a view that takes your breath away. The line fish was fresh and perfectly prepared...',
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
      rating: 4,
      date: '1 week ago',
      likes: 47
    },
    {
      id: 3,
      title: 'City Coffee Shop',
      excerpt: 'Best cappuccino in the city center. The baristas really know their craft and the atmosphere is perfect for...',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
      rating: 5,
      date: '2 weeks ago',
      likes: 12
    },
    {
      id: 4,
      title: 'Street Food Market',
      excerpt: 'Vibrant market atmosphere with incredible variety. Tried the boerewors roll and it was absolutely delicious...',
      image: 'assets/images/product-04.jpg',
      rating: 4,
      date: '3 weeks ago',
      likes: 31
    },
    {
      id: 5,
      title: 'Garden Bistro',
      excerpt: 'Hidden gem with fantastic garden seating. The salads are fresh and creative, and the service is impeccable...',
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
      rating: 5,
      date: '1 month ago',
      likes: 18
    },
    {
      id: 6,
      title: 'Rooftop Bar & Grill',
      excerpt: 'Amazing views of Table Mountain with cocktails that match the scenery. The grilled prawns were outstanding...',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
      rating: 4,
      date: '1 month ago',
      likes: 56
    }
  ]
};

// DOM elements
const elements = {
  // Profile info
  userName: document.getElementById('user-name'),
  username: document.getElementById('username'),
  userBio: document.getElementById('user-bio'),
  userAvatar: document.getElementById('user-avatar'),
  
  // Stats
  reviewsStat: document.getElementById('reviews-stat'),
  followersStat: document.getElementById('followers-stat'),
  followingStat: document.getElementById('following-stat'),
  badgesStat: document.getElementById('badges-stat'),
  
  // Navigation
  reviewsTab: document.getElementById('reviews-tab'),
  collectionsTab: document.getElementById('collections-tab'),
  likedTab: document.getElementById('liked-tab'),
  
  // Content panels
  reviewsPanel: document.getElementById('reviews-panel'),
  collectionsPanel: document.getElementById('collections-panel'),
  likedPanel: document.getElementById('liked-panel'),
  
  // Reviews content
  reviewsGrid: document.getElementById('reviews-grid'),
  reviewsLoading: document.getElementById('reviews-loading'),
  reviewsContent: document.getElementById('reviews-content'),
  reviewsEmpty: document.getElementById('reviews-empty'),
  
  // Actions
  editProfile: document.getElementById('edit-profile'),
  shareProfile: document.getElementById('share-profile'),
  backButton: document.getElementById('back-button'),
  
  // Settings
  settingsToggle: document.getElementById('settings-toggle'),
  settingsDropdown: document.getElementById('settings-dropdown'),
  accountSettings: document.getElementById('account-settings'),
  notificationsSettings: document.getElementById('notifications-settings'),
  privacySettings: document.getElementById('privacy-settings'),
  logoutSetting: document.getElementById('logout-setting'),
  
  // Logout dialog
  logoutDialog: document.getElementById('logout-dialog'),
  logoutCancel: document.getElementById('logout-cancel'),
  logoutConfirm: document.getElementById('logout-confirm'),
  
  // Live region
  liveRegion: document.querySelector('.profile__live')
};

// Current active tab
let activeTab = 'reviews';

// Initialize the profile page
function init() {
  loadUserData();
  bindEvents();
  setTimeout(() => {
    loadReviews();
  }, 1000);
}

// Load user data into the interface
function loadUserData() {
  if (elements.userName) {
    elements.userName.textContent = userData.name;
  }
  
  if (elements.username) {
    elements.username.textContent = userData.username;
  }
  
  if (elements.userBio) {
    elements.userBio.textContent = userData.bio;
  }
  
  // Update stats
  updateStats();
}

// Update stats display
function updateStats() {
  if (elements.reviewsStat) {
    const value = elements.reviewsStat.querySelector('.stat-item__value');
    if (value) value.textContent = userData.stats.reviews;
  }
  
  if (elements.followersStat) {
    const value = elements.followersStat.querySelector('.stat-item__value');
    if (value) value.textContent = userData.stats.followers;
  }
  
  if (elements.followingStat) {
    const value = elements.followingStat.querySelector('.stat-item__value');
    if (value) value.textContent = userData.stats.following;
  }
  
  if (elements.badgesStat) {
    const value = elements.badgesStat.querySelector('.stat-item__value');
    if (value) value.textContent = userData.stats.badges;
  }
}

// Load reviews
function loadReviews() {
  if (!elements.reviewsGrid) return;
  
  // Hide loading state
  if (elements.reviewsLoading) {
    elements.reviewsLoading.style.display = 'none';
  }
  
  if (userData.reviews.length === 0) {
    // Show empty state
    if (elements.reviewsEmpty) {
      elements.reviewsEmpty.style.display = 'block';
    }
  } else {
    // Show content
    if (elements.reviewsContent) {
      elements.reviewsContent.style.display = 'grid';
      elements.reviewsContent.innerHTML = generateReviewsHTML();
      
      // Bind review card events
      bindReviewCardEvents();
    }
  }
}

// Generate reviews HTML
function generateReviewsHTML() {
  return userData.reviews.map(review => `
    <a href="#" class="review-card" data-id="${review.id}">
      <div class="review-card__image">
        <img src="${review.image}" alt="${review.title}" class="review-card__img" loading="lazy" />
        <div class="review-card__rating">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
          ${review.rating}
        </div>
      </div>
      <div class="review-card__content">
        <h3 class="review-card__title">${review.title}</h3>
        <p class="review-card__excerpt">${review.excerpt}</p>
        <div class="review-card__meta">
          <span class="review-card__date">${review.date}</span>
          <div class="review-card__likes">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            ${review.likes}
          </div>
        </div>
      </div>
    </a>
  `).join('');
}

// Bind event listeners
function bindEvents() {
  // Navigation tabs
  if (elements.reviewsTab) {
    elements.reviewsTab.addEventListener('click', () => switchTab('reviews'));
  }
  
  if (elements.collectionsTab) {
    elements.collectionsTab.addEventListener('click', () => switchTab('collections'));
  }
  
  if (elements.likedTab) {
    elements.likedTab.addEventListener('click', () => switchTab('liked'));
  }
  
  // Profile actions
  if (elements.editProfile) {
    elements.editProfile.addEventListener('click', handleEditProfile);
  }
  
  if (elements.shareProfile) {
    elements.shareProfile.addEventListener('click', handleShareProfile);
  }
  
  // Back button
  if (elements.backButton) {
    elements.backButton.addEventListener('click', handleBack);
  }
  
  // Settings menu
  if (elements.settingsToggle) {
    elements.settingsToggle.addEventListener('click', toggleSettingsDropdown);
  }
  
  // Settings options
  if (elements.accountSettings) {
    elements.accountSettings.addEventListener('click', () => handleSettingsClick('account'));
  }
  
  if (elements.notificationsSettings) {
    elements.notificationsSettings.addEventListener('click', () => handleSettingsClick('notifications'));
  }
  
  if (elements.privacySettings) {
    elements.privacySettings.addEventListener('click', () => handleSettingsClick('privacy'));
  }
  
  // Logout
  if (elements.logoutSetting) {
    elements.logoutSetting.addEventListener('click', showLogoutDialog);
  }
  
  // Logout dialog
  if (elements.logoutCancel) {
    elements.logoutCancel.addEventListener('click', hideLogoutDialog);
  }
  
  if (elements.logoutConfirm) {
    elements.logoutConfirm.addEventListener('click', handleLogout);
  }
  
  // Dialog overlay
  if (elements.logoutDialog) {
    elements.logoutDialog.addEventListener('click', (e) => {
      if (e.target === elements.logoutDialog || e.target.classList.contains('logout-dialog__overlay')) {
        hideLogoutDialog();
      }
    });
  }
  
  // Global events
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', handleGlobalClick);
  
  // Stats clicks
  bindStatsEvents();
}

// Bind stats events
function bindStatsEvents() {
  if (elements.reviewsStat) {
    elements.reviewsStat.addEventListener('click', () => {
      switchTab('reviews');
      announceToScreenReader('Switched to reviews');
    });
  }
  
  if (elements.followersStat) {
    elements.followersStat.addEventListener('click', () => handleStatClick('followers'));
  }
  
  if (elements.followingStat) {
    elements.followingStat.addEventListener('click', () => handleStatClick('following'));
  }
  
  if (elements.badgesStat) {
    elements.badgesStat.addEventListener('click', () => handleStatClick('badges'));
  }
}

// Bind review card events
function bindReviewCardEvents() {
  const reviewCards = document.querySelectorAll('.review-card');
  reviewCards.forEach(card => {
    card.addEventListener('click', handleReviewCardClick);
  });
}

// Switch navigation tabs
function switchTab(tabName) {
  // Update active tab
  activeTab = tabName;
  
  // Update tab appearance
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('nav-tab--active');
    tab.setAttribute('aria-selected', 'false');
  });
  
  const activeTabElement = document.getElementById(`${tabName}-tab`);
  if (activeTabElement) {
    activeTabElement.classList.add('nav-tab--active');
    activeTabElement.setAttribute('aria-selected', 'true');
  }
  
  // Update content panels
  document.querySelectorAll('.content-panel').forEach(panel => {
    panel.style.display = 'none';
    panel.classList.remove('content-panel--active');
  });
  
  const activePanel = document.getElementById(`${tabName}-panel`);
  if (activePanel) {
    activePanel.style.display = 'block';
    activePanel.classList.add('content-panel--active');
  }
  
  announceToScreenReader(`Switched to ${tabName} tab`);
}

// Toggle settings dropdown
function toggleSettingsDropdown() {
  if (!elements.settingsDropdown) return;
  
  const isVisible = elements.settingsDropdown.classList.contains('show');
  
  if (isVisible) {
    elements.settingsDropdown.classList.remove('show');
    announceToScreenReader('Settings menu closed');
  } else {
    elements.settingsDropdown.classList.add('show');
    announceToScreenReader('Settings menu opened');
  }
}

// Handle global clicks (for closing dropdowns)
function handleGlobalClick(e) {
  // Close settings dropdown if clicked outside
  if (elements.settingsDropdown && elements.settingsMenu) {
    if (!elements.settingsMenu.contains(e.target)) {
      elements.settingsDropdown.classList.remove('show');
    }
  }
}

// Handle edit profile
function handleEditProfile() {
  announceToScreenReader('Edit profile clicked');
  showToast('Edit profile functionality coming soon!');
}

// Handle share profile
function handleShareProfile() {
  announceToScreenReader('Share profile clicked');
  
  // Try to use native share API if available
  if (navigator.share) {
    navigator.share({
      title: `${userData.name} on Reviews App`,
      text: userData.bio,
      url: window.location.href
    }).catch(err => {
      console.log('Error sharing:', err);
      showToast('Share functionality coming soon!');
    });
  } else {
    // Fallback: copy URL to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Profile link copied to clipboard!');
      }).catch(() => {
        showToast('Share functionality coming soon!');
      });
    } else {
      showToast('Share functionality coming soon!');
    }
  }
}

// Handle back navigation
function handleBack() {
  announceToScreenReader('Going back to home page');
  window.location.href = 'index.html';
}

// Handle settings clicks
function handleSettingsClick(settingType) {
  elements.settingsDropdown.classList.remove('show');
  announceToScreenReader(`${settingType} settings clicked`);
  showToast(`${capitalizeFirst(settingType)} settings coming soon!`);
}

// Handle stat clicks
function handleStatClick(statType) {
  const messages = {
    followers: 'View followers',
    following: 'View following',
    badges: 'View badges'
  };
  
  announceToScreenReader(`${messages[statType]} clicked`);
  showToast(`${messages[statType]} coming soon!`);
}

// Handle review card clicks
function handleReviewCardClick(e) {
  e.preventDefault();
  
  const reviewCard = e.currentTarget;
  const reviewId = reviewCard.dataset.id;
  const review = userData.reviews.find(r => r.id == reviewId);
  
  if (review) {
    announceToScreenReader(`Opening review for ${review.title}`);
    showToast(`Review details for ${review.title} coming soon!`);
  }
}

// Show logout dialog
function showLogoutDialog() {
  elements.settingsDropdown.classList.remove('show');
  
  if (elements.logoutDialog) {
    elements.logoutDialog.setAttribute('aria-hidden', 'false');
    elements.logoutDialog.style.display = 'flex';
    
    // Focus the cancel button
    if (elements.logoutCancel) {
      setTimeout(() => {
        elements.logoutCancel.focus();
      }, 100);
    }
    
    announceToScreenReader('Logout confirmation dialog opened');
  }
}

// Hide logout dialog
function hideLogoutDialog() {
  if (elements.logoutDialog) {
    elements.logoutDialog.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      elements.logoutDialog.style.display = 'none';
    }, 300);
    
    // Return focus to settings toggle
    if (elements.settingsToggle) {
      elements.settingsToggle.focus();
    }
    
    announceToScreenReader('Logout dialog closed');
  }
}

// Handle logout
function handleLogout() {
  announceToScreenReader('Logging out...');
  hideLogoutDialog();
  
  // In a real app, clear session and redirect
  showToast('Logout functionality coming soon!');
}

// Handle keyboard navigation
function handleKeydown(e) {
  // Close dialogs/dropdowns on Escape
  if (e.key === 'Escape') {
    if (elements.logoutDialog && elements.logoutDialog.getAttribute('aria-hidden') === 'false') {
      hideLogoutDialog();
    } else if (elements.settingsDropdown && elements.settingsDropdown.classList.contains('show')) {
      elements.settingsDropdown.classList.remove('show');
      announceToScreenReader('Settings menu closed');
    }
  }
}

// Announce to screen reader
function announceToScreenReader(message) {
  if (elements.liveRegion) {
    elements.liveRegion.textContent = message;
    
    setTimeout(() => {
      elements.liveRegion.textContent = '';
    }, 1000);
  }
}

// Show toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #111;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 1001;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 320px;
    text-align: center;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(-8px)';
  });
  
  // Remove after delay
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(8px)';
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}