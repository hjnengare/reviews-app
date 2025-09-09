/*-----------------------------------*\
  #INTERESTS.JS
\*-----------------------------------*/

// Interest categories data
const INTERESTS = [
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Travel',
  'Technology',
  'Sports',
  'Health & Fitness',
  'Arts & Culture',
  'Music',
  'Books',
  'Fashion',
  'Beauty',
  'Automotive',
  'Home & Garden',
  'Photography',
  'Gaming',
  'Education',
  'Business',
  'Finance',
  'Nature'
];

// Configuration
const CONFIG = {
  minSelection: 3,
  maxSelection: 8,
  storageKey: 'user-interests'
};

// State management
let selectedInterests = new Set();
let bubbles = [];

// Initialize the interests page
function initInterests() {
  renderInterests();
  bindEvents();
  loadSavedInterests();
  updateNextButton();
}

// Render interest bubbles in the grid
function renderInterests() {
  const grid = document.getElementById('interests-grid');
  if (!grid) return;

  // Clear existing content
  grid.innerHTML = '';

  INTERESTS.forEach((interest, index) => {
    const listItem = document.createElement('li');
    listItem.className = 'interests__item';
    
    // Add organic positioning with random offsets
    const offsetX = (Math.random() - 0.5) * 2; // -1 to 1
    const offsetY = (Math.random() - 0.5) * 2; // -1 to 1
    listItem.style.setProperty('--offset-x', offsetX);
    listItem.style.setProperty('--offset-y', offsetY);

    const bubble = document.createElement('button');
    bubble.className = 'bubble';
    bubble.type = 'button';
    bubble.setAttribute('data-interest', interest);
    bubble.setAttribute('aria-pressed', 'false');
    bubble.setAttribute('tabindex', '0');
    bubble.style.setProperty('--delay', index % 4); // Stagger animations

    const label = document.createElement('span');
    label.className = 'bubble__label';
    label.textContent = interest;

    bubble.appendChild(label);
    listItem.appendChild(bubble);
    grid.appendChild(listItem);

    bubbles.push(bubble);
  });
}

// Bind event listeners
function bindEvents() {
  const grid = document.getElementById('interests-grid');
  const nextBtn = document.getElementById('next-btn');

  // Delegate bubble clicks
  grid?.addEventListener('click', handleBubbleClick);
  grid?.addEventListener('keydown', handleKeyboardNavigation);

  // Next button click
  nextBtn?.addEventListener('click', handleNextClick);
}

// Handle bubble click/selection
function handleBubbleClick(event) {
  const bubble = event.target.closest('.bubble');
  if (!bubble) return;

  const interest = bubble.dataset.interest;
  const isSelected = selectedInterests.has(interest);

  if (isSelected) {
    // Deselect
    selectedInterests.delete(interest);
    bubble.classList.remove('is-selected');
    bubble.setAttribute('aria-pressed', 'false');
  } else {
    // Check max selection limit
    if (selectedInterests.size >= CONFIG.maxSelection) {
      showMaxSelectionFeedback(bubble);
      return;
    }

    // Select
    selectedInterests.add(interest);
    bubble.classList.add('is-selected');
    bubble.setAttribute('aria-pressed', 'true');
  }

  updateNextButton();
  updateLiveRegion();
  saveInterests();
}

// Handle keyboard navigation
function handleKeyboardNavigation(event) {
  const bubble = event.target.closest('.bubble');
  if (!bubble) return;

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleBubbleClick(event);
  }

  // Arrow key navigation
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    navigateBubbles(event.key, bubble);
  }
}

// Navigate between bubbles with arrow keys
function navigateBubbles(key, currentBubble) {
  const currentIndex = bubbles.indexOf(currentBubble);
  let nextIndex;

  switch (key) {
    case 'ArrowRight':
      nextIndex = currentIndex + 1;
      break;
    case 'ArrowLeft':
      nextIndex = currentIndex - 1;
      break;
    case 'ArrowDown':
      // Move to next row (approximate based on grid)
      nextIndex = currentIndex + 4;
      break;
    case 'ArrowUp':
      // Move to previous row
      nextIndex = currentIndex - 4;
      break;
  }

  // Wrap around and bounds check
  if (nextIndex < 0) nextIndex = bubbles.length - 1;
  if (nextIndex >= bubbles.length) nextIndex = 0;

  bubbles[nextIndex]?.focus();
}

