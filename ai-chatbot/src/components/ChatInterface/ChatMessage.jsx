import React, { useState, useEffect } from 'react';
import './styles/ChatMessage.css';

const ChatMessage = ({ message, displaySpeed }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [fullyDisplayed, setFullyDisplayed] = useState(false);
  
  useEffect(() => {
    // If it's a user message, show it immediately
    if (message.type === 'user') {
      setDisplayedContent(message.content);
      setFullyDisplayed(true);
      return;
    }
    
    // For bot messages, implement typewriter effect
    setDisplayedContent('');
    setFullyDisplayed(false);
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < message.content.length) {
        setDisplayedContent(prev => prev + message.content.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setFullyDisplayed(true);
      }
    }, displaySpeed);
    
    return () => clearInterval(interval);
  }, [message, displaySpeed]);

  return (
    <div className={`message ${message.type}`}>
      <span>{displayedContent}</span>
      {!fullyDisplayed && message.type === 'bot' && (
        <span className="cursor"></span>
      )}
    </div>
  );
};

export default ChatMessage;