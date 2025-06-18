// js/services/auth.js

import { showCustomAlert } from '../utils/dom.js'; // Import UI helpers

// User state variables - derived from localStorage for persistence
// `currentLoggedInUsername` is still useful for UI display (e.g., "Welcome, [username]!")
let currentLoggedInUsername = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : '';

// --- IMPORTANT SECURITY NOTE ---
// Do NOT store sensitive information like plain-text passwords in client-side global variables or localStorage.
// The `showModal` function in `main.js` correctly prompts the user for their username and password
// when a sensitive operation requires re-verification. This is the secure approach.
// Removed: let currentLoggedInPassword = '';

// DOM elements specific to auth module (for status messages, though `showCustomAlert` handles most of this)
// These are declared here, but their manipulation is primarily abstracted by `showCustomAlert` in `utils/dom.js`.
const loginErrorMessage = document.getElementById('login-error-message');
const loginErrorText = document.getElementById('login-error-text');
const registrationStatusMessage = document.getElementById('registration-status-message');
const registerErrorMessage = document.getElementById('register-error-message');
const registerErrorText = document.getElementById('register-error-text');

/**
 * Updates a specific status message DOM element.
 * Useful for direct feedback that showCustomAlert might not cover,
 * or for more persistent messages on a form.
 * @param {HTMLElement | null} element - The DOM element to update.
 * @param {string} message - The message to display.
 * @param {boolean} isError - True if it's an error message, false for success/info.
 * @param {boolean} show - True to show, false to hide.
 */
function updateStatusMessage(element, message, isError, show = true) {
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
        if (show) {
            element.classList.add(isError ? 'bg-red-100' : 'bg-green-100', isError ? 'text-red-700' : 'text-green-700');
        } else {
            element.classList.add('hidden');
        }
    }
}


/**
 * Handles user login.
 * Stores token and user approval statuses in localStorage upon success.
 * @param {string} username - The username entered by the user.
 * @param {string} password - The password entered by the user.
 * @returns {Promise<boolean>} - True if login is successful, false otherwise.
 */
export async function login(username, password) {
    try {
        const response = await fetch('/.netlify/functions/loginUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.token) {
                localStorage.setItem('token', data.token);
                // Store user details for quick access
                localStorage.setItem('user', JSON.stringify({
                    username: data.username,
                    foreign_approved: data.foreign_approved,
                    domestic_approved: data.domestic_approved
                }));
                // Explicitly store approval statuses for direct retrieval by getUserApprovalStatuses
                localStorage.setItem('foreignApproved', data.foreign_approved ? 'true' : 'false');
                localStorage.setItem('domesticApproved', data.domestic_approved ? 'true' : 'false');

                // Update the local currentLoggedInUsername for immediate use in UI (if any)
                currentLoggedInUsername = data.username;

                console.log('Login successful. Token and user data stored.');
                return true;
            }
        }

        // If response is not ok or token is missing
        showCustomAlert(data.message || 'Login failed. Please check your credentials.');
        console.error('Login failed:', data.message || 'Unknown error');
        return false;

    } catch (error) {
        console.error('Login network or parsing error:', error);
        showCustomAlert('Network error or unexpected response during login. Please try again.');
        return false;
    }
}

/**
 * Handles user registration.
 * Displays appropriate messages based on success or failure.
 * @param {string} username - The username for registration.
 * @param {string} password - The password for registration.
 * @returns {Promise<boolean>} - True if registration is successful, false otherwise.
 */
export async function register(username, password) {
    if (!username || !password) {
        showCustomAlert('Please enter both username and password.');
        return false;
    }

    try {
        // Clear previous messages before new attempt
        updateStatusMessage(registrationStatusMessage, '', false, false);
        updateStatusMessage(registerErrorMessage, '', true, false);
        if (registerErrorText) registerErrorText.textContent = '';

        const response = await fetch('/.netlify/functions/registerUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Registration successful:", data.message);
            updateStatusMessage(registrationStatusMessage, 'Registration successful! You can now log in.', false);
            return true;
        } else {
            const errorMessage = data.message || 'Registration failed. The username might already be taken.';
            showCustomAlert(errorMessage);
            updateStatusMessage(registerErrorMessage, errorMessage, true);
            if (registerErrorText) registerErrorText.textContent = errorMessage; // Redundant if errorMessage is already shown
            console.error("Registration failed:", errorMessage);
            return false;
        }
    } catch (error) {
        console.error("Registration network error:", error);
        showCustomAlert('Registration failed. Please try again later.');
        updateStatusMessage(registerErrorMessage, 'Registration failed due to a network error.', true);
        return false;
    }
}

/**
 * Retrieves the currently logged-in user's username from localStorage.
 * This should *not* return the password for security reasons.
 * The verification modal itself should prompt the user for their password for sensitive operations.
 * @returns {string} - The username, or an empty string if not logged in.
 */
export function getLoggedInUsername() {
    const user = localStorage.getItem('user');
    if (user) {
        try {
            return JSON.parse(user).username || '';
        } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
            return '';
        }
    }
    return '';
}

/**
 * Returns the current user's approval statuses for foreign and domestic properties.
 * Reads directly from localStorage for persistence.
 * @returns {{username: string, foreignApproved: boolean, domesticApproved: boolean}}
 */
export function getUserApprovalStatuses() {
    const foreignApproved = localStorage.getItem('foreignApproved') === 'true';
    const domesticApproved = localStorage.getItem('domesticApproved') === 'true';
    const username = getLoggedInUsername(); // Get username via dedicated function

    console.log(`User approval statuses for ${username || 'N/A'}: Foreign Approved = ${foreignApproved}, Domestic Approved = ${domesticApproved}`);

    return {
        username: username,
        foreignApproved: foreignApproved,
        domesticApproved: domesticApproved,
    };
}

/**
 * Checks if the stored authentication token is valid (not expired).
 * Assumes 'token_exp' is a Unix timestamp (seconds since epoch).
 * @returns {boolean} - True if the token is present and not expired, false otherwise.
 */
export function isTokenValid() {
    const token = localStorage.getItem('token');
    const exp = localStorage.getItem('token_exp');

    if (!token || !exp) {
        console.log('isTokenValid: No token or expiration found.');
        return false;
    }

    const expirationTimeMs = parseInt(exp) * 1000; // Convert Unix timestamp to milliseconds
    const isValid = Date.now() < expirationTimeMs;
    console.log(`isTokenValid: Token expires at ${new Date(expirationTimeMs).toLocaleString()}. Current time: ${new Date().toLocaleString()}. Valid: ${isValid}`);
    return isValid;
}

/**
 * Provides the Authorization header for API requests using the stored token.
 * @returns {Object} - An object containing the Authorization header, or an empty object if no token.
 */
export function getAuthHeader() {
    const token = localStorage.getItem('token');
    if (token) {
        return {
            'Authorization': `Bearer ${token}`
        };
    }
    return {};
}

/**
 * Handles user logout by clearing local storage.
 */
export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('token_exp');
    localStorage.removeItem('user');
    localStorage.removeItem('foreignApproved');
    localStorage.removeItem('domesticApproved');
    currentLoggedInUsername = ''; // Clear local state
    console.log('User logged out. Local storage cleared.');
    showCustomAlert('You have been logged out.');
    // Optionally, redirect to login page immediately after logout
    // showPage(document.getElementById('login-page')); // Requires showPage import if not already there
}

// Add a public function to set currentLoggedInUsername, if needed from outside (e.g., on initial load check)
export function setCurrentLoggedInUsername(username) {
    currentLoggedInUsername = username;
}
