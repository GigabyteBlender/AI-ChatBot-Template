// services/themeManager.js
export class ThemeManager {
    /**
     * Initialize theme based on saved preference
     */
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        this.applyDarkMode();
    }

    /**
     * Toggle dark mode on and off
     */
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        this.applyDarkMode();
        return isDarkMode;
    }

    /**
     * Apply dark mode class to all relevant elements
     */
    applyDarkMode() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const elements = [
            document.getElementById('chat-container'),
            document.getElementById('input-container'),
            document.getElementById('userInput'),
            document.getElementById('mode-selector'),
            document.getElementById('mode'),
            document.getElementById('settingsBtn'),
            document.getElementById('clearBtn'),
            document.getElementById('sidebar')
        ];

        // Add side-buttons to the elements array
        const sideButtons = document.getElementsByClassName('side-button');
        for (let i = 0; i < sideButtons.length; i++) {
            elements.push(sideButtons[i]);
        }
        
        // Toggle dark-mode class on all elements
        elements.forEach(element => {
            if (element) {
                element.classList.toggle('dark-mode', isDarkMode);
            }
        });
    }
}