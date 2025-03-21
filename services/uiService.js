import { markdownToHTML, attachCodeCopyListeners } from './markdownService.js';

export class UIService {
    constructor(chatHistoryService) {
        this.chatHistoryService = chatHistoryService;
        // Add reference to track current chat state
        this.currentChatId = null;
        this.currentChatMessages = [];
    }

    /**
     * Scrolls the chat container to the bottom
     * @param {boolean} smooth - Whether to use smooth scrolling animation
     */
    scrollToBottom(smooth = true) {
        const chatContainer = document.getElementById('chat-container');
        
        // Use smooth scrolling if specified, otherwise instant scroll
        if (smooth) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    /**
     * Adds a message to the chat container with the appropriate styling and ensures proper scrolling.
     * @async
     * @function addMessage
     * @param {string} content - The message content.
     * @param {string} sender - The sender of the message ('user' or 'bot').
     * @param {Array} currentChatMessages - Reference to the current chat messages array
     * @param {string} currentChatId - The ID of the current chat
     */
    async addMessage(content, sender, currentChatMessages, currentChatId) {
        const chatContainer = document.getElementById('chat-container');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        // Create a container for the message content
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('message-content');
        messageDiv.appendChild(contentContainer);

        chatContainer.appendChild(messageDiv);
        
        // Store references to current chat state
        this.currentChatId = currentChatId;
        this.currentChatMessages = currentChatMessages;
        
        // Initial scroll to bottom (might be incomplete with complex content)
        this.scrollToBottom();
        
        // If the sender is the bot, convert markdown to HTML
        if (sender === 'bot') {
            // Convert markdown to HTML
            const htmlContent = markdownToHTML(content);
            
            // Set the HTML content
            contentContainer.innerHTML = htmlContent;
            
            // Attach click event listeners to code copy buttons
            attachCodeCopyListeners();
            
            // Apply fade-in animation
            const pxContent = contentContainer.querySelector('.px-content');
            if (pxContent) {
                pxContent.style.opacity = '0';
                setTimeout(() => {
                    pxContent.style.opacity = '1';
                    pxContent.style.transition = 'opacity 0.3s ease-in-out';
                    
                    // Scroll again after content is fully rendered
                    this.scrollToBottom();
                }, 50);
            }
            
            // Final scroll after all content and images might have loaded
            setTimeout(() => {
                this.scrollToBottom(true);
            }, 100);
        } else {
            // For user messages, just display as plain text
            contentContainer.textContent = content;
            this.scrollToBottom(true);
        }
        
        // Add to current chat messages
        currentChatMessages.push({
            content: content,
            sender: sender,
            timestamp: Date.now()
        });
        
        // Save the updated chat
        if (currentChatId) {
            const title = this.getChatTitle(currentChatMessages);
            this.chatHistoryService.saveChat(currentChatId, title, currentChatMessages);
        }
    }

    /**
     * Clears the current chat messages but keeps the same chat ID
     */
    clearCurrentChat() {
        // Get reference to the chat container
        const chatContainer = document.getElementById('chat-container');
        
        // Clear the chat container
        chatContainer.innerHTML = `
            <div class="message bot">
                <div class="message-content">Chat cleared. How can I help you?</div>
            </div>
        `;
        
        // Reset the messages array with just the welcome message
        const clearedMessages = [
            {
                content: "Chat cleared. How can I help you?",
                sender: "bot",
                timestamp: Date.now()
            }
        ];
        
        // Update the internal messages array
        this.currentChatMessages = clearedMessages;
        
        // Make sure we update the chat in storage
        if (this.currentChatId) {
            // Get the current chat from storage
            const chat = this.chatHistoryService.getChat(this.currentChatId);
            if (chat) {
                // Keep the existing title
                const title = chat.title || "Cleared Chat";
                
                // Save the cleared state to storage
                this.chatHistoryService.saveChat(
                    this.currentChatId, 
                    title, 
                    clearedMessages
                );
                
                // Force update the sidebar to reflect changes
                this.updateChatHistorySidebar(this.currentChatId);
            }
        }
        
        // Focus the input field
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.value = '';
            userInput.focus();
        }
    }

