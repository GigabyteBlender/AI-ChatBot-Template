import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsContext } from '../../contexts/SettingsContext';
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
					<option value="deepseek/deepseek-prover-v2:free">DeepSeek V2</option>
					<option value="deepseek/deepseek-v3-base:free">DeepSeek V3</option>
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