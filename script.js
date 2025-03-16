import { config } from './config.js';
import { ApiService } from './services/apiService.js';
import { ChatHistoryService } from './services/chatHistoryService.js';

// Initialize services
const apiService = new ApiService(config.OPENROUTER_API_KEY);
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
 * Converts markdown syntax to HTML
 * @param {string} markdown - The markdown string to convert
 * @returns {string} The resulting HTML
 */
function markdownToHTML(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Preserve line breaks for processing
    html = html.replace(/\r\n/g, '\n');
    
    // Process code blocks FIRST, before any other markdown processing
    // This will convert them to HTML elements that won't be affected by subsequent processing
    html = html.replace(/```(.*?)\n([\s\S]*?)```/g, function(match, language, code) {
        // Trim trailing newlines from code
        code = code.replace(/\n+$/, '');
        
        // Sanitize the code - this prevents HTML injection but preserves the original formatting
        const sanitizedCode = sanitizeHTML(code);
        
        // Create the HTML structure for the code block immediately
        return `<div class="code-block">
                  <div class="code-header">
                    <span class="code-language">${language.trim() || 'code'}</span>
                    <div class="code-actions">
                      <button class="code-copy-btn" aria-label="Copy code">Copy</button>
                    </div>
                  </div>
                  <pre><code class="language-${language.trim() || 'plaintext'}">${sanitizedCode}</code></pre>
                </div>`;
    });
    
    // Now process the rest of the markdown, which will exclude the already-processed code blocks
    
    // Process tables
    html = processMarkdownTables(html);
    
    // Convert inline code (but not inside already converted code blocks)
    html = html.replace(/(`+)(?!<\/code>)(.*?)(?!\<code)((`+))/g, function(match, start, content) {
        if (start.length === 1) {
            return '<code class="inline-code">' + sanitizeHTML(content) + '</code>';
        }
        return match; // Return as is if not single backtick
    });
    
    // Convert headers with Perplexity-style classes
    html = html.replace(/^#{1,6}\s+(.*)$/gm, function(match) {
        const level = match.trim().indexOf(' ');
        const text = match.substring(level + 1).trim();
        return `<h${level} class="px-header px-h${level}">${text}</h${level}>`;
    });
    
    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="px-bold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="px-italic">$1</em>');
    html = html.replace(/\_\_(.*?)\_\_/g, '<strong class="px-bold">$1</strong>');
    html = html.replace(/\_(.*?)\_/g, '<em class="px-italic">$1</em>');
    
    // Process lists
    html = processUnorderedLists(html);
    html = processOrderedLists(html);
    
    // Convert horizontal rules
    html = html.replace(/^(\s*[-*_]){3,}\s*$/gm, '<hr class="px-hr">');
    
    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="px-link" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Handle blockquotes
    html = processBlockquotes(html);
    
    // Convert paragraphs
    html = processParagraphs(html);
    
    // Clean up extra line breaks
    html = html.replace(/\n{2,}/g, '\n');
    
    // Clean up empty paragraphs
    html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
    
    // Wrap the entire content in a container
    html = `<div class="px-content">${html.trim()}</div>`;
    
    return html;
}

/**
 * Process markdown tables
 * @param {string} html - The HTML content to process
 * @returns {string} Processed HTML with tables
 */
function processMarkdownTables(html) {
    // This regex finds markdown tables
    const tableRegex = /(\|[^\n]+\|\r?\n)((?:\|:?[-]+:?)+\|)(\n(?:\|[^\n]+\|\r?\n?)*)/g;
    
    return html.replace(tableRegex, function(match, headerRow, delimiterRow, bodyRows) {
        // Process header
        const headers = headerRow.trim().split('|').slice(1, -1).map(
            cell => `<th>${cell.trim()}</th>`
        ).join('');
        
        // Process alignment from delimiter row
        const alignments = delimiterRow.trim().split('|').slice(1, -1).map(delim => {
            if (delim.startsWith(':') && delim.endsWith(':')) return 'center';
            if (delim.endsWith(':')) return 'right';
            return 'left';
        });
        
        // Process body rows
        const rows = bodyRows.trim().split('\n').map(row => {
            const cells = row.trim().split('|').slice(1, -1);
            const cellsHtml = cells.map((cell, i) => {
                const align = alignments[i] ? `style="text-align:${alignments[i]}"` : '';
                return `<td ${align}>${cell.trim()}</td>`;
            }).join('');
            return `<tr>${cellsHtml}</tr>`;
        }).join('');
        
        return `<div class="table-wrapper"><table class="px-table">
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
        </table></div>`;
    });
}

/**
 * Process unordered lists
 * @param {string} html - The HTML content to process
 * @returns {string} Processed HTML with unordered lists
 */
function processUnorderedLists(html) {
    // Find unordered list blocks
    const listBlocks = html.match(/(?:^|\n)(?:[ \t]*[-*+][ \t]+.+\n?)+/g);
    
    if (!listBlocks) return html;
    
    listBlocks.forEach(block => {
        // Split into list items
        const items = block.match(/[ \t]*[-*+][ \t]+.+(?:\n|$)/g);
        
        if (!items) return;
        
        const listItems = items.map(item => {
            const content = item.replace(/^[ \t]*[-*+][ \t]+/, '').trim();
            return `<li class="px-list-item">${content}</li>`;
        }).join('');
        
        const listHtml = `<ul class="px-list px-unordered-list">${listItems}</ul>`;
        html = html.replace(block, listHtml);
    });
    
    return html;
}

