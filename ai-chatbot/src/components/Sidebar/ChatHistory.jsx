// src/components/Sidebar/ChatHistory.jsx
import React, { useContext } from 'react';
import { ChatContext } from '../../contexts/ChatContext';
import './styles/ChatHistory.css';

const ChatHistory = ({ isMobile, toggleSidebar }) => {
	const { chatHistory, loadChat, deleteChat, currentChatId } = useContext(ChatContext);

	const handleChatClick = (chatId) => {
		loadChat(chatId);
		if (isMobile) {
			toggleSidebar();
		}
	};

	const handleDeleteChat = (e, chatId) => {
		e.stopPropagation();
		if (window.confirm('Are you sure you want to delete this chat?')) {
			deleteChat(chatId);
		}
	};

	const formatDate = (timestamp) => {
		const date = new Date(timestamp);
		return date.toLocaleDateString();
	};

	return (
		<div className="chat-history">
			<h3>Recent Chats</h3>
			{chatHistory.length === 0 ? (
				<p className="no-chats">No chat history yet</p>
			) : (
				<ul id="chat-history-list">
					{chatHistory.map(chat => (
						<li
							key={chat.id}
							className={`chat-history-item ${currentChatId === chat.id ? 'active' : ''}`}
							onClick={() => handleChatClick(chat.id)}
						>
							<div className="chat-info">
								<span className="chat-title">{chat.title}</span>
								<span className="chat-preview">{chat.preview}</span>
								<span className="chat-date">{formatDate(chat.timestamp)}</span>
							</div>
							<button
								className="delete-chat-btn"
								onClick={(e) => handleDeleteChat(e, chat.id)}
								aria-label="Delete chat"
							>
								×
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default ChatHistory;