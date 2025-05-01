import React, { useContext } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import { ChatContext } from '../../contexts/ChatContext';
import './styles/SettingsComponents.css';

const DataSettings = () => {
  const { settings, updateSettings, exportSettings, importSettings, resetSettings } = useContext(SettingsContext);
  const { clearChat } = useContext(ChatContext);

  const handleAutoClearChange = (e) => {
    updateSettings('data', 'autoClear', parseInt(e.target.value));
  };

  const handleStorageLimitChange = (e) => {
    updateSettings('data', 'storageLimit', parseInt(e.target.value));
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all chat data? This action cannot be undone.')) {
      localStorage.clear();
      resetSettings();
      clearChat();
      window.location.reload();
    }
  };

  const handleImportSettings = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const success = importSettings(event.target.result);
        if (success) {
          alert('Settings imported successfully');
        } else {
          alert('Failed to import settings. Invalid format.');
        }
      } catch (error) {
        alert('Error importing settings');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-section">
      <h2>Data & Privacy Settings</h2>
      
      <div className="setting-group">
        <label htmlFor="autoClear">Auto-Clear Chat History</label>
        <select
          id="autoClear"
          value={settings.data.autoClear}
          onChange={handleAutoClearChange}
          className="select-control"
        >
          <option value="0">Never</option>
          <option value="1">Daily</option>
          <option value="7">Weekly</option>
          <option value="30">Monthly</option>
        </select>
        <p className="setting-description">
          Automatically clear your chat history after the specified period.
        </p>
      </div>
      
      <div className="setting-group">
        <label htmlFor="storageLimit">Max Chat History</label>
        <select
          id="storageLimit"
          value={settings.data.storageLimit}
          onChange={handleStorageLimitChange}
          className="select-control"
        >
          <option value="10">10 chats</option>
          <option value="25">25 chats</option>
          <option value="50">50 chats</option>
          <option value="100">100 chats</option>
          <option value="0">Unlimited</option>
        </select>
        <p className="setting-description">
          Maximum number of conversations to keep in your chat history.
        </p>
      </div>
      
      <div className="settings-actions">
        <button className="settings-button" onClick={exportSettings}>
          Export Settings
        </button>
        
        <div className="file-input-wrapper">
          <button className="settings-button">
            Import Settings
          </button>
          <input 
            type="file" 
            accept=".json" 
            onChange={handleImportSettings}
            className="file-input"
          />
        </div>
        
        <button className="settings-button danger" onClick={handleClearAllData}>
          Clear All Data
        </button>
      </div>
      
      <div className="settings-info warning">
        <p>All chat data is stored locally in your browser. Clearing browser data will remove all chats and settings.</p>
      </div>
    </div>
  );
};

export default DataSettings;