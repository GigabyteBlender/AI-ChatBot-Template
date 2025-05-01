import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsContext } from '../../contexts/SettingsContext';
import './styles/ModeSelector.css';

const ModeSelector = ({ onClear }) => {
  const { settings, updateSettings } = useContext(SettingsContext);
  const navigate = useNavigate();
  
  const handleModelChange = (e) => {
    updateSettings('api', 'model', e.target.value);
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
          <option value="deepseek/deepseek-r1-zero:free">OpenRouter API</option>
          <option value="random">Random Mode</option>
          <option value="deepseek/deepseek-chat:free">DeepSeek V3</option>
          <option value="cognitivecomputations/dolphin3.0-mistral-24b:free">Dolphin3.0 Mistral</option>
          <option value="sophosympatheia/rogue-rose-103b-v0.2:free">Rogue Rose v0.2</option>
          <option value="custom">Custom Model</option>
        </select>
      </div>
      
      <div className="action-buttons">
        <button id="clearBtn" onClick={onClear} aria-label="Clear chat">
          Clear
        </button>
        <button id="settingsBtn" onClick={handleSettingsClick} aria-label="Settings">
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;