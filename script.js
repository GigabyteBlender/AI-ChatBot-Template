// Description: This script file contains the main functionality for the chat application.
// It includes functions to call the OpenAI API, generate random responses, add messages to the chat interface,
// handle user input submission, and apply dark mode to the chat elements.
// The script also initializes the chat application by setting up event listeners and applying the saved theme and mode.

import { config } from './config.js';

// Check if the OPENROUTER_API_KEY is available, if not, provide a warning.
if (!config || !config.OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY is not set in config.js. The API mode will not work.");
}

/**
 * Calls the OpenRouter AI API to generate a response based on the user's prompt.
 * @async
 * @function callAI
 * @param {string} prompt - The user's input message.
 * @returns {Promise} The AI's response or an error message.
 */
async function callAI(prompt, temp) {
    const MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    try {
        if (!config.OPENROUTER_API_KEY) {
            throw new Error("API key is missing. Please set it in config.js.");
        }

        const messages = [
            {
                role: "system",
                temperature: temp,
                content: "You are a helpful assistant. Please respond to questions as concisely as possible. Aim for short, direct but informative answers."
            },
            { role: "user", content: prompt }
        ];

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: messages,
            }),
        });
        if (!response.ok) {
            //Improved error message
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
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

/**
 * Provides a random response from a predefined list.
 * @function getRandomResponse
 * @returns {string} A random response string.
 */
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

/**
 * Adds a message to the chat container with the appropriate styling and typing animation.
 * @async
 * @function addMessage
 * @param {string} content - The message content.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 */
async function addMessage(content, sender) {
    const chatContainer = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    // Create a span to hold the animated text
    const textSpan = document.createElement('span');
    messageDiv.appendChild(textSpan);

    chatContainer.appendChild(messageDiv);
    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;
    // Apply dark mode class if necessary
    if (document.body.classList.contains('dark-mode')) {
        messageDiv.classList.add('dark-mode');
    }

    // Function to simulate typing animation
    async function typeWriter(text, element) {

        return new Promise((resolve) => {
            let i = 0;
            function type() {

                const delay = localStorage.getItem('speed') || 20;

                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, delay);
                } else {
                    resolve(); // Resolve the promise when typing is complete
                }
            }
            type();
        });
    }

    // If the sender is the bot, start the typing animation
    if (sender === 'bot') {
        await typeWriter(content, textSpan);
    } else {
        textSpan.textContent = content; // Directly set the user's message
    }
}

/**
 * Handles the submission of user input, retrieves the bot's response, and updates the chat interface.
 * @async
 * @function handleSubmit
 */
async function handleSubmit() {
    
    const userInput = document.getElementById('userInput');
    const userMessage = userInput.value.trim();
    const submitBtn = document.getElementById('submitBtn');

    //temp of AI response
    const temperature = localStorage.getItem('temperature') || 1.0;

    if (userMessage) {
        addMessage(userMessage, 'user');
        userInput.value = '';

        // Disable the submit button
        submitBtn.disabled = true;

        const mode = document.getElementById('mode').value;
        let botResponse;

        if (mode === 'api') {
            botResponse = await callAI(userMessage, temperature.value);
        } else if (mode === 'random') {
            botResponse = getRandomResponse();
        } else {
            botResponse = "Please select a valid mode.";
        }

        await addMessage(botResponse, 'bot');

        // Re-enable the submit button after the bot's response is added
        submitBtn.disabled = false;
    }
}

/**
 * If the clear button is clicked, clear the chat container.
 */
const clearBtn = document.getElementById('clearBtn');
clearBtn.addEventListener('click', () => {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
});

/**
 * Applies or removes dark mode from specified elements.
 * @function applyDarkMode
 */
function applyDarkMode() {
    const elements = [
        document.getElementById('chat-container'),
        document.getElementById('input-container'),
        document.getElementById('userInput'),
        document.getElementById('mode-selector'),
        document.getElementById('mode'),
        document.getElementById('settingsBtn'),
        document.getElementById('clearBtn'),
        document.getElementById('sidebar')
    ];

    for (let i = 0; i < document.getElementsByClassName('side-button').length; i++) {
        elements.push(document.getElementsByClassName('side-button')[i]);
    }
    
    elements.forEach(element => {
        if (element) {
            element.classList.toggle('dark-mode', document.body.classList.contains('dark-mode'));
        }
    });
}

/**
 * Initializes the chat application by setting up event listeners and applying the saved theme.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    applyDarkMode(); // Apply initial dark mode

    // Load saved mode or default to 'api'
    const savedMode = localStorage.getItem('mode') || 'api';
    document.getElementById('mode').value = savedMode;

    // Event listener for sending a message on clicking the submit button
    document.getElementById('submitBtn').addEventListener('click', handleSubmit);

    // Event listener for sending a message on pressing 'Enter' (without shift key)
    document.getElementById('userInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default action (new line)
            handleSubmit(); // Submit the message
        }
    });

    // Event listener to navigate to the settings page
    document.getElementById('settingsBtn').addEventListener('click', () => {
        window.location.href = 'settings.html';
    });

    // Event listener to save the selected mode when it changes
    document.getElementById('mode').addEventListener('change', (event) => {
        localStorage.setItem('mode', event.target.value);
    });
});