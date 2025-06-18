// js/utils/dom.js

// Cache common page elements here once for efficiency (these are fine as is)
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const propertySelectionPage = document.getElementById('property-selection-page');
const addPropertyPage = document.getElementById('add-property-page');
const propertyCategoriesPage = document.getElementById('property-categories-page');
const addCategoryDetailPage = document.getElementById('add-category-detail-page');
const addNewCategoryPage = document.getElementById('add-new-category-page');
const updatePropertyPage = document.getElementById('update-property-page');
const updateCategoryDetailPage = document.getElementById('update-category-detail-page');
const propertyFilesPage = document.getElementById('property-files-content');
const verificationModal = document.getElementById('verification-modal');
const uploadFolderModal = document.getElementById('upload-folder-modal'); // Keep this global as it's a main modal

// Global status message elements (extracted from original script.js)
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
const verificationStatus = document.getElementById('verification-status');
const uploadFolderModalStatus = document.getElementById('upload-folder-modal-status');


/**
 * Hides all main pages and status messages, then displays the specified page.
 * @param {HTMLElement} pageElement - The DOM element of the page to show.
 */
export function showPage(pageElement) {
    const allPages = [
        loginPage, registerPage, propertySelectionPage, addPropertyPage,
        propertyCategoriesPage, addCategoryDetailPage, addNewCategoryPage,
        updatePropertyPage, updateCategoryDetailPage, propertyFilesPage,
        verificationModal // Modals are also pages in your setup, needs careful handling
    ];

    allPages.forEach(page => {
        if (page) {
            page.style.display = 'none';
            page.classList.add('hidden'); // Ensure Tailwind class is added
        } else {
            console.warn(`showPage: A page element was null and could not be hidden. Check its ID.`, page);
        }
    });

    if (pageElement) {
        pageElement.style.display = 'flex'; // Use 'flex' for modals too, as they are centered
        pageElement.classList.remove('hidden'); // Remove Tailwind hidden class
    } else {
        console.error('showPage: Attempted to show a null pageElement.');
    }

    // Hide any global error/status messages when changing pages
    // You have these listed as global consts, so they can be hidden directly
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
 * @param {string} message - The message to display.
 */
export function showCustomAlert(message, type = 'info') { // Added 'type' parameter
    const alertModal = document.getElementById('custom-alert-modal'); // Should be a single static element
    const alertMessageElement = document.getElementById('custom-alert-message-text'); // A new span inside alertModal
    const alertCloseBtn = document.getElementById('custom-alert-close-btn');

    if (!alertModal || !alertMessageElement || !alertCloseBtn) {
        console.error('Custom alert elements not found. Message:', message);
        alert(message); // Fallback to native alert
        return;
    }

    alertMessageElement.textContent = message;

    // Clear previous classes and apply new ones based on type
    alertModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden'; // Reset classes
    switch (type) {
        case 'success':
            alertModal.querySelector('div').className = 'bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center bg-green-100 text-green-800 border border-green-400';
            break;
        case 'warning':
            alertModal.querySelector('div').className = 'bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center bg-yellow-100 text-yellow-800 border border-yellow-400';
            break;
        case 'error':
            alertModal.querySelector('div').className = 'bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center bg-red-100 text-red-800 border border-red-400';
            break;
        case 'info':
        default:
            alertModal.querySelector('div').className = 'bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center bg-blue-100 text-blue-800 border border-blue-400';
            break;
    }
    alertModal.classList.remove('hidden');

    // Remove existing listener to prevent multiple
    const oldCloseHandler = alertCloseBtn.onclick;
    if (oldCloseHandler) {
        alertCloseBtn.removeEventListener('click', oldCloseHandler); // Assuming it was added with addEventListener
    }
    alertCloseBtn.onclick = () => alertModal.classList.add('hidden'); // Re-assign for simplicity if using onclick directly

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
        modalElement.style.display = 'none'; // Ensure display is set to none
        // Clear any specific modal inputs or status messages when hiding
        const usernameInput = modalElement.querySelector('input[type="text"]'); // More generic selector
        const passwordInput = modalElement.querySelector('input[type="password"]');
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

// Event listener for the verification modal form submission.
// This section needs to be re-thought slightly.
// The `showModal` function should handle attaching the submit listener to the form itself
// or directly to the confirm button, rather than relying on a global `currentVerificationCallback`
// and a hardcoded DOMContentLoaded listener for only one specific modal's form.

// Let's refactor showModal to be more flexible and directly manage its buttons.

// New approach for showModal
/**
 * Shows a generic modal and attaches dynamic event listeners.
 * @param {HTMLElement} modalElement - The main modal container element (e.g., verificationModal, uploadFolderModal).
 * @param {HTMLElement} confirmButton - The specific "Confirm" button element within this modal.
 * @param {HTMLElement} cancelButton - The specific "Cancel" button element within this modal.
 * @param {string} displayItemDescription - Text describing the item being acted upon (e.g., "file: 'document.pdf'").
 * @param {string} displayActionText - Text describing the action (e.g., "deleting", "moving", "uploading").
 * @param {Function} confirmCallback - Async function to execute on confirm: `(username, password) => Promise<boolean>`.
 * @param {Object} [options] - Optional settings.
 * @param {boolean} [options.isFormSubmission=true] - If true, prevents default for button click and handles form submission.
 */
export function showModal(modalElement, confirmButton, cancelButton, displayItemDescription, displayActionText, confirmCallback, options = {}) {
    const { isFormSubmission = true } = options;

    const modalTitleElement = modalElement.querySelector('[data-modal-title]'); // New: for modal title
    const modalItemDescElement = modalElement.querySelector('[data-modal-item-description]'); // New: for item description
    const modalActionDescElement = modalElement.querySelector('[data-modal-action-description]'); // New: for action description
    
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
    modalStatusMessageElement.classList.add('hidden'); // Hide status message initially

    // Update modal content based on action (adjust element selectors if needed in your HTML)
    if (modalTitleElement) modalTitleElement.textContent = displayActionText; // Set modal title (e.g., "Deleting")
    if (modalItemDescElement) modalItemDescElement.textContent = displayItemDescription; // Set item description (e.g., "file: 'doc.pdf'")
    if (modalActionDescElement) modalActionDescElement.textContent = `Please enter your credentials to confirm ${displayActionText.toLowerCase()}.`; // Full prompt

    // Specific button text/styling for verification modal
    // Assuming this logic is mostly for verificationModal, but generalize if needed
    if (modalElement.id === 'verification-modal') {
        if (confirmButton) {
            confirmButton.textContent = `Confirm ${displayActionText.charAt(0).toUpperCase() + displayActionText.slice(1)}`;
            confirmButton.classList.remove('bg-red-600', 'hover:bg-red-700', 'bg-blue-600', 'hover:bg-blue-700');
            if (displayActionText.toLowerCase() === 'deleting') {
                confirmButton.classList.add('bg-red-600', 'hover:bg-red-700');
            } else {
                confirmButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
            }
        }
    }


    modalElement.classList.remove('hidden');
    modalElement.style.display = 'flex'; // Display the modal


    // --- IMPORTANT: Clear old listeners before adding new ones by cloning buttons ---
    // This is the safest way to avoid duplicate event listeners.
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    confirmButton = newConfirmButton; // Update reference

    const newCancelButton = cancelButton.cloneNode(true);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
    cancelButton = newCancelButton; // Update reference


    // Add event listener for Confirm button
    confirmButton.addEventListener('click', async (event) => {
        if (isFormSubmission) {
            event.preventDefault(); // Prevent default form submission if wrapped in a <form>
        }
        console.log('--- Modal Confirm button CLICKED (callback executing) ---'); // CRITICAL LOG
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            modalStatusMessageElement.textContent = 'Please enter both username and password.';
            modalStatusMessageElement.classList.remove('hidden');
            return;
        }

        confirmButton.disabled = true; // Disable button during processing
        modalStatusMessageElement.textContent = `Processing ${displayActionText.toLowerCase()}...`;
        modalStatusMessageElement.classList.remove('hidden');

        try {
            const success = await confirmCallback(username, password);
            if (success) {
                hideModal(modalElement);
            } else {
                // The callback itself should show more specific alerts on failure
                // If it just returns false, we show a generic modal status
                if (modalStatusMessageElement.textContent.includes('Processing')) { // Only update if no specific error was set by callback
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


// NO need for this DOMContentLoaded listener in dom.js anymore.
// The showModal function now directly attaches listeners.
/*
document.addEventListener('DOMContentLoaded', () => {
    const verificationForm = document.getElementById('verification-form');
    const cancelVerificationBtn = document.getElementById('cancel-verification-btn');

    if (verificationForm) {
        verificationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (currentVerificationCallback) {
                await currentVerificationCallback(modalUsernameInput.value.trim(), modalPasswordInput.value.trim());
            }
        });
    }

    if (cancelVerificationBtn) {
        cancelVerificationBtn.addEventListener('click', () => {
            hideModal(verificationModal);
        });
    }
});
*/
