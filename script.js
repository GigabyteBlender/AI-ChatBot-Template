// script.js

// Simulating an AI API call
async function callAI(prompt) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`AI response to "${prompt}"`);
        }, 1000);
    });
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
    document.getElementById('body'),
    document.getElementById('mode'),
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
