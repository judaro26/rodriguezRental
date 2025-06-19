// js/utils/dom.js

// Cache common page elements here once for efficiency.
// It's generally a good practice to retrieve these once DOMContentLoaded has fired in main.js
// and then pass them as arguments to functions that need them, or keep them in a central
// application state in main.js. For consistency with your existing structure,
// these are still globally defined here but with a note about best practice.
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const propertySelectionPage = document.getElementById('property-selection-page');
const addPropertyPage = document.getElementById('add-property-page');
const propertyCategoriesPage = document.getElementById('property-categories-page');
const addCategoryDetailPage = document.getElementById('add-category-detail-page');
const addNewCategoryPage = document.getElementById('add-new-category-page');
const updatePropertyPage = document.getElementById('update-property-page');
const updateCategoryDetailPage = document.getElementById('update-category-detail-page');
const propertyFilesPage = document.getElementById('property-files-content'); // This is a content div, not a full page, but managed by showPage
const verificationModal = document.getElementById('verification-modal');
const uploadFolderModal = document.getElementById('upload-folder-modal');


// Global status message elements (retrieved once for direct access)
// Similar to above, these could be managed more locally if preferred.
const loginErrorMessage = document.getElementById('login-error-message');
const registrationStatusMessage = document.getElementById('registration-status-message');
const registerErrorMessage = document.getElementById('register-error-message');
const propertiesErrorMessage = document.getElementById('properties-error-message');
const addPropertyStatus = document.getElementById('add-property-status');
const addDetailStatus = document.getElementById('add-detail-status');
const addNewCategoryStatus = document.getElementById('add-new-category-status');
const updatePropertyStatus = document.getElementById('update-property-status');
const updateDetailStatus = document.getElementById('update-detail-status');
const fileUploadStatus = document.getElementById('file-upload-status'); // General page-level upload status
const verificationStatus = document.getElementById('verification-status'); // Status within verification modal
const uploadFolderModalStatus = document.getElementById('upload-folder-modal-status'); // Status within upload folder modal


/**
 * Hides all main application pages and global status messages, then displays the specified page.
 * It targets elements based on common ID patterns and class names.
 * @param {HTMLElement} pageElement - The DOM element of the page (or modal) to display.
 */
export function showPage(pageElement) {
    if (!pageElement) {
        console.error("showPage: Target page element is null or undefined. Cannot display.");
        return;
    }

    // Select all main page containers and ensure they are hidden
    document.querySelectorAll(
        'div[id$="-page"], ' +          // e.g., login-page, register-page
        'div[id$="-modal"], ' +         // e.g., verification-modal, upload-folder-modal
        'div[id$="-content"]'           // e.g., property-files-content
    ).forEach(page => {
        if (page) {
            page.style.display = 'none'; // Directly set display to none
            page.classList.add('hidden'); // Add Tailwind's hidden class
        } else {
            console.warn(`showPage: A page element was null and could not be hidden. Check its ID.`, page);
        }
    });

    // Display the target page element
    if (pageElement) {
        // Use 'flex' for pages/modals that require flexbox layout (most of your pages do).
        // Adjust to 'block' if any page is a simple block container.
        pageElement.style.display = 'flex';
        pageElement.classList.remove('hidden'); // Remove Tailwind's hidden class
    } else {
        console.error('showPage: Attempted to show a null pageElement.');
    }

    // Hide any global error/status messages when transitioning pages
    // This cleans up previous messages that might linger on screen.
    if (loginErrorMessage) loginErrorMessage.classList.add('hidden');
    if (registrationStatusMessage) registrationStatusMessage.classList.add('hidden');
    if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
    if (propertiesErrorMessage) propertiesErrorMessage.classList.add('hidden');
    if (addPropertyStatus) addPropertyStatus.classList.add('hidden');
    if (addDetailStatus) addDetailStatus.classList.add('hidden');
    if (addNewCategoryStatus) addNewCategoryStatus.classList.add('hidden');
    if (updatePropertyStatus) updatePropertyStatus.classList.add('hidden');
    if (updateDetailStatus) updateDetailStatus.classList.add('hidden');
    if (fileUploadStatus) fileUploadStatus.classList.add('hidden'); // Page-level upload status
    if (verificationStatus) verificationStatus.classList.add('hidden'); // Status inside verification modal
    if (uploadFolderModalStatus) uploadFolderModalStatus.classList.add('hidden'); // Status inside upload modal

    console.log(`Mapsd to page: #${pageElement ? pageElement.id : 'N/A'}`);
}

/**
 * Displays a custom alert message as a modal.
 * It requires a static HTML structure with specific IDs:
 * - '#custom-alert-modal': The main modal container.
 * - '#custom-alert-message-text': The element where the message is displayed.
 * - '#custom-alert-close-btn': The button to close the alert.
 * @param {string} message - The message text to display.
 * @param {string} type - 'info', 'success', 'warning', 'error'. Affects modal styling.
 */
