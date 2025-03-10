// Simulating an AI API call
async function callAI(prompt) {
    // In a real scenario, you'd make an API call to an AI service here
    // For this example, we'll just return a mock response
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`AI response to: "${prompt}"`);
        }, 1000);
    });
}

// Main function to handle user input and AI response
async function handleSubmit() {
    const userInput = document.getElementById('userInput').value;
    const outputDiv = document.getElementById('output');
    
    outputDiv.textContent = 'Generating response...';
    
    try {
        const response = await callAI(userInput);
        outputDiv.textContent = response;
    } catch (error) {
        outputDiv.textContent = 'Error: Unable to generate response';
        console.error('Error:', error);
    }
}

// Event listener for the submit button
document.getElementById('submitBtn').addEventListener('click', handleSubmit);
