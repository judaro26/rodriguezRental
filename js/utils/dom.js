// js/utils/dom.js

// Cache common page elements here once for efficiency
// These should ideally be obtained within DOMContentLoaded in main.js
// and passed to functions that need them, or accessed via document.getElementById
// within the functions if they are guaranteed to exist.
// For now, retaining this structure as it was in your provided file.
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const propertySelectionPage = document.getElementById('property-selection-page');
const addPropertyPage = document.getElementById('add-property-page');
const propertyCategoriesPage = document.getElementById('property-categories-page');
const addCategoryDetailPage = document.getElementById('add-category-detail-page');
const addNewCategoryPage = document.getElementById('add-new-category-page');
const updatePropertyPage = document.getElementById('update-property-page');
const updateCategoryDetailPage = document.getElementById('update-category-detail-page');
const propertyFilesPage = document.getElementById('property-files-content'); // This seems to be propertyFilesContent, not a page. Adjust showPage logic if needed.
const verificationModal = document.getElementById('verification-modal');
const uploadFolderModal = document.getElementById('upload-folder-modal');


// Global status message elements (extracted from original script.js)
// Similar note: these are best retrieved in main.js and passed down or accessed locally.
// However, assuming they are accessible globally for convenience as in your original file.
const loginErrorMessage = document.getElementById('login-error-message');
const registrationStatusMessage = document.getElementById('registration-status-message');
const registerErrorMessage = document.getElementById('register-error-message');
const propertiesErrorMessage = document.getElementById('properties-error-message');
const addPropertyStatus = document.getElementById('add-property-status');
const addDetailStatus = document.getElementById('add-detail-status');
const addNewCategoryStatus = document.getElementById('add-new-category-status');
const updatePropertyStatus = document.getElementById('update-property-status');
const updateDetailStatus = document.getElementById('update-detail-status');
const fileUploadStatus = document.getElementById('file-upload-status');
const verificationStatus = document.getElementById('verification-status'); // Specific status for verification modal
const uploadFolderModalStatus = document.getElementById('upload-folder-modal-status'); // Specific status for upload modal


/**
 * Hides all main pages and status messages, then displays the specified page.
 * @param {HTMLElement} pageElement - The DOM element of the page to show.
 */
export function showPage(pageElement) {
    if (!pageElement) {
        console.error("showPage: Target page element is null or undefined.");
        return;
    }
    // Updated selector to target sections, divs with -modal or -content, and include the hidden class
    document.querySelectorAll('section[id$="-page"], div[id$="-modal"], div[id$="-content"]').forEach(page => {
        if (page) {
            page.style.display = 'none';
            page.classList.add('hidden'); // Ensure hidden class is always added when hiding
        }
    });

    if (pageElement) {
        pageElement.style.display = pageElement.id.includes('-modal') ? 'flex' : 'flex'; // Or 'block' if appropriate
        pageElement.classList.remove('hidden'); // Remove hidden class to display
    } else {
        console.error('showPage: Attempted to show a null pageElement.');
    }

    // Hide any global error/status messages when changing pages
    // Using the cached global elements directly from the top of this file
    if (loginErrorMessage) loginErrorMessage.classList.add('hidden');
    if (registrationStatusMessage) registrationStatusMessage.classList.add('hidden');
    if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
    if (propertiesErrorMessage) propertiesErrorMessage.classList.add('hidden');
    if (addPropertyStatus) addPropertyStatus.classList.add('hidden');
    if (addDetailStatus) addDetailStatus.classList.add('hidden');
    if (addNewCategoryStatus) addNewCategoryStatus.classList.add('hidden');
    if (updatePropertyStatus) updatePropertyStatus.classList.add('hidden');
    if (updateDetailStatus) updateDetailStatus.classList.add('hidden');
    if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
    if (verificationStatus) verificationStatus.classList.add('hidden');
    if (uploadFolderModalStatus) uploadFolderModalStatus.classList.add('hidden');

    console.log(`Mapsd to page: #${pageElement ? pageElement.id : 'N/A'}`);
}

/**
 * Displays a custom alert modal with a message.
 * It's assumed you have an HTML element with ID 'custom-alert-modal',
 * with an element with ID 'custom-alert-message-text' inside it for the message,
 * and an element with ID 'custom-alert-close-btn' for the close button.
 * @param {string} message - The message to display.
 * @param {string} type - 'info', 'success', 'warning', 'error'. Affects styling.
 */
