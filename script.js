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

// Event listener for the submit button
document.getElementById('submitBtn').addEventListener('click', handleSubmit);

// Optional - Allow pressing "Enter" to send a message
document.getElementById('userInput').addEventListener('keypress', (event) => {
   if (event.key === 'Enter' && !event.shiftKey) {
       event.preventDefault();
       handleSubmit();
   }
});
