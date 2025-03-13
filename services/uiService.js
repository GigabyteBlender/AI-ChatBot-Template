// services/uiService.js
export class UiService {
    /**
     * Sanitizes a string to prevent XSS attacks
     * @param {string} str - The string to sanitize
     * @returns {string} The sanitized string
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    /**
     * Adds a message to the chat container with the appropriate styling and typing animation.
     * @async
     * @param {string} content - The message content.
     * @param {string} sender - The sender of the message ('user' or 'bot').
     * @returns {Promise<void>}
     */
    async addMessage(content, sender) {
        const chatContainer = document.getElementById('chat-container');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        // Sanitize the content to prevent XSS attacks
        const sanitizedContent = this.sanitizeHTML(content);
        
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

        // If the sender is the bot, start the typing animation
        if (sender === 'bot') {
            await this.typeWriter(sanitizedContent, textSpan);
        } else {
            textSpan.textContent = sanitizedContent; // Directly set the user's message
        }
    }

    /**
     * Simulates typing animation for text display
     * @param {string} text - The text to display with typing animation
     * @param {HTMLElement} element - The element to display the text in
     * @returns {Promise<void>}
     */
    async typeWriter(text, element) {
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
}