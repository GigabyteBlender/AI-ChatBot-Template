import { config } from './config.js';
import { ApiService } from './services/apiService.js';
import { ChatHistoryService } from './services/chatHistoryService.js';
import { UIService } from './services/uiService.js';

/**
 * ChatApp class for managing the chat application state and coordination
 */
class ChatApp {
    constructor() {
        // Initialize services
        this.apiService = new ApiService(config.OPENROUTER_API_KEY);
        this.chatHistoryService = new ChatHistoryService();
        this.uiService = new UIService(this.chatHistoryService);
        
        // Chat state
        this.currentChatId = null;
        this.currentChatMessages = [];
        this.isProcessing = false;
        this.messageQueue = [];
    }
    
    /**
     * Initializes the chat application.
     */
    init() {
        // Set up DOM elements
        this.userInput = document.getElementById('userInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.modeSelect = document.getElementById('mode');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.newChatBtn = document.querySelector('.new-chat');
        
        // Load saved settings
        this.loadSettings();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize sidebar
        this.uiService.initSidebar(this.currentChatId);
        
        // Load initial chat
        this.loadInitialChat().catch(err => {
            console.error("Failed to load initial chat:", err);
            this.startNewChat();
        });
    }
    
    /**
     * Loads saved user settings
     */
    loadSettings() {
        const savedMode = localStorage.getItem('mode') || 'api';
        this.modeSelect.value = savedMode;
        this.temperature = parseFloat(localStorage.getItem('temperature') || '1.0');
        
        // Apply font size to chat messages if needed
        const fontSize = localStorage.getItem('fontSize');
        if (fontSize) {
            document.documentElement.style.setProperty('--message-font-size', `${fontSize}px`);
        }
    }
    
    /**
     * Sets up all event listeners
     */
    setupEventListeners() {
        // Submit button
        this.submitBtn.addEventListener('click', () => this.handleSubmit());
        
        // Enter key in input field
        this.userInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.handleSubmit();
            }
        });
        
        // Settings button
        this.settingsBtn.addEventListener('click', () => {
            window.location.href = 'settings.html';
        });
        
        // Mode selection
        this.modeSelect.addEventListener('change', (event) => {
            localStorage.setItem('mode', event.target.value);
        });
        
        // Clear button
        this.clearBtn.addEventListener('click', () => {
            this.uiService.clearCurrentChat();
        });
        
        // New chat button
        this.newChatBtn.addEventListener('click', () => {
            this.startNewChat();
        });
        
        // Custom event for loading chat
        document.addEventListener('loadChat', (event) => {
            const chatId = event.detail;
            this.loadChat(chatId);
        });
        
        // Custom event for chat history changes
        document.addEventListener('chatHistoryChanged', () => {
            this.uiService.updateChatHistorySidebar(this.currentChatId);
        });
        
        // Window beforeunload - prevent accidental closing during processing
        window.addEventListener('beforeunload', (event) => {
            if (this.isProcessing) {
                event.preventDefault();
                return event.returnValue = 'Changes you made may not be saved.';
            }
        });
    }
    
    /**
     * Loads the initial chat from history or starts a new one
     */
    async loadInitialChat() {
        try {
            const chatHistory = await this.chatHistoryService.getAllChatsSorted();
            if (chatHistory && chatHistory.length > 0) {
                // Load the most recent chat
                this.loadChat(chatHistory[0].id);
            } else {
                // Start a new chat
                this.startNewChat();
            }
        } catch (error) {
            console.error("Error loading initial chat:", error);
            // Start a new chat as fallback
            this.startNewChat();
        }
    }
    
    /**
     * Handles form submission and gets AI response
     */
    async handleSubmit() {
        const userMessage = this.userInput.value.trim();
        if (!userMessage || this.isProcessing) return;
        
        // Add to queue if currently processing
        if (this.isProcessing) {
            this.messageQueue.push(userMessage);
            // Show queued indicator
            this.showStatusMessage('Message queued');
            return;
        }
        
        // Ensure we have a chat ID for this conversation
        if (!this.currentChatId) {
            this.startNewChat();
        }
        
        try {
            this.isProcessing = true;
            this.userInput.value = '';
            
            // Update UI to show processing state
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('processing');
            
            // Add user message to chat
            await this.uiService.addMessage(userMessage, 'user', this.currentChatMessages, this.currentChatId);
            
            // Get response based on selected mode
            const mode = this.modeSelect.value;
            let botResponse;
            
            try {
                if (mode === 'api') {
                    // Create context for API request
                    const context = this.createContextForRequest(userMessage);
                    botResponse = await this.apiService.getCompletion(context, this.temperature);
                } else if (mode === 'random') {
                    botResponse = this.apiService.getRandomResponse();
                } else {
                    botResponse = "Please select a valid mode.";
                }
            } catch (error) {
                console.error('Error getting response:', error);
                
                // Handle different types of errors
                if (error.name === 'AbortError') {
                    botResponse = "Request was cancelled. Please try again.";
                } else if (error.message.includes('network')) {
                    botResponse = "Network error. Please check your connection and try again.";
                } else if (error.status === 429) {
                    botResponse = "Rate limit exceeded. Please wait a moment before trying again.";
                } else {
                    botResponse = "Sorry, I encountered an error. Please try again.";
                }
            }
            
            // Add bot response to chat
            await this.uiService.addMessage(botResponse, 'bot', this.currentChatMessages, this.currentChatId);
        } finally {
            // Reset UI state
            this.isProcessing = false;
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('processing');
            
            // Process next message in queue if any
            this.processNextInQueue();
        }
    }
    
    /**
     * Creates a context object for the API request
     * @param {string} userMessage - The current user message
     * @returns {object} - The context object
     */
    createContextForRequest(userMessage) {
        // Create a simplified context for the API
        // Could include recent message history for better continuity
        const recentMessages = (this.currentChatMessages || [])
            .slice(-5) // Last 5 messages for context
            .map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));
            
        return {
            messages: recentMessages,
            currentMessage: userMessage
        };
    }
    
    /**
     * Processes the next message in the queue if any
     */
    processNextInQueue() {
        if (this.messageQueue.length > 0 && !this.isProcessing) {
            const nextMessage = this.messageQueue.shift();
            this.userInput.value = nextMessage;
            this.handleSubmit();
        }
    }
    
    /**
     * Shows a temporary status message
     * @param {string} message - The status message to show
     */
    showStatusMessage(message) {
        const statusElement = document.createElement('div');
        statusElement.classList.add('status-message');
        statusElement.textContent = message;
        
        document.body.appendChild(statusElement);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            statusElement.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(statusElement);
            }, 500);
        }, 2500);
    }
    
    /**
     * Loads a chat from history
     * @param {string} chatId - The ID of the chat to load
     */
    async loadChat(chatId) {
        if (this.isProcessing) {
            this.showStatusMessage('Please wait until current processing is complete');
            return;
        }
        
        try {
            const chatData = await this.uiService.loadChat(chatId);
            if (chatData) {
                this.currentChatId = chatData.currentChatId;
                this.currentChatMessages = chatData.currentChatMessages;
            }
        } catch (error) {
            console.error("Error loading chat:", error);
            this.showStatusMessage('Failed to load chat');
        }
    }
    
    /**
     * Starts a new chat
     */
    startNewChat() {
        if (this.isProcessing) {
            this.showStatusMessage('Please wait until current processing is complete');
            return;
        }
        
        const chatData = this.uiService.startNewChat();
        this.currentChatId = chatData.currentChatId;
        this.currentChatMessages = chatData.currentChatMessages;
        
        // Clear input field
        if (this.userInput) {
            this.userInput.value = '';
            this.userInput.focus();
        }
    }
}

// Initialize the app when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatApp = new ChatApp();
    chatApp.init();
});