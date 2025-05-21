import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SettingsContext } from './SettingsContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
	const [messages, setMessages] = useState([]);
	const [chatHistory, setChatHistory] = useState([]);
	const [currentChatId, setCurrentChatId] = useState(null);
	const [loading, setLoading] = useState(false);
	const isInitializing = useRef(true);

	const { settings } = useContext(SettingsContext);

	// Initial load of chat history and handling first-time setup
	useEffect(() => {
		// Load chat history from localStorage
		const storedHistory = localStorage.getItem('chatHistory');
		const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
		
		if (parsedHistory.length > 0) {
			// If we have chat history, load it and set current chat to the most recent one
			setChatHistory(parsedHistory);
			const mostRecentChatId = parsedHistory[0].id;
			setCurrentChatId(mostRecentChatId);
			
			// Load messages for the most recent chat
			const storedMessages = localStorage.getItem(`chat_${mostRecentChatId}`);
			if (storedMessages) {
				setMessages(JSON.parse(storedMessages));
			}
		} else {
			// If no chat history, create a new chat
			const newChatId = createInitialChat();
			setCurrentChatId(newChatId);
		}
		
		isInitializing.current = false;
	}, []);

	// This effect handles loading messages when currentChatId changes
	// but ONLY after initialization is complete
	useEffect(() => {
		if (!isInitializing.current && currentChatId) {
			loadChat(currentChatId);
		}
	}, [currentChatId]);

	// Save chat history to localStorage whenever it changes
	useEffect(() => {
		if (chatHistory.length > 0) {
			localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
		}
	}, [chatHistory]);

	// Creates the initial welcome message
	const createWelcomeMessage = () => {
		return {
			id: uuidv4(),
			type: 'bot',
			content: 'Hello! How can I help you today?',
			timestamp: Date.now(),
			isNewResponse: false // Welcome messages are never "new responses"
		};
	};

	// Creates a new chat but doesn't switch to it - used for initialization
	const createInitialChat = () => {
		const newChatId = uuidv4();
		const newChat = {
			id: newChatId,
			title: `Chat ${newChatId.substring(0, 8)}`, // Use a portion of the UUID as initial title
			timestamp: Date.now(),
			preview: 'Start a new conversation'
		};

		const welcomeMessage = createWelcomeMessage();
		
		setChatHistory([newChat]);
		setMessages([welcomeMessage]);
		
		// Save the welcome message to localStorage
		localStorage.setItem(`chat_${newChatId}`, JSON.stringify([welcomeMessage]));
		
		return newChatId;
	};

	const createNewChat = () => {
		const newChatId = uuidv4();
		const newChat = {
			id: newChatId,
			title: `Chat ${newChatId.substring(0, 8)}`, // Use a portion of the UUID as initial title
			timestamp: Date.now(),
			preview: 'Start a new conversation'
		};

		const welcomeMessage = createWelcomeMessage();

		// Update the chat history state with the new chat at the beginning
		setChatHistory(prev => [newChat, ...prev]);
		
		// Set the current chat ID to the new chat
		setCurrentChatId(newChatId);
		
		// Set the welcome message
		setMessages([welcomeMessage]);
		
		// Save the welcome message to localStorage
		localStorage.setItem(`chat_${newChatId}`, JSON.stringify([welcomeMessage]));

		return newChatId;
	};

	const loadChat = (chatId) => {
		if (!chatId) return;
		
		// Set the current chat ID
		setCurrentChatId(chatId);
		
		const storedMessages = localStorage.getItem(`chat_${chatId}`);
		if (storedMessages) {
			// Ensure all messages are marked as not new responses when loading from history
			const parsedMessages = JSON.parse(storedMessages);
			const markedMessages = parsedMessages.map(msg => ({
				...msg,
				isNewResponse: false // Mark all messages as not new when loading from history
			}));
			setMessages(markedMessages);
		} else {
			// If no messages stored (shouldn't happen), create a welcome message
			const welcomeMessage = {
				...createWelcomeMessage(),
				isNewResponse: false
			};
			setMessages([welcomeMessage]);
			localStorage.setItem(`chat_${chatId}`, JSON.stringify([welcomeMessage]));
		}
		
		// Move the selected chat to the top of the chat history
		setChatHistory(prev => {
			// Find the selected chat
			const selectedChat = prev.find(chat => chat.id === chatId);
			// Filter out the selected chat
			const otherChats = prev.filter(chat => chat.id !== chatId);
			// Return a new array with the selected chat at the beginning
			return selectedChat ? [selectedChat, ...otherChats] : prev;
		});
	};

	const addMessage = (content, type = 'user', isNewResponse = false) => {
		if (!currentChatId) return null;
		
		const newMessage = {
			id: uuidv4(),
			type,
			content,
			timestamp: Date.now(),
			isNewResponse // Use the provided isNewResponse flag
		};

		// Update messages state
		setMessages(prev => {
			const updatedMessages = [...prev, newMessage];
			
			// Save messages to localStorage
			// IMPORTANT: When saving to localStorage, mark the message as not new
			const messagesToSave = updatedMessages.map(msg => ({
				...msg,
				isNewResponse: false // Always save messages with isNewResponse as false
			}));
			localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(messagesToSave));
			
			return updatedMessages;
		});

		// Update chat preview in history if it's a user message
		if (type === 'user') {
			updateChatPreview(currentChatId, content);
			
			// If this is the first user message, use it to name the chat
			const currentMessages = messages;
			if (currentMessages.length === 1 && currentMessages[0].type === 'bot') {
				updateChatTitle(currentChatId, content);
			}
		}

		return newMessage;
	};
	
	const updateChatTitle = (chatId, content) => {
		// Create a title from the first few words of the first user message
		const titleWords = content.split(' ').slice(0, 4).join(' ');
		const title = titleWords + (content.split(' ').length > 4 ? '...' : '');
		
		setChatHistory(prev => {
			return prev.map(chat => 
				chat.id === chatId ? { ...chat, title } : chat
			);
		});
	};

	const updateChatPreview = (chatId, preview) => {
		setChatHistory(prev => {
			const updatedHistory = prev.map(chat =>
				chat.id === chatId
					? { 
						...chat, 
						preview: preview.substring(0, 30) + (preview.length > 30 ? '...' : ''), 
						timestamp: Date.now() 
					}
					: chat
			);
			
			// Move the updated chat to the top of the list
			const updatedChat = updatedHistory.find(chat => chat.id === chatId);
			const otherChats = updatedHistory.filter(chat => chat.id !== chatId);
			
			return [updatedChat, ...otherChats];
		});
	};

	const clearChat = () => {
		if (!currentChatId) return;
		
		const welcomeMessage = {
			...createWelcomeMessage(),
			isNewResponse: false
		};
		
		setMessages([welcomeMessage]);

		// Update localStorage
		localStorage.setItem(`chat_${currentChatId}`, JSON.stringify([welcomeMessage]));

		// Update chat preview and reset title
		updateChatPreview(currentChatId, 'Start a new conversation');
		
		// Reset the chat title to the default format
		setChatHistory(prev => {
			return prev.map(chat => 
				chat.id === currentChatId ? { 
					...chat, 
					title: `Chat ${currentChatId.substring(0, 8)}` 
				} : chat
			);
		});
	};

	const deleteChat = (chatId) => {
		// Remove chat from history
		setChatHistory(prev => {
			const updatedHistory = prev.filter(chat => chat.id !== chatId);
			
			// If we deleted all chats, create a new one
			if (updatedHistory.length === 0) {
				const newChatId = createInitialChat();
				setCurrentChatId(newChatId);
				return [{
					id: newChatId,
					title: 'New Chat',
					timestamp: Date.now(),
					preview: 'Start a new conversation'
				}];
			}
			
			return updatedHistory;
		});

		// Remove chat messages from localStorage
		localStorage.removeItem(`chat_${chatId}`);

		// If current chat was deleted, switch to the first available chat
		if (currentChatId === chatId) {
			setChatHistory(prev => {
				if (prev.length > 0) {
					setCurrentChatId(prev[0].id);
				}
				return prev;
			});
		}
	};

	const sendChatMessage = async (message) => {
		// Add user message
		addMessage(message, 'user', false); // User messages don't need the typewriter effect

		// Set loading state
		setLoading(true);

		try {
			// Get your API key from localStorage
			const apiKey = localStorage.getItem('apiKey') || '';

			if (!apiKey) {
				addMessage("Please add your API key in settings.", 'bot', true); // Error messages should appear immediately
				setLoading(false);
				return;
			}

			// Get the model from settings
			const selectedModel = settings.api.model;

			// Prepare the conversation history - limit to last 10 messages to avoid token limit issues
			const recentMessages = messages.slice(-10).map(msg => ({
				role: msg.type === 'user' ? 'user' : 'assistant',
				content: msg.content
			}));

			// Add the new user message
			recentMessages.push({
				role: 'user',
				content: message
			});

			// Prepare the API request payload for OpenRouter
			const payload = {
				model: selectedModel,
				messages: recentMessages,
				temperature: settings.chat.temperature || 0.7,
				max_tokens: 2000  // Increase max tokens to handle longer responses
			};

			// Make the API request to OpenRouter
			const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${apiKey}`,
					'HTTP-Referer': window.location.origin, // Required by OpenRouter
					'X-Title': 'Chat Application' // Optional for OpenRouter rankings
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("API Error Response:", errorData);
				throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
			}

			const data = await response.json();

			// Extract the assistant's response, with improved error handling
			if (data.choices && data.choices.length > 0 && data.choices[0].message) {
				const assistantResponse = data.choices[0].message.content;
				// Add the bot's response to the chat, marking it as a new response to enable the typewriter effect
				addMessage(assistantResponse, 'bot', true); // Set isNewResponse to true for fresh API responses
			} else {
				// Handle the case where the response structure is unexpected
				console.error("Unexpected API response structure:", data);
				addMessage("I'm sorry, but I received an unexpected response format. Please try again.", 'bot', true);
			}
		} catch (error) {
			console.error("API Error:", error);
			
			// Create a user-friendly error message
			let errorMessage = "An error occurred while processing your request.";
			if (error.message) {
				errorMessage = error.message;
			}
			
			addMessage(`Error: ${errorMessage}`, 'bot', true); // Error messages should appear immediately
		} finally {
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