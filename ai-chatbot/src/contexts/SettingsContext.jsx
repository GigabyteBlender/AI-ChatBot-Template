import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

const defaultSettings = {
	interface: {
		fontSize: 16,
		messageSounds: true
	},
	chat: {
		temperature: 0.7,  // Changed default from 1.0 to 0.7 for better responses
		displaySpeed: 20,
		maxContext: 5
	},
	data: {
		autoClear: 0, // 0 = never, 1 = daily, 7 = weekly, 30 = monthly
		storageLimit: 25 // max number of chats
	},
	api: {
		model: "deepseek/deepseek-prover-v2:free",
	}
};

export const SettingsProvider = ({ children }) => {
	const [settings, setSettings] = useState(defaultSettings);

	useEffect(() => {
		// Load settings from localStorage
		const storedSettings = localStorage.getItem('settings');
		if (storedSettings) {
			setSettings(JSON.parse(storedSettings));
		}
	}, []);

	// Save settings to localStorage whenever they change
	useEffect(() => {
		localStorage.setItem('settings', JSON.stringify(settings));
	}, [settings]);

	const updateSettings = (category, key, value) => {
		setSettings(prev => ({
			...prev,
			[category]: {
				...prev[category],
				[key]: value
			}
		}));
	};

	const resetSettings = () => {
		setSettings(defaultSettings);
	};

	const exportSettings = () => {
		const dataStr = JSON.stringify(settings, null, 2);
		const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

		const exportFileDefaultName = 'ai-chatbot-settings.json';

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	};

	const importSettings = (jsonSettings) => {
		try {
			const parsedSettings = JSON.parse(jsonSettings);
			setSettings({
				...defaultSettings, // Ensure we have all required fields
				...parsedSettings
			});
			return true;
		} catch (error) {
			console.error("Failed to import settings:", error);
			return false;
		}
	};

	const value = {
		settings,
		updateSettings,
		resetSettings,
		exportSettings,
		importSettings
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};