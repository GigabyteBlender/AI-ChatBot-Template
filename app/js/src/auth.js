import { AuthService } from '../../services/authService.js';

class AuthPage {
    constructor() {
        this.authService = new AuthService();
        
        // Check if user is already logged in
        if (this.authService.isLoggedIn()) {
            // Redirect back to the main page if already logged in
            window.location.href = 'index.html';
        }
        
        // Initialize UI elements
        this.initElements();
        this.attachEventListeners();
        
        // Check if we have a reset token in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const resetToken = urlParams.get('token');
        if (resetToken) {
            this.showResetPasswordForm(resetToken);
        }
    }
    
    /**
     * Initialize UI elements
     */
    initElements() {
        // Tab elements
        this.loginTab = document.getElementById('login-tab');
        this.registerTab = document.getElementById('register-tab');
        
        // Form containers
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.resetForm = document.getElementById('reset-form');
        
        // Login form elements
        this.loginEmail = document.getElementById('login-email');
        this.loginPassword = document.getElementById('login-password');
        this.loginButton = document.getElementById('login-button');
        this.forgotPassword = document.getElementById('forgot-password');
        this.loginMessage = document.getElementById('login-message');
        
        // Register form elements
        this.registerUsername = document.getElementById('register-username');
        this.registerEmail = document.getElementById('register-email');
        this.registerPassword = document.getElementById('register-password');
        this.registerConfirm = document.getElementById('register-confirm');
        this.registerButton = document.getElementById('register-button');
        this.registerMessage = document.getElementById('register-message');
        
        // Reset password form elements
        this.resetEmail = document.getElementById('reset-email');
        this.resetButton = document.getElementById('reset-button');
        this.backToLogin = document.getElementById('back-to-login');
        this.resetMessage = document.getElementById('reset-message');
    }
    
