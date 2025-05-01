import React, { useContext } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import './styles/SettingsComponents.css';

const InterfaceSettings = () => {
    const { settings, updateSettings } = useContext(SettingsContext);

    const handleFontSizeChange = (e) => {
        updateSettings('interface', 'fontSize', parseInt(e.target.value));
    };

    const handleToggleMessageSounds = (e) => {
        updateSettings('interface', 'messageSounds', e.target.checked);
    };

    return (
        <div className="settings-section">
            <h2>Interface Settings</h2>

            <div className="setting-group">
                <label htmlFor="fontSize">Font Size</label>
                <div className="range-control">
                    <input
                        type="range"
                        id="fontSize"
                        min="12"
                        max="24"
                        step="1"
                        value={settings.interface.fontSize}
                        onChange={handleFontSizeChange}
                    />
                    <span className="range-value">{settings.interface.fontSize}px</span>
                </div>
            </div>

            <div className="setting-group">
                <label htmlFor="messageSounds">Message Sounds</label>
                <div className="toggle-control">
                    <input
                        type="checkbox"
                        id="messageSounds"
                        checked={settings.interface.messageSounds}
                        onChange={handleToggleMessageSounds}
                    />
                    <span className="toggle-label">
                        {settings.interface.messageSounds ? 'On' : 'Off'}
                    </span>
                </div>
            </div>

            <div className="settings-info">
                <p>Interface settings affect how the application looks and behaves but don't impact AI responses.</p>
            </div>
        </div>
    );
};

export default InterfaceSettings;