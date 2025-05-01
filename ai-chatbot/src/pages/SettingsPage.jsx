// src/pages/SettingsPage.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import SettingsPanel from '../components/Settings/SettingsPanel';
import './styles/SettingsPage.css';

const SettingsPage = () => {
	const { currentUser } = useContext(AuthContext);

	// Optional: Redirect to login if auth is required for settings
	// Uncomment this if you want to require login for settings
	/*
	if (!currentUser) {
	  return <Navigate to="/auth" replace />;
	}
	*/

	return (
		<div className="settings-page">
			<SettingsPanel />
		</div>
	);
};

export default SettingsPage;