import { config } from './config.js';
import { ApiService } from './services/apiService.js';
import { UiService } from './services/uiService.js';
import { ThemeManager } from './services/themeManager.js';
import { ChatHistoryService } from './services/chatHistoryService.js';

// Initialize services
const apiService = new ApiService(config.OPENROUTER_API_KEY);
const uiService = new UiService();
const themeManager = new ThemeManager();
const chatHistoryService = new ChatHistoryService();

// Keep track of current chat
let currentChatId = null;
let currentChatMessages = [];

/**
 * Sanitizes a string to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} The sanitized string
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Adds a message to the chat container with the appropriate styling and typing animation.
 * @async
 * @function addMessage
 * @param {string} content - The message content.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 */
async function addMessage(content, sender) {
    const chatContainer = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    // Sanitize the content to prevent XSS attacks
    const sanitizedContent = sanitizeHTML(content);
    
    // Create a span to hold the animated text
    const textSpan = document.createElement('span');
    messageDiv.appendChild(textSpan);

    chatContainer.appendChild(messageDiv);
    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;
    // Apply dark mode class if necessary
    if (document.body.classList.contains('dark-mode')) {
        messageDiv.classList.add('dark-mode');
    }

    // Function to simulate typing animation
    async function typeWriter(text, element) {
        return new Promise((resolve) => {
            let i = 0;
            function type() {
                const delay = parseInt(localStorage.getItem('speed') || '20', 10);

                if (i < text.length) {
                    // Use a text node instead of textContent to prevent HTML parsing
                    if (i === 0) {
                        element.textContent = '';
                    }
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, delay);
                } else {
                    resolve(); // Resolve the promise when typing is complete
                }
            }
            type();
        });
    }

    // If the sender is the bot, start the typing animation
    if (sender === 'bot') {
        await typeWriter(sanitizedContent, textSpan);
    } else {
        textSpan.textContent = sanitizedContent; // Directly set the user's message
    }
    
    // Add to current chat messages
    currentChatMessages.push({
        content: content,
        sender: sender,
        timestamp: Date.now()
    });
    
    // Save the updated chat
    if (currentChatId) {
        const title = getChatTitle(currentChatMessages);
        chatHistoryService.saveChat(currentChatId, title, currentChatMessages);
    }
}

/**
 * Generate a title for the chat based on the first user message
 * @param {Array} messages - Array of message objects
 * @returns {string} A title for the chat
 */
function getChatTitle(messages) {
    if (!messages || messages.length === 0) {
        return "New Chat";
    }
    
    // Find the first user message
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    if (firstUserMessage) {
        // Create a short title from the first message
        return firstUserMessage.content.length > 20 
            ? firstUserMessage.content.substring(0, 17) + '...'
            : firstUserMessage.content;
    }
    
    return "New Chat";
}

/**
 * Handles the submission of user input, retrieves the bot's response, and updates the chat interface.
 * @async
 * @function handleSubmit
 */
async function handleSubmit() {
    const userInput = document.getElementById('userInput');
    const userMessage = userInput.value.trim();
    const submitBtn = document.getElementById('submitBtn');

    if (!userMessage) return;

    // Ensure we have a chat ID for this conversation
    if (!currentChatId) {
        startNewChat();
    }

    // Add user message to chat
    await addMessage(userMessage, 'user');
    userInput.value = '';

    // Disable the submit button
    submitBtn.disabled = true;

    // Get response based on selected mode
    const mode = document.getElementById('mode').value;
    const temperature = parseFloat(localStorage.getItem('temperature') || '1.0');
    let botResponse;

    try {
        if (mode === 'api') {
            botResponse = await apiService.getCompletion(userMessage, temperature);
        } else if (mode === 'random') {
            botResponse = apiService.getRandomResponse();
        } else {
            botResponse = "Please select a valid mode.";
        }
    } catch (error) {
        console.error('Error getting response:', error);
        botResponse = "Sorry, I encountered an error. Please try again.";
    }

    // Add bot response to chat
    await addMessage(botResponse, 'bot');

    // Re-enable the submit button
    submitBtn.disabled = false;
}

/**
 * Starts a new chat conversation
 */
function startNewChat() {
    // Clear the chat interface
    document.getElementById('chat-container').innerHTML = `
        <div class="message bot">
            <span>Hello! How can I help you today?</span>
        </div>
    `;
    
    // Reset current chat
    currentChatId = chatHistoryService.generateChatId();
    currentChatMessages = [
        {
            content: "Hello! How can I help you today?",
            sender: "bot",
            timestamp: Date.now()
        }
    ];
    
    // Save the new chat
    chatHistoryService.saveChat(currentChatId, "New Chat", currentChatMessages);
    
    // Update the sidebar
    updateChatHistorySidebar();
}

