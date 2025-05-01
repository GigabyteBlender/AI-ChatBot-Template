import React, { useState, useEffect } from 'react';
import './styles/ChatMessage.css';

const ChatMessage = ({ message, displaySpeed }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [fullyDisplayed, setFullyDisplayed] = useState(false);

    // Function to convert markdown code blocks to HTML
    const formatContent = (content) => {
        // Simple markdown code block formatting (``` code ```)
        let formattedContent = content.replace(
            /```([\s\S]*?)```/g,
            '<pre><code>$1</code></pre>'
        );

        // Format bold text
        formattedContent = formattedContent.replace(
            /\*\*(.*?)\*\*/g,
            '<strong>$1</strong>'
        );

        // Format italic text
        formattedContent = formattedContent.replace(
            /\*(.*?)\*/g,
            '<em>$1</em>'
        );

        // Format links
        formattedContent = formattedContent.replace(
            /\[(.*?)\]\((.*?)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // Add line breaks
        formattedContent = formattedContent.replace(/\n/g, '<br>');

        return formattedContent;
    };

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

        // Calculate how many characters to show per interval
        const contentLength = message.content.length;
        let charsPerInterval = 1;

        // For longer messages, increase the speed
        if (contentLength > 500) {
            charsPerInterval = Math.ceil(contentLength / 500);
        }

        let index = 0;
        const interval = setInterval(() => {
            if (index < message.content.length) {
                const nextChunk = message.content.substring(index, index + charsPerInterval);
                setDisplayedContent(prev => prev + nextChunk);
                index += charsPerInterval;
            } else {
                clearInterval(interval);
                setFullyDisplayed(true);
            }
        }, displaySpeed);

        return () => clearInterval(interval);
    }, [message, displaySpeed]);

    return (
        <div className={`message-row ${message.type}`}>
            <div className="message-content">
                {message.type === 'user' ? (
                    <span>{displayedContent}</span>
                ) : (
                    <div
                        className="bot-content"
                        dangerouslySetInnerHTML={{ __html: formatContent(displayedContent) }}
                    />
                )}
                {!fullyDisplayed && message.type === 'bot' && (
                    <span className="cursor"></span>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;