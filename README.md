# AI Chatbot Interface in JavaScript

## Project Overview

This project is a modern web-based chat interface that integrates with AI services through the OpenRouter API. The interface includes multiple interaction modes, a persistent chat history feature, and a customizable settings panel. It provides a complete chat application experience with all the features you would need.

# AI Chatbot Interface

![Chat Interface Example](assets/example.jpg)

## Overview

A comprehensive web-based chat interface that integrates with AI services through OpenRouter API. This application provides a professional, responsive interface with multiple AI models, persistent chat history, and customizable settings.

## Features

### 🚀 Core Functionality
- **Multiple AI Model Support**: Connect to various AI models including Gemini, DeepSeek, Rogue Rose, and more
- **Persistent Chat History**: Conversations automatically saved to local storage
- **Multi-chat Management**: Create and manage multiple conversations

### 💎 User Experience
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Collapsible Sidebar**: Toggle chat history panel for more screen space
- **Markdown Rendering**: Beautiful formatting for AI responses including:
  - Syntax-highlighted code blocks with copy button
  - Tables, lists, blockquotes, and other formatting
  - Headers and text styling

### ⚙️ Advanced Options
- **Customizable Settings**:
  - Adjust typing speed for bot responses
  - Control response creativity via temperature setting
  - Select from multiple AI models
- **API Monitoring**: Cancel in-progress requests when needed
- **Development Mode**: Test with random responses to save API usage

## Project Structure

```
├── index.html              # Main application structure
├── style.css               # UI styling with dark mode support
├── script.js               # Core application logic
├── config.js               # API configuration
├── settings.html           # Settings interface
├── settings.js             # Settings management
├── services/
│   ├── apiService.js       # OpenRouter API integration
│   ├── chatHistoryService.js  # History persistence
│   ├── markdownService.js  # Markdown-to-HTML conversion
│   └── uiService.js        # UI rendering and interactions
```

## Getting Started

### Prerequisites
- Web server for hosting the application
- OpenRouter API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-chatbot-interface.git
   cd ai-chatbot-interface
   ```

2. Create a `config.js` file with your API key:
   ```javascript
   export const config = {
       OPENROUTER_API_KEY: 'your-api-key-here'
   };

   // For development only
   export const getTestKey = () => {
       console.warn("Using test key - not for production use");
       return sessionStorage.getItem('temp_dev_key') || '';
   };
   ```

3. Deploy the files to your web server or run locally with a development server.

## Usage

### Chat Interface
- Type messages in the input field and press Enter or click Send
- Use Shift+Enter for multi-line messages
- Toggle the sidebar using the button on the left
- Start new conversations with the "New Chat" button

### Settings
Access settings by clicking the gear icon to:
- Select your preferred AI model
- Adjust response temperature (creativity)
- Set typing animation speed
- Choose between API and random response modes

## Available AI Models

Currently supported models include:
```
- Gemini 2.0 Flash
- DeepSeek R1 Zero
- Rogue Rose v0.2
- DeepSeek V3
- Dolphin3.0 Mistral
```

## Technical Implementation

### Key Components
- **ChatApp**: Core application class that coordinates services
- **ApiService**: Handles API communication with error handling
- **ChatHistoryService**: Manages saving/loading conversations
- **UIService**: Renders messages and manages the interface
- **MarkdownService**: Converts markdown to formatted HTML

### Security Considerations
- The app uses client-side storage for conversations
- API keys should be properly managed using environment variables in production
- Input sanitization is implemented to prevent XSS attacks

## Roadmap

Planned improvements:
- User authentication
- Server-side database for chat history
- File upload and attachment support
- Conversation summarization
- Chat export functionality
- Extended model selection options

## License

This project is licensed under the MIT License - see the LICENSE file for details.