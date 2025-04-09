# AI Chatbot Interface in JavaScript

## Project Overview

This project is a modern web-based chat interface that integrates with AI services through the OpenRouter API. The interface includes multiple interaction modes, a persistent chat history feature, and a customizable settings panel. It provides a complete chat application experience with all the features you would need.

# AI Chatbot Interface

![Chat Interface Example](img/example.jpg)

## Overview

A comprehensive web-based chat interface that integrates with AI services through OpenRouter API. This application provides a professional, responsive interface with multiple AI models, persistent chat history, and customizable settings.

## Features

### 🚀 Core Functionality
- **Multiple AI Model Support**: Connect to various AI models including Gemini, DeepSeek, Rogue Rose, and more
- **Persistent Chat History**: Conversations saved to both local storage and database
- **Multi-chat Management**: Create and manage multiple conversations
- **User Authentication**: Register and login to access your chats across devices

### 💎 User Experience
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Collapsible Sidebar**: Toggle chat history panel for more screen space
- **Markdown Rendering**: Beautiful formatting for AI responses including:
  - Syntax-highlighted code blocks with copy button
  - Tables, lists, blockquotes, and other formatting
  - Headers and text styling

### ⚙️ Advanced Options
- **Customizable Settings**:
  - Adjust display speed for bot responses
  - Auto clearing chat option
  - Storage limit for chats
  - Buttons for importing and exporting a .json with your settings
  - Context length for how many conversation are included in api call
  - Control response creativity via temperature setting
  - Select from multiple AI models
- **API Monitoring**: Cancel in-progress requests when needed
- **Development Mode**: Test with random responses to save API usage

## Project Structure

Frontend
```
app/
├── assets/
│   ├── example.jpg          # Example image asset
│   ├── icon.png             # Application icon
│   └── sidebar-icon.png     # Sidebar icon
├── css/
│   └── style.css            # Styling for the application
├── html/
│   ├── auth.html            # Authentication page
│   ├── index.html           # Main application page
│   └── settings.html        # Settings page
├── js/
│   ├── services/
│   │   ├── apiService.js        # API integration logic
│   │   ├── authService.js       # Authentication service logic
│   │   ├── chatHistoryService.js # Chat history management
│   │   ├── markdownService.js   # Markdown processing logic
│   │   └── uiService.js         # UI rendering and interactions
│   ├── src/
│   │   ├── auth.js              # Authentication-related scripts
│   │   ├── script.js            # Core application logic
│   │   └── settings.js          # Settings management

```
Backend
```
backend/
├── instance/                 # Backend instance folder (possibly for Flask configuration)
├── app.log                   # Log file for backend operations
├── config.js                 # Backend configuration file
```
Project Metadata
```
├── .gitignore                # Git ignored files configuration
├── LICENSE                   # License information for the project
├── README.md                 # Project documentation
├── SECURITY.md               # Security guidelines and policies
```
## Getting Started

### Prerequisites
- Web server for hosting the frontend application
- Python 3.7+ for the backend server
- OpenRouter API key
- SQLite (default) or PostgreSQL database

### Installation

#### Frontend Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-chatbot-interface.git
   cd ai-chatbot-interface
   ```

2. Create a `config.js` file with your API keys:
   ```javascript
   export const config = {
       OPENROUTER_API_KEY: 'your-api-key-here'
   };

   export const DatabaseUrl = {
       API_URL: 'base-databse-url-here/api'  // Update with your backend URL
   }
   // For development only
   export const getTestKey = () => {
       console.warn("Using test key - not for production use");
       return sessionStorage.getItem('temp_dev_key') || '';
   };
   ```

3. Deploy the files to your web server or run locally with a development server.

#### Backend Setup

1. Install Python dependencies:
   ```
   pip install flask flask-cors flask-sqlalchemy pyjwt werkzeug
   ```

2. Configure environment variables (optional):
   ```
   export DATABASE_URL="postgresql://username:password@localhost/dbname"  # Default is SQLite
   export SECRET_KEY="your-secret-key-here"  # For JWT token generation
   ```

3. Run the backend server:
   ```
   python database.py
   ```

## Database Features

The application uses a Flask backend (`database.py`) with SQLAlchemy to provide:

- **User Authentication**: Register and login with username/email/password
- **JWT Token Authentication**: Secure API access with JWT tokens
- **Chat Persistence**: Store and retrieve chat history from the database
- **User Settings**: Personalized settings stored per user
- **Auto-Clear Functionality**: Automatically remove old chats based on user preferences
- **Storage Limits**: Control the number of stored chats per user
- **Password Reset**: Request password reset via email (implementation ready)
- **Logging**: Currently has a logging deature which shows in detail all access and data sent in and out of database for development purposes. is written to a file called app.log. Can be easily removed if needed.

### Database Models

- **User**: Stores user credentials and authentication information
- **Chat**: Contains chat metadata (title, preview, timestamp)
- **Message**: Individual messages within chats
- **Setting**: User-specific application settings

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Create a new user account |
| `/api/login` | POST | Authenticate and get JWT token |
| `/api/user` | GET | Retrieve current user information |
| `/api/request-reset` | POST | Request a password reset |
| `/api/reset-password` | POST | Reset password with a valid token |
| `/api/settings` | GET | Retrieve user settings |
| `/api/settings` | POST | Update user settings |
| `/api/chats` | GET | Get all user chats |
| `/api/chats/sorted` | GET | Get chats sorted by timestamp with messages |
| `/api/chats/<chat_id>` | GET | Get a specific chat with messages |
| `/api/chats` | POST | Save or update a chat |
| `/api/chats/<chat_id>` | DELETE | Delete a specific chat |
| `/api/chats` | DELETE | Clear all user chats |
| `/api/generate-chat-id` | GET | Generate a unique chat ID |

### Security Considerations
- User passwords are hashed using Werkzeug's security functions
- JWT tokens are used for API authentication with expiration
- Request validation is implemented for all endpoints
- API routes are protected with a token_required decorator
- Password reset functionality follows security best practices

## Usage

### Chat Interface
- Type messages in the input field and press Enter or click Send
- Use Shift+Enter for multi-line messages
- Toggle the sidebar using the button on the left
- Start new conversations with the "New Chat" button
- Log in to access your chats from any device

### Settings
Access settings by clicking the gear icon to:
- Select your preferred AI model
- Adjust response temperature (creativity)
- Set typing animation speed
- Choose between API and random response modes
- Configure auto-clear and storage limit options

## Available AI Models

Currently supported models include:
```
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
- **Flask Backend**: Provides user authentication and database storage

### Security Considerations
- The app uses both client-side storage and server-side database
- User passwords are hashed using Werkzeug's security functions
- JWT tokens are used for API authentication
- API keys should be properly managed using environment variables in production
- Input sanitization is implemented to prevent XSS attacks

## Deployment

### Frontend
- Can be deployed to any static web hosting service (Netlify, Vercel, GitHub Pages)
- Update the config.js with your key and the database url

### Backend
- Deploy to a server that supports Python (Heroku, DigitalOcean, AWS, etc.)
- Set up environment variables for production:
  - `DATABASE_URL`: Connection string for your production database
  - `SECRET_KEY`: Secure random string for JWT token signing

## Roadmap

Planned improvements:
- Enhanced user authentication with password reset
- File upload and attachment support
- Conversation summarization
- Chat export functionality
- Extended model selection options
- User profile management
- Chat sharing capabilities

## License

This project is licensed under the MIT License - see the LICENSE file for details.
