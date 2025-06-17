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
        if (!username || !password) {
            showCustomAlert('Please enter both username and password');
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
                return true;
            } else {
                showCustomAlert(data.message || 'Registration failed. The username might already be taken.');
                return false;
            }
        } catch (error) {
            console.error("Registration error:", error);
            showCustomAlert('Registration failed. Please try again later.');
            return false;
        }
    }

/**
 * Returns the currently logged-in user's credentials for verification.
 * It now reads username/password from currentLoggedInUsername/currentLoggedInPassword.
 * In a real app, you would pass the token here and backend validates.
 * Since your modal requires username/password, we retrieve it from the (DEMO ONLY) stored state.
 * @returns {{username: string, password: string}}
 */
export function getLoggedInCredentials() {
    // For demo purposes, we'll retrieve the username from currentLoggedInUsername.
    // However, the password is a high security risk if stored in plain text.
    // Ideally, for verification modals, you'd re-authenticate or use a short-lived token.
    const username = currentLoggedInUsername;
    // For the password, we need to temporarily get it from localStorage if it's used for verification.
    // Your current setup passes username/password to the verification modal's callback.
    // The previous implementation was setting currentLoggedInPassword, which is bad practice.
    // If your modal *needs* the password for re-validation, it should prompt the user for it.
    // Since the main.js showModal is designed to take username and password inputs,
    // we should modify getUserApprovalStatuses to provide these to the modal, not getLoggedInCredentials.
    // Let's ensure showModal is correctly prompting the user for username and password.

    // Given your main.js code's `showModal` usage:
    // showModal(verificationModal, ..., async (username, password) => { ... })
    // The `username` and `password` inside this callback are the *user-entered* values from the modal itself.
    // So, `getLoggedInCredentials` might not be strictly needed by the modal's callback,
    // as it's prompting the user.

    // If you need the *currently logged-in username* to pre-fill the modal,
    // you would return `currentLoggedInUsername`. The password shouldn't be here.
    return {
        username: currentLoggedInUsername,
        // *** DANGER: Never store plaintext passwords in client-side state in production! ***
        // For your current demo verification modal, the modal itself collects username/password.
        // So, this function's `password` return is problematic and likely unused by current modal.
        // If your backend *requires* the password to be sent from the client for a sensitive operation,
        // the UI should prompt the user for it at that specific moment.
        // If the modal expects the *user's stored password*, then the architecture needs a rethink.
        // For now, I'll remove `currentLoggedInPassword` from here to prevent misconceptions.
        password: "" // Or remove this line entirely if not used
    };
}


/**
 * Returns the current user's approval statuses for foreign and domestic properties.
 * This now reads directly from localStorage for persistence.
 * @returns {{foreignApproved: boolean, domesticApproved: boolean}}
 */
export function getUserApprovalStatuses() {
    // Read directly from localStorage
    const foreignApproved = localStorage.getItem('foreignApproved') === 'true';
    const domesticApproved = localStorage.getItem('domesticApproved') === 'true';

    console.log('getUserApprovalStatuses: Foreign Approved from localStorage:', foreignApproved);
    console.log('getUserApprovalStatuses: Domestic Approved from localStorage:', domesticApproved);

    // Also, provide the username/password for the modal if needed, but this should ideally come from user input in the modal
    // For the modal's internal use where it asks for credentials, it should get them from the modal form itself.
    // The `showModal` function in `dom.js` actually receives `username` and `password` as parameters
    // within its callback, implying the modal itself prompts for them. This is the correct approach.
    // So, we should not return a password from here.

    // If the modal *does* need the logged-in username to pre-fill, you can return it.
    // Otherwise, this function should strictly be about approval statuses.
    return {
        username: currentLoggedInUsername, // Still useful for reference or pre-filling some UI elements
        foreignApproved: foreignApproved,
        domesticApproved: domesticApproved,
        // Do NOT return password here. The modal collects it.
    };
}

// No DOM event listeners in this file anymore, they are handled in main.js.
// DOM element lookups for status messages are fine here as they are directly updated.
