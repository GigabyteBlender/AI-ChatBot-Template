import { DatabaseUrl } from '../config.js';

export class ChatHistoryService {
    constructor() {
        this.apiBaseUrl = DatabaseUrl.API_URL
        this.token = localStorage.getItem('auth_token');
        this.maxStorageCount = 0;
        this.autoClearDays = 0;
        
        // Load settings from API if token exists
        if (this.token) {
            this.loadSettings();
        }
    }

    /**
     * Load user settings from the API
     */
    async loadSettings() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/settings`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const settings = await response.json();
                this.maxStorageCount = parseInt(settings.storageLimit) || 0;
                this.autoClearDays = parseInt(settings.autoClear) || 0;
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
    
    /**
     * Update user settings to the API
     * @param {Object} settings - Settings object with keys and values
     */
    async updateSettings(settings) {
        if (!this.token) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/settings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            
            if (response.ok) {
                // Update local settings
                if ('storageLimit' in settings) {
                    this.maxStorageCount = parseInt(settings.storageLimit) || 0;
                }
                if ('autoClear' in settings) {
                    this.autoClearDays = parseInt(settings.autoClear) || 0;
                }
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    }

    /**
     * Save a new chat to history
     * @param {string} id - Unique ID for the chat
     * @param {string} title - Title for the chat
     * @param {Array} messages - Array of message objects
     * @returns {Promise<Object>} - The saved chat object
     */
    async saveChat(id, title, messages) {
        if (!this.token) {
            // Fallback to localStorage if not logged in
            return this.saveChatToLocalStorage(id, title, messages);
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/chats`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id,
                    title,
                    messages
                })
            });
            
            if (response.ok) {
                const savedChat = await response.json();
                this.dispatchHistoryChangeEvent();
                return savedChat;
            } else {
                // Fallback to localStorage if API call fails
                return this.saveChatToLocalStorage(id, title, messages);
            }
        } catch (error) {
            console.error('Failed to save chat:', error);
            // Fallback to localStorage if API call fails
            return this.saveChatToLocalStorage(id, title, messages);
        }
    }
    
    /**
     * Fallback method to save chat to localStorage
     * @param {string} id - Unique ID for the chat
     * @param {string} title - Title for the chat
     * @param {Array} messages - Array of message objects
     * @returns {Object} - The saved chat object
     */
    saveChatToLocalStorage(id, title, messages) {
        const storageKey = 'chat_history';
        const historyStr = localStorage.getItem(storageKey);
        const history = historyStr ? JSON.parse(historyStr) : {};
        
        const timestamp = Date.now();
        
        history[id] = {
            id,
            title,
            messages,
            timestamp,
            preview: this.generatePreview(messages)
        };
        
        if (this.maxStorageCount > 0) {
            const chats = Object.values(history).sort((a, b) => b.timestamp - a.timestamp);
            
            if (chats.length > this.maxStorageCount) {
                const chatsToRemove = chats.slice(this.maxStorageCount);
                chatsToRemove.forEach(chat => {
                    delete history[chat.id];
                });
            }
        }
        
        localStorage.setItem(storageKey, JSON.stringify(history));
        this.dispatchHistoryChangeEvent();
        
        return history[id];
    }
    
    /**
     * Get all saved chats
     * @returns {Promise<Object>} Object with chat IDs as keys
     */
    async getAllChats() {
        if (!this.token) {
            // Fallback to localStorage if not logged in
            return this.getAllChatsFromLocalStorage();
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/chats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                // Fallback to localStorage if API call fails
                return this.getAllChatsFromLocalStorage();
            }
        } catch (error) {
            console.error('Failed to get chats:', error);
            // Fallback to localStorage if API call fails
            return this.getAllChatsFromLocalStorage();
        }
    }
    
    /**
     * Fallback method to get chats from localStorage
     * @returns {Object} Object with chat IDs as keys
     */
    getAllChatsFromLocalStorage() {
        const storageKey = 'chat_history';
        const historyStr = localStorage.getItem(storageKey);
        return historyStr ? JSON.parse(historyStr) : {};
    }
    
    /**
     * Get all chats as an array, sorted by timestamp
     * @returns {Promise<Array>} Array of chat objects
     */
    async getAllChatsSorted() {
        if (!this.token) {
            // Fallback to localStorage if not logged in
            const history = this.getAllChatsFromLocalStorage();
            return Object.values(history).sort((a, b) => b.timestamp - a.timestamp);
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/chats/sorted`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                // Fallback to localStorage if API call fails
                const history = this.getAllChatsFromLocalStorage();
                return Object.values(history).sort((a, b) => b.timestamp - a.timestamp);
            }
        } catch (error) {
            console.error('Failed to get sorted chats:', error);
            // Fallback to localStorage if API call fails
            const history = this.getAllChatsFromLocalStorage();
            return Object.values(history).sort((a, b) => b.timestamp - a.timestamp);
        }
    }
    
    /**
     * Get a specific chat by ID
     * @param {string} id - The chat ID
     * @returns {Promise<Object|null>} The chat object or null if not found
     */
    async getChat(id) {
        if (!this.token) {
            // Fallback to localStorage if not logged in
            const history = this.getAllChatsFromLocalStorage();
            return history[id] || null;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/chats/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                return await response.json();
            } else if (response.status === 404) {
                return null;
            } else {
                // Fallback to localStorage if API call fails
                const history = this.getAllChatsFromLocalStorage();
                return history[id] || null;
            }
        } catch (error) {
            console.error(`Failed to get chat ${id}:`, error);
            // Fallback to localStorage if API call fails
            const history = this.getAllChatsFromLocalStorage();
            return history[id] || null;
        }
    }
    
    /**
     * Delete a chat from history
     * @param {string} id - The chat ID to delete
     * @returns {Promise<boolean>} Whether deletion was successful
     */
    async deleteChat(id) {
        if (!this.token) {
            // Fallback to localStorage if not logged in
            return this.deleteChatFromLocalStorage(id);
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/chats/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                this.dispatchHistoryChangeEvent();
                return true;
            } else {
                // Fallback to localStorage if API call fails
                return this.deleteChatFromLocalStorage(id);
            }
        } catch (error) {
            console.error(`Failed to delete chat ${id}:`, error);
            // Fallback to localStorage if API call fails
            return this.deleteChatFromLocalStorage(id);
        }
    }
    
    /**
     * Fallback method to delete chat from localStorage
     * @param {string} id - The chat ID to delete
     * @returns {boolean} Whether deletion was successful
     */
    deleteChatFromLocalStorage(id) {
        const storageKey = 'chat_history';
        const historyStr = localStorage.getItem(storageKey);
        const history = historyStr ? JSON.parse(historyStr) : {};
        
        if (history[id]) {
            delete history[id];
            localStorage.setItem(storageKey, JSON.stringify(history));
            this.dispatchHistoryChangeEvent();
            return true;
        }
        
        return false;
    }
    
    /**
     * Clear all chat history
     * @returns {Promise<boolean>} Whether clearing was successful
     */
    async clearAllChats() {
        if (!this.token) {
            // Fallback to localStorage if not logged in
            localStorage.removeItem('chat_history');
            this.dispatchHistoryChangeEvent();
            return true;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/chats`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                this.dispatchHistoryChangeEvent();
                return true;
            } else {
                // Fallback to localStorage if API call fails
                localStorage.removeItem('chat_history');
                this.dispatchHistoryChangeEvent();
                return true;
            }
        } catch (error) {
            console.error('Failed to clear all chats:', error);
            // Fallback to localStorage if API call fails
            localStorage.removeItem('chat_history');
            this.dispatchHistoryChangeEvent();
            return true;
        }
    }
    
    /**
     * Generate a short preview from the messages
     * @param {Array} messages - Array of message objects
     * @returns {string} A short preview of the chat
     */
    generatePreview(messages) {
        if (!messages || messages.length === 0) {
            return "New chat";
        }
        
        // Find the first user message
        const firstUserMessage = messages.find(msg => msg.sender === 'user');
        if (firstUserMessage) {
            // Return max 30 characters of the first user message
            return firstUserMessage.content.length > 30 
                ? firstUserMessage.content.substring(0, 27) + '...'
                : firstUserMessage.content;
        }
        
        return "New chat";
    }
    
    /**
     * Generate a unique ID for a new chat
     * @returns {Promise<string>} A unique chat ID
     */
    async generateChatId() {
        if (!this.token) {
            // Fallback to local generation if not logged in
            return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/generate-chat-id`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.id;
            } else {
                // Fallback to local generation if API call fails
                return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
            }
        } catch (error) {
            console.error('Failed to generate chat ID:', error);
            // Fallback to local generation if API call fails
            return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        }
    }
    
    /**
     * Dispatch a custom event to notify the UI that chat history has changed
     */
    dispatchHistoryChangeEvent() {
        const event = new CustomEvent('chatHistoryChanged');
        document.dispatchEvent(event);
    }
    
    /**
     * Set the authentication token
     * @param {string} token - The JWT token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
        this.loadSettings();
    }
    
    /**
     * Clear the authentication token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }
}