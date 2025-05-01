/**
 * Service for handling local storage operations
 */

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {boolean} - Success status
 */
export const saveToStorage = (key, data) => {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
      return false;
    }
  };
  
  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} - Retrieved data or defaultValue
   */
  export const loadFromStorage = (key, defaultValue = null) => {
    try {
      const serializedData = localStorage.getItem(key);
      return serializedData ? JSON.parse(serializedData) : defaultValue;
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error);
      return defaultValue;
    }
  };
  
  /**
   * Remove data from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} - Success status
   */
  export const removeFromStorage = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  };
  
  /**
   * Clear all app data from localStorage
   * @param {Array} preserveKeys - Array of keys to preserve
   * @returns {boolean} - Success status
   */
  export const clearAllData = (preserveKeys = []) => {
    try {
      // If there are keys to preserve, save them first
      const preserved = {};
      if (preserveKeys.length > 0) {
        preserveKeys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) preserved[key] = value;
        });
      }
      
      // Clear storage
      localStorage.clear();
      
      // Restore preserved keys
      Object.entries(preserved).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  };
  
  /**
   * Check if localStorage is available
   * @returns {boolean} - Whether localStorage is available
   */
  export const isStorageAvailable = () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  /**
   * Get the total size of localStorage used by the app
   * @returns {number} - Size in bytes
   */
  export const getStorageSize = () => {
    try {
      let totalSize = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // Approximate UTF-16 size
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  };
  
  /**
   * Check if storage limit is approaching
   * @returns {boolean} - Whether storage is nearly full
   */
  export const isStorageNearlyFull = () => {
    // Most browsers have ~5MB limit for localStorage
    const MAX_STORAGE = 5 * 1024 * 1024; // 5MB in bytes
    const WARNING_THRESHOLD = 0.8; // 80% full
    
    const currentSize = getStorageSize();
    return currentSize > (MAX_STORAGE * WARNING_THRESHOLD);
  };