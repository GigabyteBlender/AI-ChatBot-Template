/**
 * Service for handling authentication operations
 */

// Currently using localStorage for demo purposes
// In a real app, this would communicate with a backend API

/**
 * Log in a user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User object
 */
export const loginUser = async (email, password) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple validation for demo
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Invalid credentials');
      }
      
      // In a real app, this would validate credentials against a backend
      const user = {
        email,
        username: email.split('@')[0],
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  };
  
  /**
   * Register a new user
   * @param {string} username - User's username
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - User object
   */
  export const registerUser = async (username, email, password) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation for demo
      if (!username || !email || !password) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Check if email is already "registered" (in localStorage)
      const existingUser = localStorage.getItem('user');
      if (existingUser && JSON.parse(existingUser).email === email) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const user = {
        username,
        email,
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  };
  
  /**
   * Log out the current user
   * @returns {Promise<void>}
   */
  export const logoutUser = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Remove user from localStorage
      localStorage.removeItem('user');
      
      return true;
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  };
  
  /**
   * Request a password reset
   * @param {string} email - User's email
   * @returns {Promise<boolean>}
   */
  export const requestPasswordReset = async (email) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!email) {
        throw new Error('Email is required');
      }
      
      // In a real app, this would send a password reset email
      console.log(`Password reset requested for: ${email}`);
      
      return true;
    } catch (error) {
      console.error('Password Reset Error:', error);
      throw error;
    }
  };
  
  /**
   * Get the current user from localStorage
   * @returns {Object|null} - User object or null if not logged in
   */
  export const getCurrentUser = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Get Current User Error:', error);
      return null;
    }
  };