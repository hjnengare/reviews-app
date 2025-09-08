/*-----------------------------------*\
  #SUB-INTERESTS.JS
\*-----------------------------------*/

// Configuration
const CONFIG = {
  storageKey: 'user-sub-interests',
  categories: ['food-drink', 'arts-culture'],
  categoryLabels: {
    'food-drink': 'Food & Drink',
    'arts-culture': 'Arts & Culture'
  }
};

// State management
const selections = new Map();
let chips = [];

// Initialize the sub-interests page
function initSubInterests() {
  setupSelections();
  bindEvents();
  loadSavedSelections();
  updateContinueButton();
  updateLiveRegion();
}

// Initialize selection tracking for each category
function setupSelections() {
  CONFIG.categories.forEach(category => {
    selections.set(category, new Set());
  });
  
  // Collect all chip elements
  chips = Array.from(document.querySelectorAll('.chip'));
}

// Bind event listeners
function bindEvents() {
  const content = document.querySelector('.sub-interests__content');
  const continueBtn = document.getElementById('continue-btn');

  // Delegate chip clicks
  content?.addEventListener('click', handleChipClick);
  content?.addEventListener('keydown', handleKeyboardNavigation);

  // Continue button click
  continueBtn?.addEventListener('click', handleContinueClick);
}

// Handle chip click/selection
function handleChipClick(event) {
  const chip = event.target.closest('.chip');
  if (!chip) return;

  toggleChipSelection(chip);
}

// Handle keyboard navigation and activation
function handleKeyboardNavigation(event) {
  const chip = event.target.closest('.chip');
  if (!chip) return;

  // Toggle selection with Space or Enter
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleChipSelection(chip);
  }

  // Arrow key navigation
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    navigateChips(event.key, chip);
  }
}

// Toggle chip selection state
function toggleChipSelection(chip) {
  const chipId = chip.dataset.chip;
  const category = chip.closest('.category').dataset.category;
  const categorySelections = selections.get(category);
  const isSelected = chip.getAttribute('aria-pressed') === 'true';

  if (isSelected) {
    // Deselect
    categorySelections.delete(chipId);
    chip.setAttribute('aria-pressed', 'false');
  } else {
    // Select
    categorySelections.add(chipId);
    chip.setAttribute('aria-pressed', 'true');
  }

  updateContinueButton();
  updateLiveRegion();
  saveSelections();
}

// Navigate between chips with arrow keys
function navigateChips(key, currentChip) {
  const currentIndex = chips.indexOf(currentChip);
  let nextIndex;

  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      nextIndex = currentIndex + 1;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      nextIndex = currentIndex - 1;
      break;
  }

  // Wrap around bounds
  if (nextIndex < 0) nextIndex = chips.length - 1;
  if (nextIndex >= chips.length) nextIndex = 0;

  chips[nextIndex]?.focus();
}

// Update Continue button state based on validation
function updateContinueButton() {
  const continueBtn = document.getElementById('continue-btn');
  const isValid = validateSelections();
  
  if (continueBtn) {
    continueBtn.disabled = !isValid;
  }
}

// Validate that each category has at least one selection
function validateSelections() {
  return CONFIG.categories.every(category => {
    const categorySelections = selections.get(category);
    return categorySelections && categorySelections.size > 0;
  });
}

// Update screen reader live region with selection counts
function updateLiveRegion() {
  const liveRegion = document.querySelector('.sub-interests__live');
  if (!liveRegion) return;

  const messages = [];
  
  CONFIG.categories.forEach(category => {
    const categorySelections = selections.get(category);
    const count = categorySelections.size;
    const label = CONFIG.categoryLabels[category];
    
    if (count > 0) {
      messages.push(`${count} selected in ${label}`);
    }
  });

  const isValid = validateSelections();
  let announcement = '';

  if (messages.length > 0) {
    announcement = messages.join(', ') + '. ';
  }

  if (isValid) {
    announcement += 'All categories complete. You can continue.';
  } else {
    const remaining = CONFIG.categories.filter(category => 
      selections.get(category).size === 0
    ).map(category => CONFIG.categoryLabels[category]);
    
    if (remaining.length > 0) {
      announcement += `Please select at least one option in: ${remaining.join(', ')}.`;
    }
  }

  // Only update if the message has changed to avoid excessive announcements
  if (liveRegion.textContent !== announcement) {
    liveRegion.textContent = announcement;
  }
}

// Handle Continue button click
function handleContinueClick() {
  if (!validateSelections()) {
    return;
  }

  // Save final selections
  saveSelections();
  
  // Navigate to next page (adjust URL as needed)
  window.location.href = 'index.html'; // or next step in onboarding
}

// Save selections to localStorage
function saveSelections() {
  try {
    const selectionsObject = {};
    
    CONFIG.categories.forEach(category => {
      const categorySelections = selections.get(category);
      selectionsObject[category] = Array.from(categorySelections);
    });
    
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(selectionsObject));
  } catch (error) {
    console.warn('Could not save sub-interests to localStorage:', error);
  }
}

// Load previously saved selections
function loadSavedSelections() {
  try {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (!saved) return;

    const selectionsObject = JSON.parse(saved);
    
    CONFIG.categories.forEach(category => {
      const savedSelections = selectionsObject[category];
      if (Array.isArray(savedSelections)) {
        const categorySelections = selections.get(category);
        
        savedSelections.forEach(chipId => {
          categorySelections.add(chipId);
          
          // Update UI
          const chip = document.querySelector(`[data-chip="${chipId}"]`);
          if (chip) {
            chip.setAttribute('aria-pressed', 'true');
          }
        });
      }
    });
  } catch (error) {
    console.warn('Could not load saved sub-interests:', error);
  }
}

// Get current selections for external access
function getCurrentSelections() {
  const result = {};
  CONFIG.categories.forEach(category => {
    const categorySelections = selections.get(category);
    result[category] = Array.from(categorySelections);
  });
  return result;
}

// Clear all selections
function clearAllSelections() {
  CONFIG.categories.forEach(category => {
    selections.get(category).clear();
  });
  
  chips.forEach(chip => {
    chip.setAttribute('aria-pressed', 'false');
  });
  
  updateContinueButton();
  updateLiveRegion();
  saveSelections();
}

// Set selections programmatically
function setSelections(selectionsObject) {
  clearAllSelections();
  
  CONFIG.categories.forEach(category => {
    const categorySelections = selections.get(category);
    const newSelections = selectionsObject[category];
    
    if (Array.isArray(newSelections)) {
      newSelections.forEach(chipId => {
        categorySelections.add(chipId);
        
        const chip = document.querySelector(`[data-chip="${chipId}"]`);
        if (chip) {
          chip.setAttribute('aria-pressed', 'true');
        }
      });
    }
  });
  
  updateContinueButton();
  updateLiveRegion();
  saveSelections();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initSubInterests);

// Export for potential external use
window.SubInterestsManager = {
  getSelections: getCurrentSelections,
  setSelections: setSelections,
  clearAll: clearAllSelections,
  isValid: validateSelections
};