export function showCustomAlert(message, type = 'info') {
    const alertModal = document.getElementById('custom-alert-modal');
    const alertMessageElement = document.getElementById('custom-alert-message-text');
    const alertCloseBtn = document.getElementById('custom-alert-close-btn');

    if (!alertModal || !alertMessageElement || !alertCloseBtn) {
        console.error('Custom alert elements not found. Message:', message);
        alert(message); // Fallback to native alert
        return;
    }

    alertMessageElement.textContent = message;

    // Reset classes on the content div inside the modal
    const alertContentDiv = alertModal.querySelector('div.bg-white'); // Assuming the inner div is bg-white
    if (alertContentDiv) {
        alertContentDiv.className = 'bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center'; // Reset base classes
        switch (type) {
            case 'success':
                alertContentDiv.classList.add('bg-green-100', 'text-green-800', 'border', 'border-green-400');
                break;
            case 'warning':
                alertContentDiv.classList.add('bg-yellow-100', 'text-yellow-800', 'border', 'border-yellow-400');
                break;
            case 'error':
                alertContentDiv.classList.add('bg-red-100', 'text-red-800', 'border', 'border-red-400');
                break;
            case 'info':
            default:
                alertContentDiv.classList.add('bg-blue-100', 'text-blue-800', 'border', 'border-blue-400');
                break;
        }
    }

    alertModal.classList.remove('hidden'); // Show the modal

    // Ensure only one listener
    const newCloseHandler = () => alertModal.classList.add('hidden');
    alertCloseBtn.removeEventListener('click', newCloseHandler); // Remove potential old listeners
    alertCloseBtn.addEventListener('click', newCloseHandler); // Add new one

    // Automatically hide after a few seconds
    setTimeout(() => {
        alertModal.classList.add('hidden');
    }, 5000); // 5 seconds
    console.log(`Alert (${type}): ${message}`);
}

/**
 * Hides a modal.
 * @param {HTMLElement} modalElement - The DOM element of the modal to hide.
 */
export function hideModal(modalElement) {
    if (modalElement) {
        modalElement.classList.add('hidden');
        modalElement.style.display = 'none'; // Ensure display is set to none for absolute positioning

        // Clear any specific modal inputs or status messages when hiding
        const usernameInput = modalElement.querySelector('[data-modal-username-input]');
        const passwordInput = modalElement.querySelector('[data-modal-password-input]');
        const modalStatusMessageElement = modalElement.querySelector('[data-modal-status-message]');

        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (modalStatusMessageElement) {
            modalStatusMessageElement.textContent = '';
            modalStatusMessageElement.classList.add('hidden');
        }
        console.log(`Modal #${modalElement.id} hidden.`);
    }
}

/**
 * Shows a generic modal and attaches dynamic event listeners.
 * It's assumed the modal HTML includes elements with:
 * - data-modal-title (for main heading)
 * - data-modal-item-description (for item being acted on)
 * - data-modal-action-description (for full prompt text, e.g., "confirm deleting")
 * - data-modal-username-input (for username input)
 * - data-modal-password-input (for password input)
 * - data-modal-status-message (for internal status/error messages)
 *
 * @param {HTMLElement} modalElement - The main modal container element (e.g., verificationModal, uploadFolderModal).
 * @param {HTMLElement} confirmButton - The specific "Confirm" button element within this modal.
 * @param {HTMLElement} cancelButton - The specific "Cancel" button element within this modal.
 * @param {string} displayItemDescription - Text describing the item being acted upon (e.g., "file: 'document.pdf'").
 * @param {string} displayActionText - Text describing the action (e.g., "deleting", "moving", "uploading", "Select Upload Destination"). This will be lowercased for dynamic messages.
 * @param {Function} confirmCallback - Async function to execute on confirm: `(username, password) => Promise<boolean>`.
 */