    /**
     * Attach event listeners to UI elements
     */
    attachEventListeners() {
        // Tab switching
        this.loginTab.addEventListener('click', () => this.switchTab('login'));
        this.registerTab.addEventListener('click', () => this.switchTab('register'));
        
        // Form submissions
        this.loginButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        this.registerButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        // Password reset
        this.forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPasswordResetForm();
        });
        
        this.resetButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handlePasswordResetRequest();
        });
        
        this.backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab('login');
        });
        
        // Enter key for form submission
        this.loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleLogin();
            }
        });
        
        this.registerConfirm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleRegister();
            }
        });
        
        this.resetEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handlePasswordResetRequest();
            }
        });
    }
    
    /**
     * Switch between login and register tabs
     * @param {string} tab - The tab to switch to ('login' or 'register')
     */
    switchTab(tab) {
        // Hide all forms
        this.loginForm.classList.remove('active');
        this.registerForm.classList.remove('active');
        this.resetForm.classList.remove('active');
        
        // Remove active class from all tabs
        this.loginTab.classList.remove('active');
        this.registerTab.classList.remove('active');
        
        // Set active tab and form
        if (tab === 'login') {
            this.loginTab.classList.add('active');
            this.loginForm.classList.add('active');
        } else if (tab === 'register') {
            this.registerTab.classList.add('active');
            this.registerForm.classList.add('active');
        } else if (tab === 'reset') {
            this.resetForm.classList.add('active');
        }
        
        // Clear any error messages
        this.clearMessages();
    }
    
    /**
     * Clear all error/success messages
     */
    clearMessages() {
        this.loginMessage.textContent = '';
        this.loginMessage.classList.remove('error', 'success');
        
        this.registerMessage.textContent = '';
        this.registerMessage.classList.remove('error', 'success');
        
        this.resetMessage.textContent = '';
        this.resetMessage.classList.remove('error', 'success');
    }
    
    /**
     * Show password reset form
     */
    showPasswordResetForm() {
        this.switchTab('reset');
        
        // Pre-fill email if available
        if (this.loginEmail.value) {
            this.resetEmail.value = this.loginEmail.value;
        }
    }
    
    /**
     * Handle login form submission
     */
    async handleLogin() {
        this.clearMessages();
        
        // Validate form
        const email = this.loginEmail.value.trim();
        const password = this.loginPassword.value;
        
        if (!email || !password) {
            this.showMessage(this.loginMessage, 'Please fill in all fields', 'error');
            return;
        }
        
        // Disable button and show loading state
        this.loginButton.disabled = true;
        this.loginButton.textContent = 'Logging in...';
        
        try {
            const result = await this.authService.login({ email, password });
            
            if (result.success) {
                this.showMessage(this.loginMessage, 'Login successful, redirecting...', 'success');
                
                // Redirect back to main page after short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                this.showMessage(this.loginMessage, result.error, 'error');
                
                // Reset button
                this.loginButton.disabled = false;
                this.loginButton.textContent = 'Login';
            }
        } catch (error) {
            this.showMessage(this.loginMessage, 'An unexpected error occurred', 'error');
            console.error('Login error:', error);
            
            // Reset button
            this.loginButton.disabled = false;
            this.loginButton.textContent = 'Login';
        }
    }
    
    /**
     * Handle register form submission
     */
    async handleRegister() {
        this.clearMessages();
        
        // Validate form
        const username = this.registerUsername.value.trim();
        const email = this.registerEmail.value.trim();
        const password = this.registerPassword.value;
        const confirmPassword = this.registerConfirm.value;
        
        if (!username || !email || !password || !confirmPassword) {
            this.showMessage(this.registerMessage, 'Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage(this.registerMessage, 'Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 8) {
            this.showMessage(this.registerMessage, 'Password must be at least 8 characters long', 'error');
            return;
        }
        
        // Disable button and show loading state
        this.registerButton.disabled = true;
        this.registerButton.textContent = 'Creating account...';
        
        try {
            const result = await this.authService.register({ username, email, password });
            
            if (result.success) {
                this.showMessage(this.registerMessage, 'Registration successful, redirecting...', 'success');
                
                // Redirect back to main page after short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                this.showMessage(this.registerMessage, result.error, 'error');
                
                // Reset button
                this.registerButton.disabled = false;
                this.registerButton.textContent = 'Register';
            }
        } catch (error) {
            this.showMessage(this.registerMessage, 'An unexpected error occurred', 'error');
            console.error('Registration error:', error);
            
            // Reset button
            this.registerButton.disabled = false;
            this.registerButton.textContent = 'Register';
        }
    }
    
    /**
     * Handle password reset request
     */
    async handlePasswordResetRequest() {
        this.clearMessages();
        
        // Validate form
        const email = this.resetEmail.value.trim();
        
        if (!email) {
            this.showMessage(this.resetMessage, 'Please enter your email address', 'error');
            return;
        }
        
        // Disable button and show loading state
        this.resetButton.disabled = true;
        this.resetButton.textContent = 'Sending...';
        
        try {
            const result = await this.authService.requestPasswordReset(email);
            
            if (result.success) {
                this.showMessage(this.resetMessage, 'Password reset link sent to your email', 'success');
                
                // Reset button
                this.resetButton.disabled = false;
                this.resetButton.textContent = 'Send Reset Link';
            } else {
                this.showMessage(this.resetMessage, result.error, 'error');
                
                // Reset button
                this.resetButton.disabled = false;
                this.resetButton.textContent = 'Send Reset Link';
            }
        } catch (error) {
            this.showMessage(this.resetMessage, 'An unexpected error occurred', 'error');
            console.error('Password reset request error:', error);
            
            // Reset button
            this.resetButton.disabled = false;
            this.resetButton.textContent = 'Send Reset Link';
        }
    }
    
    /**
     * Show reset password form with token
     * @param {string} token - The reset token from the URL
     */
    showResetPasswordForm(token) {
        // Create a new form for password reset confirmation
        const resetFormContainer = document.createElement('div');
        resetFormContainer.id = 'reset-confirm-form';
        resetFormContainer.className = 'auth-form';
        
        resetFormContainer.innerHTML = `
            <h2>Set New Password</h2>
            <div class="form-group">
                <label for="new-password">New Password</label>
                <input type="password" id="new-password" required>
                <p class="password-hint">Password must be at least 8 characters long</p>
            </div>
            <div class="form-group">
                <label for="confirm-new-password">Confirm New Password</label>
                <input type="password" id="confirm-new-password" required>
            </div>
            <div class="form-actions">
                <button id="reset-confirm-button" class="auth-submit">Reset Password</button>
            </div>
            <div id="reset-confirm-message" class="auth-message"></div>
        `;
        
        // Replace the reset form with the new form
        this.resetForm.parentNode.replaceChild(resetFormContainer, this.resetForm);
        
        // Get the new elements
        const newPassword = document.getElementById('new-password');
        const confirmNewPassword = document.getElementById('confirm-new-password');
        const resetConfirmButton = document.getElementById('reset-confirm-button');
        const resetConfirmMessage = document.getElementById('reset-confirm-message');
        
        // Add event listener for form submission
        resetConfirmButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Clear any previous messages
            resetConfirmMessage.textContent = '';
            resetConfirmMessage.classList.remove('error', 'success');
            
            // Validate form
            const password = newPassword.value;
            const confirmPassword = confirmNewPassword.value;
            
            if (!password || !confirmPassword) {
                this.showMessage(resetConfirmMessage, 'Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                this.showMessage(resetConfirmMessage, 'Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 8) {
                this.showMessage(resetConfirmMessage, 'Password must be at least 8 characters long', 'error');
                return;
            }
            
            // Disable button and show loading state
            resetConfirmButton.disabled = true;
            resetConfirmButton.textContent = 'Resetting...';
            
            try {
                const result = await this.authService.resetPassword({ token, password });
                
                if (result.success) {
                    this.showMessage(resetConfirmMessage, 'Password reset successful. You can now login with your new password.', 'success');
                    
                    // Redirect to login page after a delay
                    setTimeout(() => {
                        window.location.href = 'auth.html';
                    }, 3000);
                } else {
                    this.showMessage(resetConfirmMessage, result.error, 'error');
                    
                    // Reset button
                    resetConfirmButton.disabled = false;
                    resetConfirmButton.textContent = 'Reset Password';
                }
            } catch (error) {
                this.showMessage(resetConfirmMessage, 'An unexpected error occurred', 'error');
                console.error('Password reset error:', error);
                
                // Reset button
                resetConfirmButton.disabled = false;
                resetConfirmButton.textContent = 'Reset Password';
            }
        });
        
        // Add event listener for Enter key
        confirmNewPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                resetConfirmButton.click();
            }
        });
    }
    
    /**
     * Show a message to the user
     * @param {HTMLElement} element - The message element to update
     * @param {string} message - The message text
     * @param {string} type - The message type ('error' or 'success')
     */
    showMessage(element, message, type) {
        element.textContent = message;
        element.classList.remove('error', 'success');
        element.classList.add(type);
    }
}

// Initialize the auth page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthPage();
});