    /**
     * Loads a chat from history
     * @param {string} chatId - The ID of the chat to load
     * @returns {Object} - The loaded chat data including messages and updated currentChatId
     */
    loadChat(chatId) {
        const chat = this.chatHistoryService.getChat(chatId);
        if (!chat) return null;
        
        // Clear the chat container
        const chatContainer = document.getElementById('chat-container');
        chatContainer.innerHTML = '';
        
        // Add each message to the chat interface
        chat.messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', msg.sender);
            
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
        
        // Attach click event listeners to code copy buttons
        attachCodeCopyListeners();
        
        // Ensure scroll to bottom after everything is loaded
        setTimeout(() => {
            this.scrollToBottom(true);
        }, 100);
        
        // Update sidebar to highlight this chat
        this.updateChatHistorySidebar(chatId);
        
        // Update internal state references
        this.currentChatId = chatId;
        this.currentChatMessages = chat.messages;
        
        return {
            currentChatId: chatId,
            currentChatMessages: chat.messages
        };
    }

    /**
     * Generates a title for the chat based on the first user message
     * @param {Array} messages - The chat messages
     * @returns {string} - The generated chat title
     */
    getChatTitle(messages) {
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
     * Sets up a new chat interface
     * @returns {Object} - The new chat data including ID and initial messages
     */
    startNewChat() {
        // Clear the chat interface
        document.getElementById('chat-container').innerHTML = `
            <div class="message bot">
                <div class="message-content">Hello! How can I help you today?</div>
            </div>
        `;
        
        // Generate new chat data
        const chatId = this.chatHistoryService.generateChatId();
        const chatMessages = [
            {
                content: "Hello! How can I help you today?",
                sender: "bot",
                timestamp: Date.now()
            }
        ];
        
        // Update internal state references
        this.currentChatId = chatId;
        this.currentChatMessages = chatMessages;
        
        // Save the new chat
        this.chatHistoryService.saveChat(chatId, "New Chat", chatMessages);
        
        // Update the sidebar
        this.updateChatHistorySidebar(chatId);
        
        return {
            currentChatId: chatId,
            currentChatMessages: chatMessages
        };
    }

    /**
     * Updates the chat history sidebar
     * @param {string} currentChatId - The ID of the current active chat
     */
    updateChatHistorySidebar(currentChatId) {
        const historyList = document.getElementById('chat-history-list');
        historyList.innerHTML = '';
        
        const chats = this.chatHistoryService.getAllChatsSorted();
        
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
                this.deleteChat(chat.id, currentChatId);
            });
            
            // Append delete button to list item
            listItem.appendChild(deleteBtn);
            
            // Highlight the current chat
            if (chat.id === currentChatId) {
                listItem.classList.add('active-chat');
            }
            
            listItem.addEventListener('click', () => {
                // We'll implement this in the main script to avoid circular references
                document.dispatchEvent(new CustomEvent('loadChat', { detail: chat.id }));
            });
            
            historyList.appendChild(listItem);
        });
    }

    /**
     * Deletes a chat from history
     * @param {string} chatId - The ID of the chat to delete
     * @param {string} currentChatId - The current active chat ID
     * @returns {boolean} - Whether a new chat needs to be started
     */
    deleteChat(chatId, currentChatId) {
        // Delete the chat from storage
        this.chatHistoryService.deleteChat(chatId);
        
        // If the deleted chat was the current chat, start a new one
        const needNewChat = chatId === currentChatId;
        
        // Update the sidebar
        this.updateChatHistorySidebar(currentChatId);
        
        return needNewChat;
    }

    /**
     * Initializes the sidebar
     * @param {string} currentChatId - The current active chat ID
     */
    initSidebar(currentChatId) {
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
        this.updateChatHistorySidebar(currentChatId);
    }
}