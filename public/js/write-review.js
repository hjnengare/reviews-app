/*-----------------------------------*\
  #WRITE-REVIEW.JS
\*-----------------------------------*/

// Configuration
const CONFIG = {
  maxTags: 4,
  maxCharacters: 1000,
  maxPhotoSize: 5 * 1024 * 1024, // 5MB
  acceptedPhotoTypes: ['image/jpeg', 'image/png', 'image/webp'],
  apiEndpoint: '/api/reviews',
  transcribeEndpoint: '/api/transcribe',
  storageKey: 'review_draft'
};

// State management
let reviewState = {
  placeId: 'mamas-kitchen', // This would come from URL params in real app
  placeName: "Mama's Kitchen",
  rating: 0,
  tags: new Set(),
  text: '',
  photos: [],
  transcription: '',
  isRecording: false,
  mediaRecorder: null,
  recordedBlob: null
};

// Initialize the write review page
function initWriteReview() {
  setPlaceName();
  loadDraft();
  bindEvents();
  updateSubmitButton();
}

// Set the place name in the header
function setPlaceName() {
  const placeNameElement = document.getElementById('place-name');
  if (placeNameElement) {
    placeNameElement.textContent = reviewState.placeName;
  }
}

// Bind all event listeners
function bindEvents() {
  bindRatingEvents();
  bindTagEvents();
  bindTextEvents();
  bindVoiceEvents();
  bindPhotoEvents();
  bindSubmitEvents();
}

// Rating functionality
function bindRatingEvents() {
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('rating-value');
  
  stars.forEach((star, index) => {
    star.addEventListener('click', () => setRating(index + 1));
    star.addEventListener('keydown', (e) => handleRatingKeydown(e, index));
    star.addEventListener('mouseenter', () => highlightStars(index + 1));
    star.addEventListener('mouseleave', () => highlightStars(reviewState.rating));
  });
}

function setRating(rating) {
  reviewState.rating = rating;
  document.getElementById('rating-value').value = rating;
  updateStarsDisplay(rating);
  clearRatingError();
  updateSubmitButton();
  saveDraft();
  
  // Announce rating change
  announceToScreen(`Rating set to ${rating} star${rating !== 1 ? 's' : ''}`);
}

function updateStarsDisplay(rating) {
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    const isSelected = index < rating;
    star.classList.toggle('star--selected', isSelected);
    star.setAttribute('aria-pressed', isSelected.toString());
  });
}

function highlightStars(rating) {
  updateStarsDisplay(rating);
}

function handleRatingKeydown(e, currentIndex) {
  let newIndex = currentIndex;
  
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      newIndex = Math.max(0, currentIndex - 1);
      break;
    case 'ArrowRight':
      e.preventDefault();
      newIndex = Math.min(4, currentIndex + 1);
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      setRating(currentIndex + 1);
      return;
  }
  
  if (newIndex !== currentIndex) {
    document.querySelectorAll('.star')[newIndex].focus();
  }
}

function clearRatingError() {
  document.getElementById('rating-error').textContent = '';
}

// Tags functionality
function bindTagEvents() {
  const tagChips = document.querySelectorAll('.tag-chip');
  
  tagChips.forEach(chip => {
    chip.addEventListener('click', () => toggleTag(chip));
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTag(chip);
      }
    });
  });
}

function toggleTag(chip) {
  const tag = chip.dataset.tag;
  const isSelected = chip.getAttribute('aria-pressed') === 'true';
  
  if (isSelected) {
    // Deselect
    reviewState.tags.delete(tag);
    chip.setAttribute('aria-pressed', 'false');
    updateTagsHint();
  } else {
    // Check max limit
    if (reviewState.tags.size >= CONFIG.maxTags) {
      showTagsError(`You can only select up to ${CONFIG.maxTags} tags.`);
      return;
    }
    
    // Select
    reviewState.tags.add(tag);
    chip.setAttribute('aria-pressed', 'true');
    clearTagsError();
  }
  
  updateSubmitButton();
  saveDraft();
  
  // Announce change
  const action = isSelected ? 'Deselected' : 'Selected';
  const tagLabel = chip.querySelector('.tag-chip__label').textContent;
  announceToScreen(`${action}: ${tagLabel}. ${reviewState.tags.size} of ${CONFIG.maxTags} tags selected.`);
}

