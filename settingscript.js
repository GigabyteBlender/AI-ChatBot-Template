// settingscript.js

/**
 * @description Navigates the user back to the main chat window (index.html).
 * This function is attached to the 'click' event of the element with the ID 'exitBtn'.
 */
document.getElementById('exitBtn').addEventListener('click', () => {
  window.location.href = 'index.html'; // Navigate back to the main chat window
});

// Theme toggle functionality
const themeToggleBtn = document.getElementById('themeToggleBtn');

/**
 * @function toggleDarkModeClass
 * @description Applies or removes the 'dark-mode' class from a given element.
 *              If the element does not exist, this function will not throw an error.
 * @param {HTMLElement} element - The HTML element to toggle the 'dark-mode' class on.
 */
function toggleDarkModeClass(element) {
  if (element) { // Check if the element exists before toggling the class
    element.classList.toggle('dark-mode');
  }
}

// Chagning the display speed of the bot output
const speed = document.getElementById('speed');

speed.addEventListener('change', () => {
  localStorage.setItem('speed', speed.value);
});

const temperature = document.getElementById('temperature');

temperature.addEventListener('change', () => {
  localStorage.setItem('temperature', temperature.value);
});

/**
 * @description Event listener for the theme toggle button.
 *              Toggles dark mode on the body and relevant elements,
 *              updates the button text, and saves the theme preference to localStorage.
 */
themeToggleBtn.addEventListener('click', () => {
  // Toggle dark mode on the body
  document.body.classList.toggle('dark-mode');

  // Array of elements to apply/remove dark mode class
  const elements = [
    document.getElementById('settings-wrapper'),
    document.getElementById('exitBtn'),
    document.getElementById('themeToggleBtn'),
  ];

  // Apply/remove dark mode class from each element
  elements.forEach(toggleDarkModeClass);

  // Update button text based on current theme
  if (document.body.classList.contains('dark-mode')) {
    themeToggleBtn.textContent = 'Switch to Light Mode';
    localStorage.setItem('theme', 'dark'); // Save theme preference to localStorage
  } else {
    themeToggleBtn.textContent = 'Switch to Dark Mode';
    localStorage.setItem('theme', 'light'); // Save theme preference to localStorage
  }
});

/**
 * @description Event listener that runs when the DOM is fully loaded.
 *              Checks for a saved theme preference in localStorage and applies it.
 */
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  const temperature = localStorage.getItem('temperature');
  const speed = localStorage.getItem('speed');

  document.getElementById('temperature').value = temperature;
  document.getElementById('speed').value = speed;

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');

    const elements = [
      document.getElementById('settings-wrapper'),
      document.getElementById('exitBtn'),
      document.getElementById('themeToggleBtn')
    ];

    elements.forEach(toggleDarkModeClass);
    themeToggleBtn.textContent = 'Switch to Light Mode';
  } else {
    themeToggleBtn.textContent = 'Switch to Dark Mode'; // Ensure the button is set to dark mode if theme is light or null
  }
});
