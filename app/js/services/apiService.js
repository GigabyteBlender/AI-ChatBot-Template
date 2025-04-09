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
        const model = localStorage.getItem('model') || 'deepseek/deepseek-chat:free';
        
        // Check if we're using a custom model
        if (model === 'custom') {
            const customModel = localStorage.getItem('customModel');
            this.MODEL = customModel && customModel.trim() !== '' 
                ? customModel 
                : 'deepseek/deepseek-chat:free';
        } else {
            this.MODEL = model;
        }
        
        // Load max context setting
        this.maxContext = parseInt(localStorage.getItem('maxContext')) || 5;
        
        // Default temperature
        this.defaultTemperature = parseFloat(localStorage.getItem('temperature')) || 1.0;
    }

    // Add this to the ApiService class
    async validateApiKey() {
        try {
            if (!this.apiKey || this.apiKey.trim() === '') {
                return false;
            }
            
            // Make a simple request to check if the API key is valid
            const response = await fetch('https://openrouter.ai/api/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('API key validation error:', error);
            return false;
        }
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
                        content: 'You are a helpful assistant.'
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
                    // Keep system message and take the last maxContext messages
                    const systemMessage = messages.find(m => m.role === 'system');
                    const limitedMessages = messages.slice(-this.maxContext);
                    
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
                        content: 'You are a helpful assistant.'
                    },
                    {
                        role: 'user',
                        content: input
                    }
                ];
            }
            
            // Log the request for debugging
            console.log('API Request payload:', {
                model: this.MODEL,
                messages: messages,
                temperature: tempToUse,
                max_tokens: 1000
            });
            
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
                const errorText = await response.text();
                let errorData;
                
                try {
                    // Try to parse as JSON
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    // If not JSON, use the text directly
                    errorData = { error: { message: errorText } };
                }
                
                console.error('API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData: errorData
                });
                
                if (response.status === 400) {
                    // Handle specific 400 error - could be malformed request
                    throw new Error(`Bad request: ${errorData?.error?.message || 'Check API key and request format'}`);
                } else if (response.status === 401 || response.status === 403) {
                    // Auth error
                    throw new Error(`Authentication error: ${errorData?.error?.message || 'Invalid API key'}`);
                } else {
                    throw new Error(`API request failed: ${errorData?.error?.message || response.statusText}`);
                }
            }
            
            const data = await response.json();
            
            // Handle different response formats
            if (data.choices && data.choices.length > 0) {
                if (data.choices[0].message && data.choices[0].message.content) {
                    return data.choices[0].message.content;
                }
                
                if (data.choices[0].text) {
                    return data.choices[0].text;
                }
                
                if (data.choices[0].message && data.choices[0].message.response) {
                    return data.choices[0].message.response;
                }
                
                console.warn('Unknown response format in choices:', data.choices[0]);
                return JSON.stringify(data.choices[0].message || data.choices[0]);
            }
            
            if (data.response || data.output || data.text || data.content) {
                return data.response || data.output || data.text || data.content;
            }
            
            console.error('Unrecognized API response format:', data);
            return "Sorry, I couldn't understand the API response.";
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request was aborted');
            } else {
                console.error('API request error:', error);
            }
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