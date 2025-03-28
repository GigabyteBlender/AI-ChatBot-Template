export class ApiService {
    /**
     * Creates a new ApiService instance
     * @param {string} apiKey - The API key for authentication
     */
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.API_URL = 'https://openrouter.ai/api/v1/chat/completions';
        this.loadSettings();
    }
    
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        // Get model setting
        const model = localStorage.getItem('model') || 'google/gemini-2.0-flash-lite-preview-02-05:free';
        
        // Check if we're using a custom model
        if (model === 'custom') {
            const customModel = localStorage.getItem('customModel');
            this.MODEL = customModel && customModel.trim() !== '' 
                ? customModel 
                : 'google/gemini-2.0-flash-lite-preview-02-05:free';
        } else {
            this.MODEL = model;
        }
        
        // Load max context setting
        this.maxContext = parseInt(localStorage.getItem('maxContext')) || 5;
        
        // Default temperature
        this.defaultTemperature = parseFloat(localStorage.getItem('temperature')) || 1.0;
    }
    
    /**
     * Gets a completion from the API
     * @param {object|string} input - The input text or context object
     * @param {number} temperature - The creativity level (0.0 to 2.0)
     * @returns {Promise<string>} - The completion text
     */
    async getCompletion(input, temperature = null) {
        // Use provided temperature or default from settings
        const tempToUse = temperature !== null ? temperature : this.defaultTemperature;
        
        // Cancel any existing requests
        if (this.controller) {
            this.controller.abort();
        }
        
        // Create a new abort controller for this request
        this.controller = new AbortController();
        
        try {
            let messages;
            
            // Check if input is a context object or just a string
            if (typeof input === 'object' && input.messages) {
                messages = input.messages;

                // Make sure we have a system message at the beginning if it doesn't exist
                if (!messages.some(m => m.role === 'system')) {
                    messages.unshift({
                        role: 'system',
                        content: 'You are a helpful assistant.'  // Customize this system message
                    });
                }
                
                // Add current message if it exists and isn't already included
                if (input.currentMessage && !messages.some(m => m.role === 'user' && m.content === input.currentMessage)) {
                    messages.push({
                        role: 'user',
                        content: input.currentMessage
                    });
                }
                
                // Apply max context limit if set
                if (this.maxContext > 0 && messages.length > this.maxContext + 2) {
                    // Keep system message (index 0), and take the last maxContext messages
                    // +2 accounts for system message and the latest user message
                    const systemMessage = messages.find(m => m.role === 'system');
                    const limitedMessages = messages.slice(-this.maxContext);
                    
                    // If we found a system message, add it back at the beginning
                    if (systemMessage) {
                        limitedMessages.unshift(systemMessage);
                    }
                    
                    messages = limitedMessages;
                }
            } else {
                // Simple string input, create a basic message
                messages = [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant.'  // Customize this system message
                    },
                    {
                        role: 'user',
                        content: input
                    }
                ];
            }
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    messages: messages,
                    temperature: tempToUse,
                    max_tokens: 1000
                }),
                signal: this.controller.signal
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            // Handle different response formats
            if (data.choices && data.choices.length > 0) {
                // Format 1: OpenAI-like format with choices array containing message objects
                if (data.choices[0].message && data.choices[0].message.content) {
                    return data.choices[0].message.content;
                }
                
                // Format 2: Some APIs include text directly in the choice
                if (data.choices[0].text) {
                    return data.choices[0].text;
                }
                
                // Format 3: Some might use 'response' instead of 'content'
                if (data.choices[0].message && data.choices[0].message.response) {
                    return data.choices[0].message.response;
                }
                
                // If we get here, the format is unexpected but we have choices
                console.warn('Unknown response format in choices:', data.choices[0]);
                return JSON.stringify(data.choices[0].message || data.choices[0]);
            }
            
            // Format 4: Some APIs might put the response at the top level
            if (data.response || data.output || data.text || data.content) {
                return data.response || data.output || data.text || data.content;
            }
            
            // If we can't determine the format, log the issue and return an error message
            // In the getCompletion method of apiService.js
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    throw new Error(`API error: ${errorData.error.message || 'Unknown error'}`);
                }
                throw new Error(`API request failed with status ${response.status}`);
            }
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request was aborted');
                throw error;
            }
            
            console.error('API request error:', error);
            throw error;
        } finally {
            this.controller = null;
        }
    }
    
    /**
     * Gets a random pre-defined response for testing
     * @returns {string} - A random response
     */
    getRandomResponse() {
        const responses = [
            "I'm not sure about that. Could you provide more information?",
            "That's an interesting question! Let me think about it...",
            "Based on my understanding, I would suggest...",
            "Here's what I think about your question...",
            "I'd like to help you with that. Here's my response..."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * Cancels any pending requests
     */
    cancelRequest() {
        if (this.controller) {
            this.controller.abort();
            this.controller = null;
        }
    }
    
    /**
     * Refresh settings
     * Call this method whenever settings might have changed
     */
    refreshSettings() {
        this.loadSettings();
    }
}