/**
 * Loads a chat from history
 * @param {string} chatId - The ID of the chat to load
 */
function loadChat(chatId) {
    const chat = chatHistoryService.getChat(chatId);
    if (!chat) return;
    
    // Set as current chat
    currentChatId = chatId;
    currentChatMessages = chat.messages;
    
    // Clear the chat container
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
    
    // Add each message to the chat interface
    chat.messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', msg.sender);
        
        // Apply dark mode class if necessary
        if (document.body.classList.contains('dark-mode')) {
            messageDiv.classList.add('dark-mode');
        }
        
        const textSpan = document.createElement('span');
        textSpan.textContent = msg.content;
        messageDiv.appendChild(textSpan);
        
        chatContainer.appendChild(messageDiv);
    });
    
    // Scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Update sidebar to highlight this chat
    updateChatHistorySidebar();
}

/**
 * Updates the chat history sidebar with the latest chats
 */
function updateChatHistorySidebar() {
    const historyList = document.getElementById('chat-history-list');
    historyList.innerHTML = '';
    
    const chats = chatHistoryService.getAllChatsSorted();
    
    if (chats.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = "No chat history";
        emptyItem.classList.add('empty-history');
        historyList.appendChild(emptyItem);
        return;
    }
    
    chats.forEach(chat => {
        const listItem = document.createElement('li');
        listItem.textContent = chat.title;
        listItem.setAttribute('data-chat-id', chat.id);
        
        // Highlight the current chat
        if (chat.id === currentChatId) {
            listItem.classList.add('active-chat');
        }
        
        // Apply dark mode if necessary
        if (document.body.classList.contains('dark-mode')) {
            listItem.classList.add('dark-mode');
        }
        
        listItem.addEventListener('click', () => {
            loadChat(chat.id);
        });
        
        historyList.appendChild(listItem);
    });
}

/**
 * Initializes sidebar
 */
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const chatWrapper = document.getElementById('chat-wrapper');
    
    // Simple toggle function that uses a new class name
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show-sidebar');
        chatWrapper.classList.toggle('sidebar-expanded');
        
        // Store sidebar state for persistence
        const isSidebarVisible = sidebar.classList.contains('show-sidebar');
        localStorage.setItem('sidebarVisible', isSidebarVisible);
        
        // Update toggle button position
        if (isSidebarVisible) {
            sidebarToggle.style.left = `${parseInt(getComputedStyle(sidebar).width) + 20}px`;
        } else {
            sidebarToggle.style.left = '20px';
        }
    });
    
    // Restore sidebar state on page load
    const savedSidebarState = localStorage.getItem('sidebarVisible') === 'true';
    if (savedSidebarState) {
        sidebar.classList.add('show-sidebar');
        chatWrapper.classList.add('sidebar-expanded');
        sidebarToggle.style.left = `${parseInt(getComputedStyle(sidebar).width) + 20}px`;
    }
    
    // Initialize chat history in sidebar
    updateChatHistorySidebar();
    
    // Set up listener for history changes
    document.addEventListener('chatHistoryChanged', updateChatHistorySidebar);
    
    // Set up new chat button
    const newChatBtn = document.querySelector('.new-chat');
    newChatBtn.addEventListener('click', startNewChat);
}

/**
 * Initializes the chat application.
 */
function initApp() {
    // Initialize theme
    themeManager.initTheme();
    
    // Load saved mode
    const savedMode = localStorage.getItem('mode') || 'api';
    document.getElementById('mode').value = savedMode;
    
    // Set up event listeners
    document.getElementById('submitBtn').addEventListener('click', handleSubmit);
    
    document.getElementById('userInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    });
    
    document.getElementById('settingsBtn').addEventListener('click', () => {
        window.location.href = 'settings.html';
    });
    
    document.getElementById('mode').addEventListener('change', (event) => {
        localStorage.setItem('mode', event.target.value);
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        startNewChat();
    });
    
    // Initialize sidebar
    initSidebar();
    
    // Start a new chat session or load the last chat
    const chatHistory = chatHistoryService.getAllChatsSorted();
    if (chatHistory.length > 0) {
        // Load the most recent chat
        loadChat(chatHistory[0].id);
    } else {
        // Start a new chat
        startNewChat();
    }
}

// Initialize the app when DOM content is loaded
document.addEventListener('DOMContentLoaded', initApp);