function updateTagsHint() {
  const hint = document.getElementById('tags-hint');
  const count = reviewState.tags.size;
  
  if (count === 0) {
    hint.textContent = '';
  } else {
    hint.textContent = `${count} of ${CONFIG.maxTags} tags selected`;
  }
  hint.classList.remove('tags-section__hint--error');
}

function showTagsError(message) {
  const hint = document.getElementById('tags-hint');
  hint.textContent = message;
  hint.classList.add('tags-section__hint--error');
  
  setTimeout(() => {
    updateTagsHint();
  }, 3000);
}

function clearTagsError() {
  updateTagsHint();
}

// Text area functionality
function bindTextEvents() {
  const textarea = document.getElementById('experience-text');
  const counter = document.getElementById('experience-counter');
  
  textarea.addEventListener('input', (e) => {
    const text = e.target.value;
    const length = text.length;
    
    reviewState.text = text;
    updateCharacterCounter(length);
    updateSubmitButton();
    saveDraft();
  });
  
  // Auto-resize
  textarea.addEventListener('input', autoResizeTextarea);
}

function updateCharacterCounter(length) {
  const counter = document.getElementById('experience-counter');
  const warningThreshold = CONFIG.maxCharacters * 0.8;
  const errorThreshold = CONFIG.maxCharacters;
  
  counter.textContent = `${length} / ${CONFIG.maxCharacters}`;
  
  counter.classList.remove('experience-section__counter--warning', 'experience-section__counter--error');
  
  if (length >= errorThreshold) {
    counter.classList.add('experience-section__counter--error');
  } else if (length >= warningThreshold) {
    counter.classList.add('experience-section__counter--warning');
  }
}

function autoResizeTextarea(e) {
  const textarea = e.target;
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

// Voice recording functionality
function bindVoiceEvents() {
  const voiceButton = document.getElementById('voice-button');
  voiceButton.addEventListener('click', toggleRecording);
}

async function toggleRecording() {
  if (reviewState.isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    reviewState.mediaRecorder = new MediaRecorder(stream);
    reviewState.isRecording = true;
    
    const audioChunks = [];
    
    reviewState.mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };
    
    reviewState.mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      await transcribeAudio(audioBlob);
      
      // Clean up
      stream.getTracks().forEach(track => track.stop());
    };
    
    reviewState.mediaRecorder.start();
    updateVoiceUI(true);
    updateVoiceStatus('Recording... Click to stop');
    
  } catch (error) {
    handleVoiceError(error);
  }
}

function stopRecording() {
  if (reviewState.mediaRecorder && reviewState.isRecording) {
    reviewState.mediaRecorder.stop();
    reviewState.isRecording = false;
    updateVoiceUI(false);
    updateVoiceStatus('Processing...');
  }
}

async function transcribeAudio(audioBlob) {
  try {
    // Simulate transcription (replace with real API call)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock transcription result
    const mockTranscription = "This is a transcribed voice note about my experience at the restaurant.";
    
    reviewState.transcription = mockTranscription;
    displayTranscription(mockTranscription);
    updateVoiceStatus('Voice note transcribed');
    updateSubmitButton();
    saveDraft();
    
    announceToScreen('Voice note transcribed successfully');
    
  } catch (error) {
    updateVoiceStatus('Transcription failed. Please try again.');
    console.error('Transcription error:', error);
  }
}

function displayTranscription(text) {
  const transcriptionElement = document.getElementById('voice-transcription');
  transcriptionElement.textContent = text;
  transcriptionElement.classList.add('voice-section__transcription--visible');
}

function updateVoiceUI(isRecording) {
  const button = document.getElementById('voice-button');
  const text = button.querySelector('.voice-section__text');
  
  button.classList.toggle('voice-section__button--recording', isRecording);
  text.textContent = isRecording ? 'Stop Recording' : 'Add Voice Note';
}

