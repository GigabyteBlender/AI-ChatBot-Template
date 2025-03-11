import {config} from './config.js';

// Function to call the AI API using OpenRouter

async function callAI(prompt) {
    const MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'; //OpenRouter API Endpoint

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: "user", content: prompt }],
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check for a valid response and extract the message content
        if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
            return data.choices[0].message.content;
        } else {
            console.error('Unexpected API response format:', data);
            return "Sorry, I couldn't understand the response.";
        }

    } catch (error) {
        console.error('Error calling AI API:', error);
        return "Sorry, I encountered an error. Please try again.";
    }
}

// Generating a random response
function getRandomResponse() {
    const randomResponses = [
        "I'm not sure about that.",
        "Can you tell me more?",
        "That's interesting!",
        "Let me think about it...",
        "I don't have an answer for that right now.",
        "Why do you ask?",
        "That's a great question!",
        "Hmm... I'm not sure."
    ];
    const randomIndex = Math.floor(Math.random() * randomResponses.length);
    return randomResponses[randomIndex];
}

// Function to add a message to the chat container
function addMessage(content, sender) {
    const chatContainer = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = content;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Apply dark mode class if necessary
    if (document.body.classList.contains('dark-mode')) {
        messageDiv.classList.add('dark-mode');
    }
}

// Main function to handle user input and bot response
async function handleSubmit() {
    const userInput = document.getElementById('userInput');
    const userMessage = userInput.value.trim();

    if (userMessage) {
        addMessage(userMessage, 'user');
        userInput.value = '';

        const mode = document.getElementById('mode').value;
        let botResponse;

        if (mode === 'api') {
            botResponse = await callAI(userMessage);
        } else if (mode === 'random') {
            botResponse = getRandomResponse();
        }

        addMessage(botResponse, 'bot');
    }
}

// Event listeners
document.getElementById('submitBtn').addEventListener('click', handleSubmit);

document.getElementById('userInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
    }
});

document.getElementById('settingsBtn').addEventListener('click', () => {
    window.location.href = 'settings.html';
});

// Function to apply dark mode to elements
function applyDarkMode() {
  const elements = [
    document.getElementById('chat-container'),
    document.getElementById('input-container'),
    document.getElementById('userInput'),
    document.getElementById('mode-selector'),
    document.getElementById('mode'),
    document.getElementById('settingsBtn'),
  ];

  elements.forEach(element => {
    if (element) {
      element.classList.toggle('dark-mode', document.body.classList.contains('dark-mode'));
    }
  });
}

// Load saved theme on initial load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');

    // Apply dark mode to necessary elements
    applyDarkMode();
});
