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
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    // Add text content
    messageDiv.textContent = content;

    // Append to chat container
    chatContainer.appendChild(messageDiv);

    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Main function to handle user input and bot response
async function handleSubmit() {
    const userInput = document.getElementById('userInput');
    
    // Add user message
    const userMessage = userInput.value.trim();
    
    if (userMessage) {
        addMessage(userMessage, 'user');
        userInput.value = ''; // Clear input field
        
        // Determine which mode is selected
        const mode = document.getElementById('mode').value;

        if (mode === 'api') {
            // Use API mode
            const botResponse = await callAI(userMessage);
            addMessage(botResponse, 'bot');
        } else if (mode === 'random') {
            // Use Random Bot mode
            const botResponse = getRandomResponse();
            addMessage(botResponse, 'bot');
        }
    }
}

// Theme toggle functionality
const themeToggleBtn = document.getElementById('themeToggleBtn');
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    // Add dark mode class to necessary elements
    const elements = [
        document.getElementById('chat-container'),
        document.getElementById('input-container'),
        document.getElementById('userInput'),
        document.getElementById('submitBtn'),
        document.getElementById('mode-selector'),
        document.getElementById('mode'),
        themeToggleBtn
    ];

    elements.forEach(element => {
        element.classList.toggle('dark-mode');
    });

    // Get all messages and toggle dark mode class
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        message.classList.toggle('dark-mode');
    });

    // Update button text based on current theme
    if (document.body.classList.contains('dark-mode')) {
        themeToggleBtn.textContent = 'Switch to Light Mode';
    } else {
        themeToggleBtn.textContent = 'Switch to Dark Mode';
    }
});

// Event listener for the submit button
document.getElementById('submitBtn').addEventListener('click', handleSubmit);

// Optional - Allow pressing "Enter" to send a message
document.getElementById('userInput').addEventListener('keypress', (event) => {
   if (event.key === 'Enter' && !event.shiftKey) {
       event.preventDefault();
       handleSubmit();
   }
});
