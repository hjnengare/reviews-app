/*-----------------------------------*\
  #DEALBREAKERS.JS
\*-----------------------------------*/

// Configuration
const CONFIG = {
  minSelection: 2,
  maxSelection: 3,
  storageKey: 'dealbreakers',
  nextPage: 'allow-location.html' // Placeholder for next step
};

// Available dealbreakers
const DEALBREAKERS = [
  { id: 'trust', label: 'Trust' },
  { id: 'punctuality', label: 'Punctuality' },
  { id: 'friendliness', label: 'Friendliness' },
  { id: 'pricing', label: 'Pricing' }
];

// State management
let selectedDealbreakers = new Set();
let cards = [];

// Initialize the dealbreakers page
function initDealbreakers() {
  collectCards();
  bindEvents();
  loadSavedSelections();
  updateContinueButton();
  updateLiveRegion();
}

// Collect all card elements
function collectCards() {
  cards = Array.from(document.querySelectorAll('.dealbreaker-card'));
}

// Bind event listeners
function bindEvents() {
  const grid = document.querySelector('.dealbreakers__grid');
  const continueBtn = document.getElementById('continue-btn');

  // Delegate card clicks
  grid?.addEventListener('click', handleCardClick);
  grid?.addEventListener('keydown', handleKeyboardNavigation);

  // Continue button click
  continueBtn?.addEventListener('click', handleContinueClick);
}

// Handle card click/selection
function handleCardClick(event) {
  const card = event.target.closest('.dealbreaker-card');
  if (!card) return;

  toggleCardSelection(card);
}

// Handle keyboard navigation and activation
function handleKeyboardNavigation(event) {
  const card = event.target.closest('.dealbreaker-card');
  if (!card) return;

  // Toggle selection with Space or Enter
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleCardSelection(card);
  }

  // Arrow key navigation
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    navigateCards(event.key, card);
  }
}

// Toggle card selection state
function toggleCardSelection(card) {
  const dealbreakerId = card.dataset.dealbreaker;
  const isSelected = card.getAttribute('aria-pressed') === 'true';

  if (isSelected) {
    // Deselect
    selectedDealbreakers.delete(dealbreakerId);
    card.setAttribute('aria-pressed', 'false');
    
    updateContinueButton();
    updateLiveRegion('deselected', dealbreakerId);
    updateHintMessage();
    saveSelections();
  } else {
    // Check max selection limit
    if (selectedDealbreakers.size >= CONFIG.maxSelection) {
      showMaxSelectionHint();
      return;
    }

    // Select
    selectedDealbreakers.add(dealbreakerId);
    card.setAttribute('aria-pressed', 'true');
    
    updateContinueButton();
    updateLiveRegion('selected', dealbreakerId);
    updateHintMessage();
    saveSelections();
  }
}

// Navigate between cards with arrow keys
function navigateCards(key, currentCard) {
  const currentIndex = cards.indexOf(currentCard);
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
  if (nextIndex < 0) nextIndex = cards.length - 1;
  if (nextIndex >= cards.length) nextIndex = 0;

  cards[nextIndex]?.focus();
}

// Show hint message when max selection is reached
function showMaxSelectionHint() {
  const hintElement = document.getElementById('selection-hint');
  if (!hintElement) return;

  hintElement.textContent = `You can only select up to ${CONFIG.maxSelection} deal-breakers.`;
  hintElement.classList.add('dealbreakers__hint--error');

  // Clear hint after a few seconds
  setTimeout(() => {
    if (selectedDealbreakers.size <= CONFIG.maxSelection) {
      updateHintMessage();
    }
  }, 3000);
}

// Update hint message based on current selection
function updateHintMessage() {
  const hintElement = document.getElementById('selection-hint');
  if (!hintElement) return;

  const count = selectedDealbreakers.size;
  
  hintElement.classList.remove('dealbreakers__hint--error');
  
  if (count === 0) {
    hintElement.textContent = `Select ${CONFIG.minSelection}–${CONFIG.maxSelection} deal-breakers to continue.`;
  } else if (count === 1) {
    hintElement.textContent = `Select ${CONFIG.minSelection - count} more to continue.`;
  } else if (count >= CONFIG.minSelection && count <= CONFIG.maxSelection) {
    hintElement.textContent = `${count} selected. You can continue or add ${CONFIG.maxSelection - count} more.`;
  }
}