// Show feedback for max selection reached
function showMaxSelectionFeedback(bubble) {
  bubble.classList.add('shake');
  
  // Remove shake class after animation
  setTimeout(() => {
    bubble.classList.remove('shake');
  }, 600);

  // Update live region with feedback
  updateLiveRegion(`Maximum of ${CONFIG.maxSelection} interests can be selected`);
}

// Update the Next button state
function updateNextButton() {
  const nextBtn = document.getElementById('next-btn');
  const isEnabled = selectedInterests.size >= CONFIG.minSelection;
  
  if (nextBtn) {
    nextBtn.disabled = !isEnabled;
    nextBtn.textContent = isEnabled ? 'Next' : `Select ${CONFIG.minSelection - selectedInterests.size} more`;
  }
}

// Update screen reader live region
function updateLiveRegion(customMessage = null) {
  const liveRegion = document.querySelector('.interests__live');
  if (!liveRegion) return;

  const count = selectedInterests.size;
  const message = customMessage || 
    `${count} interest${count !== 1 ? 's' : ''} selected. ${
      count < CONFIG.minSelection 
        ? `Select at least ${CONFIG.minSelection - count} more to continue.`
        : 'You can now continue to the next step.'
    }`;

  liveRegion.textContent = message;
}

// Handle Next button click
async function handleNextClick() {
  if (selectedInterests.size < CONFIG.minSelection) {
    return;
  }

  const nextBtn = document.getElementById('next-btn');
  const originalText = nextBtn.textContent;
  
  try {
    // Show loading state
    nextBtn.disabled = true;
    nextBtn.textContent = 'Saving...';
    
    // Prepare data for submission
    const interestsArray = Array.from(selectedInterests);
    
    // Submit to backend
    const response = await fetch('/interests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interests: interestsArray
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Save locally as backup
      saveInterests();
      
      // Navigate to next page
      window.location.href = result.redirectTo;
    } else {
      throw new Error(result.error || 'Failed to save interests');
    }
    
  } catch (error) {
    console.error('Error saving interests:', error);
    
    // Show error feedback to user
    const liveRegion = document.querySelector('.interests__live');
    if (liveRegion) {
      liveRegion.textContent = 'Error saving interests. Please try again.';
    }
    
    // Reset button state
    nextBtn.disabled = false;
    nextBtn.textContent = originalText;
  }
}

// Save interests to localStorage
function saveInterests() {
  try {
    const interestsArray = Array.from(selectedInterests);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(interestsArray));
  } catch (error) {
    console.warn('Could not save interests to localStorage:', error);
  }
}

// Load previously saved interests
function loadSavedInterests() {
  try {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (saved) {
      const interestsArray = JSON.parse(saved);
      interestsArray.forEach(interest => {
        if (INTERESTS.includes(interest)) {
          selectedInterests.add(interest);
          
          // Update UI
          const bubble = document.querySelector(`[data-interest="${interest}"]`);
          if (bubble) {
            bubble.classList.add('is-selected');
            bubble.setAttribute('aria-pressed', 'true');
          }
        }
      });
    }
  } catch (error) {
    console.warn('Could not load saved interests:', error);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initInterests);

// Export for potential external use
window.InterestsManager = {
  getSelected: () => Array.from(selectedInterests),
  setSelected: (interests) => {
    selectedInterests = new Set(interests);
    bubbles.forEach(bubble => {
      const interest = bubble.dataset.interest;
      const isSelected = selectedInterests.has(interest);
      bubble.classList.toggle('is-selected', isSelected);
      bubble.setAttribute('aria-pressed', isSelected.toString());
    });
    updateNextButton();
    updateLiveRegion();
    saveInterests();
  },
  clear: () => {
    selectedInterests.clear();
    bubbles.forEach(bubble => {
      bubble.classList.remove('is-selected');
      bubble.setAttribute('aria-pressed', 'false');
    });
    updateNextButton();
    updateLiveRegion();
    saveInterests();
  }
};