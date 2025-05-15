import React, { useState, useEffect } from 'react';
import './styles/ChatMessage.css';
import { marked } from 'marked';
import hljs from 'highlight.js';

const ChatMessage = ({ message, displaySpeed }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [fullyDisplayed, setFullyDisplayed] = useState(false);

    // Configure marked with syntax highlighting
    marked.setOptions({
        breaks: true,
        highlight: function (code, lang) {
            return hljs.highlightAuto(code, [lang]).value;
        },
    });

    // Convert markdown to HTML with syntax highlighting
    const formatContent = (content) => {
        return marked(content);
    };

    useEffect(() => {
        if (message.type === 'user' || message.isNewResponse === false) {
            setDisplayedContent(message.content);
            setFullyDisplayed(true);
            return;
        }

        setDisplayedContent('');
        setFullyDisplayed(false);

        const contentLength = message.content.length;
        let charsPerInterval = 1;
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
                        className="bot-content markdown-body"
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
