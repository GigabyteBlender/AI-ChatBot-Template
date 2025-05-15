import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ChatContext } from '../../contexts/ChatContext';
import ChatHistory from './ChatHistory';
import SidebarFooter from './SidebarFooter';
import './styles/Sidebar.css';
import openSidebarIcon from './images/sidebar-button-open.png';  // Import your open sidebar icon
import closeSidebarIcon from './images/sidebar-button-closed.png'; // Import your close sidebar icon

const Sidebar = ({ isMobile, sidebarOpen, toggleSidebar }) => {
	const { currentUser, logout } = useContext(AuthContext);
	const { createNewChat } = useContext(ChatContext);
	const navigate = useNavigate();

	const handleNewChat = () => {
		createNewChat();
		if (isMobile) {
			toggleSidebar();
		}
	};

	const handleAuthClick = () => {
		if (currentUser) {
			if (window.confirm('Are you sure you want to log out?')) {
				logout();
			}
		} else {
			navigate('/auth');
		}
	};

	return (
		<>
			{/* Sidebar Toggle Button - with images */}
			<button
				className={`sidebar-toggle-button ${isMobile ? 'mobile' : 'desktop'} ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
				onClick={toggleSidebar}
				aria-label="Toggle sidebar"
			>
				<img 
					src={sidebarOpen ? closeSidebarIcon : openSidebarIcon} 
					alt={sidebarOpen ? "Close sidebar" : "Open sidebar"} 
					className="sidebar-toggle-icon" 
				/>
			</button>
			
			{/* Overlay for closing sidebar on mobile */}
			{isMobile && sidebarOpen && (
				<div
					className="sidebar-overlay"
					onClick={toggleSidebar}
					aria-hidden="true"
				/>
			)}
			
			<div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
				<h1>AI Chatbot</h1>
				<button className="side-button new-chat" onClick={handleNewChat}>
					New Chat
				</button>

				<ChatHistory isMobile={isMobile} toggleSidebar={toggleSidebar} />

				<button
					id="auth-button"
					className="side-button auth-button"
					onClick={handleAuthClick}
				>
					{currentUser ? 'Logout' : 'Login / Register'}
				</button>

				<SidebarFooter />
			</div>
		</>
	);
};

export default Sidebar;