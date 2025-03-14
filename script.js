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
 * Converts markdown syntax to HTML with Perplexity-like styling
 * @param {string} markdown - The markdown string to convert
 * @returns {string} The resulting HTML
 */
function markdownToHTML(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Convert code blocks before anything else to prevent interference
    html = html.replace(/```(.*?)\n([\s\S]*?)```/g, function(match, language, code) {
        return `<div class="code-block">
                  <div class="code-header">
                    <span class="code-language">${language.trim() || 'code'}</span>
                  </div>
                  <pre><code class="language-${language.trim()}">${sanitizeHTML(code)}</code></pre>
                </div>`;
    });
    
    // Convert inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // Convert headers with Perplexity-style classes
    html = html.replace(/^# (.*$)/gm, '<h1 class="px-header px-h1">$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="px-header px-h2">$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="px-header px-h3">$1</h3>');
    html = html.replace(/^#### (.*$)/gm, '<h4 class="px-header px-h4">$1</h4>');
    html = html.replace(/^##### (.*$)/gm, '<h5 class="px-header px-h5">$1</h5>');
    html = html.replace(/^###### (.*$)/gm, '<h6 class="px-header px-h6">$1</h6>');
    
    // Convert bold and italic with Perplexity-style classes
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="px-bold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="px-italic">$1</em>');
    html = html.replace(/\_\_(.*?)\_\_/g, '<strong class="px-bold">$1</strong>');
    html = html.replace(/\_(.*?)\_/g, '<em class="px-italic">$1</em>');
    
    // Process unordered lists with Perplexity-style classes
    const listBlockRegex = /(?:^|\n)((?:[\-\*]\s+.*(?:\n|$))+)/g;
    html = html.replace(listBlockRegex, function(match, listBlock) {
        const listItems = listBlock.split('\n')
            .filter(line => line.trim().match(/^[\-\*]\s+/))
            .map(line => line.replace(/^[\-\*]\s+/, ''))
            .filter(item => item.trim())
            .map(item => `<li class="px-list-item">${item}</li>`)
            .join('');
        
        return `\n<ul class="px-list px-unordered-list">${listItems}</ul>\n`;
    });
    
    // Process ordered lists with Perplexity-style classes
    const orderedListBlockRegex = /(?:^|\n)((?:\d+\.\s+.*(?:\n|$))+)/g;
    html = html.replace(orderedListBlockRegex, function(match, listBlock) {
        const listItems = listBlock.split('\n')
            .filter(line => line.trim().match(/^\d+\.\s+/))
            .map(line => line.replace(/^\d+\.\s+/, ''))
            .filter(item => item.trim())
            .map(item => `<li class="px-list-item">${item}</li>`)
            .join('');
        
        return `\n<ol class="px-list px-ordered-list">${listItems}</ol>\n`;
    });
    
    // Convert links with Perplexity-style classes
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="px-link" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Handle blockquotes
    html = html.replace(/^>\s*(.*$)/gm, '<blockquote class="px-blockquote">$1</blockquote>');
    
    // Convert paragraphs (must be done after lists)
    html = html.replace(/(?:^|\n)([^<\n].*?)(?=\n|$)/g, function(match, p1) {
        // Skip if it's already an HTML tag or empty line
        if (p1.trim() === '' || p1.trim().match(/^<\/?[a-zA-Z]/)) return match;
        return `\n<p class="px-paragraph">${p1}</p>\n`;
    });
    
    // Clean up extra line breaks
    html = html.replace(/\n{2,}/g, '\n');
    
    // Clean up empty paragraphs
    html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
    
    // Wrap the entire content in a container
    html = `<div class="px-content">${html.trim()}</div>`;
    
    return html;
}

/**
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

    // Create a container for the message content
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('message-content');
    messageDiv.appendChild(contentContainer);

    chatContainer.appendChild(messageDiv);
    
    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Apply dark mode class if necessary
    if (document.documentElement.classList.contains('dark-theme')) {
        messageDiv.classList.add('dark-mode');
    }

    // If the sender is the bot, convert markdown to HTML
    if (sender === 'bot') {
        // Convert markdown to HTML
        const htmlContent = markdownToHTML(content);
        
        // Set the HTML content
        contentContainer.innerHTML = htmlContent;
        
        // Apply fade-in animation
        const pxContent = contentContainer.querySelector('.px-content');
        if (pxContent) {
            pxContent.style.opacity = '0';
            setTimeout(() => {
                pxContent.style.opacity = '1';
                pxContent.style.transition = 'opacity 0.3s ease-in-out';
            }, 50);
        }
    } else {
        // For user messages, just display as plain text
        contentContainer.textContent = content;
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
        
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('message-content');
        
        // Convert bot messages from markdown to HTML
        if (msg.sender === 'bot') {
            contentContainer.innerHTML = markdownToHTML(msg.content);
        } else {
            contentContainer.textContent = msg.content;
        }
        
        messageDiv.appendChild(contentContainer);
        chatContainer.appendChild(messageDiv);
    });
    
    // Scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Update sidebar to highlight this chat
    updateChatHistorySidebar();
}

// The rest of your code remains unchanged
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

function startNewChat() {
    // Clear the chat interface
    document.getElementById('chat-container').innerHTML = `
        <div class="message bot">
            <div class="message-content">Hello! How can I help you today?</div>
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
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('chat-delete-btn');
        deleteBtn.innerHTML = '×'; // × symbol for delete
        deleteBtn.setAttribute('aria-label', 'Delete chat');
        
        // Add event listener to delete button
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the click from bubbling up to the list item
            deleteChat(chat.id);
        });
        
        // Append delete button to list item
        listItem.appendChild(deleteBtn);
        
        // Highlight the current chat
        if (chat.id === currentChatId) {
            listItem.classList.add('active-chat');
        }
        
        // Apply dark mode if necessary
        if (document.body.classList.contains('dark-mode')) {
            listItem.classList.add('dark-mode');
            deleteBtn.classList.add('dark-mode');
        }
        
        listItem.addEventListener('click', () => {
            loadChat(chat.id);
        });
        
        historyList.appendChild(listItem);
    });
}

function deleteChat(chatId) {
    // Delete the chat from storage
    chatHistoryService.deleteChat(chatId);
    
    // If the deleted chat was the current chat, start a new one
    if (chatId === currentChatId) {
        startNewChat();
    }
    
    // Update the sidebar
    updateChatHistorySidebar();
}

function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const chatWrapper = document.getElementById('chat-wrapper');
    const body = document.body;
    
    // Check if sidebar was previously hidden
    const sidebarHidden = localStorage.getItem('sidebarHidden') === 'true';
    
    // Set initial state
    if (sidebarHidden) {
        sidebar.classList.add('hidden-sidebar');
        chatWrapper.classList.add('full-width');
        body.classList.add('sidebar-hidden');
    }
    
    // Toggle function
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hidden-sidebar');
        chatWrapper.classList.toggle('full-width');
        body.classList.toggle('sidebar-hidden');
        
        // Store sidebar state for persistence
        const isHidden = sidebar.classList.contains('hidden-sidebar');
        localStorage.setItem('sidebarHidden', isHidden);
    });
    
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
        navigateTo('settings.html');
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

function navigateTo(url) {
    const overlay = document.getElementById('page-transition-overlay');
    overlay.classList.add('active');
    
    setTimeout(() => {
        window.location.href = url;
    }, 300); // Match this delay to your CSS transition time
}

// Initialize the app when DOM content is loaded
document.addEventListener('DOMContentLoaded', initApp);