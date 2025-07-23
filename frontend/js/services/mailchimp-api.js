// frontend/js/services/mailchimp-api.js
// ------------------------------------------------------------
// Mailchimp API service for handling waitlist subscriptions
// ------------------------------------------------------------

/**
 * Subscribe an email to the Mailchimp waitlist
 * @param {string} email - The email address to subscribe
 * @returns {Promise} - Promise resolving to the API response
 */
export async function subscribeToWaitlist(email) {
  try {
    const formData = new FormData();
    formData.append('email', email);
    
    const response = await fetch('/subscribe', {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Subscription failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Mailchimp subscription error:', error);
    throw error;
  }
}

/**
 * Validate if the provided email has a valid format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}