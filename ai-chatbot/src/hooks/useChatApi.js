import { useState, useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

/**
 * Custom hook for interacting with chat APIs
 * @returns {Object} - Chat API methods and state
 */
const useChatApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { settings } = useContext(SettingsContext);

  /**
   * Send a message to the AI API and get a response
   * @param {string} message - User message
   * @param {Array} history - Chat history for context
   * @returns {Promise<string>} - AI response
   */
  const sendMessage = async (message, history = []) => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would make an API call to an AI service
      // For demo purposes, we'll simulate a response
      
      // Get the API key from localStorage if it exists
      const apiKey = localStorage.getItem('apiKey');
      
      // Determine which model to use based on settings
      const model = settings.api.model === 'custom' 
        ? settings.api.customModel 
        : settings.api.model;
      
      // For demo, we'll just return a simulated response
      // In a real app, you would make an actual API call here
      
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (model === 'random') {
        const responses = [
          "I find that question fascinating. Let me share my thoughts...",
          "That's an interesting topic. Based on what I know...",
          "I can help with that. Here's what I think...",
          "Good question! From my perspective...",
          "I've analyzed this before. My conclusion is..."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
      
      return `This is a simulated response from the ${model} model with temperature ${settings.chat.temperature}. In a real application, this would be an actual response from an AI API.`;
    } catch (err) {
      setError(err.message || 'Failed to get response from AI');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear the current API state
   */
  const resetState = () => {
    setLoading(false);
    setError(null);
  };

  return {
    sendMessage,
    resetState,
    loading,
    error
  };
};

export default useChatApi;