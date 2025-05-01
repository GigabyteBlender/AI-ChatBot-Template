import React from 'react';
import './styles/SidebarFooter.css';

const SidebarFooter = () => {
  return (
    <div className="sidebar-footer">
      <div className="footer-links">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
        <span className="separator">•</span>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        <span className="separator">•</span>
        <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>
      </div>
      <div className="footer-copyright">
        © {new Date().getFullYear()} AI Chatbot
      </div>
    </div>
  );
};

export default SidebarFooter;