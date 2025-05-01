import React, { useContext } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import './styles/SettingsComponents.css';

const ChatSettings = () => {
    const { settings, updateSettings } = useContext(SettingsContext);

    const handleTemperatureChange = (e) => {
        updateSettings('chat', 'temperature', parseFloat(e.target.value));
    };

    const handleDisplaySpeedChange = (e) => {
        updateSettings('chat', 'displaySpeed', parseInt(e.target.value));
    };

    const handleMaxContextChange = (e) => {
        updateSettings('chat', 'maxContext', parseInt(e.target.value));
    };

    return (
        <div className="settings-section">
            <h2>Chat Settings</h2>

            <div className="setting-group">
                <label htmlFor="temperature">Response Creativity</label>
                <div className="range-control">
                    <input
                        type="range"
                        id="temperature"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.chat.temperature}
                        onChange={handleTemperatureChange}
                    />
                    <span className="range-value">{settings.chat.temperature.toFixed(1)}</span>
                </div>
                <p className="setting-description">
                    Lower values produce more consistent responses, higher values make responses more creative and varied.
                </p>
            </div>

            <div className="setting-group">
                <label htmlFor="displaySpeed">Text Display Speed</label>
                <div className="range-control">
                    <input
                        type="range"
                        id="displaySpeed"
                        min="5"
                        max="50"
                        step="5"
                        value={settings.chat.displaySpeed}
                        onChange={handleDisplaySpeedChange}
                    />
                    <span className="range-value">
                        {settings.chat.displaySpeed <= 10 ? 'Fast' : settings.chat.displaySpeed >= 40 ? 'Slow' : 'Medium'}
                    </span>
                </div>
                <p className="setting-description">
                    Controls how fast the AI responses appear on screen.
                </p>
            </div>

            <div className="setting-group">
                <label htmlFor="maxContext">Context Window Size</label>
                <select
                    id="maxContext"
                    value={settings.chat.maxContext}
                    onChange={handleMaxContextChange}
                    className="select-control"
                >
                    <option value="3">3 messages</option>
                    <option value="5">5 messages</option>
                    <option value="10">10 messages</option>
                    <option value="20">20 messages</option>
                    <option value="0">Unlimited</option>
                </select>
                <p className="setting-description">
                    Number of previous messages to include for AI context. Higher values provide more context but may reduce performance.
                </p>
            </div>

            <div className="settings-info">
                <p>These settings affect how the AI generates and displays responses.</p>
            </div>
        </div>
    );
};

export default ChatSettings;