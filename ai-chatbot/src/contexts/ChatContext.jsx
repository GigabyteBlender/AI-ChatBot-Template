import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SettingsContext } from './SettingsContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { settings } = useContext(SettingsContext);

  useEffect(() => {
    // Load chat history from localStorage
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
      setChatHistory(JSON.parse(storedHistory));
    }
    
    // Create a new chat if none exists
    if (!currentChatId) {
      createNewChat();
    } else {
      // Load messages for current chat
      loadChat(currentChatId);
    }
  }, [currentChatId]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const createNewChat = () => {
    const newChatId = uuidv4();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      timestamp: Date.now(),
      preview: 'Start a new conversation'
    };
    
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([
      {
        id: uuidv4(),
        type: 'bot',
        content: 'Hello! How can I help you today?',
        timestamp: Date.now()
      }
    ]);
    
    return newChatId;
  };

  const loadChat = (chatId) => {
    const storedMessages = localStorage.getItem(`chat_${chatId}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages([
        {
          id: uuidv4(),
          type: 'bot',
          content: 'Hello! How can I help you today?',
          timestamp: Date.now()
        }
      ]);
    }
    setCurrentChatId(chatId);
  };

  const addMessage = (content, type = 'user') => {
    const newMessage = {
      id: uuidv4(),
      type,
      content,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update chat preview in history
    if (type === 'user') {
      updateChatPreview(currentChatId, content);
    }
    
    // Save messages to localStorage
    setTimeout(() => {
      localStorage.setItem(`chat_${currentChatId}`, JSON.stringify([...messages, newMessage]));
    }, 0);
    
    return newMessage;
  };

  const updateChatPreview = (chatId, preview) => {
    setChatHistory(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, preview: preview.substring(0, 30) + (preview.length > 30 ? '...' : ''), timestamp: Date.now() }
          : chat
      )
    );
  };

  const clearChat = () => {
    setMessages([
      {
        id: uuidv4(),
        type: 'bot',
        content: 'Hello! How can I help you today?',
        timestamp: Date.now()
      }
    ]);
    
    // Update localStorage
    localStorage.setItem(`chat_${currentChatId}`, JSON.stringify([
      {
        id: uuidv4(),
        type: 'bot',
        content: 'Hello! How can I help you today?',
        timestamp: Date.now()
      }
    ]));
    
    // Update chat preview
    updateChatPreview(currentChatId, 'Start a new conversation');
  };

  const deleteChat = (chatId) => {
    // Remove chat from history
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    
    // Remove chat messages from localStorage
    localStorage.removeItem(`chat_${chatId}`);
    
    // If current chat was deleted, create a new one
    if (currentChatId === chatId) {
      createNewChat();
    }
  };

  const sendChatMessage = async (message) => {
    // Add user message
    addMessage(message, 'user');
    
    // Set loading state
    setLoading(true);
    
    try {
      // In a real app, this would call an AI API
      // For demo, we'll simulate a response
      setTimeout(() => {
        const responses = [
          "I understand what you're asking. Let me help with that.",
          "That's an interesting question. Here's what I think...",
          "Based on my knowledge, I can provide this information.",
          "I'd be happy to assist with your request.",
          "Let me analyze that and give you my thoughts."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, 'bot');
        setLoading(false);
      }, 1000);
    } catch (error) {
      addMessage("I'm sorry, but I encountered an error processing your request. Please try again.", 'bot');
      setLoading(false);
    }
  };

  const value = {
    messages,
    chatHistory,
    currentChatId,
    loading,
    createNewChat,
    loadChat,
    addMessage,
    clearChat,
    deleteChat,
    sendChatMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};