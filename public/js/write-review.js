/*-----------------------------------*\
  #WRITE REVIEW - INTERACTIVE FUNCTIONALITY
\*-----------------------------------*/

'use strict';

// State management
const reviewState = {
  rating: 0,
  selectedTags: new Set(),
  photos: [],
  hasVoiceNote: false,
  isDraft: false
};

// DOM Elements
const ratingStars = document.querySelectorAll('.rating-star');
const ratingDisplay = document.getElementById('rating-display');
const ratingText = document.getElementById('rating-text');
const ratingError = document.getElementById('rating-error');
const ratingValue = document.getElementById('rating-value');

const tagChips = document.querySelectorAll('.tag-chip');
const tagLimitMessage = document.getElementById('tag-limit-message');

const experienceInput = document.getElementById('experience-text');
const charCount = document.getElementById('char-count');

const voiceNoteBtn = document.getElementById('voice-note-btn');
const photoBtn = document.getElementById('photo-btn');
const photoInput = document.getElementById('photo-input');
const photoPreviews = document.getElementById('photo-previews');

const submitBtn = document.getElementById('submit-btn');
const saveDraftBtn = document.getElementById('save-draft');
const form = document.getElementById('review-form');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  initializeRatingSystem();
  initializeTagSystem();
  initializeTextArea();
  initializeAttachments();
  initializeFormSubmission();
  updateSubmitButton();
  
  // Load draft if exists
  loadDraftFromStorage();
});

/**
 * Rating System
 */
function initializeRatingSystem() {
  ratingStars.forEach((star, index) => {
    const rating = index + 1;
    
    star.addEventListener('click', () => {
      setRating(rating);
    });
    
    star.addEventListener('mouseenter', () => {
      highlightStars(rating);
    });
    
    star.addEventListener('mouseleave', () => {
      highlightStars(reviewState.rating);
    });
    
    // Keyboard navigation
    star.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          setRating(rating);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (index > 0) ratingStars[index - 1].focus();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (index < ratingStars.length - 1) ratingStars[index + 1].focus();
          break;
      }
    });
  });
}

function setRating(rating) {
  reviewState.rating = rating;
  ratingValue.value = rating;
  
  highlightStars(rating);
  updateRatingDisplay(rating);
  hideRatingError();
  updateSubmitButton();
  saveDraftToStorage();
}

function highlightStars(rating) {
  ratingStars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('selected');
    } else {
      star.classList.remove('selected');
    }
  });
}

function updateRatingDisplay(rating) {
  if (rating > 0) {
    ratingText.textContent = `${rating}/5`;
  } else {
    ratingText.textContent = 'Select a rating';
  }
}

function showRatingError(message) {
  ratingError.textContent = message;
  ratingError.style.display = 'block';
}

function hideRatingError() {
  ratingError.style.display = 'none';
}

/**
 * Tag System
 */
function initializeTagSystem() {
  tagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      toggleTag(chip);
    });
    
    // Keyboard navigation
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTag(chip);
      }
    });
  });
}

function toggleTag(chip) {
  const tagValue = chip.dataset.tag;
  
  if (reviewState.selectedTags.has(tagValue)) {
    // Remove tag
    reviewState.selectedTags.delete(tagValue);
    chip.classList.remove('selected');
    hideTagLimitMessage();
  } else {
    // Check limit
    if (reviewState.selectedTags.size >= 4) {
      showTagLimitMessage();
      return;
    }
    
    // Add tag
    reviewState.selectedTags.add(tagValue);
    chip.classList.add('selected');
    hideTagLimitMessage();
  }
  
  saveDraftToStorage();
}

function showTagLimitMessage() {
  tagLimitMessage.textContent = 'You can pick up to 4 tags';
  tagLimitMessage.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    hideTagLimitMessage();
  }, 3000);
}

function hideTagLimitMessage() {
  tagLimitMessage.style.display = 'none';
}

/**
 * Text Area
 */
function initializeTextArea() {
  experienceInput.addEventListener('input', () => {
    updateCharacterCount();
    autoExpandTextarea();
    saveDraftToStorage();
  });
  
  // Auto-expand textarea
  experienceInput.addEventListener('keydown', (e) => {
    // Allow Enter key for line breaks
    if (e.key === 'Enter' && !e.shiftKey) {
      // Normal enter - just add line break
      setTimeout(autoExpandTextarea, 0);
    }
  });
}

function updateCharacterCount() {
  const currentLength = experienceInput.value.length;
  const maxLength = experienceInput.maxLength;
  
  charCount.textContent = `${currentLength}/${maxLength}`;
  
  // Show warning at 90%
  if (currentLength >= maxLength * 0.9) {
    charCount.classList.add('warning');
  } else {
    charCount.classList.remove('warning');
  }
}

function autoExpandTextarea() {
  experienceInput.style.height = 'auto';
  const maxHeight = 6 * 24; // 6 lines * 24px line height
  const scrollHeight = experienceInput.scrollHeight;
  
  if (scrollHeight <= maxHeight) {
    experienceInput.style.height = Math.max(120, scrollHeight) + 'px';
  } else {
    experienceInput.style.height = maxHeight + 'px';
  }
}

/**
 * Attachments
 */
function initializeAttachments() {
  // Voice note functionality
  voiceNoteBtn.addEventListener('click', handleVoiceNote);
  
  // Photo functionality
  photoBtn.addEventListener('click', () => {
    photoInput.click();
  });
  
  photoInput.addEventListener('change', handlePhotoSelection);
}

