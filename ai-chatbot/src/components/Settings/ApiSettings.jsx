import React, { useContext, useState } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import './styles/SettingsComponents.css';

const ApiSettings = () => {
	const { settings, updateSettings } = useContext(SettingsContext);
	const [apiKey, setApiKey] = useState('');
	const [showApiKey, setShowApiKey] = useState(false);

	const handleModelChange = (e) => {
		updateSettings('api', 'model', e.target.value);
	};

	const handleApiKeyChange = (e) => {
		setApiKey(e.target.value);
	};

	const handleSaveApiKey = () => {
		if (apiKey) {
			// Save API key securely
			// In a real app, this should use more secure storage than localStorage
			localStorage.setItem('apiKey', apiKey);
			updateSettings('api', 'hasApiKey', true);
			setApiKey('');
			alert('API key saved successfully');
		}
	};

	const handleRemoveApiKey = () => {
		if (window.confirm('Are you sure you want to remove your API key?')) {
			localStorage.removeItem('apiKey');
			updateSettings('api', 'hasApiKey', false);
			alert('API key removed');
		}
	};

	const toggleShowApiKey = () => {
		setShowApiKey(!showApiKey);
	};

	return (
		<div className="settings-section">
			<h2>API Configuration</h2>

			<div className="setting-group">
				<label htmlFor="model">AI Model</label>
				<select
					id="model"
					value={settings.api.model}
					onChange={handleModelChange}
					className="select-control"
				>
					<option value="deepseek/deepseek-prover-v2:free">DeepSeek V2</option>
					<option value="deepseek/deepseek-chat-v3-0324:free">DeepSeek V3</option>
					<option value="google/gemini-2.5-pro-exp-03-25">Gemini 2.5 Pro (experimental)</option>
				</select>
			</div>

			<div className="setting-group">
				<label htmlFor="apiKey">API Key</label>
				<div className="input-with-button">
					<input
						type={showApiKey ? 'text' : 'password'}
						id="apiKey"
						placeholder={settings.api.hasApiKey ? '••••••••••••••••••••' : 'Enter your API key'}
						value={apiKey}
						onChange={handleApiKeyChange}
						className="text-input"
					/>
					<button onClick={toggleShowApiKey} className="input-button">
						{showApiKey ? 'Hide' : 'Show'}
					</button>
				</div>
				<div className="button-group">
					<button onClick={handleSaveApiKey} className="settings-button">
						Save API Key
					</button>
					{settings.api.hasApiKey && (
						<button onClick={handleRemoveApiKey} className="settings-button danger">
							Remove Key
						</button>
					)}
				</div>
				<p className="setting-description">
					Your API key is stored locally and used to access the AI services.
				</p>
			</div>

			<div className="settings-info">
				<p>Some models may require an API key. Free models are available without an API key but may have usage limitations.</p>
			</div>
		</div>
	);
};

export default ApiSettings;