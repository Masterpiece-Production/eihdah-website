/**
 * Mailchimp API integration utility
 * 
 * This module provides functions to interact with the Mailchimp API
 * for waitlist management.
 */

/**
 * Submit email to Mailchimp waitlist
 * 
 * @param {string} email - The email address to add to the waitlist
 * @param {Object} additionalFields - Optional additional fields to include
 * @returns {Promise<Object>} - The API response
 */
export async function submitToMailchimp(email, additionalFields = {}) {
  try {
    // Prepare the data for submission
    const formData = new FormData();
    formData.append('email', email);
    
    // Add any additional fields
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Submit the form to our backend endpoint that handles the Mailchimp API call
    const response = await fetch('/subscribe', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to subscribe');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Mailchimp submission error:', error);
    throw error;
  }
}

/**
 * Validate email format
 * 
 * @param {string} email - The email address to validate
 * @returns {boolean} - Whether the email is valid
 */
export function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}