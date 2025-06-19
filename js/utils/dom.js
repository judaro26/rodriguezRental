// js/utils/dom.js

// Cache common page elements here once for efficiency
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
const uploadFolderModal = document.getElementById('upload-folder-modal');


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
        verificationModal
    ];

    allPages.forEach(page => {
        if (page) {
            page.style.display = 'none';
        } else {
            console.warn(`showPage: A page element was null and could not be hidden. Check its ID.`, page);
        }
    });

    if (pageElement) {
        pageElement.style.display = 'flex';
    } else {
        console.error('showPage: Attempted to show a null pageElement.');
    }

    // Hide any global error/status messages when changing pages
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
}

/**
 * Displays a custom alert modal with a message.
 * @param {string} message - The message to display.
 */
export function showCustomAlert(message) { // <--- Added 'export' here
    const existingAlert = document.getElementById('custom-alert-modal');
    if (existingAlert) existingAlert.remove();

    const alertModal = document.createElement('div');
    alertModal.id = 'custom-alert-modal';
    alertModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    alertModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <p class="text-lg font-semibold mb-4">${message}</p>
            <button id="custom-alert-close-btn" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">OK</button>
        </div>
    `;
    document.body.appendChild(alertModal);

    document.getElementById('custom-alert-close-btn').addEventListener('click', () => {
        alertModal.remove();
    });
}

// Verification Modal specific elements
const modalItemToDeleteNameSpan = document.getElementById('modal-item-to-delete-name');
const modalPromptActionSpan = document.getElementById('modal-prompt-action');
const confirmActionButton = document.getElementById('confirm-action-button');
const modalUsernameInput = document.getElementById('modal-username');
const modalPasswordInput = document.getElementById('modal-password');

let currentVerificationCallback = null;

/**
 * Shows the generic verification modal, sets its content, and prepares for a callback.
 * @param {HTMLElement} modalElement - The modal DOM element (e.g., verificationModal, uploadFolderModal).
 * @param {string} itemName - The name of the item being acted upon (e.g., "file: 'document.pdf'").
 * @param {string} actionType - The type of action (e.g., "deleting", "renaming", "updating").
 * @param {Function} callback - The function to call when the modal's confirm button is clicked,
 * receiving (username, password) as arguments.
 */
export function showModal(modalElement, itemDescription, actionDescription, confirmationCallback) {
    // Set modal content
    modalElement.querySelector('[data-modal-item-description]').textContent = itemDescription;
    modalElement.querySelector('[data-modal-action-description]').textContent = actionDescription;
    
    // Clear previous state
    const statusMessage = modalElement.querySelector('[data-modal-status-message]');
    if (statusMessage) {
        statusMessage.classList.add('hidden');
        statusMessage.textContent = '';
    }
    
    // Show modal
    modalElement.classList.remove('hidden');
    
    // Set up confirm button
    const confirmBtn = modalElement.querySelector('#confirm-verification-btn');
    if (confirmBtn) {
        // Remove any existing listeners to prevent duplicates
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        
        // Add new listener
        modalElement.querySelector('#confirm-verification-btn').addEventListener('click', async () => {
            const username = modalElement.querySelector('[data-modal-username-input]').value;
            const password = modalElement.querySelector('[data-modal-password-input]').value;
            
            try {
                const success = await confirmationCallback(username, password);
                if (success) {
                    hideModal(modalElement);
                }
            } catch (error) {
                if (statusMessage) {
                    statusMessage.textContent = `Error: ${error.message}`;
                    statusMessage.classList.remove('hidden');
                }
            }
        });
    }
}

// In utils/dom.js (assumed based on your main.js imports)
export function hideModal(modalElement) {
    if (modalElement) {
        modalElement.classList.add('hidden'); // This likely sets display: none
    }
}


// Event listener for the verification modal form submission.
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