// Update Continue button state based on validation
function updateContinueButton() {
  const continueBtn = document.getElementById('continue-btn');
  const isValid = validateSelections();
  
  if (continueBtn) {
    continueBtn.disabled = !isValid;
  }
}

// Validate that selection count is within valid range
function validateSelections() {
  const count = selectedDealbreakers.size;
  return count >= CONFIG.minSelection && count <= CONFIG.maxSelection;
}

// Update screen reader live region with selection status
function updateLiveRegion(lastAction = null, dealbreakerId = null) {
  const liveRegion = document.querySelector('.dealbreakers__live');
  if (!liveRegion) return;

  const count = selectedDealbreakers.size;
  const selectedLabels = Array.from(selectedDealbreakers).map(id => {
    const dealbreaker = DEALBREAKERS.find(d => d.id === id);
    return dealbreaker ? dealbreaker.label : id;
  });

  let announcement = '';
  
  // Provide specific feedback for the last action
  if (lastAction && dealbreakerId) {
    const dealbreaker = DEALBREAKERS.find(d => d.id === dealbreakerId);
    const dealbrakerName = dealbreaker ? dealbreaker.label : dealbreakerId;
    
    if (lastAction === 'selected') {
      announcement = `Selected: ${dealbrakerName}. `;
    } else if (lastAction === 'deselected') {
      announcement = `Deselected: ${dealbrakerName}. `;
    }
  }
  
  // Add count information
  if (count === 0) {
    announcement += 'No deal-breakers selected.';
  } else {
    announcement += `${count} of ${CONFIG.maxSelection} selected.`;
  }

  const isValid = validateSelections();
  if (isValid) {
    announcement += ' You can continue to the next step.';
  } else if (count < CONFIG.minSelection) {
    announcement += ` Select ${CONFIG.minSelection - count} more to continue.`;
  }

  // Always announce the change for immediate feedback
  liveRegion.textContent = announcement;
}

// Handle Continue button click
function handleContinueClick() {
  if (!validateSelections()) {
    return;
  }

  // Save final selections
  saveSelections();
  
  // Navigate to next page
  window.location.href = CONFIG.nextPage;
}

// Save selections to localStorage
function saveSelections() {
  try {
    const selectionsArray = Array.from(selectedDealbreakers);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(selectionsArray));
  } catch (error) {
    console.warn('Could not save dealbreakers to localStorage:', error);
  }
}

// Load previously saved selections
function loadSavedSelections() {
  try {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (!saved) return;

    const selectionsArray = JSON.parse(saved);
    if (!Array.isArray(selectionsArray)) return;

    selectionsArray.forEach(dealbreakerId => {
      if (DEALBREAKERS.some(d => d.id === dealbreakerId)) {
        selectedDealbreakers.add(dealbreakerId);
        
        // Update UI - this will show the icon side for saved selections
        const card = document.querySelector(`[data-dealbreaker="${dealbreakerId}"]`);
        if (card) {
          card.setAttribute('aria-pressed', 'true');
        }
      }
    });
  } catch (error) {
    console.warn('Could not load saved dealbreakers:', error);
  }
}

// Get current selections for external access
function getCurrentSelections() {
  return Array.from(selectedDealbreakers);
}

// Clear all selections
function clearAllSelections() {
  selectedDealbreakers.clear();
  
  cards.forEach(card => {
    card.setAttribute('aria-pressed', 'false');
  });
  
  updateContinueButton();
  updateLiveRegion();
  updateHintMessage();
  saveSelections();
}

// Set selections programmatically
function setSelections(selectionsArray) {
  if (!Array.isArray(selectionsArray)) return;

  clearAllSelections();
  
  selectionsArray.forEach(dealbreakerId => {
    if (DEALBREAKERS.some(d => d.id === dealbreakerId) && 
        selectedDealbreakers.size < CONFIG.maxSelection) {
      selectedDealbreakers.add(dealbreakerId);
      
      const card = document.querySelector(`[data-dealbreaker="${dealbreakerId}"]`);
      if (card) {
        card.setAttribute('aria-pressed', 'true');
      }
    }
  });
  
  updateContinueButton();
  updateLiveRegion();
  updateHintMessage();
  saveSelections();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initDealbreakers);

// Export for potential external use
window.DealbreakersManager = {
  getSelections: getCurrentSelections,
  setSelections: setSelections,
  clearAll: clearAllSelections,
  isValid: validateSelections
};