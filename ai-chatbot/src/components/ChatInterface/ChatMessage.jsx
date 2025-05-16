import React, { useState, useEffect, useRef } from 'react';
import './styles/ChatMessage.css';
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

const ChatMessage = ({ message, displaySpeed }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [fullyDisplayed, setFullyDisplayed] = useState(false);
    const intervalRef = useRef(null);

    // Configure marked with syntax highlighting
    marked.setOptions({
        breaks: true,
        highlight: function (code, lang) {
            if (lang === 'markdown') {
                return code; // return raw content for markdown to avoid <pre><code>
            }

            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }

            return hljs.highlightAuto(code).value;
        },
    });

    // Convert markdown to sanitized HTML
    const formatContent = (content) => {
        const rawHtml = marked(content);
        return DOMPurify.sanitize(rawHtml);
    };

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (message.type === 'user' || message.isNewResponse === false) {
            setDisplayedContent(message.content);
            setFullyDisplayed(true);
            return;
        }

        setDisplayedContent('');
        setFullyDisplayed(false);

        const contentLength = message.content.length;
        const charsPerInterval = contentLength > 500 ? Math.ceil(contentLength / 500) : 1;

        let index = 0;
        intervalRef.current = setInterval(() => {
            if (index < message.content.length) {
                const nextChunk = message.content.substring(index, index + charsPerInterval);
                setDisplayedContent(prev => prev + nextChunk);
                index += charsPerInterval;
            } else {
                clearInterval(intervalRef.current);
                setFullyDisplayed(true);
            }
        }, displaySpeed);

        return () => clearInterval(intervalRef.current);
    }, [message, displaySpeed]);

    return (
        <div className={`message-row ${message.type}`}>
            <div className="message-content">
                {message.type === 'user' ? (
                    <span className="user-text-content">{displayedContent}</span>
                ) : (
                    <div
                        className="bot-content markdown-body"
                        dangerouslySetInnerHTML={{ __html: formatContent(displayedContent) }}
                    />
                )}
            </div>
        </div>
    );
};

export default ChatMessage;