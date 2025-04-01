import { DatabaseUrl } from '../../../config.js';

export class AuthService {
    constructor() {
        this.apiBaseUrl = DatabaseUrl.API_URL;
        this.token = localStorage.getItem('auth_token');
        this.user = null;
        
        // Check if we have a token and try to get user info
        if (this.token) {
            this.getUserInfo();
        }
    }
    
    /**
     * Check if the user is currently logged in
     * @returns {boolean} Whether the user is logged in
     */
    isLoggedIn() {
        return !!this.token;
    }
    
    async login(credentials) {
        // The backend expects username/password, but frontend might be passing email/password
        const loginData = {
            username: credentials.username || credentials.email, // Support both formats
            password: credentials.password
        };
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store the token and user data
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('auth_token', this.token);
                
                // Dispatch an event to notify other components
                document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: this.user }));
                
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error during login' };
        }
    }

    // Fix the register method to match backend expectations
    async register(userData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: userData.username,
                    email: userData.email,
                    password: userData.password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, message: data.message };
                // Note: The backend doesn't return a token on registration, so we should prompt login
            } else {
                return { success: false, error: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Network error during registration' };
        }
    }

    async getUserInfo() {
        if (!this.token) {
            return { success: false, error: 'No authentication token' };
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.user = data;
                return { success: true, user: this.user };
            } else {
                // If token is invalid, clear it
                if (response.status === 401) {
                    this.logout();
                }
                return { success: false, error: data.message || 'Failed to get user info' };
            }
        } catch (error) {
            console.error('Get user info error:', error);
            return { success: false, error: 'Network error while fetching user info' };
        }
    }
    
    /**
     * Logout the current user
     */
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('auth_token');
        
        // Dispatch an event to notify other components
        document.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
    
    /**
     * Update the authentication token (used by other services)
     * @param {string} token - The new JWT token
     */
    updateToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }
    
    /**
     * Request a password reset for a user
     * @param {string} email - The user's email address
     * @returns {Promise<Object>} Reset request result
     */
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/request-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, message: data.message || 'Password reset email sent' };
            } else {
                return { success: false, error: data.error || 'Failed to request password reset' };
            }
        } catch (error) {
            console.error('Password reset request error:', error);
            return { success: false, error: 'Network error during password reset request' };
        }
    }
    
    /**
     * Reset a user's password with a reset token
     * @param {Object} resetData - Password reset data
     * @param {string} resetData.token - Reset token from email
     * @param {string} resetData.password - New password
     * @returns {Promise<Object>} Password reset result
     */
    async resetPassword(resetData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resetData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, message: data.message || 'Password reset successful' };
            } else {
                return { success: false, error: data.error || 'Failed to reset password' };
            }
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: 'Network error during password reset' };
        }
    }
}