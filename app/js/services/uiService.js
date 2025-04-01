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
        
        // Ensure we have a valid messages array
        if (!currentChatMessages) {
            currentChatMessages = [];
            console.warn("currentChatMessages was undefined, creating new array");
        }
        
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
        this.currentChatMessages.push({
            content: content,
            sender: sender,
            timestamp: Date.now()
        });
        
        // Save the updated chat
        if (currentChatId) {
            const title = this.getChatTitle(this.currentChatMessages);
            await this.chatHistoryService.saveChat(currentChatId, title, this.currentChatMessages);
        }
        
        // Return the current messages array in case the caller needs it
        return this.currentChatMessages;
    }

    /**
     * Clears the current chat messages but keeps the same chat ID
     */
    async clearCurrentChat() {
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
            try {
                // Get the current chat from storage
                const chat = await this.chatHistoryService.getChat(this.currentChatId);
                if (chat) {
                    // Keep the existing title
                    const title = chat.title || "Cleared Chat";
                    
                    // Save the cleared state to storage
                    await this.chatHistoryService.saveChat(
                        this.currentChatId, 
                        title, 
                        clearedMessages
                    );
                    
                    // Force update the sidebar to reflect changes
                    await this.updateChatHistorySidebar(this.currentChatId);
                }
            } catch (error) {
                console.error("Error clearing chat:", error);
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
     * @returns {Promise<Object>} - The loaded chat data including messages and updated currentChatId
     */
    async loadChat(chatId) {
        try {
            const chat = await this.chatHistoryService.getChat(chatId);
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
            await this.updateChatHistorySidebar(chatId);
            
            // Update internal state references
            this.currentChatId = chatId;
            this.currentChatMessages = chat.messages;
            
            return {
                currentChatId: chatId,
                currentChatMessages: chat.messages
            };
        } catch (error) {
            console.error("Error loading chat:", error);
            return null;
        }
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
     * @returns {Promise<Object>} - The new chat data including ID and initial messages
     */
    async startNewChat() {
        // Clear the chat interface
        document.getElementById('chat-container').innerHTML = `
            <div class="message bot">
                <div class="message-content">Hello! How can I help you today?</div>
            </div>
        `;
        
        try {
            // Generate new chat data
            const chatId = await this.chatHistoryService.generateChatId();
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
            await this.chatHistoryService.saveChat(chatId, "New Chat", chatMessages);
            
            // Update the sidebar
            await this.updateChatHistorySidebar(chatId);
            
            return {
                currentChatId: chatId,
                currentChatMessages: chatMessages
            };
        } catch (error) {
            console.error("Error starting new chat:", error);
            // Use a fallback local ID in case of error
            const fallbackId = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2);
            return {
                currentChatId: fallbackId,
                currentChatMessages: [{
                    content: "Hello! How can I help you today?",
                    sender: "bot",
                    timestamp: Date.now()
                }]
            };
        }
    }

    /**
     * Updates the chat history sidebar
     * @param {string} currentChatId - The ID of the current active chat
     */
    async updateChatHistorySidebar(currentChatId) {
        const historyList = document.getElementById('chat-history-list');
        historyList.innerHTML = '';
        
        try {
            const chats = await this.chatHistoryService.getAllChatsSorted();
            
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
        } catch (error) {
            console.error("Error updating chat history sidebar:", error);
            const emptyItem = document.createElement('li');
            emptyItem.textContent = "Error loading chat history";
            emptyItem.classList.add('empty-history', 'error');
            historyList.appendChild(emptyItem);
        }
    }

    /**
     * Deletes a chat from history
     * @param {string} chatId - The ID of the chat to delete
     * @param {string} currentChatId - The current active chat ID
     * @returns {Promise<boolean>} - Whether a new chat needs to be started
     */
    async deleteChat(chatId, currentChatId) {
        try {
            // Delete the chat from storage
            await this.chatHistoryService.deleteChat(chatId);
            
            // If the deleted chat was the current chat, start a new one
            const needNewChat = chatId === currentChatId;
            
            // Update the sidebar
            await this.updateChatHistorySidebar(currentChatId);
            
            return needNewChat;
        } catch (error) {
            console.error("Error deleting chat:", error);
            return false;
        }
    }

    /**
     * Initializes the sidebar
     * @param {string} currentChatId - The current active chat ID
     */
    async initSidebar(currentChatId) {
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
        await this.updateChatHistorySidebar(currentChatId);
    }
}