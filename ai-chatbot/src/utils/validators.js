/**
 * Utility functions for validating data
 */

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate a password meets requirements
   * @param {string} password - Password to validate
   * @param {Object} options - Validation options
   * @returns {Object} - { valid: boolean, message: string }
   */
  export const validatePassword = (password, options = {}) => {
    // Default options
    const settings = {
      minLength: 6,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecial: false,
      ...options
    };
    
    if (!password) {
      return { valid: false, message: 'Password is required' };
    }
    
    if (password.length < settings.minLength) {
      return { 
        valid: false, 
        message: `Password must be at least ${settings.minLength} characters` 
      };
    }
    
    if (settings.requireUppercase && !/[A-Z]/.test(password)) {
      return { 
        valid: false, 
        message: 'Password must include at least one uppercase letter' 
      };
    }
    
    if (settings.requireLowercase && !/[a-z]/.test(password)) {
      return { 
        valid: false, 
        message: 'Password must include at least one lowercase letter'
      };
    }
    
    if (settings.requireNumbers && !/[0-9]/.test(password)) {
      return { 
        valid: false, 
        message: 'Password must include at least one number'
      };
    }
    
    if (settings.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { 
        valid: false, 
        message: 'Password must include at least one special character'
      };
    }
    
    return { valid: true, message: '' };
  };
  
  /**
   * Validate a username meets requirements
   * @param {string} username - Username to validate
   * @returns {Object} - { valid: boolean, message: string }
   */
  export const validateUsername = (username) => {
    if (!username) {
      return { valid: false, message: 'Username is required' };
    }
    
    if (username.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters' };
    }
    
    if (username.length > 30) {
      return { valid: false, message: 'Username must be less than 30 characters' };
    }
    
    // Only allow letters, numbers, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { 
        valid: false, 
        message: 'Username can only contain letters, numbers, underscores, and hyphens'
      };
    }
    
    return { valid: true, message: '' };
  };
  
  /**
   * Check if two passwords match
   * @param {string} password - Primary password
   * @param {string} confirmPassword - Confirmation password
   * @returns {boolean} - Whether the passwords match
   */
  export const passwordsMatch = (password, confirmPassword) => {
    return password === confirmPassword;
  };
  
  /**
   * Validate API key format
   * @param {string} apiKey - API key to validate
   * @returns {boolean} - Whether the API key format is valid
   */
  export const isValidApiKeyFormat = (apiKey) => {
    if (!apiKey) return false;
    
    // Check for minimum length
    if (apiKey.length < 10) return false;
    
    // Most API keys are alphanumeric with some special characters
    // This is a general validation and may need to be adjusted for specific APIs
    return /^[a-zA-Z0-9_.-]+$/.test(apiKey);
  };
  
  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} - Whether the URL format is valid
   */
  export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Check if a string contains only allowed characters
   * @param {string} str - String to check
   * @param {string} allowedChars - Regex pattern of allowed characters
   * @returns {boolean} - Whether the string contains only allowed characters
   */
  export const containsOnlyAllowedChars = (str, allowedChars = /^[a-zA-Z0-9\s]+$/) => {
    if (!str) return false;
    return allowedChars.test(str);
  };