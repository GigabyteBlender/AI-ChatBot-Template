/**
 * Service for handling API requests
 */

/**
 * Send a message to the chat API
 * @param {string} message - The user's message
 * @param {Array} history - Previous message history
 * @param {Object} settings - API settings
 * @returns {Promise<string>} - The AI response
 */
export const sendChatMessage = async (message, history = [], settings = {}) => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      
      // In a real app, this would use fetch or axios to call an actual API
      // For demo, we'll simulate a response
      
      console.log('Sending message to API:', { message, history, settings });
      
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine which response to simulate based on model
      const model = settings.model || 'default';
      
      if (model === 'random') {
        const responses = [
          "I understand your question about '" + message.substring(0, 20) + "...'. Here's what I think...",
          "Thank you for asking about that. From my analysis...",
          "That's a topic I'm familiar with. My response is...",
          "I've processed your request and here's what I found...",
          "Based on the information available to me..."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
      
      return `This is a simulated response from the ${model} model. Your message was: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}". In a real application, this would come from an actual AI API.`;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to get a response from the AI service');
    }
  };
  
  /**
   * Check if the API key is valid
   * @param {string} apiKey - The API key to validate
   * @returns {Promise<boolean>} - Whether the API key is valid
   */
  export const validateApiKey = async (apiKey) => {
    try {
      // In a real app, this would make a request to validate the API key
      // For demo, we'll just return true for any non-empty string
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return !!apiKey && apiKey.length > 8;
    } catch (error) {
      console.error('API Key Validation Error:', error);
      return false;
    }
  };