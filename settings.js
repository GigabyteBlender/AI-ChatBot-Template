// settings.js
import { ThemeManager } from './services/themeManager.js';

class SettingsManager {
    constructor() {
        this.themeManager = new ThemeManager();
        this.exitBtn = document.getElementById('exitBtn');
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.speedInput = document.getElementById('speed');
        this.temperatureInput = document.getElementById('temperature');
        this.temperatureValue = document.getElementById('temperature-value');
        this.speedValue = document.getElementById('speed-value');
        
        this.initEventListeners();
        this.loadSavedSettings();
    }
    
    initEventListeners() {
        // Exit button event listener
        this.exitBtn.addEventListener('click', () => {
            document.body.classList.remove('settings-open');
            navigateTo('index.html');
        });
        
        
        // Theme toggle button event listener
        this.themeToggleBtn.addEventListener('click', () => {
            const isDarkMode = this.themeManager.toggleDarkMode();
            this.themeToggleBtn.textContent = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
            
            // Update settings wrapper and buttons
            const elements = [
                document.getElementById('settings-wrapper'),
                this.exitBtn,
                this.themeToggleBtn,
                this.speedInput,
                this.temperatureInput,
                this.temperatureValue,
                this.speedValue
            ];
            
            elements.forEach(element => {
                if (element) {
                    element.classList.toggle('dark-mode', isDarkMode);
                }
            });
        });
        
        // Speed input event listener
        this.speedInput.addEventListener('input', () => {
            localStorage.setItem('speed', this.speedInput.value);
            this.speedValue.textContent = `${this.speedInput.value}ms`;
        });
        
        // Temperature input event listener
        this.temperatureInput.addEventListener('input', () => {
            localStorage.setItem('temperature', this.temperatureInput.value);
            this.temperatureValue.textContent = this.temperatureInput.value;
        });
    }
    
    loadSavedSettings() {
        // Initialize theme
        this.themeManager.initTheme();
        const isDarkMode = document.body.classList.contains('dark-mode');
        this.themeToggleBtn.textContent = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        
        // Load saved speed and temperature
        const savedSpeed = localStorage.getItem('speed') || '20';
        const savedTemperature = localStorage.getItem('temperature') || '1.0';
        
        this.speedInput.value = savedSpeed;
        this.temperatureInput.value = savedTemperature;
        
        // Update display values
        this.speedValue.textContent = `${savedSpeed}ms`;
        this.temperatureValue.textContent = savedTemperature;
        
        // Apply dark mode to settings elements if necessary
        if (isDarkMode) {
            const elements = [
                document.getElementById('settings-wrapper'),
                this.exitBtn,
                this.themeToggleBtn,
                this.speedInput,
                this.temperatureInput,
                this.temperatureValue,
                this.speedValue
            ];
            
            elements.forEach(element => {
                if (element) {
                    element.classList.add('dark-mode');
                }
            });
        }
    }
}

function navigateTo(url) {
    const overlay = document.getElementById('page-transition-overlay');
    overlay.classList.add('active');
    
    setTimeout(() => {
        window.location.href = url;
    }, 300); // Match this delay to your CSS transition time
}


// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});