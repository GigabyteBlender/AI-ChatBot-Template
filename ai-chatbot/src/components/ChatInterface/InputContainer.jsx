import React, { useState, useContext, useRef, useEffect } from 'react';
import { ChatContext } from '../../contexts/ChatContext';
import './styles/InputContainer.css';

const InputContainer = () => {
  const [input, setInput] = useState('');
  const { sendChatMessage, loading } = useContext(ChatContext);
  const textareaRef = useRef(null);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + 'px';
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      sendChatMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="input-container">
      <textarea 
        id="userInput"
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        rows="1"
        disabled={loading}
      />
      <button 
        id="submitBtn" 
        onClick={handleSubmit}
        disabled={!input.trim() || loading}
      >
        Send
      </button>
    </div>
  );
};

export default InputContainer;