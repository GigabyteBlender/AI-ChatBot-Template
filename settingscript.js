// settingscript.js

document.getElementById('exitBtn').addEventListener('click', () => {
    window.location.href = 'index.html'; // Navigate back to the main chat window
  });
  
  // Theme toggle functionality
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  
  // Function to apply or remove dark mode from an element
  function toggleDarkModeClass(element) {
    if (element) { // Check if the element exists before toggling the class
      element.classList.toggle('dark-mode');
    }
  }
  
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
  
  // On settings page load, check the saved theme preference
  document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');

      const elements = [
        document.getElementById('settings-wrapper'),
        document.getElementById('exitBtn'),
        document.getElementById('themeToggleBtn')
      ];
      
      elements.forEach(toggleDarkModeClass);
      themeToggleBtn.textContent = 'Switch to Light Mode';
    }
  });
  