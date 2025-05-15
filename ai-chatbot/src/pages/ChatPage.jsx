// src/pages/ChatPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatInterface from '../components/ChatInterface/ChatInterface';
import './styles/ChatPage.css';

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(false);
  const { currentUser } = useContext(AuthContext);

  // Detect screen size and update isMobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // Default to open on desktop
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="chat-page">
      <Sidebar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className={`main-content ${sidebarOpen && !isMobile ? 'sidebar-open' : ''}`}>
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;