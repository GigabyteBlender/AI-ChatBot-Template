class SettingsManager {
    constructor() {
        // Initialize DOM elements
        this.initDOMElements();
        
        // Initialize default settings
        this.defaultSettings = {
            fontSize: 16,
            speed: 20,
            temperature: 1.0,
            maxContext: 5,
            autoClear: 0,
            storageLimit: 0,
            model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
            customModel: '',
            messageSounds: true
        };
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load saved settings
        this.loadSavedSettings();
    }
    
    initDOMElements() {
        // Core buttons
        this.exitBtn = document.getElementById('exitBtn');
        this.exportSettingsBtn = document.getElementById('export-settings');
        this.importSettingsBtn = document.getElementById('import-settings');
        this.settingsFileInput = document.getElementById('settings-file-input');
        
        // API settings
        this.aiModel = document.getElementById('api-model');
        this.customModelContainer = document.getElementById('custom-model-container');
        this.customModelInput = document.getElementById('custom-model');
        
        // Interface settings
        this.fontSizeInput = document.getElementById('font-size');
        this.fontSizeValue = document.getElementById('font-size-value');
        this.messageSoundsToggle = document.getElementById('message-sounds');
        
        // Chat experience settings
        this.speedInput = document.getElementById('speed');
        this.temperatureInput = document.getElementById('temperature');
        this.temperatureValue = document.getElementById('temperature-value');
        this.speedValue = document.getElementById('speed-value');
        this.maxContextSelect = document.getElementById('max-context');
        
        // Data management settings
        this.autoClearSelect = document.getElementById('auto-clear');
        this.storageLimitSelect = document.getElementById('storage-limit');
        
        // Confirmation modal
        this.confirmationModal = document.getElementById('confirmation-modal');
        this.confirmationMessage = document.getElementById('confirmation-message');
        this.cancelActionBtn = document.getElementById('cancel-action');
        this.confirmActionBtn = document.getElementById('confirm-action');
    }
    
    initEventListeners() {
        // Exit button event listener
        this.exitBtn.addEventListener('click', () => {
            document.body.classList.remove('settings-open');
            window.location.href = 'index.html';
        });
        
        // Export/Import settings
        this.exportSettingsBtn.addEventListener('click', this.exportSettings.bind(this));
        this.importSettingsBtn.addEventListener('click', () => this.settingsFileInput.click());
        this.settingsFileInput.addEventListener('change', this.importSettings.bind(this));
        
        // Custom model toggle
        this.aiModel.addEventListener('change', (event) => {
            localStorage.setItem('model', event.target.value);
            this.toggleCustomModelInput();
        });
        
        this.customModelInput.addEventListener('input', (event) => {
            localStorage.setItem('customModel', event.target.value);
        });
        
        // Font size slider
        this.fontSizeInput.addEventListener('input', () => {
            localStorage.setItem('fontSize', this.fontSizeInput.value);
            this.fontSizeValue.textContent = `${this.fontSizeInput.value}px`;
        });
        
        // Message sounds toggle
        this.messageSoundsToggle.addEventListener('change', () => {
            localStorage.setItem('messageSounds', this.messageSoundsToggle.checked);
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
        
        // Max context select
        this.maxContextSelect.addEventListener('change', (event) => {
            localStorage.setItem('maxContext', event.target.value);
        });
        
        // Auto clear select
        this.autoClearSelect.addEventListener('change', (event) => {
            localStorage.setItem('autoClear', event.target.value);
        });
        
        // Storage limit select
        this.storageLimitSelect.addEventListener('change', (event) => {
            localStorage.setItem('storageLimit', event.target.value);
        });
        
        // Modal buttons
        this.cancelActionBtn.addEventListener('click', () => {
            this.confirmationModal.classList.add('hidden');
        });
    }
    
    loadSavedSettings() {
        // Load all settings with fallbacks to defaults
        const settings = {};
        
        // For each default setting, try to load from localStorage
        for (const [key, defaultValue] of Object.entries(this.defaultSettings)) {
            const savedValue = localStorage.getItem(key);
            
            // If the setting exists in localStorage
            if (savedValue !== null) {
                // Convert boolean strings to actual booleans
                if (savedValue === 'true' || savedValue === 'false') {
                    settings[key] = savedValue === 'true';
                }
                // Convert numeric strings to numbers
                else if (!isNaN(savedValue) && savedValue !== '') {
                    settings[key] = Number(savedValue);
                }
                // Keep strings as strings
                else {
                    settings[key] = savedValue;
                }
            } else {
                // Use default value if not in localStorage
                settings[key] = defaultValue;
                // Save default to localStorage
                if (typeof defaultValue === 'boolean') {
                    localStorage.setItem(key, defaultValue);
                } else {
                    localStorage.setItem(key, defaultValue.toString());
                }
            }
        }
        
        // Apply settings to UI elements
        this.fontSizeInput.value = settings.fontSize;
        this.fontSizeValue.textContent = `${settings.fontSize}px`;
        this.speedInput.value = settings.speed;
        this.speedValue.textContent = `${settings.speed}ms`;
        this.temperatureInput.value = settings.temperature;
        this.temperatureValue.textContent = settings.temperature;
        this.maxContextSelect.value = settings.maxContext;
        this.autoClearSelect.value = settings.autoClear;
        this.storageLimitSelect.value = settings.storageLimit;
        this.aiModel.value = settings.model;
        this.customModelInput.value = settings.customModel;
        this.messageSoundsToggle.checked = settings.messageSounds;
        
        // Toggle custom model input visibility
        this.toggleCustomModelInput();
    }
    
    toggleCustomModelInput() {
        if (this.aiModel.value === 'custom') {
            this.customModelContainer.classList.remove('hidden');
        } else {
            this.customModelContainer.classList.add('hidden');
        }
    }
    
    // Keep the clearAllData method for use with importing settings
    clearAllData(preserveApiKey = true) {
        // Clear all localStorage except for the API key if preserveApiKey is true
        if (preserveApiKey) {
            const apiKey = localStorage.getItem('apiKey');
            localStorage.clear();
            
            // Restore API key
            if (apiKey) {
                localStorage.setItem('apiKey', apiKey);
            }
        } else {
            localStorage.clear();
        }
        
        // Reset to default settings
        for (const [key, value] of Object.entries(this.defaultSettings)) {
            if (preserveApiKey && key === 'apiKey') continue; // Don't reset API key if preserving
            localStorage.setItem(key, value.toString());
        }
    }
    
    exportSettings() {
        // Create a settings object with all current settings
        const settings = {};
        for (const key of Object.keys(this.defaultSettings)) {
            settings[key] = localStorage.getItem(key);
        }
        
        // Convert to JSON and create download link
        const dataStr = JSON.stringify(settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportName = 'ai-chatbot-settings-' + new Date().toISOString().split('T')[0] + '.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
    }
    
    importSettings(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                // Show confirmation before importing
                this.showConfirmationModal(
                    'Import these settings? This will overwrite your current settings.',
                    () => {
                        // Apply each valid setting
                        for (const [key, value] of Object.entries(settings)) {
                            if (this.defaultSettings.hasOwnProperty(key) && value !== null) {
                                localStorage.setItem(key, value);
                            }
                        }
                        // Reload the page to apply imported settings
                        window.location.reload();
                    }
                );
            } catch (error) {
                alert('Error importing settings: Invalid file format');
                console.error('Import settings error:', error);
            }
        };
        reader.readAsText(file);
        
        // Reset the file input so the same file can be selected again
        this.settingsFileInput.value = '';
    }
    
    showConfirmationModal(message, confirmCallback) {
        this.confirmationMessage.textContent = message;
        this.confirmationModal.classList.remove('hidden');
        
        // Remove any previous event listener
        const newConfirmBtn = this.confirmActionBtn.cloneNode(true);
        this.confirmActionBtn.parentNode.replaceChild(newConfirmBtn, this.confirmActionBtn);
        this.confirmActionBtn = newConfirmBtn;
        
        // Add new event listener
        this.confirmActionBtn.addEventListener('click', () => {
            confirmCallback();
            this.confirmationModal.classList.add('hidden');
        });
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});