// src/pages/ChatPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatInterface from '../components/ChatInterface/ChatInterface';
import './styles/ChatPage.css';

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { currentUser } = useContext(AuthContext);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      } else if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Optional: Redirect to login if auth is required
  // Uncomment this if you want to require login
  /*
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  */

  return (
    <div className="chat-page">
      <Sidebar 
        isMobile={isMobile} 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {isMobile && (
          <button 
            className="menu-toggle" 
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? '×' : '☰'}
          </button>
        )}
        
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;