/**
 * Process ordered lists
 * @param {string} html - The HTML content to process
 * @returns {string} Processed HTML with ordered lists
 */
function processOrderedLists(html) {
    // Find ordered list blocks
    const listBlocks = html.match(/(?:^|\n)(?:[ \t]*\d+\.[ \t]+.+\n?)+/g);
    
    if (!listBlocks) return html;
    
    listBlocks.forEach(block => {
        // Split into list items
        const items = block.match(/[ \t]*\d+\.[ \t]+.+(?:\n|$)/g);
        
        if (!items) return;
        
        const listItems = items.map(item => {
            const content = item.replace(/^[ \t]*\d+\.[ \t]+/, '').trim();
            return `<li class="px-list-item">${content}</li>`;
        }).join('');
        
        const listHtml = `<ol class="px-list px-ordered-list">${listItems}</ol>`;
        html = html.replace(block, listHtml);
    });
    
    return html;
}

/**
 * Process blockquotes
 * @param {string} html - The HTML content to process
 * @returns {string} Processed HTML with blockquotes
 */
function processBlockquotes(html) {
    // Find continuous blockquote lines
    const quoteRegex = /(?:^|\n)(?:&gt;|>)[ \t]?(.*?)(?=\n(?!(?:&gt;|>))|$)/gs;
    
    return html.replace(quoteRegex, function(match, content) {
        // Remove any trailing newlines
        content = content.replace(/\n$/, '');
        return `<blockquote class="px-blockquote">${content}</blockquote>`;
    });
}

/**
 * Process paragraphs
 * @param {string} html - The HTML content to process
 * @returns {string} Processed HTML with paragraphs
 */
function processParagraphs(html) {
    // Split content by double newlines (paragraph breaks)
    const paragraphs = html.split(/\n\n+/);
    
    return paragraphs.map(p => {
        // Skip if empty or already contains HTML tags
        if (!p.trim() || p.trim().match(/^<\/?[a-zA-Z]|^<blockquote|^<[uo]l|^<h[1-6]|^<hr|^<div class="code-block"|^<div class="table-wrapper"/)) {
            return p;
        }
        
        // Handle multi-line paragraphs (with single line breaks)
        const processedP = p.replace(/\n/g, '<br>');
        return `<p class="px-paragraph">${processedP}</p>`;
    }).join('\n\n');
}
/**
 * Attaches click event listeners to all code copy buttons in the chat
 */
function attachCodeCopyListeners() {
    // Find all copy buttons in the chat container
    const copyButtons = document.querySelectorAll('.code-copy-btn');
    
    // Add click event listener to each button
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find the closest code block
            const codeBlock = this.closest('.code-block');
            
            // Get the code content
            const codeElement = codeBlock.querySelector('code');
            
            // Get code text but remove any language headers or unnecessary elements
            let codeText = codeElement.textContent;
            
            // Remove potential header lines that start with common comment patterns
            // This regex identifies lines that look like headers or comments at the top of code
            codeText = codeText.replace(/^(\/\/.*|#.*|\s*\/\*.*\*\/\s*|<!-.*->)?\n?/, '');
            
            // Copy to clipboard
            navigator.clipboard.writeText(codeText)
                .then(() => {
                    // Show feedback that code was copied
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    
                    // Reset button text after a delay
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    // Show error feedback
                    this.textContent = 'Failed!';
                    setTimeout(() => {
                        this.textContent = 'Copy';
                    }, 2000);
                });
        });
    });
}

/**
 * Scrolls the chat container to the bottom
 * @param {boolean} smooth - Whether to use smooth scrolling animation
 */
function scrollToBottom(smooth = true) {
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
    
    // Initial scroll to bottom (might be incomplete with complex content)
    scrollToBottom();
    
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
                scrollToBottom();
            }, 50);
        }
        
        // Final scroll after all content and images might have loaded
        setTimeout(() => {
            scrollToBottom(true);
        }, 100);
    } else {
        // For user messages, just display as plain text
        contentContainer.textContent = content;
        scrollToBottom(true);
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
        scrollToBottom(true);
    }, 100);
    
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

        // Get current state
        const isSidebarHidden = document.body.classList.contains('sidebar-hidden');
        
        // Add transition class
        this.style.transition = "transform 0.5s ease, left 0.5s ease, right 0.5s ease";
        
        // If we're on mobile, add a sliding animation
        if (window.innerWidth <= 768) {
            if (isSidebarHidden) {
            // Sidebar will become visible, slide button to right
            this.style.transform = "translateX(100vw)";
            } else {
            // Sidebar will be hidden, slide button to left
            this.style.transform = "translateX(-100vw)";
            }
            
            // After a small delay, toggle the sidebar and reset the button
            setTimeout(() => {
            document.body.classList.toggle('sidebar-hidden');
            this.style.transform = "";
            }, 250);
            
        } else {
            // On desktop, just toggle normally
            document.body.classList.toggle('sidebar-hidden');
        }
        
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
        window.location.href = 'settings.html'
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