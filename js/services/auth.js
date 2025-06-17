// js/services/auth.js

import { showPage, showCustomAlert } from '../utils/dom.js'; // Import UI helpers

// User state variables (local state should probably be derived from localStorage/session storage for consistency)
// For this fix, we'll focus on storing the token and approval statuses in localStorage.
let currentLoggedInUsername = ''; // Still useful for displaying username in UI, etc.

// No need to store plain-text password globally here if it's stored securely in backend and used via token.
// let currentLoggedInPassword = ''; // WARNING: Storing plain-text password is a HIGH SECURITY RISK for production. REMOVE THIS IF YOU DON'T ABSOLUTELY NEED IT FOR NON-AUTH PURPOSES.


// DOM elements specific to auth module that are interacted with (e.g., status messages)
// These can remain here as they are directly updated by this module's logic.
const loginErrorMessage = document.getElementById('login-error-message');
const loginErrorText = document.getElementById('login-error-text');
const registrationStatusMessage = document.getElementById('registration-status-message');
const registerErrorMessage = document.getElementById('register-error-message');
const registerErrorText = document.getElementById('register-error-text');


/**
 * Handles user login.
 * @param {string} username - The username entered by the user.
 * @param {string} password - The password entered by the user.
 * @returns {Promise<boolean>} - True if login is successful, false otherwise.
 */
export async function login(username, password) {
    if (loginErrorMessage) loginErrorMessage.classList.add('hidden');
    if (loginErrorText) loginErrorText.textContent = '';

    if (!username || !password) {
        if (loginErrorMessage) loginErrorMessage.classList.remove('hidden');
        if (loginErrorText) loginErrorText.textContent = 'Please enter both username and password.';
        return false;
    }

    try {
        const response = await fetch('/.netlify/functions/loginUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Login successful:", data.message);
            // --- CRITICAL FIX: STORE THE TOKEN AND APPROVAL STATUSES IN LOCAL STORAGE ---
            if (data.token) {
                localStorage.setItem('token', data.token);
                console.log('JWT token stored in localStorage.');
            } else {
                console.warn('Login successful but no token received from backend!');
                // You might want to show an alert or handle this case where a token is expected but not provided.
                showCustomAlert('Login successful, but no session token received. You may experience limited functionality.', 'warning');
            }

            // Store approval statuses in localStorage as well, so they persist across sessions
            // and can be read by getUserApprovalStatuses.
            localStorage.setItem('foreignApproved', data.foreign_approved ? 'true' : 'false');
            localStorage.setItem('domesticApproved', data.domestic_approved ? 'true' : 'false');
            console.log(`Foreign Approved: ${data.foreign_approved}, Domestic Approved: ${data.domestic_approved} stored.`);


            // Update local state for immediate use within the current session, though localStorage is the source of truth
            currentLoggedInUsername = username;
            // No longer storing plain-text password in global state here due to security risk.
            // currentLoggedInPassword = password; // REMOVE THIS LINE


            return true;
        } else {
            if (loginErrorMessage) loginErrorMessage.classList.remove('hidden');
            if (loginErrorText) loginErrorText.textContent = data.message || 'An unknown error occurred during login.';
            return false;
        }
    } catch (error) {
        console.error("Fetch error during login:", error);
        if (loginErrorMessage) loginErrorMessage.classList.remove('hidden');
        if (loginErrorText) loginErrorText.textContent = 'Network error or server issue. Please try again later.';
        return false;
    }
}

/**
 * Handles user registration.
 * @param {string} username - The username for registration.
 * @param {string} password - The password for registration.
 * @returns {Promise<boolean>} - True if registration is successful, false otherwise.
 */
export async function register(username, password) {
    if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
    if (registerErrorText) registerErrorText.textContent = '';

    if (!username || !password) {
        if (registerErrorMessage) registerErrorMessage.classList.remove('hidden');
        if (registerErrorText) registerErrorText.textContent = 'Please enter both username and password.';
        return false;
    }

    try {
        const response = await fetch('/.netlify/functions/registerUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Registration successful:", data.message);
            if (registrationStatusMessage) registrationStatusMessage.classList.remove('hidden');
            return true;
        } else {
            if (registerErrorMessage) registerErrorMessage.classList.remove('hidden');
            if (registerErrorText) registerErrorText.textContent = data.message || 'An unknown error occurred during registration.';
            return false;
        }
    } catch (error) {
        console.error("Fetch error during registration:", error);
        if (registerErrorMessage) registerErrorMessage.
