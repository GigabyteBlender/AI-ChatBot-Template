import { markdownToHTML, attachCodeCopyListeners } from './markdownService.js';

export class UIService {
    constructor(chatHistoryService) {
        this.chatHistoryService = chatHistoryService;
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

            // Get current state
            const isSidebarHidden = body.classList.contains('sidebar-hidden');
            
            // Add transition class
            sidebarToggle.style.transition = "transform 0.5s ease, left 0.5s ease, right 0.5s ease";
            
            // If we're on mobile, add a sliding animation
            if (window.innerWidth <= 768) {
                if (isSidebarHidden) {
                    // Sidebar will become visible, slide button to right
                    sidebarToggle.style.transform = "translateX(100vw)";
                } else {
                    // Sidebar will be hidden, slide button to left
                    sidebarToggle.style.transform = "translateX(-100vw)";
                }
                
                // After a small delay, toggle the sidebar and reset the button
                setTimeout(() => {
                    body.classList.toggle('sidebar-hidden');
                    sidebarToggle.style.transform = "";
                }, 250);
                
            } else {
                // On desktop, just toggle normally
                body.classList.toggle('sidebar-hidden');
            }
            
            // Store sidebar state for persistence
            const isHidden = sidebar.classList.contains('hidden-sidebar');
            localStorage.setItem('sidebarHidden', isHidden);
        });
        
        // Initialize chat history in sidebar
        this.updateChatHistorySidebar(currentChatId);
    }
}