import React, { useContext, useRef, useEffect } from 'react';
import { ChatContext } from '../../contexts/ChatContext';
import { SettingsContext } from '../../contexts/SettingsContext';
import ChatMessage from './ChatMessage';
import InputContainer from './InputContainer';
import ModeSelector from './ModeSelector';
import './styles/ChatInterface.css';

const ChatInterface = () => {
    const { messages, loading, clearChat } = useContext(ChatContext);
    const { settings } = useContext(SettingsContext);
    const chatContainerRef = useRef(null);

    // Auto-scroll to bottom when new messages come in
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleClearChat = () => {
        if (window.confirm('Are you sure you want to clear the current chat?')) {
            clearChat();
        }
    };

    return (
        <div className="chat-wrapper">
            <ModeSelector onClear={handleClearChat} />

            <div
                className="chat-container"
                ref={chatContainerRef}
                style={{ fontSize: `${settings.interface.fontSize}px` }}
            >
                <div className="chat-content-wrapper">
                    {messages.map(message => (
                        <ChatMessage
                            key={message.id}
                            message={message}
                            displaySpeed={settings.chat.displaySpeed}
                        />
                    ))}

                    {loading && (
                        <div className="loading-indicator">
                            <div className="spinner"></div>
                        </div>
                    )}
                </div>
            </div>

            <InputContainer />
        </div>
    );
};

export default ChatInterface;