function updateVoiceStatus(message) {
  const status = document.getElementById('voice-status');
  status.textContent = message;
  status.classList.toggle('voice-section__status--recording', reviewState.isRecording);
  status.classList.toggle('voice-section__status--processing', message === 'Processing...');
}

function handleVoiceError(error) {
  let message = 'Could not access microphone. ';
  
  if (error.name === 'NotAllowedError') {
    message += 'Please check your browser permissions.';
  } else if (error.name === 'NotFoundError') {
    message += 'No microphone found.';
  } else {
    message += 'Please try again.';
  }
  
  updateVoiceStatus(message);
  updateVoiceUI(false);
  reviewState.isRecording = false;
  
  announceToScreen(message);
}

// Photo functionality
function bindPhotoEvents() {
  const photoButton = document.getElementById('photo-button');
  const photoInput = document.getElementById('photo-input');
  
  photoButton.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', handlePhotoSelection);
}

function handlePhotoSelection(e) {
  const files = Array.from(e.target.files);
  const validFiles = files.filter(validatePhoto);
  
  if (validFiles.length !== files.length) {
    showPhotoError('Some files were invalid and skipped.');
  } else {
    clearPhotoError();
  }
  
  validFiles.forEach(addPhoto);
  updateSubmitButton();
  saveDraft();
}

function validatePhoto(file) {
  if (!CONFIG.acceptedPhotoTypes.includes(file.type)) {
    showPhotoError(`${file.name}: Invalid file type. Please use JPG, PNG, or WebP.`);
    return false;
  }
  
  if (file.size > CONFIG.maxPhotoSize) {
    showPhotoError(`${file.name}: File too large. Maximum size is 5MB.`);
    return false;
  }
  
  return true;
}

function addPhoto(file) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const photoData = {
      id: Date.now() + Math.random(),
      file: file,
      dataUrl: e.target.result,
      name: file.name
    };
    
    reviewState.photos.push(photoData);
    renderPhotoPreview(photoData);
    updateSubmitButton();
    saveDraft();
  };
  
  reader.readAsDataURL(file);
}

function renderPhotoPreview(photoData) {
  const previewsContainer = document.getElementById('photo-previews');
  
  const preview = document.createElement('div');
  preview.className = 'photo-preview';
  preview.dataset.photoId = photoData.id;
  
  preview.innerHTML = `
    <img src="${photoData.dataUrl}" alt="${photoData.name}" class="photo-preview__image">
    <button type="button" class="photo-preview__remove" aria-label="Remove photo">×</button>
  `;
  
  const removeButton = preview.querySelector('.photo-preview__remove');
  removeButton.addEventListener('click', () => removePhoto(photoData.id));
  
  previewsContainer.appendChild(preview);
}

function removePhoto(photoId) {
  reviewState.photos = reviewState.photos.filter(photo => photo.id !== photoId);
  
  const preview = document.querySelector(`[data-photo-id="${photoId}"]`);
  if (preview) {
    preview.remove();
  }
  
  updateSubmitButton();
  saveDraft();
  announceToScreen('Photo removed');
}

function showPhotoError(message) {
  const errorElement = document.getElementById('photo-error');
  errorElement.textContent = message;
  
  setTimeout(() => {
    clearPhotoError();
  }, 5000);
}

function clearPhotoError() {
  document.getElementById('photo-error').textContent = '';
}

// Submit functionality
function bindSubmitEvents() {
  const form = document.getElementById('review-form');
  form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();
  
  if (!validateReview()) {
    return;
  }
  
  const submitButton = document.getElementById('submit-button');
  submitButton.classList.add('write-review__submit--loading');
  submitButton.disabled = true;
  
  try {
    const reviewData = constructReviewData();
    await submitReview(reviewData);
    
    // Success - clear draft and navigate
    clearDraft();
    announceToScreen('Review submitted successfully!');
    
    // Navigate back or to success page
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
    
  } catch (error) {
    console.error('Submit error:', error);
    showSubmitError('Failed to submit review. Please try again.');
  } finally {
    submitButton.classList.remove('write-review__submit--loading');
    submitButton.disabled = false;
  }
}

