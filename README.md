# AI Chatbot Interface in JavaScript

## Project Overview

This project is a simple web-based chat interface that demonstrates how to integrate a basic AI interaction into a website using JavaScript. It includes two modes: an API mode that simulates calls to an AI service and a random response mode for quick testing and prototyping. The interface also includes a light/dark mode toggle for enhanced user experience.

## Key Components

*   **`index.html`**: The main HTML file that sets up the structure of the chat interface, including the input field, chat display area, mode selector, and theme toggle button as well as some other feautures.
*   **`style.css`**: The CSS file that styles the chat interface, providing a visually appealing layout and handling the light/dark mode switch.
*   **`script.js`**: The JavaScript file that contains the logic for handling user input and simulating AI responses. Currently also has a local storage function so that the theme and what model you are using is saved
*   **`config.js`**: The JavaScript file that holds any private keys
*   **`settingscript.js`**: The JavaScript file that handles all the settings in the settings window
*   **`settings.html`**: The settings HTML file that sets up a basic settings menu. Currently has the temperature for the AI response, how fast the text is displayed in the chat container, and also a button to change between light and dark theme for the website.

## Learning Objectives

Through this project, I learned:

*   How to create a dynamic web interface using HTML, CSS, and JavaScript.
*   How to handle user input and update the DOM (Document Object Model) in real-time.
*   How to simulate asynchronous API calls using `async/await` and Promises.
*   How to implement a basic light/dark mode toggle using CSS classes and JavaScript.
*   How to modularize JavaScript code for better maintainability and reusability.

## Use Cases

This project can be used as a starting point for:

*   Building a more complex chatbot interface.
*   Integrating AI services into web applications.
*   Creating interactive tutorials or demos.
*   Experimenting with different UI/UX designs for chat interfaces.

## Config Setup

Create a file called `config.js` and add the following:

```javascript
export const config = {
    OPENROUTER_API_KEY : 'YOUR API KEY HERE'
};
```