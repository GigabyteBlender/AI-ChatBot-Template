import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const navigate = useNavigate();

	useEffect(() => {
		// Check if user is logged in from localStorage
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			setCurrentUser(JSON.parse(storedUser));
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		try {
			setError(null);
			setLoading(true);

			// In a real app, this would make an API call
			// For demo, we'll simulate successful login
			const user = { email, username: email.split('@')[0] };

			localStorage.setItem('user', JSON.stringify(user));
			setCurrentUser(user);
			navigate('/');
			return true;
		} catch (err) {
			setError(err.message || 'Failed to login');
			return false;
		} finally {
			setLoading(false);
		}
	};

	const register = async (username, email, password) => {
		try {
			setError(null);
			setLoading(true);

			// In a real app, this would make an API call
			// For demo, we'll simulate successful registration
			const user = { email, username };

			localStorage.setItem('user', JSON.stringify(user));
			setCurrentUser(user);
			navigate('/');
			return true;
		} catch (err) {
			setError(err.message || 'Failed to register');
			return false;
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		localStorage.removeItem('user');
		setCurrentUser(null);
		navigate('/auth');
	};

	const resetPassword = async (email) => {
		try {
			setError(null);
			setLoading(true);

			// In a real app, this would make an API call
			// For demo, we'll just return success
			return true;
		} catch (err) {
			setError(err.message || 'Failed to reset password');
			return false;
		} finally {
			setLoading(false);
		}
	};

	const value = {
		currentUser,
		login,
		register,
		logout,
		resetPassword,
		loading,
		error
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};
