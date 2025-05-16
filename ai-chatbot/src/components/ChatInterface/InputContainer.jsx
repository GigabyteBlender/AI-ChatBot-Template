import React, { useState, useContext, useRef, useEffect } from 'react';
import { ChatContext } from '../../contexts/ChatContext';
import './styles/InputContainer.css';

const InputContainer = () => {
    const [input, setInput] = useState('');
    const [files, setFiles] = useState([]);
    const { sendChatMessage, loading } = useContext(ChatContext);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-resize textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px'; // Reset height
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = Math.min(200, Math.max(0, scrollHeight)) + 'px'; // Min height 80px, Max height 200px
        }
    }, [input]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((input.trim() || files.length > 0) && !loading) {
            sendChatMessage(input.trim(), files);
            setInput('');
            setFiles([]);

            // Reset height after sending
            if (textareaRef.current) {
                textareaRef.current.style.height = '0px';
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFileUpload = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    };

    const removeFile = (indexToRemove) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="input-container-wrapper">
            <div className="input-container">
                <div className="textarea-wrapper">
                    {/* File previews */}
                    {files.length > 0 && (
                        <div className="file-previews">
                            {files.map((file, index) => (
                                <div key={index} className="file-preview">
                                    <span className="file-name">{file.name}</span>
                                    <button 
                                        className="remove-file-btn" 
                                        onClick={() => removeFile(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <textarea
                        id="userInput"
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Reply..."
                        rows="1"
                        disabled={loading}
                    />
                </div>
                
                {/* Separated action buttons container */}
                <div className="input-actions-container">
                    <div className="input-actions">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            multiple 
                            onChange={handleFileUpload} 
                            style={{ display: 'none' }}
                        />
                        <button 
                            className="attach-btn" 
                            onClick={() => fileInputRef.current.click()}
                            title="Attach files"
                            disabled={loading}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 10.5V6C21 4.34315 19.6569 3 18 3H6C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M15 14L12 11L9 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        
                        <button
                            id="submitBtn"
                            onClick={handleSubmit}
                            disabled={(!input.trim() && files.length === 0) || loading}
                            className={(input.trim() || files.length > 0) ? 'visible' : ''}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div className="input-footer">
                    <p className="disclaimer">Chatbot can make mistakes. Consider checking important information.</p>
                </div>
            </div>
        </div>
    );
};

export default InputContainer;