# AI Chatbot Interface in JavaScript

## Project Overview

This project is a modern web-based chat interface that integrates with AI services through the OpenRouter API. The interface includes multiple interaction modes, a persistent chat history feature, and a customizable settings panel. It provides a complete chat application experience with all the features you would need.

## Key Components

### Core Files
* **`index.html`**: Main HTML structure for the chat interface, including sidebar, chat display area, and controls
* **`style.css`**: Comprehensive styling for the entire application with responsive design and theme support
* **`script.js`**: Core application logic including message handling, UI interactions, and API communication. Also formats all the chats
* **`config.js`**: Configuration file for API keys and development utilities
* **`settings.html`**: Settings interface with adjustable parameters for the chat experience
* **`settings.js`**: JavaScript for handling settings functionality and preferences

### Services
* **`services/apiService.js`**: Manages API interactions with OpenRouter
* **`services/uiService.js`**: Handles UI-related functionality
* **`services/chatHistoryService.js`**: Manages persistent chat history functionality

## Features

### User Interface
* Responsive design that works across desktop and mobile devices
* Collapsible sidebar for chat history navigation
* Real-time message display with customizable typing animation
* default dark colour scheme
* Message input area with support for shift+enter for line breaks

### Current Interface:
![Photo](assets/example.jpg)

### Chat Functionality
* Persistent chat history stored in local storage
* Converts the chats from mark down to html for correct format
* code is now kept in code-spaces where you are able to copy it easily
* Multiple conversation management
* Option to clear current chat

### API Integration
* Integration with OpenRouter API for AI model access
* Support for different AI models including Gemini, Deepseek and many others
* Random response mode for application testing without API consumption
* Configurable temperature setting for response creativity

### Settings
* Adjustable typing speed for bot responses
* Controllable response creativity through temperature setting 
* Model selection options. Current models to choose from:

```text
Gemini 2.0 Flash,
DeepSeek R1 Zero,
Rogue Rose v0.2,
DeepSeek V3,
Dolphin3.0 Mistral
```

## Configuration

To configure the application:

1. Create a `config.js` file in the root directory with your API keys:

```javascript
// config.js - Environment variables should be used instead of hardcoding
export const config = {
    // Use environment variables or a secure method to store API keys
    OPENROUTER_API_KEY: 'your-api-key-here'
};

// For development testing only, never use this in production
export const getTestKey = () => {
    console.warn("Using test key - not for production use");
    return sessionStorage.getItem('temp_dev_key') || '';
};
```

2. Update the model selection in `settings.html` if needed to match your preferred AI models.

## Security Considerations

* The current implementation includes API keys directly in the code, which should be avoided in production
* For a production deployment, implement proper API key management using environment variables
* Consider adding authentication for user-specific chat histories

## Future Improvements

* Add user authentication for personalized experiences
* Implement database for chat history (currently using local storage)
* Add support for file uploads and attachments
* Implement conversation summarization
* Add export functionality for chat logs