function validateReview() {
  let isValid = true;
  
  // Rating is required
  if (reviewState.rating === 0) {
    document.getElementById('rating-error').textContent = 'Please select a rating';
    isValid = false;
  }
  
  // Must have text, photos, or transcription
  const hasContent = reviewState.text.trim() || 
                    reviewState.photos.length > 0 || 
                    reviewState.transcription.trim();
  
  if (!hasContent) {
    document.getElementById('experience-error').textContent = 'Please add text, a photo, or a voice note';
    isValid = false;
  }
  
  // Character limit
  if (reviewState.text.length > CONFIG.maxCharacters) {
    document.getElementById('experience-error').textContent = `Text is too long (${reviewState.text.length}/${CONFIG.maxCharacters})`;
    isValid = false;
  }
  
  return isValid;
}

function constructReviewData() {
  const combinedText = [reviewState.text, reviewState.transcription]
    .filter(text => text.trim())
    .join(' ');
  
  return {
    placeId: reviewState.placeId,
    rating: reviewState.rating,
    tags: Array.from(reviewState.tags),
    text: combinedText,
    photos: reviewState.photos.map(photo => ({
      name: photo.name,
      dataUrl: photo.dataUrl // In real app, would upload to server first
    })),
    createdAt: new Date().toISOString()
  };
}

async function submitReview(reviewData) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In real app:
  // const response = await fetch(CONFIG.apiEndpoint, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(reviewData)
  // });
  // 
  // if (!response.ok) {
  //   throw new Error('Network error');
  // }
  
  console.log('Review submitted:', reviewData);
}

function showSubmitError(message) {
  announceToScreen(message);
  // Could show toast notification here
}

// Submit button state management
function updateSubmitButton() {
  const submitButton = document.getElementById('submit-button');
  const hasRating = reviewState.rating > 0;
  const hasContent = reviewState.text.trim() || 
                    reviewState.photos.length > 0 || 
                    reviewState.transcription.trim();
  
  const isValid = hasRating && hasContent;
  submitButton.disabled = !isValid;
}

// Draft persistence
function saveDraft() {
  try {
    const draft = {
      placeId: reviewState.placeId,
      rating: reviewState.rating,
      tags: Array.from(reviewState.tags),
      text: reviewState.text,
      transcription: reviewState.transcription,
      photos: reviewState.photos.map(photo => ({
        id: photo.id,
        name: photo.name,
        dataUrl: photo.dataUrl
      })),
      savedAt: Date.now()
    };
    
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(draft));
  } catch (error) {
    console.warn('Could not save draft:', error);
  }
}

function loadDraft() {
  try {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (!saved) return;
    
    const draft = JSON.parse(saved);
    
    // Only load if for same place
    if (draft.placeId !== reviewState.placeId) return;
    
    // Restore state
    if (draft.rating) {
      setRating(draft.rating);
    }
    
    if (draft.tags) {
      draft.tags.forEach(tag => {
        const chip = document.querySelector(`[data-tag="${tag}"]`);
        if (chip) {
          reviewState.tags.add(tag);
          chip.setAttribute('aria-pressed', 'true');
        }
      });
      updateTagsHint();
    }
    
    if (draft.text) {
      reviewState.text = draft.text;
      document.getElementById('experience-text').value = draft.text;
      updateCharacterCounter(draft.text.length);
    }
    
    if (draft.transcription) {
      reviewState.transcription = draft.transcription;
      displayTranscription(draft.transcription);
      updateVoiceStatus('Voice note restored from draft');
    }
    
    if (draft.photos) {
      draft.photos.forEach(photoData => {
        reviewState.photos.push(photoData);
        renderPhotoPreview(photoData);
      });
    }
    
    updateSubmitButton();
    
  } catch (error) {
    console.warn('Could not load draft:', error);
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(CONFIG.storageKey);
  } catch (error) {
    console.warn('Could not clear draft:', error);
  }
}

// Accessibility helper
function announceToScreen(message) {
  const liveRegion = document.querySelector('.write-review__live');
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initWriteReview);

// Export for potential external use
window.WriteReviewManager = {
  getReviewState: () => ({ ...reviewState }),
  saveDraft,
  clearDraft,
  submitReview: handleSubmit
};