export function showModal(modalElement, confirmButton, cancelButton, displayItemDescription, displayActionText, confirmCallback) {
    const modalTitleElement = modalElement.querySelector('[data-modal-title]');
    const modalItemDescElement = modalElement.querySelector('[data-modal-item-description]');
    const modalActionDescElement = modalElement.querySelector('[data-modal-action-description]');

    const usernameInput = modalElement.querySelector('[data-modal-username-input]');
    const passwordInput = modalElement.querySelector('[data-modal-password-input]');
    const modalStatusMessageElement = modalElement.querySelector('[data-modal-status-message]');

    if (!modalElement || !confirmButton || !cancelButton || !usernameInput || !passwordInput || !modalStatusMessageElement) {
        console.error("showModal: Missing one or more required modal elements. Cannot show confirmation.", { modalElement, confirmButton, cancelButton, usernameInput, passwordInput, modalStatusMessageElement });
        showCustomAlert("Error: Modal elements not fully configured. Cannot show confirmation.", "error");
        return;
    }

    // Reset inputs and messages
    usernameInput.value = '';
    passwordInput.value = '';
    modalStatusMessageElement.textContent = '';
    modalStatusMessageElement.classList.add('hidden');

    // Update modal content based on action
    const actionTextLowercase = typeof displayActionText === 'string' ? displayActionText.toLowerCase() : '';
    const capitalizedActionText = typeof displayActionText === 'string'
        ? displayActionText.charAt(0).toUpperCase() + displayActionText.slice(1)
        : '';

    if (modalTitleElement) modalTitleElement.textContent = displayActionText || ''; // Use original case for title
    if (modalItemDescElement) modalItemDescElement.textContent = displayItemDescription || '';
    if (modalActionDescElement) modalActionDescElement.textContent = `Please enter your credentials to confirm ${actionTextLowercase}.`;

    // Specific button text/styling for verification modal (optional, depends on your design)
    if (modalElement.id === 'verification-modal') {
        if (confirmButton) {
            confirmButton.textContent = `Confirm ${capitalizedActionText}`;
            confirmButton.classList.remove('bg-red-600', 'hover:bg-red-700', 'bg-blue-600', 'hover:bg-blue-700');
            if (actionTextLowercase === 'deleting') {
                confirmButton.classList.add('bg-red-600', 'hover:bg-red-700');
            } else {
                confirmButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
            }
        }
    } else { // For other modals like uploadFolderModal, you might have different default button texts
        // Make sure buttons for uploadFolderModal are simply "Confirm" and "Cancel"
        // Their text might be static in HTML, or set here if dynamic
    }


    modalElement.classList.remove('hidden');
    modalElement.style.display = 'flex'; // Display the modal


    // --- IMPORTANT: Clear old listeners before adding new ones by cloning buttons ---
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    confirmButton = newConfirmButton; // Update reference

    const newCancelButton = cancelButton.cloneNode(true);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
    cancelButton = newCancelButton; // Update reference


    // Add event listener for Confirm button
    confirmButton.addEventListener('click', async (event) => {
        // Prevent default form submission if the button is within a <form>
        // and you want to control submission via JS.
        // Assuming your modal buttons are not `type="submit"` directly triggering a form.
        event.preventDefault(); // Good practice to prevent default click behavior if not intended for navigation/form submission.

        console.log('--- Modal Confirm button CLICKED (callback executing) ---');
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            modalStatusMessageElement.textContent = 'Please enter both username and password.';
            modalStatusMessageElement.classList.remove('hidden');
            return;
        }

        confirmButton.disabled = true; // Disable button during processing
        modalStatusMessageElement.textContent = `Processing ${actionTextLowercase}...`;
        modalStatusMessageElement.classList.remove('hidden');

        try {
            const success = await confirmCallback(username, password);
            if (success) {
                hideModal(modalElement); // Hide modal on success
            } else {
                // If callback returned false but didn't show an alert, show a generic one.
                // The callback itself is usually expected to show specific failure alerts.
                if (modalStatusMessageElement.textContent.includes('Processing')) {
                     modalStatusMessageElement.textContent = `Operation failed. Check credentials or try again.`;
                     modalStatusMessageElement.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('Modal confirmation callback error:', error);
            modalStatusMessageElement.textContent = `An unexpected error occurred: ${error.message}`;
            modalStatusMessageElement.classList.remove('hidden');
        } finally {
            confirmButton.disabled = false; // Re-enable button
            console.log('--- Modal Confirm callback ENDED ---');
        }
    });

    // Add event listener for Cancel button
    cancelButton.addEventListener('click', () => {
        console.log('Modal Cancel button clicked.');
        hideModal(modalElement);
    });

    console.log(`showModal: Successfully displayed modal '${modalElement.id}'.`);
}
