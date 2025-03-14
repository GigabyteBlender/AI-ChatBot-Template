class SettingsManager {
    constructor() {
        this.exitBtn = document.getElementById('exitBtn');
        this.aiModel = document.getElementById('api-model');
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
            window.location.href = 'index.html'
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

        this.aiModel.addEventListener('change', (event) => {
            localStorage.setItem('model', event.target.value);
        });
    }
    
    loadSavedSettings() {
        // Load saved speed and temperature
        const savedSpeed = localStorage.getItem('speed') || '20';
        const savedTemperature = localStorage.getItem('temperature') || '1.0';
        const savedModel = localStorage.getItem('model') || 'google/gemini-2.0-flash-lite-preview-02-05:free';
        
        this.speedInput.value = savedSpeed;
        this.temperatureInput.value = savedTemperature;
        
        // Update display values
        this.speedValue.textContent = `${savedSpeed}ms`;
        this.temperatureValue.textContent = savedTemperature;
        
        //update what the current model is
        this.aiModel.value = savedModel;
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