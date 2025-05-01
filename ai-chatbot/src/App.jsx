import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { SettingsProvider } from './contexts/SettingsContext';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <ChatProvider>
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </ChatProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;