import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './styles/AuthForms.css';

const ResetPasswordForm = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const { resetPassword, loading } = useContext(AuthContext);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    try {
      const success = await resetPassword(email);
      if (success) {
        setMessage('Password reset link sent to your email');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during password reset');
    }
  };
  
  return (
    <div className="auth-form-container">
      <h2>Reset Password</h2>
      <p className="auth-subtitle">Enter your email to reset your password</p>
      
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-success">{message}</div>}
      
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
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      
      <div className="auth-toggle">
        <p>
          Remember your password?{' '}
          <button 
            type="button" 
            onClick={() => toggleForm('login')}
            disabled={loading}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;