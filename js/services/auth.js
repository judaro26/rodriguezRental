// js/services/auth.js

import { showPage, showCustomAlert } from '../utils/dom.js'; // Import UI helpers

// User state variables
let currentUserForeignApprovedStatus = false;
let currentUserDomesticApprovedStatus = false;
let currentLoggedInUsername = '';
let currentLoggedInPassword = ''; // WARNING: Storing plain-text password is a HIGH SECURITY RISK for production.

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
export async function login(username, password) { // Now accepts username and password
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
            currentUserForeignApprovedStatus = data.foreign_approved;
            currentUserDomesticApprovedStatus = data.domestic_approved;
            currentLoggedInUsername = username;
            currentLoggedInPassword = password; // Store plain-text for demo, see warning above.
            return true;
        } else {
            if (loginErrorMessage) loginErrorMessage.classList.remove('hidden');
            if (loginErrorText) loginErrorText.textContent = data.message || 'An unknown error occurred during login.';
            // Do not clear password here, main.js will handle clearing input field
            return false;
        }
    } catch (error) {
        console.error("Fetch error during login:", error);
        if (loginErrorMessage) loginErrorMessage.classList.remove('hidden');
        if (loginErrorText) loginErrorText.textContent = 'Network error or server issue. Please try again later.';
        // Do not clear password here
        return false;
    }
}

/**
 * Handles user registration.
 * @param {string} username - The username for registration.
 * @param {string} password - The password for registration.
 * @returns {Promise<boolean>} - True if registration is successful, false otherwise.
 */
export async function register(username, password) { // Now accepts username and password
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
            // Do not clear password here
            return false;
        }
    } catch (error) {
        console.error("Fetch error during registration:", error);
        if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
        if (registerErrorText) registerErrorText.textContent = 'Network error or server issue. Please try again later.';
        // Do not clear password here
        return false;
    }
}

/**
 * Returns the currently logged-in user's credentials.
 * IMPORTANT: In a real app, you'd return an auth token, not plain password.
 * @returns {{username: string, password: string}}
 */
export function getLoggedInCredentials() {
    return {
        username: currentLoggedInUsername,
        password: currentLoggedInPassword
    };
}

/**
 * Returns the current user's approval statuses for foreign and domestic properties.
 * @returns {{foreignApproved: boolean, domesticApproved: boolean}}
 */
export function getUserApprovalStatuses() {
    return {
        foreignApproved: currentUserForeignApprovedStatus,
        domesticApproved: currentUserDomesticApprovedStatus
    };
}

// No DOM event listeners in this file anymore, they are handled in main.js.
// DOM element lookups for status messages are fine here as they are directly updated.
