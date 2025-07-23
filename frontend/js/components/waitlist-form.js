// frontend/js/components/waitlist-form.js
// ------------------------------------------------------------
// Waitlist form component with validation and submission
// ------------------------------------------------------------

import { subscribeToWaitlist, validateEmail } from '../services/mailchimp-api.js';

/**
 * Initialize the waitlist form with validation and AJAX submission
 */
export function initWaitlistForm() {
  const waitlistForms = document.querySelectorAll('form[action="/subscribe"]');
  
  if (!waitlistForms.length) return;
  
  waitlistForms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get email input
      const emailInput = form.querySelector('input[type="email"]');
      if (!emailInput) return;
      
      // Clear previous errors
      clearErrors(emailInput);
      
      // Basic validation
      const email = emailInput.value.trim();
      if (!email || !validateEmail(email)) {
        showError(emailInput, 'Please enter a valid email address');
        return;
      }
      
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'Join Waitlist';
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subscribing...';
      }
      
      try {
        // Submit to Mailchimp API
        const response = await subscribeToWaitlist(email);
        
        if (response.success) {
          // Show success message briefly before redirect
          showSuccess(emailInput, response.message || 'Successfully subscribed!');
          
          // Redirect to thanks page after a short delay
          setTimeout(() => {
            window.location.href = '/thanks';
          }, 500);
        } else {
          // Show error
          showError(emailInput, response.message || 'Subscription failed. Please try again.');
          
          // Reset button
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }
      } catch (error) {
        console.error('Subscription error:', error);
        showError(emailInput, error.message || 'An error occurred. Please try again.');
        
        // Reset button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
    
    // Add real-time validation
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
      emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
          showError(this, 'Please enter a valid email address');
        } else if (email) {
          clearErrors(this);
        }
      });
      
      // Clear error when user starts typing again
      emailInput.addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
          clearErrors(this);
        }
      });
    }
  });
}

/**
 * Show error message for input
 */
function showError(input, message) {
  // Remove any existing feedback
  clearFeedback(input);
  
  // Add error class to input
  input.classList.add('is-invalid');
  
  // Create and append error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  input.parentNode.appendChild(errorDiv);
}

/**
 * Show success message for input
 */
function showSuccess(input, message) {
  // Remove any existing feedback
  clearFeedback(input);
  
  // Add success class to input
  input.classList.add('is-valid');
  
  // Create and append success message
  const successDiv = document.createElement('div');
  successDiv.className = 'valid-feedback';
  successDiv.textContent = message;
  input.parentNode.appendChild(successDiv);
}

/**
 * Clear all errors from an input
 */
function clearErrors(input) {
  input.classList.remove('is-invalid');
  const errorMessage = input.parentNode.querySelector('.invalid-feedback');
  if (errorMessage) {
    errorMessage.remove();
  }
}

/**
 * Clear all feedback (error and success) from an input
 */
function clearFeedback(input) {
  // Clear error state
  input.classList.remove('is-invalid');
  const errorMessage = input.parentNode.querySelector('.invalid-feedback');
  if (errorMessage) {
    errorMessage.remove();
  }
  
  // Clear success state
  input.classList.remove('is-valid');
  const successMessage = input.parentNode.querySelector('.valid-feedback');
  if (successMessage) {
    successMessage.remove();
  }
}