export class ThemeManager {

    constructor() {
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    }
    /**
     * Initialize theme based on saved preference
     */
    initTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark-theme');
            this.applyDarkMode(true);
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark-theme');
            this.applyDarkMode(false);
        }
    }

    /**
     * Toggle dark mode on and off
     */
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark-theme');
        }
        
        this.applyDarkMode(this.isDarkMode);
        return this.isDarkMode;
    }

    /**
     * Apply dark mode class to all relevant elements
     * @param {boolean} isDarkMode - Whether to apply or remove dark mode
     */
    applyDarkMode(isDarkMode) {
        const elements = [
            document.getElementById('chat-container'),
            document.getElementById('input-container'),
            document.getElementById('userInput'),
            document.getElementById('mode-selector'),
            document.getElementById('mode'),
            document.getElementById('settingsBtn'),
            document.getElementById('clearBtn'),
            document.getElementById('sidebar'),
            document.getElementById('submitBtn')
        ];

        // Add side-buttons to the elements array
        const sideButtons = document.getElementsByClassName('side-button');
        for (let i = 0; i < sideButtons.length; i++) {
            elements.push(sideButtons[i]);
        }
        
        // Add message elements
        const messages = document.getElementsByClassName('message');
        for (let i = 0; i < messages.length; i++) {
            elements.push(messages[i]);
        }
        
        // Add chat history items
        const historyItems = document.getElementById('chat-history-list')?.children;
        if (historyItems) {
            for (let i = 0; i < historyItems.length; i++) {
                elements.push(historyItems[i]);
                
                // Also get the delete buttons inside history items
                const deleteBtn = historyItems[i].querySelector('.chat-delete-btn');
                if (deleteBtn) {
                    elements.push(deleteBtn);
                }
            }
        }
        
        // Toggle dark-mode class on all elements
        elements.forEach(element => {
            if (element) {
                if (isDarkMode) {
                    element.classList.add('dark-mode');
                } else {
                    element.classList.remove('dark-mode');
                }
            }
        });
    }
}