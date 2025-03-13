export class ChatHistoryService {
    constructor() {
        this.storageKey = 'chat_history';
    }

    /**
     * Save a new chat to history
     * @param {string} id - Unique ID for the chat
     * @param {string} title - Title for the chat
     * @param {Array} messages - Array of message objects
     */
    saveChat(id, title, messages) {
        const history = this.getAllChats();
        
        // Create a timestamp for sorting
        const timestamp = Date.now();
        
        // Create or update chat entry
        history[id] = {
            id,
            title,
            messages,
            timestamp,
            preview: this.generatePreview(messages)
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(history));
        
        // Notify any listeners that history has changed
        this.dispatchHistoryChangeEvent();
        
        return history[id];
    }
    
    /**
     * Get all saved chats
     * @returns {Object} Object with chat IDs as keys
     */
    getAllChats() {
        const historyStr = localStorage.getItem(this.storageKey);
        return historyStr ? JSON.parse(historyStr) : {};
    }
    
    /**
     * Get all chats as an array, sorted by timestamp
     * @returns {Array} Array of chat objects
     */
    getAllChatsSorted() {
        const history = this.getAllChats();
        return Object.values(history).sort((a, b) => b.timestamp - a.timestamp);
    }
    
    /**
     * Get a specific chat by ID
     * @param {string} id - The chat ID
     * @returns {Object|null} The chat object or null if not found
     */
    getChat(id) {
        const history = this.getAllChats();
        return history[id] || null;
    }
    
    /**
     * Delete a chat from history
     * @param {string} id - The chat ID to delete
     */
    deleteChat(id) {
        const history = this.getAllChats();
        if (history[id]) {
            delete history[id];
            localStorage.setItem(this.storageKey, JSON.stringify(history));
            this.dispatchHistoryChangeEvent();
        }
    }
    
    /**
     * Clear all chat history
     */
    clearAllChats() {
        localStorage.removeItem(this.storageKey);
        this.dispatchHistoryChangeEvent();
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
     * @returns {string} A unique chat ID
     */
    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }
    
    /**
     * Dispatch a custom event to notify the UI that chat history has changed
     */
    dispatchHistoryChangeEvent() {
        const event = new CustomEvent('chatHistoryChanged');
        document.dispatchEvent(event);
    }
}