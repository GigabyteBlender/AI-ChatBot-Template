import { DatabaseUrl } from '../../../config.js';
import { AuthService } from './authService.js';

export class ChatHistoryService {
    constructor() {
        this.apiBaseUrl = DatabaseUrl.API_URL;
        this.localStorageKey = 'chat_history';
        this.authService = new AuthService();
        
    }

    /**
     * Generates a unique chat ID
     * @returns {Promise<string>} A unique chat ID
     */
    async generateChatId() {
        // Try to get a chat ID from the API if authenticated
        if (localStorage.getItem('isLoggedIn') === true) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/generate-chat-id`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.authService.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return data.id;
                }
            } catch (error) {
                console.error('Error generating chat ID from API:', error);
                // Fall back to local ID generation
            }
        }
        
        // Fallback: Generate a local ID if API call fails or user is not authenticated
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substring(2, 9);
        return `chat_${timestamp}_${randomPart}`;
    }

    /**
     * Gets a chat by ID
     * @param {string} chatId - The ID of the chat to retrieve
     * @returns {Promise<Object>} The chat object with messages
     */
    async getChat(chatId) {
        if (localStorage.getItem('isLoggedIn') === true) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/chats/${chatId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.authService.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    return await response.json();
                } else if (response.status === 404) {
                    // Chat not found in API, try local storage
                    return this.getLocalChat(chatId);
                }
            } catch (error) {
                console.error('Error fetching chat from API:', error);
                // Fall back to local storage
            }
        }
        
        // Get from local storage if not authenticated or API call fails
        return this.getLocalChat(chatId);
    }

    /**
     * Gets a chat by ID from local storage
     * @param {string} chatId - The ID of the chat to retrieve
     * @returns {Object|null} The chat object with messages or null if not found
     */
    getLocalChat(chatId) {
        const chatHistory = this.getLocalChatHistory();
        const chat = chatHistory[chatId];
        return chat || null;
    }

    /**
     * Gets all chats
     * @returns {Promise<Object>} All chat objects
     */
    async getAllChats() {
        if (localStorage.getItem('isLoggedIn') === true) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/chats`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.authService.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error fetching all chats from API:', error);
                // Fall back to local storage
            }
        }
        
        // Get from local storage if not authenticated or API call fails
        return this.getLocalChatHistory();
    }

    /**
     * Gets all chats sorted by timestamp (newest first)
     * @returns {Promise<Array>} Sorted array of chat objects
     */
    async getAllChatsSorted() {
        if (localStorage.getItem('isLoggedIn') === true) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/chats/sorted`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.authService.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error fetching sorted chats from API:', error);
                // Fall back to local sorting
            }
        }
        
        // Sort locally if not authenticated or API call fails
        return this.getLocalChatsSorted();
    }

    /**
     * Gets all chats from local storage sorted by timestamp (newest first)
     * @returns {Array} Sorted array of chat objects
     */
    getLocalChatsSorted() {
        const chatHistory = this.getLocalChatHistory();
        
        // Convert to array and sort by timestamp
        return Object.values(chatHistory)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Saves a chat
     * @param {string} chatId - The ID of the chat
     * @param {string} title - The title of the chat
     * @param {Array} messages - Array of message objects
     * @returns {Promise<Object>} The saved chat object
     */
    async saveChat(chatId, title, messages) {
        const chatData = {
            id: chatId,
            title: title,
            messages: messages,
            timestamp: Date.now()
        };
        
        if (localStorage.getItem('isLoggedIn') === true) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/chats`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authService.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(chatData)
                });
                
                if (response.ok) {
                    // Notify other components about the change
                    document.dispatchEvent(new CustomEvent('chatHistoryChanged'));
                    return await response.json();
                }
            } catch (error) {
                console.error('Error saving chat to API:', error);
                // Fall back to local storage
            }
        }
        
        // Save to local storage if not authenticated or API call fails
        return this.saveLocalChat(chatId, chatData);
    }

    /**
     * Saves a chat to local storage
     * @param {string} chatId - The ID of the chat
     * @param {Object} chatData - The chat data to save
     * @returns {Object} The saved chat object
     */
    saveLocalChat(chatId, chatData) {
        const chatHistory = this.getLocalChatHistory();
        chatHistory[chatId] = chatData;
        this.saveLocalChatHistory(chatHistory);
        
        // Notify other components about the change
        document.dispatchEvent(new CustomEvent('chatHistoryChanged'));
        
        return chatData;
    }

    /**
     * Deletes a chat
     * @param {string} chatId - The ID of the chat to delete
     * @returns {Promise<boolean>} Whether the deletion was successful
     */
    async deleteChat(chatId) {
        if (localStorage.getItem('isLoggedIn') === true) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/chats/${chatId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.authService.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Notify other components about the change
                    document.dispatchEvent(new CustomEvent('chatHistoryChanged'));
                    return true;
                }
            } catch (error) {
                console.error('Error deleting chat from API:', error);
                // Fall back to local storage
            }
        }
        
        // Delete from local storage if not authenticated or API call fails
        return this.deleteLocalChat(chatId);
    }

    /**
     * Deletes a chat from local storage
     * @param {string} chatId - The ID of the chat to delete
     * @returns {boolean} Whether the deletion was successful
     */
    deleteLocalChat(chatId) {
        const chatHistory = this.getLocalChatHistory();
        
        if (chatId in chatHistory) {
            delete chatHistory[chatId];
            this.saveLocalChatHistory(chatHistory);
            
            // Notify other components about the change
            document.dispatchEvent(new CustomEvent('chatHistoryChanged'));
            
            return true;
        }
        
        return false;
    }

    /**
     * Clears all chats
     * @returns {Promise<boolean>} Whether the deletion was successful
     */
    async clearAllChats() {
        if (localStorage.getItem('isLoggedIn') === true) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/chats`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.authService.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Notify other components about the change
                    document.dispatchEvent(new CustomEvent('chatHistoryChanged'));
                    return true;
                }
            } catch (error) {
                console.error('Error clearing all chats from API:', error);
                // Fall back to local storage
            }
        }
        
        // Clear local storage if not authenticated or API call fails
        return this.clearLocalChats();
    }

    /**
     * Clears all chats from local storage
     * @returns {boolean} Whether the deletion was successful
     */
    clearLocalChats() {
        this.saveLocalChatHistory({});
        
        // Notify other components about the change
        document.dispatchEvent(new CustomEvent('chatHistoryChanged'));
        
        return true;
    }

    /**
     * Gets the chat history from local storage
     * @returns {Object} The chat history object
     */
    getLocalChatHistory() {
        try {
            const chatHistoryString = localStorage.getItem(this.localStorageKey);
            return chatHistoryString ? JSON.parse(chatHistoryString) : {};
        } catch (error) {
            console.error('Error parsing chat history from local storage:', error);
            return {};
        }
    }

    /**
     * Saves the chat history to local storage
     * @param {Object} chatHistory - The chat history object to save
     */
    saveLocalChatHistory(chatHistory) {
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(chatHistory));
        } catch (error) {
            console.error('Error saving chat history to local storage:', error);
            
            // If the error is due to storage limits, try to remove the oldest chats
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                this.applyLocalStorageLimit();
            }
        }
    }

    /**
     * Applies a storage limit to local storage to prevent quota exceeded errors
     * Default: Keep only the 10 most recent chats
     */
    applyLocalStorageLimit(limit = 10) {
        try {
            const chatHistory = this.getLocalChatHistory();
            const sortedChats = Object.entries(chatHistory)
                .sort(([, a], [, b]) => b.timestamp - a.timestamp);
            
            if (sortedChats.length <= limit) {
                return; // No need to delete anything
            }
            
            // Keep only the most recent chats up to the limit
            const limitedChatHistory = {};
            sortedChats.slice(0, limit).forEach(([id, chat]) => {
                limitedChatHistory[id] = chat;
            });
            
            // Save the reduced history
            localStorage.setItem(this.localStorageKey, JSON.stringify(limitedChatHistory));
            console.log(`Applied storage limit: kept ${limit} most recent chats`);
        } catch (error) {
            console.error('Error applying storage limit:', error);
            
            // If all else fails, clear everything
            localStorage.removeItem(this.localStorageKey);
        }
    }

    /**
     * Checks if there are any saved chats
     * @returns {Promise<boolean>} Whether there are any saved chats
     */
    async hasChats() {
        const chats = await this.getAllChatsSorted();
        return chats && chats.length > 0;
    }
}