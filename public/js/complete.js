/*-----------------------------------*\
  #COMPLETE.JS
\*-----------------------------------*/

// Configuration
const CONFIG = {
  homeUrl: 'index.html', // Adjust as needed for your app's home
  consolidatedStorageKey: 'onboarding_profile'
};

// Initialize the completion page
function initCompletePage() {
  focusTitle();
  announceCompletion();
  consolidateOnboardingData();
  bindEvents();
}

// Focus the main title for accessibility
function focusTitle() {
  const title = document.getElementById('completion-title');
  if (title) {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      title.focus();
    }, 100);
  }
}

// Announce completion via live region
function announceCompletion() {
  const liveRegion = document.querySelector('.complete__live');
  if (liveRegion) {
    // Delay announcement to allow page to load
    setTimeout(() => {
      liveRegion.textContent = 'Onboarding complete. Welcome to Reviews App!';
    }, 500);
  }
}

// Consolidate all onboarding data into a single profile
function consolidateOnboardingData() {
  try {
    const profile = {};
    
    // Collect data from different onboarding steps
    const interests = getStoredData('user-interests');
    const subInterests = getStoredData('user-sub-interests');
    const dealbreakers = getStoredData('dealbreakers');
    
    // Add to consolidated profile if data exists
    if (interests && interests.length > 0) {
      profile.interests = interests;
    }
    
    if (subInterests) {
      profile.subInterests = subInterests;
    }
    
    if (dealbreakers && dealbreakers.length > 0) {
      profile.dealbreakers = dealbreakers;
    }
    
    // Add completion timestamp
    profile.completedAt = new Date().toISOString();
    profile.version = '1.0';
    
    // Save consolidated profile
    if (Object.keys(profile).length > 1) { // More than just timestamp
      localStorage.setItem(CONFIG.consolidatedStorageKey, JSON.stringify(profile));
      
      // Optional: Clean up individual onboarding keys
      cleanupIndividualOnboardingData();
      
      console.log('Onboarding profile saved:', profile);
    }
    
  } catch (error) {
    console.warn('Could not consolidate onboarding data:', error);
  }
}

// Helper function to safely get stored data
function getStoredData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`Could not parse stored data for key "${key}":`, error);
    return null;
  }
}

// Clean up individual onboarding keys (optional)
function cleanupIndividualOnboardingData() {
  const keysToClean = [
    'user-interests',
    'user-sub-interests', 
    'dealbreakers'
  ];
  
  keysToClean.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Could not remove key "${key}":`, error);
    }
  });
}

// Bind event listeners
function bindEvents() {
  const homeBtn = document.getElementById('home-btn');
  
  if (homeBtn) {
    homeBtn.addEventListener('click', handleHomeClick);
  }
}

// Handle "Go to Home" button click
async function handleHomeClick() {
  const homeBtn = document.getElementById('home-btn');
  const originalText = homeBtn ? homeBtn.textContent : '';
  
  try {
    // Show loading state
    if (homeBtn) {
      homeBtn.disabled = true;
      homeBtn.textContent = 'Completing...';
    }
    
    // Submit completion to backend
    const response = await fetch('/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completedAt: new Date().toISOString()
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Optional: Emit analytics event
      console.log('Onboarding completed - navigating to home');
      
      // Optional: Custom event for other scripts to listen to
      const completionEvent = new CustomEvent('onboardingComplete', {
        detail: {
          timestamp: new Date().toISOString(),
          profile: getStoredData(CONFIG.consolidatedStorageKey)
        }
      });
      document.dispatchEvent(completionEvent);
      
      // Clear forward history and navigate
      clearForwardHistory();
      
      // Navigate to home/explore page
      window.location.href = result.redirectTo;
    } else {
      throw new Error(result.error || 'Failed to complete onboarding');
    }
    
  } catch (error) {
    console.error('Error completing onboarding:', error);
    
    // Show error feedback to user
    const liveRegion = document.querySelector('.complete__live');
    if (liveRegion) {
      liveRegion.textContent = 'Error completing onboarding. Please try again.';
    }
    
    // Reset button state
    if (homeBtn) {
      homeBtn.disabled = false;
      homeBtn.textContent = originalText;
    }
  }
}

// Clear forward history to prevent users from going back to onboarding
function clearForwardHistory() {
  try {
    // Replace current state to prevent back navigation to onboarding
    if (history.replaceState) {
      history.replaceState(
        { onboardingComplete: true },
        'Onboarding Complete',
        window.location.href
      );
    }
  } catch (error) {
    console.warn('Could not clear forward history:', error);
  }
}

// Get onboarding profile for external access
function getOnboardingProfile() {
  return getStoredData(CONFIG.consolidatedStorageKey);
}

// Check if user has completed onboarding (utility function)
function hasCompletedOnboarding() {
  const profile = getOnboardingProfile();
  return profile && profile.completedAt;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCompletePage);

// Export for potential external use
window.OnboardingComplete = {
  getProfile: getOnboardingProfile,
  hasCompleted: hasCompletedOnboarding,
  navigateToHome: handleHomeClick
};