export function showCustomAlert(message, type = 'info') {
    const alertModal = document.getElementById('custom-alert-modal');
    const alertMessageElement = document.getElementById('custom-alert-message-text');
    const alertCloseBtn = document.getElementById('custom-alert-close-btn');

    if (!alertModal || !alertMessageElement || !alertCloseBtn) {
        console.error('Custom alert elements not found. Message:', message);
        alert(message); // Fallback to native alert if elements are missing
        return;
    }

    alertMessageElement.textContent = message;

    // Reset and apply styling to the inner content div of the alert modal
    const alertContentDiv = alertModal.querySelector('div.bg-white'); // Assumes a div with bg-white inside alert modal
    if (alertContentDiv) {
        // Reset to default alert styles first
        alertContentDiv.className = 'bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center';
        // Apply type-specific styles
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

    alertModal.classList.remove('hidden'); // Show the alert modal

    // Ensure only one click listener on the close button to prevent multiple triggers
    const newCloseHandler = () => {
        alertModal.classList.add('hidden'); // Hide on click
    };
    // Re-attach listener by cloning to prevent stale closures/multiple attachments
    const oldCloseBtn = alertCloseBtn;
    const newCloseBtn = oldCloseBtn.cloneNode(true);
    oldCloseBtn.parentNode.replaceChild(newCloseBtn, oldCloseBtn);
    newCloseBtn.addEventListener('click', newCloseHandler); // Attach new listener

    // Automatically hide after a few seconds
    setTimeout(() => {
        alertModal.classList.add('hidden');
    }, 5000); // Hide after 5 seconds
    console.log(`Alert (${type}): ${message}`);
}

/**
 * Hides a modal.
 * It also clears common input fields and status messages within the modal.
 * @param {HTMLElement} modalElement - The DOM element of the modal to hide.
 */
export function hideModal(modalElement) {
    if (modalElement) {
        modalElement.classList.add('hidden'); // Hide the modal with Tailwind class
        modalElement.style.display = 'none'; // Ensure display property is also set to none

        // Clear username and password inputs if they exist within the modal
        const usernameInput = modalElement.querySelector('[data-modal-username-input]');
        const passwordInput = modalElement.querySelector('[data-modal-password-input]');
        const modalStatusMessageElement = modalElement.querySelector('[data-modal-status-message]');

        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (modalStatusMessageElement) {
            modalStatusMessageElement.textContent = '';
            modalStatusMessageElement.classList.add('hidden'); // Hide modal-specific status message
        }
        console.log(`Modal #${modalElement.id} hidden.`);
    }
}

/**
 * Shows a generic modal and attaches dynamic event listeners to its confirm/cancel buttons.
 * This function expects specific data attributes on elements *within* the modal HTML:
 * - `data-modal-title`: Element for the main heading (e.g., `<h3>`).
 * - `data-modal-item-description`: Element for the item being acted on (e.g., `<p><span>`).
 * - `data-modal-action-description`: Element for the full prompt text (e.g., `<span>Please enter...`).
 * - `data-modal-username-input`: Username input field.
 * - `data-modal-password-input`: Password input field.
 * - `data-modal-status-message`: Element for displaying internal modal status/error messages.
 *
 * @param {HTMLElement} modalElement - The main modal container element (e.g., `verificationModal`, `uploadFolderModal`).
 * @param {HTMLElement} confirmButton - The specific "Confirm" button element for *this* modal.
 * @param {HTMLElement} cancelButton - The specific "Cancel" button element for *this* modal.
 * @param {string} displayItemDescription - Text describing the item (e.g., "file: 'document.pdf'", "category: 'Maintenance'").
 * @param {string} displayActionText - Text describing the action (e.g., "deleting", "moving", "uploading", "Select Upload Destination"). Used for dynamic display.
 * @param {Function} confirmCallback - Async function to execute on confirm: `(username, password) => Promise<boolean>`.
 */
export function showModal(modalElement, confirmButton, cancelButton, displayItemDescription, displayActionText, confirmCallback) {
    // Retrieve inner elements using data attributes relative to the modalElement
    const modalTitleElement = modalElement.querySelector('[data-modal-title]');
    const modalItemDescElement = modalElement.querySelector('[data-modal-item-description]');
    const modalActionDescElement = modalElement.querySelector('[data-modal-action-description]');

    const usernameInput = modalElement.querySelector('[data-modal-username-input]');
    const passwordInput = modalElement.querySelector('[data-modal-password-input]');
    const modalStatusMessageElement = modalElement.querySelector('[data-modal-status-message]');

    // Validate that all required internal elements are found
    if (!modalElement || !confirmButton || !cancelButton || !usernameInput || !passwordInput || !modalStatusMessageElement) {
        console.error("showModal: Missing one or more required modal internal elements. Cannot show confirmation.", {
            modalElement: modalElement ? modalElement.id : 'null',
            confirmButton: confirmButton ? confirmButton.id : 'null',
            cancelButton: cancelButton ? cancelButton.id : 'null',
            usernameInput: usernameInput ? 'found' : 'null',
            passwordInput: passwordInput ? 'found' : 'null',
            modalStatusMessageElement: modalStatusMessageElement ? 'found' : 'null'
        });
        showCustomAlert("Error: Modal elements not fully configured. Cannot show confirmation.", "error");
        return;
    }

    // Reset input fields and hide status message
    usernameInput.value = '';
    passwordInput.value = '';
    modalStatusMessageElement.textContent = '';
    modalStatusMessageElement.classList.add('hidden'); // Ensure status message is hidden initially

    // Prepare text for dynamic display
    const actionTextLowercase = typeof displayActionText === 'string' ? displayActionText.toLowerCase() : '';
    const capitalizedActionText = typeof displayActionText === 'string'
        ? displayActionText.charAt(0).toUpperCase() + displayActionText.slice(1)
        : '';

    // Update modal content based on the passed arguments
    if (modalTitleElement) modalTitleElement.textContent = displayActionText || ''; // Main title of the modal
    if (modalItemDescElement) modalItemDescElement.textContent = displayItemDescription || ''; // The item being acted on
    if (modalActionDescElement) modalActionDescElement.textContent = `Please enter your credentials to confirm ${actionTextLowercase}.`; // Full prompt message

    // Specific button text/styling for the verification modal (adjust as per your design)
    if (modalElement.id === 'verification-modal') {
        if (confirmButton) {
            confirmButton.textContent = `Confirm ${capitalizedActionText}`; // Dynamic text based on action
            // Remove previous styling classes before adding new ones
            confirmButton.classList.remove('bg-red-600', 'hover:bg-red-700', 'bg-blue-600', 'hover:bg-blue-700');
            if (actionTextLowercase === 'deleting') {
                confirmButton.classList.add('bg-red-600', 'hover:bg-red-700'); // Red for delete
            } else {
                confirmButton.classList.add('bg-blue-600', 'hover:bg-blue-700'); // Blue for other actions
            }
        }
    }
    // For other modals like uploadFolderModal, their button text/styles might be static in HTML
    // or defined with separate logic here if they need dynamic changes.


    // Make the modal visible
    modalElement.classList.remove('hidden');
    modalElement.style.display = 'flex'; // Ensure it uses flex display for centering

    // --- IMPORTANT: Clear old listeners before adding new ones by cloning the buttons ---
    // This prevents multiple event listeners from accumulating on the same button
    // which can lead to callbacks firing multiple times on a single click.
    const newConfirmButton = confirmButton.cloneNode(true); // Clone with all its children/attributes
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton); // Replace old button with new clone
    confirmButton = newConfirmButton; // Update the reference to the new button element

    const newCancelButton = cancelButton.cloneNode(true);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
    cancelButton = newCancelButton; // Update the reference


    // Add event listener for Confirm button
    confirmButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default click behavior (like form submission if button is type="submit")

        console.log('--- Modal Confirm button CLICKED (callback executing) ---');
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            modalStatusMessageElement.textContent = 'Please enter both username and password.';
            modalStatusMessageElement.classList.remove('hidden'); // Show error message
            return; // Stop execution if credentials are missing
        }

        confirmButton.disabled = true; // Disable button to prevent multiple clicks during processing
        modalStatusMessageElement.textContent = `Processing ${actionTextLowercase}...`;
        modalStatusMessageElement.classList.remove('hidden'); // Show processing message

        try {
            const success = await confirmCallback(username, password); // Execute the function passed from main.js
            if (success) {
                hideModal(modalElement); // Hide modal on successful operation
            } else {
                // If the callback returns false (indicating failure) but didn't display a specific error
                // (e.g., from a service function), show a generic modal error.
                if (modalStatusMessageElement.textContent.includes('Processing')) { // Only update if still showing processing message
                     modalStatusMessageElement.textContent = `Operation failed. Check credentials or try again.`;
                     modalStatusMessageElement.classList.remove('hidden'); // Show failure message
                }
            }
        } catch (error) {
            console.error('Modal confirmation callback error:', error);
            modalStatusMessageElement.textContent = `An unexpected error occurred: ${error.message}`;
            modalStatusMessageElement.classList.remove('hidden'); // Show unexpected error
        } finally {
            confirmButton.disabled = false; // Re-enable button regardless of success/failure
            console.log('--- Modal Confirm callback ENDED ---');
        }
    });

    // Add event listener for Cancel button
    cancelButton.addEventListener('click', () => {
        console.log('Modal Cancel button clicked.');
        hideModal(modalElement); // Hide modal on cancel
    });

    console.log(`showModal: Successfully displayed modal '${modalElement.id}'.`);
}
