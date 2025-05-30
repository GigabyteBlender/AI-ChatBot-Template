import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsContext } from '../../contexts/SettingsContext';
import clearIcon from './images/clear-icon.png';  // adjust the exact filenames as needed
import settingsIcon from './images/settings-button.png';
import './styles/ModeSelector.css';

const ModeSelector = ({ onClear }) => {
  const { settings, updateSettings } = useContext(SettingsContext);
  const navigate = useNavigate();

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    updateSettings('api', 'model', newModel);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <div className="mode-selector">
      <div className="mode-container">
        <select
          id="mode"
          value={settings.api.model}
          onChange={handleModelChange}
          aria-label="Select AI model"
        >
          <option value="deepseek/deepseek-chat-v3-0324:free">DeepSeek V3</option>
        </select>
      </div>

      <div className="action-buttons">
        <button id="clearBtn" onClick={onClear} aria-label="Clear chat">
          <img src={clearIcon} alt="Clear" className="icon" />
        </button>
        <button id="settingsBtn" onClick={handleSettingsClick} aria-label="Settings">
          <img src={settingsIcon} alt="Settings" className="icon" />
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
