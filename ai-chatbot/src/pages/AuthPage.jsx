// src/pages/AuthPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import ResetPasswordForm from '../components/Auth/ResetPasswordForm';
import './styles/AuthPage.css';

const AuthPage = () => {
  const [activeForm, setActiveForm] = useState('login');
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const toggleForm = (formName) => {
    setActiveForm(formName);
  };

  const renderForm = () => {
    switch (activeForm) {
      case 'login':
        return <LoginForm toggleForm={toggleForm} />;
      case 'register':
        return <RegisterForm toggleForm={toggleForm} />;
      case 'reset':
        return <ResetPasswordForm toggleForm={toggleForm} />;
      default:
        return <LoginForm toggleForm={toggleForm} />;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>AI Chatbot</h1>
          <p>Your intelligent conversation partner</p>
        </div>
        
        <div className="auth-form-wrapper">
          {renderForm()}
        </div>
        
        <div className="auth-footer">
          <button className="back-to-chat" onClick={() => navigate('/')}>
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;