function handleVoiceNote() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('Voice recording is not supported in your browser', 'error');
    return;
  }
  
  if (reviewState.hasVoiceNote) {
    // Remove voice note
    reviewState.hasVoiceNote = false;
    voiceNoteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
      <span>Add Voice Note</span>
    `;
    voiceNoteBtn.style.background = 'var(--sage)';
  } else {
    // Start voice recording (simplified for demo)
    reviewState.hasVoiceNote = true;
    voiceNoteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6"/>
      </svg>
      <span>Voice Added ✓</span>
    `;
    voiceNoteBtn.style.background = 'var(--coral)';
    showToast('Voice note added successfully', 'success');
  }
  
  saveDraftToStorage();
}

function handlePhotoSelection(event) {
  const files = Array.from(event.target.files);
  const maxPhotos = 5;
  
  if (reviewState.photos.length + files.length > maxPhotos) {
    showToast(`You can only add up to ${maxPhotos} photos`, 'error');
    return;
  }
  
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('Photo must be smaller than 5MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const photo = {
          id: Date.now() + Math.random(),
          file: file,
          dataUrl: e.target.result
        };
        
        reviewState.photos.push(photo);
        renderPhotoPreview(photo);
        saveDraftToStorage();
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Reset input
  photoInput.value = '';
}

function renderPhotoPreview(photo) {
  const preview = document.createElement('div');
  preview.className = 'photo-preview';
  preview.dataset.photoId = photo.id;
  
  preview.innerHTML = `
    <img src="${photo.dataUrl}" alt="Photo preview">
    <button type="button" class="photo-remove" onclick="removePhoto('${photo.id}')" aria-label="Remove photo">×</button>
  `;
  
  photoPreviews.appendChild(preview);
}

function removePhoto(photoId) {
  reviewState.photos = reviewState.photos.filter(photo => photo.id != photoId);
  const preview = document.querySelector(`[data-photo-id="${photoId}"]`);
  if (preview) {
    preview.remove();
  }
  saveDraftToStorage();
}

// Make removePhoto globally accessible
window.removePhoto = removePhoto;

/**
 * Form Submission
 */
function initializeFormSubmission() {
  form.addEventListener('submit', handleSubmit);
  saveDraftBtn.addEventListener('click', handleSaveDraft);
}

function handleSubmit(event) {
  event.preventDefault();
  
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    <span>Submitting...</span>
  `;
  
  // Simulate form submission
  setTimeout(() => {
    // Clear draft
    clearDraftFromStorage();
    
    // Show success and redirect
    showToast('Thanks for sharing!', 'success');
    
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }, 1500);
}

function handleSaveDraft(event) {
  event.preventDefault();
  reviewState.isDraft = true;
  saveDraftToStorage();
  showToast('Draft saved successfully', 'success');
}

function validateForm() {
  let isValid = true;
  
  // Check rating
  if (reviewState.rating === 0) {
    showRatingError('Pick a rating to submit');
    ratingStars[0].focus();
    isValid = false;
  }
  
  return isValid;
}

function updateSubmitButton() {
  const hasRating = reviewState.rating > 0;
  submitBtn.disabled = !hasRating;
  
  if (hasRating) {
    submitBtn.classList.remove('disabled');
  } else {
    submitBtn.classList.add('disabled');
  }
}

/**
 * Draft Management
 */
function saveDraftToStorage() {
  const draftData = {
    rating: reviewState.rating,
    selectedTags: Array.from(reviewState.selectedTags),
    experienceText: experienceInput.value,
    hasVoiceNote: reviewState.hasVoiceNote,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem('write-review-draft', JSON.stringify(draftData));
  } catch (error) {
    console.warn('Could not save draft to localStorage:', error);
  }
}

function loadDraftFromStorage() {
  try {
    const draftData = localStorage.getItem('write-review-draft');
    if (draftData) {
      const draft = JSON.parse(draftData);
      
      // Load rating
      if (draft.rating > 0) {
        setRating(draft.rating);
      }
      
      // Load tags
      if (draft.selectedTags) {
        draft.selectedTags.forEach(tagValue => {
          const chip = document.querySelector(`[data-tag="${tagValue}"]`);
          if (chip) {
            reviewState.selectedTags.add(tagValue);
            chip.classList.add('selected');
          }
        });
      }
      
      // Load text
      if (draft.experienceText) {
        experienceInput.value = draft.experienceText;
        updateCharacterCount();
        autoExpandTextarea();
      }
      
      // Load voice note
      if (draft.hasVoiceNote) {
        handleVoiceNote();
      }
    }
  } catch (error) {
    console.warn('Could not load draft from localStorage:', error);
  }
}

function clearDraftFromStorage() {
  try {
    localStorage.removeItem('write-review-draft');
  } catch (error) {
    console.warn('Could not clear draft from localStorage:', error);
  }
}

/**
 * Toast Notifications
 */
function showToast(message, type = 'success') {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  if (type === 'error') {
    toast.style.background = 'var(--coral)';
  }
  
  document.body.appendChild(toast);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 4000);
}

/**
 * Auto-save functionality
 */
let autoSaveTimeout;
function scheduleAutoSave() {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    saveDraftToStorage();
  }, 5000); // Auto-save every 5 seconds
}

// Add auto-save to input events
document.addEventListener('input', scheduleAutoSave);

// Add CSS animation for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);