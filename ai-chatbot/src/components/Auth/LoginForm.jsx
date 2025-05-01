import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './styles/AuthForms.css';

const LoginForm = ({ toggleForm }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const { login, loading } = useContext(AuthContext);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (!email || !password) {
			setError('Please fill in all fields');
			return;
		}

		try {
			const success = await login(email, password);
			if (!success) {
				setError('Invalid email or password');
			}
		} catch (err) {
			setError(err.message || 'An error occurred during login');
		}
	};

	return (
		<div className="auth-form-container">
			<h2>Welcome Back</h2>
			<p className="auth-subtitle">Login to your account</p>

			{error && <div className="auth-error">{error}</div>}

			<form onSubmit={handleSubmit} className="auth-form">
				<div className="form-group">
					<label htmlFor="email">Email</label>
					<input
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email"
						disabled={loading}
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="password">Password</label>
					<input
						type="password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter your password"
						disabled={loading}
						required
					/>
				</div>

				<div className="auth-actions">
					<button
						type="button"
						className="forgotten-password"
						onClick={() => toggleForm('reset')}
						disabled={loading}
					>
						Forgot password?
					</button>
				</div>

				<button
					type="submit"
					className="auth-button"
					disabled={loading}
				>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</form>

			<div className="auth-toggle">
				<p>
					Don't have an account?{' '}
					<button
						type="button"
						onClick={() => toggleForm('register')}
						disabled={loading}
					>
						Sign up
					</button>
				</p>
			</div>
		</div>
	);
};

export default LoginForm;