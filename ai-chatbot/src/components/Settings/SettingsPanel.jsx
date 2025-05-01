import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InterfaceSettings from './InterfaceSettings';
import ChatSettings from './ChatSettings';
import DataSettings from './DataSettings';
import ApiSettings from './ApiSettings';
import './styles/SettingsPanel.css';

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('interface');
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'interface':
        return <InterfaceSettings />;
      case 'chat':
        return <ChatSettings />;
      case 'data':
        return <DataSettings />;
      case 'api':
        return <ApiSettings />;
      default:
        return <InterfaceSettings />;
    }
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <button className="back-button" onClick={handleGoBack}>
          &larr; Back
        </button>
        <h1>Settings</h1>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <ul className="settings-tabs">
            <li 
              className={activeTab === 'interface' ? 'active' : ''}
              onClick={() => setActiveTab('interface')}
            >
              Interface
            </li>
            <li 
              className={activeTab === 'chat' ? 'active' : ''}
              onClick={() => setActiveTab('chat')}
            >
              Chat Settings
            </li>
            <li 
              className={activeTab === 'data' ? 'active' : ''}
              onClick={() => setActiveTab('data')}
            >
              Data & Privacy
            </li>
            <li 
              className={activeTab === 'api' ? 'active' : ''}
              onClick={() => setActiveTab('api')}
            >
              API Configuration
            </li>
          </ul>
        </div>

        <div className="settings-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;