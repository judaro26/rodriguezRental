// script.js

document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements ---
    // ... (all your existing DOM element declarations) ...
    const loginPage = document.getElementById('login-page');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginErrorMessage = document.getElementById('login-error-message');
    const loginErrorText = document.getElementById('login-error-text');
    const showRegisterFormBtn = document.getElementById('show-register-form-btn');
    const registrationStatusMessage = document.getElementById('registration-status-message');

    const registerPage = document.getElementById('register-page');
    const registerForm = document.getElementById('register-form');
    const regUsernameInput = document.getElementById('reg-username');
    const regPasswordInput = document.getElementById('reg-password');
    const registerErrorMessage = document.getElementById('register-error-message');
    const registerErrorText = document.getElementById('register-error-text');
    const backToLoginFromRegisterBtn = document.getElementById('back-to-login-from-register-btn');


    const propertySelectionPage = document.getElementById('property-selection-page');
    const propertyCardsContainer = document.getElementById('property-cards-container');
    const propertiesLoadingMessage = document.getElementById('properties-loading-message');
    const propertiesErrorMessage = document.getElementById('properties-error-message');
    const propertiesErrorText = document.getElementById('properties-error-text');
    const addPropertyButton = document.getElementById('add-property-button');
    const refreshPropertiesButton = document.getElementById('refresh-properties-button');
    const backToLoginBtn = document.getElementById('back-to-login-btn');
    const filterAllPropertiesBtn = document.getElementById('filter-all-properties');
    const filterDomesticPropertiesBtn = document.getElementById('filter-domestic-properties');
    const filterForeignPropertiesBtn = document.getElementById('filter-foreign-properties');


    const addPropertyPage = document.getElementById('add-property-page');
    const addPropertyForm = document.getElementById('add-property-form');
    const propertyTitleInput = document.getElementById('property-title');
    const propertyImageInput = document.getElementById('property-image');
    const propertyDescriptionInput = document.getElementById('property-description');
    const propertyCategoriesInput = document.getElementById('property-categories');
    const cancelAddPropertyButton = document.getElementById('cancel-add-property');
    const addPropertyStatus = document.getElementById('add-property-status');
    const backFromAddPropertyBtn = document.getElementById('back-from-add-property-btn');
    const propertyIsForeignInput = document.getElementById('property-is-foreign');


    const propertyCategoriesPage = document.getElementById('property-categories-page');
    const propertyCategoriesNav = document.getElementById('property-categories-nav');
    const categoryDetailsHeading = document.getElementById('category-details-heading');
    const categoryDetailsContent = document.getElementById('category-details-content');
    const dynamicCategoryButtonsContainer = document.getElementById('dynamic-category-buttons-container');
    const categoryLoadingMessage = document.getElementById('category-loading-message');
    const backToPropertiesBtn = document.getElementById('back-to-properties-btn');
    const addNewCategoryButton = document.getElementById('add-new-category-button');
    const deleteCategoryButton = document.getElementById('delete-category-button');
    const refreshCategoriesButtonOnCategoriesPage = document.getElementById('refresh-categories-on-page-button');
    const viewFilesButton = document.getElementById('view-files-button');


    // Property details header elements
    const propertyHeader = document.getElementById('property-header');
    const currentPropertyTitle = document.getElementById('current-property-title');
    const currentPropertyThumbnail = document.getElementById('current-property-thumbnail');


    // New elements for Add Category Detail Page
    const addCategoryDetailPage = document.getElementById('add-category-detail-page');
    const addDetailForm = document.getElementById('add-detail-form');
    const detailNameInput = document.getElementById('detail-name');
    const detailUrlInput = document.getElementById('detail-url');
    const detailDescriptionInput = document.getElementById('detail-description');
    const presetLogoPicker = document.getElementById('preset-logo-picker');
    const customLogoUrlInput = document.getElementById('custom-logo-url');
    let selectedPresetLogoUrl = null;
    const cancelAddDetailButton = document.getElementById('cancel-add-detail');
    const addDetailStatus = document.getElementById('add-detail-status');
    const backFromAddDetailBtn = document.getElementById('back-from-add-detail-btn');
    const addDetailCategoryNameSpan = document.getElementById('add-detail-category-name');
    const detailUsernameAddInput = document.getElementById('detail-username-add');
    const detailPasswordAddInput = document.getElementById('detail-password-add');


    // New elements for Add New Category Page
    const addNewCategoryPage = document.getElementById('add-new-category-page');
    const addNewCategoryForm = document.getElementById('add-new-category-form');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const categoryPropertyTitleSpan = document.getElementById('category-property-title');
    const cancelNewCategoryButton = document.getElementById('cancel-new-category');
    const addNewCategoryStatus = document.getElementById('add-new-category-status');
    const backFromAddNewCategoryBtn = document.getElementById('back-from-add-new-category-btn');

    // New elements for Verification Modal
    const verificationModal = document.getElementById('verification-modal');
    const verificationForm = document.getElementById('verification-form');
    const modalUsernameInput = document.getElementById('modal-username');
    const modalPasswordInput = document.getElementById('modal-password');
    const verificationStatus = document.getElementById('verification-status');
    const modalItemToDeleteNameSpan = document.getElementById('modal-item-to-delete-name');
    const modalPromptActionSpan = document.getElementById('modal-prompt-action');
    const confirmActionButton = document.getElementById('confirm-action-button');
    const cancelVerificationBtn = document.getElementById('cancel-verification-btn');


    // New elements for Update Category Detail Page (for editing existing details)
    const updateCategoryDetailPage = document.getElementById('update-category-detail-page');
    const updateDetailForm = document.getElementById('update-detail-form');
    const updateDetailIdInput = document.getElementById('update-detail-id');
    const updateDetailNameInput = document.getElementById('update-detail-name');
    const updateDetailUrlInput = document.getElementById('update-detail-url');
    const updateDetailDescriptionInput = document.getElementById('update-detail-description');
    const updatePresetLogoPicker = document.getElementById('update-preset-logo-picker');
    const updateCustomLogoUrlInput = document.getElementById('update-custom-logo-url');
    let selectedUpdatePresetLogoUrl = null;
    const cancelUpdateDetailButton = document.getElementById('cancel-update-detail');
    const updateDetailStatus = document.getElementById('update-detail-status');
    const backFromUpdateDetailBtn = document.getElementById('back-from-add-detail-btn');
    const updateDetailCategoryNameSpan = document.getElementById('update-detail-category-name');
    const updateDetailUsernameInput = document.getElementById('update-detail-username');
    const updateDetailPasswordInput = document.getElementById('update-detail-password');


    // New elements for Update Property Page
    const updatePropertyPage = document.getElementById('update-property-page');
    const updatePropertyForm = document.getElementById('update-property-form');
    const updatePropertyIdInput = document.getElementById('update-property-id');
    const updatePropertyTitleInput = document.getElementById('update-property-title');
    const updatePropertyImageInput = document.getElementById('property-image');
    const updatePropertyDescriptionInput = document.getElementById('property-description');
    const updatePropertyCategoriesInput = document.getElementById('update-property-categories');
    const updatePropertyIsForeignInput = document.getElementById('update-property-is-foreign');
    const cancelUpdatePropertyButton = document.getElementById('cancel-update-property');
    const updatePropertyStatus = document.getElementById('update-property-status');
    const backFromUpdatePropertyBtn = document.getElementById('back-from-update-property-btn');

    // Elements for Property Files Page
    const propertyFilesPage = document.getElementById('property-files-page');
    const filesPropertyTitleSpan = document.getElementById('files-property-title');
    const filesPropertyThumbnail = document.getElementById('files-property-thumbnail');
    const fileUploadInput = document.getElementById('file-upload-input');
    const uploadFileButton = document.getElementById('upload-file-button');
    const fileUploadStatus = document.getElementById('file-upload-status');
    const filesListContainer = document.getElementById('files-list-container');
    const backFromFilesButton = document.getElementById('back-from-files-button');

    const propertyFilesContent = document.getElementById('property-files-content');

    // New elements for Upload Folder Selection Modal
    const uploadFolderModal = document.getElementById('upload-folder-modal');
    const folderSelectDropdown = document.getElementById('folder-select-dropdown');
    const newFolderNameContainer = document.getElementById('new-folder-name-container');
    const newFolderNameInput = document.getElementById('new-folder-name-input');
    const cancelFolderSelectionBtn = document.getElementById('cancel-folder-selection-btn');
    const confirmFolderSelectionBtn = document.getElementById('confirm-folder-selection-btn');
    const uploadFolderModalStatus = document.getElementById('upload-folder-modal-status');


    // --- Global variables ---
    let currentVerificationCallback = null;
    let currentUserForeignApprovedStatus = false;
    let currentUserDomesticApprovedStatus = false;
    let currentLoggedInUsername = '';
    let currentLoggedInPassword = ''; // WARNING: Storing plain-text password is a HIGH SECURITY RISK for production.

    let selectedFiles = new Set();
    let currentFolder = 'all';
    let folders = []; // This array will hold logical folder data for the UI

    // Variables to temporarily hold file data during folder selection flow
    let fileToUpload = null;
    let base64DataToUpload = null;
    let mimeTypeToUpload = null;


    // --- Data Definitions ---
    let properties = [];
    let currentSelectedProperty = null;
    let currentSelectedCategoryName = null;

    const presetLogos = [
        { name: 'Water', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/drop-fill.svg' },
        { name: 'Electricity', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/lightning-fill.svg' },
        { name: 'Gas', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/fire-fill.svg' },
        { name: 'Internet', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/wifi-high-fill.svg' },
        { name: 'Trash', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/trash-fill.svg' },
        { name: 'Rent', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/house-fill.svg' },
        { name: 'Mortgage', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/bank-fill.svg' },
        { name: 'HOA', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/users-three-fill.svg' },
        { name: 'Insurance', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/shield-check-fill.svg' },
        { name: 'Repair', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/wrench-fill.svg' },
        { name: 'Cleaning', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/broom-fill.svg' },
        { name: 'Phone', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/phone-call-fill.svg' },
        { name: 'Streaming', url: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/fill/television-fill.svg' }
    ];

    // --- Custom Alert/Modal Function (Replaces alert()) ---
    function showCustomAlert(message) {
        const existingAlert = document.getElementById('custom-alert-modal');
        if (existingAlert) existingAlert.remove(); // Remove any previous alerts

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

    // --- Helper functions for FILE MANAGEMENT - Defined early to ensure availability ---
    function getFileIcon(extension, filename) {
        const iconMap = {
            pdf: 'file-pdf',
            doc: 'file-word',
            docx: 'file-word',
            xls: 'file-excel',
            xlsx: 'file-excel',
            ppt: 'file-powerpoint',
            pptx: 'file-powerpoint',
            jpg: 'file-image',
            jpeg: 'file-image',
            png: 'file-image',
            gif: 'file-image',
            webp: 'file-image', // Added webp support
            txt: 'file-alt',
            csv: 'file-csv', // Added csv support
            zip: 'file-archive',
            mp3: 'file-audio',
            mp4: 'file-video'
        };

        const icon = iconMap[extension] || 'file'; // Default to 'file' if extension not found
        return `<i class="fas fa-${icon} file-icon text-blue-500"></i>`;
    }

    function formatFileSize(bytes) {
        if (isNaN(bytes) || bytes === undefined) return '0 Bytes';
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function toggleFileSelection(fileId) {
        if (selectedFiles.has(fileId)) {
            selectedFiles.delete(fileId);
        } else {
            selectedFiles.add(fileId);
        }
        updateSelectionUI();
    }

    function updateSelectionUI() {
        document.querySelectorAll('.file-item').forEach(item => {
            const fileId = parseInt(item.dataset.fileId);
            if (selectedFiles.has(fileId)) {
                item.classList.add('selected');
                item.querySelector('.file-checkbox').checked = true;
            } else {
                item.classList.remove('selected');
                item.querySelector('.file-checkbox').checked = false;
            }
        });

        const moveButton = document.getElementById('move-to-folder-button');
        const deleteButton = document.getElementById('delete-selected-files-button');

        if (moveButton && deleteButton) {
            const hasSelection = selectedFiles.size > 0;
            moveButton.disabled = !hasSelection;
            deleteButton.disabled = !hasSelection;
        }
    }

    // Add this function here to prevent "updateFilterButtonsHighlight is not defined" error
    function updateFilterButtonsHighlight() {
        if (filterAllPropertiesBtn) {
            filterAllPropertiesBtn.classList.remove('bg-blue-500', 'text-white');
            filterAllPropertiesBtn.classList.add('bg-gray-200', 'text-gray-800');
        }
        if (filterDomesticPropertiesBtn) {
            filterDomesticPropertiesBtn.classList.remove('bg-blue-500', 'text-white');
            filterDomesticPropertiesBtn.classList.add('bg-gray-200', 'text-gray-800');
        }
        if (filterForeignPropertiesBtn) {
            filterForeignPropertiesBtn.classList.remove('bg-blue-500', 'text-white');
            filterForeignPropertiesBtn.classList.add('bg-gray-200', 'text-gray-800');
        }

        if (currentPropertyFilter === null && filterAllPropertiesBtn) {
            filterAllPropertiesBtn.classList.remove('bg-gray-200', 'text-gray-800');
            filterAllPropertiesBtn.classList.add('bg-blue-500', 'text-white');
        } else if (currentPropertyFilter === false && filterDomesticPropertiesBtn) {
            filterDomesticPropertiesBtn.classList.remove('bg-gray-200', 'text-gray-800');
            filterDomesticPropertiesBtn.classList.add('bg-blue-500', 'text-white');
        } else if (currentPropertyFilter === true && filterForeignPropertiesBtn) {
            filterForeignPropertiesBtn.classList.remove('bg-gray-200', 'text-gray-800');
            filterForeignPropertiesBtn.classList.add('bg-blue-500', 'text-white');
        }
    }

    function renderFilesList(files) {
        if (!filesListContainer) return;

        if (files.length === 0) {
            filesListContainer.innerHTML = `<p class="text-gray-500 p-4 text-center">No files found in this folder.</p>`;
            return;
        }

        filesListContainer.innerHTML = '';

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.fileId = file.id;

            const fileExtension = file.filename.split('.').pop().toLowerCase();
            const isSelected = selectedFiles.has(file.id);

            if (isSelected) {
                fileItem.classList.add('selected');
            }

            fileItem.innerHTML = `
                <input type="checkbox" class="file-checkbox" ${isSelected ? 'checked' : ''} data-file-id="${file.id}">
                ${getFileIcon(fileExtension, file.filename)}
                <div class="file-info flex-grow">
                    <a href="${file.file_url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${file.filename}</a>
                    <div class="text-xs text-gray-500">
                        ${formatFileSize(file.size)} • ${new Date(file.uploaded_at).toLocaleString()}
                    </div>
                </div>
                <div class="file-actions">
                    <button class="edit-file-btn bg-gray-400 text-gray-800 py-1 px-2 rounded-md hover:bg-gray-500"
                        data-file-id="${file.id}" data-file-name="${file.filename}">
                        Edit
                    </button>
                    <button class="delete-file-btn bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600"
                        data-file-id="${file.id}" data-file-name="${file.filename}">
                        Delete
                    </button>
                </div>
            `;

            // Add event listeners
            const checkbox = fileItem.querySelector('.file-checkbox');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFileSelection(file.id);
                });
            }

            fileItem.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                    toggleFileSelection(file.id);
                }
            });

            // Add edit button event listener
            const editBtn = fileItem.querySelector('.edit-file-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent toggling selection
                    // === EDIT FILE LOGIC ===
                    // For a full implementation, you'd typically show an edit modal
                    // and pre-fill it with file.filename, file.folder_name, etc.
                    // Then call a Netlify function to update the file details in the DB.
                    showCustomAlert(`Edit functionality for file "${file.filename}" (ID: ${file.id}) is not yet fully implemented. You can implement a modal to edit file details here.`);
                });
            }

            // Add delete button event listener
            const deleteBtn = fileItem.querySelector('.delete-file-btn');
            if (deleteBtn) {
                console.log(`Attaching delete listener to file: ${file.filename}`); // DEBUG LOG
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent toggling selection
                    console.log(`Delete button clicked for file: ${file.filename}`); // DEBUG LOG
                    console.log("verificationModal element:", verificationModal); // DEBUG LOG
                    showModal( // Replaced confirm with showModal as per instructions
                        verificationModal,
                        `file: "${file.filename}"`,
                        `deleting`,
                        async (username, password) => {
                            if (verificationStatus) {
                                verificationStatus.classList.remove('hidden');
                                verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                                verificationStatus.textContent = 'Verifying and deleting file...';
                            }
                            try {
                                const response = await fetch('/.netlify/functions/deleteFiles', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        file_ids: [file.id], // Pass only the single file ID for deletion
                                        property_id: currentSelectedProperty.id,
                                        username: username,
                                        password: password
                                    })
                                });

                                const data = await response.json();

                                if (response.ok) {
                                    if (verificationStatus) {
                                        verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                                        verificationStatus.textContent = data.message;
                                    }
                                    setTimeout(async () => {
                                        hideModal(verificationModal);
                                        await displayPropertyFiles(currentFolder); // Refresh the file list after deletion
                                    }, 1500);
                                } else {
                                    if (verificationStatus) {
                                        verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                                        verificationStatus.textContent = data.message || 'Deletion failed. Check credentials or try again.';
                                        if (modalPasswordInput) modalPasswordInput.value = ''; // Clear password field on failure
                                    }
                                }
                            } catch (error) {
                                console.error('Error during single file delete verification:', error);
                                if (verificationStatus) {
                                    verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                                    verificationStatus.textContent = `Network error: ${error.message}`;
                                }
                            }
                        }
                    );
                });
            }

            filesListContainer.appendChild(fileItem);
        });
    }

    // renderFoldersList function - Needs to be defined before displayPropertyFiles calls it
    function renderFoldersList() {
        const foldersList = document.getElementById('folders-list');
        if (!foldersList) return;

        // Clear and rebuild folder list based on the global 'folders' array
        foldersList.innerHTML = `
            <li class="folder-item ${currentFolder === 'all' ? 'active' : ''}" data-folder-id="all">
                <svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                All Files
            </li>
        `;

        folders.forEach(folder => {
            const folderItem = document.createElement('li');
            folderItem.className = `folder-item ${currentFolder === folder.id ? 'active' : ''}`;
            folderItem.dataset.folderId = folder.id;

            folderItem.innerHTML = `
                <div class="folder-content">
                    <svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    ${folder.name}
                </div>
                <div class="folder-actions">
                    <button class="edit-folder-btn text-blue-500 hover:text-blue-700 ml-2" data-folder-id="${folder.id}" data-folder-name="${folder.name}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-folder-btn text-red-500 hover:text-red-700 ml-2" data-folder-id="${folder.id}" data-folder-name="${folder.name}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Add event listeners for folder selection
            folderItem.querySelector('.folder-content').addEventListener('click', () => {
                currentFolder = folder.id;
                displayPropertyFiles(folder.id);
            });

            // Add event listeners for edit and delete buttons
            folderItem.querySelector('.edit-folder-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent folder selection when clicking edit
                const folderIdToEdit = e.currentTarget.dataset.folderId;
                const folderNameToEdit = e.currentTarget.dataset.folderName;
                editFolder(folderIdToEdit, folderNameToEdit);
            });

            folderItem.querySelector('.delete-folder-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent folder selection when clicking delete
                const folderIdToDelete = e.currentTarget.dataset.folderId;
                const folderNameToDelete = e.currentTarget.dataset.folderName;
                deleteFolder(folderIdToDelete, folderNameToDelete);
            });

            foldersList.appendChild(folderItem);
        });
    }

    // --- New Functions for Folder Management ---

    async function editFolder(folderId, oldFolderName) {
        const newFolderName = prompt(`Rename folder "${oldFolderName}" to:`, oldFolderName);
        if (newFolderName === null || newFolderName.trim() === '') {
            showCustomAlert('Folder name cannot be empty or cancelled.');
            return;
        }
        const trimmedNewName = newFolderName.trim();
        if (trimmedNewName === oldFolderName) {
            showCustomAlert('Folder name is the same. No changes made.');
            return;
        }

        // Check if new name conflicts with existing folder names (case-insensitive)
        const existingFolderNames = folders.map(f => f.name.toLowerCase());
        if (existingFolderNames.includes(trimmedNewName.toLowerCase())) {
            showCustomAlert('A folder with this name already exists.');
            return;
        }

        showModal(
            verificationModal,
            `folder: "${oldFolderName}" to "${trimmedNewName}"`,
            `renaming`,
            async (username, password) => {
                if (verificationStatus) {
                    verificationStatus.classList.remove('hidden');
                    verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                    verificationStatus.textContent = 'Verifying and renaming folder...';
                }
                try {
                    const response = await fetch('/.netlify/functions/updateFolder', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            property_id: currentSelectedProperty.id,
                            folder_id: folderId,
                            new_folder_name: trimmedNewName,
                            username: username,
                            password: password
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        if (verificationStatus) {
                            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                            verificationStatus.textContent = data.message;
                        }
                        setTimeout(async () => {
                            hideModal(verificationModal);
                            await displayPropertyFiles(currentFolder); // Refresh folder list and files
                        }, 1500);
                    } else {
                        if (verificationStatus) {
                            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                            verificationStatus.textContent = data.message || 'Renaming failed. Check credentials or try again.';
                            if (modalPasswordInput) modalPasswordInput.value = '';
                        }
                    }
                } catch (error) {
                    console.error('Error during folder rename verification:', error);
                    if (verificationStatus) {
                        verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                        verificationStatus.textContent = `Network error: ${error.message}`;
                    }
                }
            }
        );
    }

    async function deleteFolder(folderId, folderName) {
        showModal(
            verificationModal,
            `folder: "${folderName}"`,
            `deleting`,
            async (username, password) => {
                if (verificationStatus) {
                    verificationStatus.classList.remove('hidden');
                    verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                    verificationStatus.textContent = 'Verifying and deleting folder...';
                }
                try {
                    const response = await fetch('/.netlify/functions/deleteFolder', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            property_id: currentSelectedProperty.id,
                            folder_id: folderId,
                            username: username,
                            password: password
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        if (verificationStatus) {
                            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                            verificationStatus.textContent = data.message;
                        }
                        setTimeout(async () => {
                            hideModal(verificationModal);
                            // If the deleted folder was the currently viewed one, switch to 'all files'
                            if (currentFolder === folderId) {
                                currentFolder = 'all';
                            }
                            await displayPropertyFiles(currentFolder); // Refresh files and folders
                        }, 1500);
                    } else {
                        if (verificationStatus) {
                            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                            verificationStatus.textContent = data.message || 'Deletion failed. Check credentials or try again.';
                            if (modalPasswordInput) modalPasswordInput.value = '';
                        }
                    }
                } catch (error) {
                    console.error('Error during folder delete verification:', error);
                    if (verificationStatus) {
                        verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                        verificationStatus.textContent = `Network error: ${error.message}`;
                    }
                }
            }
        );
    }


    // --- Fetch Properties from Netlify Function (Connected to Neon DB) ---
    // MOVED UP for proper function definition order
    async function fetchProperties(isForeignFilter = null) {
        if (propertiesLoadingMessage) propertiesLoadingMessage.style.display = 'block';
        if (propertiesErrorMessage) propertiesErrorMessage.classList.add('hidden');
        if (propertyCardsContainer) propertyCardsContainer.innerHTML = '';

        try {
            const response = await fetch('/.netlify/functions/getProperties');
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorBody.details || response.statusText}`);
            }
            properties = await response.json();
            properties.sort((a, b) => a.id - b.id);
            console.log('All Properties loaded from Neon DB (sorted by ID):', properties);

            applyPropertyFilter(isForeignFilter);
        }
        catch (error) {
            console.error('Error fetching properties from Netlify Function:', error);
            if (propertiesErrorMessage) propertiesErrorMessage.classList.remove('hidden');
            if (propertiesErrorText) propertiesErrorText.textContent = error.message;
        } finally {
            if (propertiesLoadingMessage) propertiesLoadingMessage.style.display = 'none';
        }
    }

    // --- Apply Property Filter and Render Cards ---
    // MOVED UP for proper function definition order
    let displayedProperties = [];
    let currentPropertyFilter = null;

    function applyPropertyFilter(filter) {
        currentPropertyFilter = filter;

        if (filter === true) {
            if (currentUserForeignApprovedStatus) {
                displayedProperties = properties.filter(p => p.is_foreign === true);
            } else {
                showCustomAlert('You are not approved to view foreign properties. Please contact an administrator.');
                displayedProperties = properties.filter(p => p.is_foreign === false);
                currentPropertyFilter = false;
            }
        } else if (filter === false) {
            if (currentUserDomesticApprovedStatus) {
                displayedProperties = properties.filter(p => p.is_foreign === false);
            } else {
                showCustomAlert('You are not approved to view domestic properties. Please contact an administrator.');
                displayedProperties = properties.filter(p => p.is_foreign === true);
                currentPropertyFilter = true;
            }
        } else {
            if (currentUserDomesticApprovedStatus && currentUserForeignApprovedStatus) {
                displayedProperties = [...properties];
            } else if (currentUserDomesticApprovedStatus) {
                displayedProperties = properties.filter(p => p.is_foreign === false);
                showCustomAlert('You are not approved to view foreign properties. Displaying domestic only.');
                currentPropertyFilter = false;
            } else if (currentUserForeignApprovedStatus) {
                displayedProperties = properties.filter(p => p.is_foreign === true);
                showCustomAlert('You are not approved to view domestic properties. Displaying foreign only.');
                currentPropertyFilter = true;
            } else {
                displayedProperties = [];
                showCustomAlert('You are not approved to view any properties. Please contact an administrator.');
            }
        }
        renderPropertyCards();
        updateFilterButtonsHighlight();
    }

    // --- Page Navigation Functions ---
    function showPage(pageElement) {
        // List all possible page elements here to ensure they are hidden
        const allPages = [
            loginPage, registerPage, propertySelectionPage, addPropertyPage,
            propertyCategoriesPage, addCategoryDetailPage, addNewCategoryPage,
            updatePropertyPage, updateCategoryDetailPage, propertyFilesPage,
            verificationModal // Ensure verification modal is hidden
            // REMOVED uploadFolderModal from this list. Its visibility is handled independently.
        ];

        allPages.forEach(page => {
            if (page) {
                page.style.display = 'none';
            } else {
                // Log which element was not found, helpful for debugging missing IDs in HTML
                console.warn('showPage: A page element was null and could not be hidden.', page);
            }
        });

        if (pageElement) {
            // Set the display style for the target page
            pageElement.style.display = 'flex'; // Assuming 'flex' is the desired display for your main pages
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

    // --- Show/Hide Modal Function ---
    function showModal(modalElement, itemName, actionType, callback) {
        console.log("showModal called for:", itemName, "action:", actionType); // DEBUG LOG
        console.log("modalElement received:", modalElement); // DEBUG LOG
        if (!modalElement) {
            console.error("showModal: modalElement is null or undefined. Cannot display modal.");
            return; // Prevent further errors if modalElement is null
        }
        modalElement.classList.remove('hidden');
        // --- FIX: Explicitly set display to flex to override inline/other CSS ---
        modalElement.style.display = 'flex';
        // --- END FIX ---

        if (modalItemToDeleteNameSpan) modalItemToDeleteNameSpan.textContent = itemName;
        if (modalPromptActionSpan) {
            modalPromptActionSpan.textContent = `Please enter your credentials to confirm ${actionType} `;
        }

        if (confirmActionButton) {
            confirmActionButton.textContent = `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`;
            confirmActionButton.classList.remove('bg-red-600', 'hover:bg-red-700', 'bg-blue-600', 'hover:bg-blue-700');
            if (actionType === 'deleting') {
                confirmActionButton.classList.add('bg-red-600', 'hover:bg-red-700');
            } else if (actionType === 'updating' || actionType === 'renaming') { // Added 'renaming'
                confirmActionButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
            }
        }

        currentVerificationCallback = callback;
        if (modalUsernameInput) modalUsernameInput.value = '';
        if (modalPasswordInput) modalPasswordInput.value = '';
        if (verificationStatus) {
            verificationStatus.classList.add('hidden');
            verificationStatus.textContent = '';
        }
    }

    function hideModal(modalElement) {
        modalElement.classList.add('hidden');
        // --- FIX: Explicitly set display to none when hiding ---
        modalElement.style.display = 'none';
        // --- END FIX ---
        currentVerificationCallback = null;
    }

    // --- Login Logic ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const const_password = passwordInput.value.trim();

        if (loginErrorMessage) loginErrorMessage.classList.add('hidden');
        if (loginErrorText) loginErrorText.textContent = '';

        if (!username || !const_password) {
            if (loginErrorMessage) loginErrorMessage.classList.remove('hidden');
            if (loginErrorText) loginErrorText.textContent = 'Please enter both username and password.';
            return;
        }

        try {
            const response = await fetch('/.netlify/functions/loginUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: const_password })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login successful:", data.message);
                currentUserForeignApprovedStatus = data.foreign_approved;
                currentUserDomesticApprovedStatus = data.domestic_approved;
                currentLoggedInUsername = username;
                currentLoggedInPassword = const_password;

                showPage(propertySelectionPage);
                await fetchProperties(null); // This call is now safe because fetchProperties is defined earlier
                updateFilterButtonsHighlight();
            } else {
                if (loginErrorMessage) loginErrorMessage.classList.remove('hidden');
                if (loginErrorText) loginErrorText.textContent = data.message || 'An unknown error occurred during login.';
                if (passwordInput) passwordInput.value = '';
            }
        } catch (error) {
            console.error("Fetch error during login:", error);
            if (loginErrorMessage) loginErrorMessage.classList.remove('hidden');
            if (loginErrorText) loginErrorText.textContent = 'Network error or server issue. Please try again later.';
            if (passwordInput) passwordInput.value = '';
        }
    });

    // --- Registration Logic ---
    if (showRegisterFormBtn) {
        showRegisterFormBtn.addEventListener('click', () => {
            showPage(registerPage);
            if (regUsernameInput) regUsernameInput.value = '';
            if (regPasswordInput) regPasswordInput.value = '';
            if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
            if (registrationStatusMessage) registrationStatusMessage.classList.add('hidden');
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = regUsernameInput.value.trim();
            const password = regPasswordInput.value.trim();

            if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
            if (registerErrorText) registerErrorText.textContent = '';

            if (!username || !password) {
                if (registerErrorMessage) registerErrorMessage.classList.remove('hidden');
                if (registerErrorText) registerErrorText.textContent = 'Please enter both username and password.';
                return;
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
                    showPage(loginPage);
                    if (usernameInput) usernameInput.value = username;
                    if (passwordInput) passwordInput.value = '';
                } else {
                    if (registerErrorMessage) registerErrorMessage.classList.remove('hidden');
                    if (registerErrorText) registerErrorText.textContent = data.message || 'An unknown error occurred during registration.';
                    if (regPasswordInput) regPasswordInput.value = '';
                }
            } catch (error) {
                console.error("Fetch error during registration:", error);
                if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
                if (registerErrorText) registerErrorText.textContent = 'Network error or server issue. Please try again later.';
                if (regPasswordInput) regPasswordInput.value = '';
            }
        });
    }

    // --- Property Selection Logic ---
    function renderPropertyCards() {
        if (propertyCardsContainer) propertyCardsContainer.innerHTML = '';
        if (displayedProperties.length === 0) {
            if (propertyCardsContainer) propertyCardsContainer.innerHTML = `<p class="text-gray-600 w-full text-center">No properties found matching this filter. Add a new one!</p>`;
            return;
        }
        displayedProperties.forEach(property => {
            const propertyCard = document.createElement('div');
            propertyCard.classList.add(
                'bg-white', 'rounded-xl', 'shadow-md', 'overflow-hidden', 'cursor-pointer',
                'hover:shadow-lg', 'transition-shadow', 'duration-200', 'border', 'border-gray-200',
                'flex', 'flex-col'
            );
            propertyCard.dataset.propertyId = property.id;

            const imageUrl = property.image || 'https://placehold.co/400x250/CCCCCC/FFFFFF?text=No+Image';

            propertyCard.innerHTML = `
                <img src="${imageUrl}" alt="${property.title}" class="w-full h-40 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/400x250/CCCCCC/FFFFFF?text=Image+Load+Error';">
                <div class="p-4 flex-grow">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${property.title}</h3>
                    <p class="text-gray-600 text-sm">${property.description}</p>
                </div>
                <div class="p-4 pt-0 flex justify-between gap-2">
                    <button class="w-1/2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold" data-action="view-property-details" data-property-id="${property.id}">View Details</button>
                    <button class="w-1/2 bg-gray-400 text-gray-800 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200 font-semibold" data-action="edit-property" data-property-id="${property.id}">Edit</button>
                </div>
            `;

            propertyCard.querySelector('[data-action="view-property-details"]').addEventListener('click', (e) => {
                e.stopPropagation();
                currentSelectedProperty = properties.find(p => p.id == e.target.dataset.propertyId);
                showPage(propertyCategoriesPage);
                renderPropertyCategories();
            });

            propertyCard.querySelector('[data-action="edit-property"]').addEventListener('click', (e) => {
                e.stopPropagation();
                const propertyIdToEdit = e.target.dataset.propertyId;
                const propertyToEdit = properties.find(p => p.id == propertyIdToEdit);
                if (propertyToEdit) {
                    showPage(updatePropertyPage);
                    if (updatePropertyIdInput) updatePropertyIdInput.value = propertyToEdit.id;
                    if (updatePropertyTitleInput) updatePropertyTitleInput.value = propertyToEdit.title;
                    if (updatePropertyImageInput) updatePropertyImageInput.value = propertyToEdit.image;
                    if (updatePropertyDescriptionInput) updatePropertyDescriptionInput.value = propertyToEdit.description;
                    if (updatePropertyCategoriesInput) updatePropertyCategoriesInput.value = propertyToEdit.categories.join(', ');
                    if (updatePropertyIsForeignInput) updatePropertyIsForeignInput.checked = propertyToEdit.is_foreign;
                    if (updatePropertyStatus) updatePropertyStatus.classList.add('hidden');
                } else {
                    showCustomAlert('Property not found for editing.');
                }
            });

            if (propertyCardsContainer) propertyCardsContainer.appendChild(propertyCard);
        });
    }

    // Filter button event listeners
    if (filterAllPropertiesBtn) filterAllPropertiesBtn.addEventListener('click', () => applyPropertyFilter(null));
    if (filterDomesticPropertiesBtn) filterDomesticPropertiesBtn.addEventListener('click', () => applyPropertyFilter(false));
    if (filterForeignPropertiesBtn) filterForeignPropertiesBtn.addEventListener('click', () => {
        if (currentUserForeignApprovedStatus) {
            applyPropertyFilter(true);
        } else {
            showCustomAlert('You are not approved to view foreign properties. Please contact an administrator.');
            applyPropertyFilter(false);
        }
    });

    if (addPropertyButton) {
        addPropertyButton.addEventListener('click', () => {
            showPage(addPropertyPage);
            if (addPropertyForm) addPropertyForm.reset();
            if (propertyIsForeignInput) propertyIsForeignInput.checked = false;
            if (addPropertyStatus) addPropertyStatus.classList.add('hidden');
        });
    }

    // --- Add New Property Form Logic ---
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            console.log("Add Property form submitted.");

            const title = propertyTitleInput.value.trim();
            const image = propertyImageInput.value.trim();
            const description = propertyDescriptionInput.value.trim();
            const categoriesString = propertyCategoriesInput.value.trim();
            const isForeign = propertyIsForeignInput.checked;

            if (!title || !image || !description || !categoriesString) {
                if (addPropertyStatus) {
                    addPropertyStatus.classList.remove('hidden');
                    addPropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-yellow-100 text-yellow-700';
                    addPropertyStatus.textContent = 'Please fill in all required fields.';
                }
                return;
            }

            const parsedCategories = categoriesString.split(',').map(cat => cat.trim()).filter(cat => cat !== '');

            if (addPropertyStatus) {
                addPropertyStatus.classList.remove('hidden');
                addPropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                addPropertyStatus.textContent = 'Saving property...';
            }

            try {
                const response = await fetch('/.netlify/functions/saveProperty', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title, image, description, categories: parsedCategories, is_foreign: isForeign })
                });

                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorBody.details || response.statusText}`);
                }

                const savedProperty = await response.json();
                console.log('Property saved successfully:', savedProperty);

                if (addPropertyStatus) {
                    addPropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                    addPropertyStatus.textContent = 'Property saved successfully!';
                }

                setTimeout(async () => {
                    showPage(propertySelectionPage);
                    await fetchProperties(currentPropertyFilter);
                }, 1500);

            } catch (error) {
                console.error('Error saving property:', error);
                if (addPropertyStatus) {
                    addPropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                    addPropertyStatus.textContent = `Error saving property: ${error.message}`;
                }
            }
        });
    }

    if (cancelAddPropertyButton) {
        cancelAddPropertyButton.addEventListener('click', () => {
            showPage(propertySelectionPage);
        });
    }

    // --- Property Categories Page Logic ---
    function renderPropertyCategories() {
        if (propertyCategoriesNav) propertyCategoriesNav.innerHTML = '';
        // Update the property header details
        if (currentPropertyTitle && currentPropertyThumbnail && currentSelectedProperty) {
            currentPropertyTitle.textContent = currentSelectedProperty.title;
            currentPropertyThumbnail.src = currentSelectedProperty.image || 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
            currentPropertyThumbnail.alt = currentSelectedProperty.title;
        } else if (currentPropertyTitle && currentPropertyThumbnail) {
            currentPropertyTitle.textContent = 'Category Details';
            currentPropertyThumbnail.src = 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
            currentPropertyThumbnail.alt = 'Property Thumbnail';
        }


        if (!currentSelectedProperty || !currentSelectedProperty.categories || currentSelectedProperty.categories.length === 0) {
            if (propertyCategoriesNav) propertyCategoriesNav.innerHTML = `<p class="text-gray-500 text-sm">No categories defined for this property.</p>`;
            if (deleteCategoryButton) deleteCategoryButton.style.display = 'none';
            if (addNewCategoryButton) addNewCategoryButton.style.display = 'block';
            if (refreshCategoriesButtonOnCategoriesPage) refreshCategoriesButtonOnCategoriesPage.style.display = 'block';
            const addVendorButton = document.getElementById('add-category-detail-button-bottom');
            if (addVendorButton) addVendorButton.style.display = 'none';
            return;
        }

        if (deleteCategoryButton) deleteCategoryButton.style.display = 'block';
        if (addNewCategoryButton) addNewCategoryButton.style.display = 'block';
        if (refreshCategoriesButtonOnCategoriesPage) refreshCategoriesButtonOnCategoriesPage.style.display = 'block';
        const addVendorButton = document.getElementById('add-category-detail-button-bottom');
        if (addVendorButton) addVendorButton.style.display = 'none';

        currentSelectedProperty.categories.forEach(categoryName => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add(
                'cursor-pointer', 'p-3', 'rounded-lg', 'hover:bg-blue-100', 'transition-colors', 'duration-200', 'text-gray-700', 'font-medium', 'mb-2'
            );
            categoryDiv.textContent = categoryName;
            categoryDiv.dataset.categoryName = categoryName;
            categoryDiv.addEventListener('click', () => {
                if (propertyFilesContent) propertyFilesContent.style.display = 'none';
                if (categoryDetailsContent) categoryDetailsContent.style.display = 'flex';

                currentSelectedCategoryName = categoryName;
                displayCategoryDetails(categoryName);
                if (categoryDetailsHeading) categoryDetailsHeading.textContent = `Your ${categoryName} Details`;
                document.querySelectorAll('#property-categories-nav > div').forEach(div => {
                    div.classList.remove('bg-blue-200', 'text-blue-800');
                });
                categoryDiv.classList.add('bg-blue-200', 'text-blue-800');
            });
            if (propertyCategoriesNav) propertyCategoriesNav.appendChild(categoryDiv);
        });

        if (currentSelectedProperty.categories.length > 0) {
            const previouslySelectedDiv = currentSelectedCategoryName
                ? (propertyCategoriesNav ? propertyCategoriesNav.querySelector(`[data-category-name="${currentSelectedCategoryName}"]`) : null)
                : null;

            if (previouslySelectedDiv) {
                previouslySelectedDiv.click();
            } else {
                const firstCategoryDiv = propertyCategoriesNav ? propertyCategoriesNav.querySelector('div') : null;
                if (firstCategoryDiv) {
                    firstCategoryDiv.click();
                }
            }
        }
    }

    // --- Display Category Details / Dynamic Buttons (now tiles) ---
    async function displayCategoryDetails(selectedCategoryName) {
        if (!categoryDetailsContent || !propertyFilesContent) return;

        propertyFilesContent.style.display = 'none';
        categoryDetailsContent.style.display = 'flex';

        const securityWarningDiv = document.getElementById('security-warning');
        const buttonsContainer = document.getElementById('dynamic-category-buttons-container');
        const loadingMessage = document.getElementById('category-loading-message');
        const addVendorButton = document.getElementById('add-category-detail-button-bottom');

        if (!buttonsContainer || !loadingMessage) return;

        // Clear previous content
        buttonsContainer.innerHTML = '';
        loadingMessage.style.display = 'block';
        loadingMessage.textContent = `Loading details for "${selectedCategoryName}"...`;

        if (addVendorButton) addVendorButton.style.display = 'block';

        try {
            const response = await fetch(`/.netlify/functions/getCategoryDetails?property_id=${currentSelectedProperty.id}&category_name=${encodeURIComponent(selectedCategoryName)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const details = await response.json();
            console.log(`Details for ${selectedCategoryName}:`, details);

            loadingMessage.style.display = 'none';
            buttonsContainer.innerHTML = '';

            if (details.length === 0) {
                const noDetailsMessage = document.createElement('p');
                noDetailsMessage.classList.add('text-gray-600', 'mt-4');
                noDetailsMessage.textContent = `No details found for category: "${selectedCategoryName}".`;
                buttonsContainer.appendChild(noDetailsMessage);
            } else {
                details.forEach(detail => {
                    const detailTile = document.createElement('div');
                    detailTile.classList.add('detail-tile');
                    detailTile.dataset.detailId = detail.id;

                    const logoHtml = detail.detail_logo_url
                        ? `<img src="${detail.detail_logo_url}" alt="${detail.detail_name}" class="object-contain w-16 h-16 mb-2" onerror="this.onerror=null;this.src='https://placehold.co/64x64/CCCCCC/FFFFFF?text=Logo';">`
                        : `<div class="logo-placeholder w-16 h-16 mb-2">${detail.detail_name.substring(0,3)}</div>`;

                    const usernameInputId = `username-${detail.id}`;
                    const passwordInputId = `password-${detail.id}`;

                    detailTile.innerHTML = `
                        ${logoHtml}
                        <h3>${detail.detail_name}</h3>
                        ${detail.detail_description ? `<p>${detail.detail_description}</p>` : ''}
                        <div class="credential-container">
                            <div class="credential-field">
                                <label for="${usernameInputId}">User:</label>
                                <input type="text" id="${usernameInputId}" value="${detail.detail_username || ''}" placeholder="Username" readonly>
                                <button class="copy-btn" data-target="${usernameInputId}">Copy</button>
                            </div>
                            <div class="credential-field">
                                <label for="${passwordInputId}">Pass:</label>
                                <input type="password" id="${passwordInputId}" value="${detail.detail_password || ''}" placeholder="Password" readonly>
                                <button class="password-toggle-btn" data-target="${passwordInputId}">👁️</button>
                                <button class="copy-btn" data-target="${passwordInputId}">Copy</button>
                            </div>
                            <p class="text-xs text-red-500 mt-1">
                                Note: Credentials are stored directly in your database. **This is a HIGH SECURITY RISK.**
                                Consider using a dedicated password manager for sensitive data.
                            </p>
                        </div>
                        <div class="detail-tile-actions">
                            <button class="bg-blue-500 text-white hover:bg-blue-600" data-action="view" data-url="${detail.detail_url}">View Site</button>
                            <button class="bg-gray-400 text-gray-800 hover:bg-gray-500" data-action="edit" data-id="${detail.id}" data-name="${detail.detail_name}" data-url="${detail.detail_url}" data-description="${detail.detail_description || ''}" data-logo="${detail.detail_logo_url || ''}" data-username="${detail.detail_username || ''}" data-password="${detail.detail_password || ''}">Edit</button>
                            <button class="bg-red-500 text-white hover:bg-red-600" data-action="delete-detail" data-id="${detail.id}" data-name="${detail.detail_name}">Delete</button>
                        </div>
                    `;

                    // Add event listeners only if elements exist
                    const passwordToggleBtn = detailTile.querySelector(`.password-toggle-btn[data-target="${passwordInputId}"]`);
                    if (passwordToggleBtn) {
                        passwordToggleBtn.addEventListener('click', (e) => {
                            const targetInput = document.getElementById(e.target.dataset.target);
                            if (targetInput) {
                                targetInput.type = targetInput.type === 'password' ? 'text' : 'password';
                                e.target.textContent = targetInput.type === 'password' ? '👁️' : '🙈';
                            }
                        });
                    }

                    detailTile.querySelectorAll('.copy-btn').forEach(button => {
                        button.addEventListener('click', async (e) => {
                            const targetInput = document.getElementById(e.target.dataset.target);
                            if (targetInput) {
                                try {
                                    await navigator.clipboard.writeText(targetInput.value);
                                    showCustomAlert('Copied to clipboard!');
                                } catch (err) {
                                    console.error('Failed to copy: ', err);
                                    showCustomAlert('Failed to copy to clipboard. Please copy manually.');
                                }
                            }
                        });
                    });

                    const viewBtn = detailTile.querySelector('[data-action="view"]');
                    if (viewBtn) {
                        viewBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const url = e.target.dataset.url;
                            if (url) {
                                window.open(url, '_blank');
                            } else {
                                showCustomAlert(`Detail: "${detail.detail_name}" has no URL.`);
                            }
                        });
                    }

                    const editBtn = detailTile.querySelector('[data-action="edit"]');
                    if (editBtn) {
                        editBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            // Your edit button logic here
                            showPage(updateCategoryDetailPage);
                            if (updateDetailIdInput) updateDetailIdInput.value = editBtn.dataset.id;
                            if (updateDetailNameInput) updateDetailNameInput.value = editBtn.dataset.name;
                            if (updateDetailUrlInput) updateDetailUrlInput.value = editBtn.dataset.url;
                            if (updateDetailDescriptionInput) updateDetailDescriptionInput.value = editBtn.dataset.description;
                            if (updateDetailUsernameInput) updateDetailUsernameInput.value = editBtn.dataset.username;
                            if (updateDetailPasswordInput) updateDetailPasswordInput.value = editBtn.dataset.password;
                            if (updateDetailCategoryNameSpan) updateDetailCategoryNameSpan.textContent = `"${currentSelectedCategoryName}" for ${currentSelectedProperty.title}`;

                            // Logic to pre-select preset logo or show custom URL
                            const detailLogoUrl = editBtn.dataset.logo;
                            let presetLogoFound = false;
                            if (updatePresetLogoPicker) {
                                updatePresetLogoPicker.innerHTML = ''; // Clear previous options
                                presetLogos.forEach(logo => {
                                    const radio = document.createElement('input');
                                    radio.type = 'radio';
                                    radio.name = 'update-logo';
                                    radio.value = logo.url;
                                    radio.className = 'mr-1';
                                    radio.id = `update-logo-${logo.name.replace(/\s+/g, '-').toLowerCase()}`;
                                    if (detailLogoUrl === logo.url) {
                                        radio.checked = true;
                                        selectedUpdatePresetLogoUrl = logo.url;
                                        presetLogoFound = true;
                                    }
                                    const label = document.createElement('label');
                                    label.htmlFor = radio.id;
                                    label.className = 'inline-flex items-center mr-4 cursor-pointer';
                                    label.innerHTML = `<img src="${logo.url}" class="w-6 h-6 mr-1 inline-block" alt="${logo.name}"> ${logo.name}`;
                                    updatePresetLogoPicker.appendChild(radio);
                                    updatePresetLogoPicker.appendChild(label);
                                });
                            }

                            if (updateCustomLogoUrlInput) {
                                if (!presetLogoFound && detailLogoUrl) {
                                    updateCustomLogoUrlInput.value = detailLogoUrl;
                                    const customRadio = document.createElement('input');
                                    customRadio.type = 'radio';
                                    customRadio.name = 'update-logo';
                                    customRadio.value = 'custom';
                                    customRadio.checked = true;
                                    customRadio.className = 'mr-1';
                                    updatePresetLogoPicker.appendChild(customRadio);
                                    const customLabel = document.createElement('label');
                                    customLabel.textContent = 'Custom URL';
                                    updatePresetLogoPicker.appendChild(customLabel);
                                    selectedUpdatePresetLogoUrl = null; // Indicate custom
                                } else {
                                    updateCustomLogoUrlInput.value = '';
                                }
                            }
                            if (updateDetailStatus) updateDetailStatus.classList.add('hidden');
                        });
                    }

                    const deleteBtn = detailTile.querySelector('[data-action="delete-detail"]');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            showModal(
                                verificationModal,
                                `detail: "${detail.detail_name}"`,
                                `deleting`,
                                async (username, password) => {
                                    if (verificationStatus) {
                                        verificationStatus.classList.remove('hidden');
                                        verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                                        verificationStatus.textContent = 'Verifying and deleting detail...';
                                    }
                                    try {
                                        const response = await fetch('/.netlify/functions/deleteCategoryDetail', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                property_id: currentSelectedProperty.id,
                                                category_name: currentSelectedCategoryName,
                                                detail_id: detail.id,
                                                username: username,
                                                password: password
                                            })
                                        });

                                        const data = await response.json();

                                        if (response.ok) {
                                            if (verificationStatus) {
                                                verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                                                verificationStatus.textContent = data.message;
                                            }
                                            setTimeout(() => {
                                                hideModal(verificationModal);
                                                displayCategoryDetails(currentSelectedCategoryName); // Refresh details
                                            }, 1500);
                                        } else {
                                            if (verificationStatus) {
                                                verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                                                verificationStatus.textContent = data.message || 'Deletion failed. Check credentials or try again.';
                                                if (modalPasswordInput) modalPasswordInput.value = '';
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Error during detail delete verification:', error);
                                        if (verificationStatus) {
                                            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                                            verificationStatus.textContent = `Network error: ${error.message}`;
                                        }
                                    }
                                }
                            );
                        });
                    }

                    buttonsContainer.appendChild(detailTile);
                });
            }
        } catch (error) {
            console.error('Error fetching category details:', error);
            if (loadingMessage) {
                loadingMessage.classList.add('text-red-600');
                loadingMessage.textContent = `Failed to load details: ${error.message}`;
            }
            buttonsContainer.innerHTML = '';
        }
    }

    // --- Add Category Detail Button & Form Logic ---
    const addCategoryDetailButtonAtBottom = document.getElementById('add-category-detail-button-bottom');
    const mainTag = document.querySelector('main');
    if (addCategoryDetailButtonAtBottom && mainTag) {
        addCategoryDetailButtonAtBottom.style.display = 'none';

        addCategoryDetailButtonAtBottom.addEventListener('click', () => {
            if (currentSelectedProperty && currentSelectedCategoryName) {
                if (addDetailCategoryNameSpan) addDetailCategoryNameSpan.textContent = `"${currentSelectedCategoryName}" for ${currentSelectedProperty.title}`;
                showPage(addCategoryDetailPage);
                if (addDetailForm) addDetailForm.reset();
                if (detailUsernameAddInput) detailUsernameAddInput.value = '';
                if (detailPasswordAddInput) detailPasswordAddInput.value = '';
                if (addDetailStatus) addDetailStatus.classList.add('hidden');
                renderPresetLogos();
                selectedPresetLogoUrl = null;
                if (customLogoUrlInput) customLogoUrlInput.value = '';
            } else {
                showCustomAlert('Please select a property category first to add details to it.');
            }
        });
    }

    if (addDetailForm) {
        addDetailForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const detailName = detailNameInput.value.trim();
            const detailUrl = detailUrlInput.value.trim();
            const detailDescription = detailDescriptionInput.value.trim();
            const logoUrlToSend = selectedPresetLogoUrl || (customLogoUrlInput ? customLogoUrlInput.value.trim() : null);
            const usernameToSave = detailUsernameAddInput ? detailUsernameAddInput.value.trim() : '';
            const passwordToSave = detailPasswordAddInput ? detailPasswordAddInput.value.trim() : '';


            if (!detailName || !detailUrl) {
                if (addDetailStatus) {
                    addDetailStatus.classList.remove('hidden');
                    addDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-yellow-100 text-yellow-700';
                    addDetailStatus.textContent = 'Detail Name and URL are required.';
                }
                return;
            }

            if (addDetailStatus) {
                addDetailStatus.classList.remove('hidden');
                addDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                addDetailStatus.textContent = 'Saving detail...';
            }

            try {
                const response = await fetch('/.netlify/functions/addCategoryDetail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        property_id: currentSelectedProperty.id,
                        category_name: currentSelectedCategoryName,
                        detail_name: detailName,
                        detail_url: detailUrl,
                        detail_description: detailDescription,
                        detail_logo_url: logoUrlToSend,
                        detail_username: usernameToSave,
                        detail_password: passwordToSave
                    })
                });

                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorBody.details || response.statusText}`);
                }

                const savedDetail = await response.json();
                console.log('Category detail saved:', savedDetail);

                if (addDetailStatus) {
                    addDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                    addDetailStatus.textContent = 'Detail saved successfully!';
                }

                setTimeout(() => {
                    showPage(propertyCategoriesPage);
                    displayCategoryDetails(currentSelectedCategoryName);
                }, 1500);

            } catch (error) {
                console.error('Error saving detail:', error);
                if (addDetailStatus) {
                    addDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                    if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
                        addDetailStatus.textContent = 'Detail with this name already exists for this category.';
                    } else {
                        addDetailStatus.textContent = `Error saving detail: ${error.message}`;
                    }
                }
            }
        });
    }

    if (cancelAddDetailButton) {
        cancelAddDetailButton.addEventListener('click', () => {
            showPage(propertyCategoriesPage);
        });
    }


    // --- Add New Category Button & Form Logic ---
    if (addNewCategoryButton) {
        addNewCategoryButton.addEventListener('click', () => {
            if (currentSelectedProperty) {
                if (categoryPropertyTitleSpan) categoryPropertyTitleSpan.textContent = `"${currentSelectedProperty.title}"`;
                showPage(addNewCategoryPage);
                if (addNewCategoryForm) addNewCategoryForm.reset();
                if (addNewCategoryStatus) addNewCategoryStatus.classList.add('hidden');
            } else {
                showCustomAlert('Please select a property first to add a new category.');
            }
        });
    }

    if (addNewCategoryForm) {
        addNewCategoryForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const newCategoryName = newCategoryNameInput.value.trim();

            if (!newCategoryName) {
                if (addNewCategoryStatus) {
                    addNewCategoryStatus.classList.remove('hidden');
                    addNewCategoryStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-yellow-100 text-yellow-700';
                    addNewCategoryStatus.textContent = 'Please enter a category name.';
                }
                return;
            }

            if (addNewCategoryStatus) {
                addNewCategoryStatus.classList.remove('hidden');
                addNewCategoryStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                addNewCategoryStatus.textContent = 'Adding category...';
            }

            try {
                const response = await fetch('/.netlify/functions/updatePropertyCategories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        property_id: currentSelectedProperty.id,
                        new_category_name: newCategoryName
                    })
                });

                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorBody.details || response.statusText}`);
                }

                const result = await response.json();
                console.log('Category added successfully:', result.message);

                if (addNewCategoryStatus) {
                    addNewCategoryStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                    addNewCategoryStatus.textContent = 'Category added successfully!';
                }

                currentSelectedProperty.categories = result.updatedProperty.categories;

                showPage(propertyCategoriesPage);
                renderPropertyCategories();

            } catch (error) {
                console.error('Error adding new category:', error);
                if (addNewCategoryStatus) {
                    addNewCategoryStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                    if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
                        addNewCategoryStatus.textContent = 'Category with this name already exists for this property.';
                    } else {
                        addNewCategoryStatus.textContent = `Error adding category: ${error.message}`;
                    }
                }
            }
        });
    }

    if (cancelNewCategoryButton) {
        cancelNewCategoryButton.addEventListener('click', () => {
            showPage(propertyCategoriesPage);
        });
    }


    // --- Update Property Logic ---
    if (updatePropertyForm) {
        updatePropertyForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const propertyId = updatePropertyIdInput.value;
            const title = updatePropertyTitleInput.value.trim();
            const image = updatePropertyImageInput.value.trim();
            const description = updatePropertyDescriptionInput.value.trim();
            const categoriesString = updatePropertyCategoriesInput.value.trim();
            const isForeign = updatePropertyIsForeignInput.checked;

            if (!title || !image || !description || !categoriesString) {
                if (updatePropertyStatus) {
                    updatePropertyStatus.classList.remove('hidden');
                    updatePropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-yellow-100 text-yellow-700';
                    updatePropertyStatus.textContent = 'All fields except Username/Password are required.';
                }
                return;
            }

            const parsedCategories = categoriesString.split(',').map(cat => cat.trim()).filter(cat => cat !== '');

            if (updatePropertyStatus) {
                updatePropertyStatus.classList.remove('hidden');
                updatePropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                updatePropertyStatus.textContent = 'Updating property...';
            }

            try {
                const response = await fetch('/.netlify/functions/updateProperty', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: propertyId,
                        title: title,
                        image: image,
                        description: description,
                        categories: parsedCategories,
                        is_foreign: isForeign
                    })
                });

                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorBody.details || response.statusText}`);
                }

                const result = await response.json();
                console.log('Property updated successfully:', result.message);

                if (updatePropertyStatus) {
                    updatePropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                    updatePropertyStatus.textContent = 'Property updated successfully!';
                }

                setTimeout(async () => {
                    showPage(propertySelectionPage);
                    await fetchProperties(currentPropertyFilter);
                }, 1500);

            } catch (error) {
                console.error('Error updating property:', error);
                if (updatePropertyStatus) {
                    updatePropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                    updatePropertyStatus.textContent = `Error updating property: ${error.message}`;
                }
            }
        });
    }

    if (cancelUpdatePropertyButton) {
        cancelUpdatePropertyButton.addEventListener('click', () => {
            showPage(propertySelectionPage);
        });
    }


    // --- Update Category Detail Logic ---
    if (updateDetailForm) {
        updateDetailForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const detailId = updateDetailIdInput.value;
            const detailName = updateDetailNameInput.value.trim();
            const detailUrl = updateDetailUrlInput.value.trim();
            const detailDescription = updateDetailDescriptionInput.value.trim();
            const logoUrlToSend = selectedUpdatePresetLogoUrl || (updateCustomLogoUrlInput ? updateCustomLogoUrlInput.value.trim() : null);
            const usernameToSave = updateDetailUsernameInput ? updateDetailUsernameInput.value.trim() : '';
            const passwordToSave = updateDetailPasswordInput ? updateDetailPasswordInput.value.trim() : '';


            if (!detailName || !detailUrl) {
                if (updateDetailStatus) {
                    updateDetailStatus.classList.remove('hidden');
                    updateDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-yellow-100 text-yellow-700';
                    updateDetailStatus.textContent = 'Detail Name and URL are required.';
                }
                return;
            }

            if (updateDetailStatus) {
                updateDetailStatus.classList.remove('hidden');
                updateDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                addDetailStatus.textContent = 'Saving detail...';
            }

            try {
                const response = await fetch('/.netlify/functions/updateCategoryDetail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: detailId,
                        detail_name: detailName,
                        detail_url: detailUrl,
                        detail_description: detailDescription,
                        detail_logo_url: logoUrlToSend,
                        detail_username: usernameToSave,
                        detail_password: passwordToSave,
                        username: currentLoggedInUsername,
                        password: currentLoggedInPassword
                    })
                });

                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorBody.details || response.statusText}`);
                }

                const updatedDetail = await response.json();
                console.log('Category detail updated:', updatedDetail);

                if (updateDetailStatus) {
                    updateDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                    updateDetailStatus.textContent = 'Detail updated successfully!';
                }

                setTimeout(() => {
                    showPage(propertyCategoriesPage);
                    displayCategoryDetails(currentSelectedCategoryName);
                }, 1500);

            } catch (error) {
                console.error('Error updating detail:', error);
                if (updateDetailStatus) {
                    updateDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                    if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
                        updateDetailStatus.textContent = 'Detail with this name and URL already exists for this category.';
                    } else {
                        updateDetailStatus.textContent = `Error updating detail: ${error.message}`;
                    }
                }
            }
        });
    }

    if (cancelUpdateDetailButton) {
        cancelUpdateDetailButton.addEventListener('click', () => {
            showPage(propertyCategoriesPage);
        });
    }


    // --- Delete Category Logic ---
    if (deleteCategoryButton) {
        deleteCategoryButton.addEventListener('click', () => {
            if (!currentSelectedProperty || !currentSelectedCategoryName) {
                showCustomAlert('Please select a property and a category to delete.');
                return;
            }
            showModal(
                verificationModal,
                `category: "${currentSelectedCategoryName}"`,
                `deleting`,
                async (username, password) => {
                    if (verificationStatus) {
                        verificationStatus.classList.remove('hidden');
                        verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                        verificationStatus.textContent = 'Verifying and deleting category...';
                    }
                    try {
                        const response = await fetch('/.netlify/functions/deletePropertyCategory', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username: username,
                                password: password,
                                property_id: currentSelectedProperty.id,
                                category_to_delete: currentSelectedCategoryName
                            })
                        });

                        const data = await response.json();

                        if (response.ok) {
                            if (verificationStatus) {
                                verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                                verificationStatus.textContent = data.message;
                            }

                            currentSelectedProperty.categories = data.updatedProperty.categories;

                            setTimeout(() => {
                                hideModal(verificationModal);
                                showPage(propertyCategoriesPage);
                                renderPropertyCategories();
                                if (!currentSelectedProperty.categories.includes(currentSelectedCategoryName)) {
                                    currentSelectedCategoryName = null;
                                    if (categoryDetailsHeading) categoryDetailsHeading.textContent = 'Category Details';
                                    if (categoryDetailsContent) categoryDetailsContent.innerHTML = `<p id="category-loading-message" class="text-gray-600">Select a property category to view details.</p><div id="dynamic-category-buttons-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"></div><div id="security-warning" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-8 rounded-md" role="alert"><p class="font-bold">Security Notice:</p><p class="text-sm">External links (if any) will open in a new browser tab for security reasons (Same-Origin Policy).</p></div>`;
                                }
                            }, 1500);

                        } else {
                            if (verificationStatus) {
                                verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                                verificationStatus.textContent = data.message || 'Deletion failed. Check credentials or try again.';
                                if (modalPasswordInput) modalPasswordInput.value = '';
                            }
                        }
                    } catch (error) {
                        console.error('Error during delete verification:', error);
                        if (verificationStatus) {
                            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                            verificationStatus.textContent = `Network error: ${error.message}`;
                        }
                    }
                }
            );
        });
    }

    // --- Manual Refresh Categories Button Logic ---
    if (refreshCategoriesButtonOnCategoriesPage) {
        refreshCategoriesButtonOnCategoriesPage.addEventListener('click', () => {
            if (currentSelectedProperty) {
                renderPropertyCategories();
            } else {
                showCustomAlert('Please select a property first.');
            }
        });
    }

    if (refreshPropertiesButton) {
        refreshPropertiesButton.addEventListener('click', async () => {
            await fetchProperties(currentPropertyFilter);
        });
    }


    // --- Verification Modal Form Submission Handler ---
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


    // --- Back Button Event Listeners ---
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            showPage(loginPage);
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';
            if (registrationStatusMessage) registrationStatusMessage.classList.add('hidden');
        });
    }

    if (backToLoginFromRegisterBtn) {
        backToLoginFromRegisterBtn.addEventListener('click', () => {
            showPage(loginPage);
            if (regUsernameInput) regUsernameInput.value = '';
            if (regPasswordInput) regPasswordInput.value = '';
            if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
        });
    }

    if (backFromAddPropertyBtn) {
        backFromAddPropertyBtn.addEventListener('click', () => {
            showPage(propertySelectionPage);
            if (addPropertyForm) addPropertyForm.reset();
            if (addPropertyStatus) addPropertyStatus.classList.add('hidden');
        });
    }

    if (backToPropertiesBtn) {
        backToPropertiesBtn.addEventListener('click', () => {
            showPage(propertySelectionPage);
            currentSelectedProperty = null;
            currentSelectedCategoryName = null;
            if (categoryDetailsHeading) categoryDetailsHeading.textContent = 'Category Details';
            if (currentPropertyTitle) currentPropertyTitle.textContent = 'Category Details';
            if (currentPropertyThumbnail) currentPropertyThumbnail.src = 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
        });
    }

    if (backFromAddDetailBtn) {
        backFromAddDetailBtn.addEventListener('click', () => {
            showPage(propertyCategoriesPage);
            if (categoryDetailsContent) categoryDetailsContent.style.display = 'flex';
            if (propertyFilesPage) propertyFilesPage.style.display = 'none';
            const addVendorButton = document.getElementById('add-category-detail-button-bottom');
            if (addVendorButton) addVendorButton.style.display = 'block';
        });
    }

    if (backFromAddNewCategoryBtn) {
        backFromAddNewCategoryBtn.addEventListener('click', () => {
            showPage(propertyCategoriesPage);
            if (categoryDetailsContent) categoryDetailsContent.style.display = 'flex';
            if (propertyFilesPage) propertyFilesPage.style.display = 'none';
            const addVendorButton = document.getElementById('add-category-detail-button-bottom');
            if (addVendorButton) addVendorButton.style.display = 'block';
        });
    }

    if (backFromUpdateDetailBtn) {
        backFromUpdateDetailBtn.addEventListener('click', () => {
            showPage(propertyCategoriesPage);
            if (categoryDetailsContent) categoryDetailsContent.style.display = 'flex';
            if (propertyFilesPage) propertyFilesPage.style.display = 'none';
            const addVendorButton = document.getElementById('add-category-detail-button-bottom');
            if (addVendorButton) addVendorButton.style.display = 'block';
        });
    }

    if (backFromUpdatePropertyBtn) {
        backFromUpdatePropertyBtn.addEventListener('click', () => {
            showPage(propertySelectionPage);
            fetchProperties(currentPropertyFilter);
        });
    }

    // New: View Files button functionality
    if (viewFilesButton) {
        viewFilesButton.addEventListener('click', () => {
            if (currentSelectedProperty) {
                if (categoryDetailsContent && propertyFilesContent) {
                    if (categoryDetailsContent.style.display !== 'none') {
                        categoryDetailsContent.style.display = 'none';
                        propertyFilesContent.style.display = 'flex';

                        if (filesPropertyTitleSpan) filesPropertyTitleSpan.textContent = currentSelectedProperty.title;

                        const addVendorButton = document.getElementById('add-category-detail-button-bottom');
                        if (addVendorButton) addVendorButton.style.display = 'none';

                        displayPropertyFiles(); // This will now fetch folders first
                    } else {
                        if (currentSelectedCategoryName) {
                            displayCategoryDetails(currentSelectedCategoryName);
                        } else if (currentSelectedProperty.categories.length > 0) {
                            const firstCategory = currentSelectedProperty.categories[0];
                            currentSelectedCategoryName = firstCategory;
                            displayCategoryDetails(firstCategory);
                        }
                    }
                }
            } else {
                showCustomAlert('Please select a property to view files.');
            }
        });
    }

    // New: Back from Files button functionality
    if (backFromFilesButton) {
        backFromFilesButton.addEventListener('click', () => {
            showPage(propertyCategoriesPage);
            renderPropertyCategories();
            const addVendorButton = document.getElementById('add-category-detail-button-bottom');
            if (addVendorButton) addVendorButton.style.display = 'block';
        });
    }

    // START MODIFICATION FOR FOLDER SELECTION AND UPLOAD FLOW

    // NEW: Function to populate the folder dropdown
    async function populateFolderDropdown() {
        if (!folderSelectDropdown || !currentSelectedProperty) {
            console.error("populateFolderDropdown: Missing dropdown or selected property.");
            return;
        }

        // Clear previous options, keeping the default ones
        folderSelectDropdown.innerHTML = '<option value="none">-- No Folder (All Files) --</option><option value="new">+ Create New Folder</option>';

        uploadFolderModalStatus.classList.remove('hidden', 'bg-red-100', 'text-red-700');
        uploadFolderModalStatus.classList.add('bg-blue-100', 'text-blue-700');
        uploadFolderModalStatus.textContent = 'Loading folders...';

        try {
            const foldersResponse = await fetch('/.netlify/functions/getFolders', {
                method: 'POST', // getFolders function expects POST with auth
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    property_id: currentSelectedProperty.id,
                    username: currentLoggedInUsername,
                    password: currentLoggedInPassword
                })
            });

            if (!foldersResponse.ok) {
                const errorBody = await foldersResponse.json();
                throw new Error(errorBody.message || 'Failed to fetch folders.');
            }
            const fetchedFolders = await foldersResponse.json();

            // Add existing folders to the dropdown
            fetchedFolders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.id;
                option.textContent = folder.name;
                // Insert before the 'Create New Folder' option
                folderSelectDropdown.insertBefore(option, folderSelectDropdown.children[folderSelectDropdown.children.length - 1]);
            });

            uploadFolderModalStatus.classList.add('hidden'); // Hide status message on success

        } catch (error) {
            console.error('Error fetching folders for upload modal:', error);
            uploadFolderModalStatus.classList.remove('hidden', 'bg-blue-100', 'text-blue-700');
            uploadFolderModalStatus.classList.add('bg-red-100', 'text-red-700');
            uploadFolderModalStatus.textContent = `Error loading folders: ${error.message}`;
        }
    }

    // Helper function to show the folder selection modal for upload
    // Removed the direct fetch to getFolders from here.
    async function showUploadFolderSelectionModal(file, base64data, mimeType) {
        if (!uploadFolderModal || !currentSelectedProperty) {
            showCustomAlert('Cannot open folder selection. Please select a property and ensure the modal elements are present.');
            return;
        }

        // Store file data temporarily
        fileToUpload = file;
        base64DataToUpload = base64data;
        mimeTypeToUpload = mimeType;

        // Reset modal state
        uploadFolderModalStatus.classList.add('hidden');
        uploadFolderModalStatus.textContent = '';
        newFolderNameContainer.classList.add('hidden');
        newFolderNameInput.value = '';
        // Reset dropdown to default and prepare for dynamic population
        folderSelectDropdown.innerHTML = '<option value="none">-- No Folder (All Files) --</option><option value="new">+ Create New Folder</option>';
        folderSelectDropdown.value = 'none'; // Reset to default selection

        // Show the modal
        uploadFolderModal.classList.remove('hidden');

        // Now, immediately call the populate function to load folders.
        // This still means the POST happens as soon as the modal is *shown*,
        // but clarifies the intent: the modal needs data.
        await populateFolderDropdown();
    }

    // Event listener for dropdown change in upload folder modal
    if (folderSelectDropdown) {
        folderSelectDropdown.addEventListener('change', (e) => {
            if (e.target.value === 'new') {
                newFolderNameContainer.classList.remove('hidden');
                newFolderNameInput.focus();
            } else {
                newFolderNameContainer.classList.add('hidden');
                newFolderNameInput.value = '';
            }
            uploadFolderModalStatus.classList.add('hidden'); // Clear status when selection changes
        });

        // Add an event listener to populate the dropdown when it is focused/clicked.
        // This is an alternative if you truly want to delay the API call even further.
        // For now, it's called immediately when modal is shown, which is more common for populating.
        // If you want to delay, uncomment the following and remove the `await populateFolderDropdown()`
        // call from `showUploadFolderSelectionModal`.
        /*
        let foldersLoaded = false;
        folderSelectDropdown.addEventListener('focus', async () => {
            if (!foldersLoaded) {
                await populateFolderDropdown();
                foldersLoaded = true;
            }
        }, { once: true }); // Use { once: true } to only load folders once per modal open
        */
    }

    // Event listener for cancel button in upload folder modal
    if (cancelFolderSelectionBtn) {
        cancelFolderSelectionBtn.addEventListener('click', () => {
            uploadFolderModal.classList.add('hidden');
            fileUploadInput.value = ''; // Clear selected file from main input
            fileToUpload = null; // Clear temporary file data
            base64DataToUpload = null;
            mimeTypeToUpload = null;
            if (fileUploadStatus) fileUploadStatus.classList.add('hidden'); // Clear main status
        });
    }

    // Event listener for confirm button in upload folder modal
    if (confirmFolderSelectionBtn) {
        confirmFolderSelectionBtn.addEventListener('click', async () => {
            const selectedFolderId = folderSelectDropdown.value;
            let finalFolderId = null; // Initialize to null by default
            let finalFolderName = null; // Initialize to null by default

            // --- DEBUGGING LOGS ---
            console.log("Confirm button clicked in folder modal.");
            console.log("Selected Folder ID from dropdown:", selectedFolderId);
            console.log("Current global 'folders' array:", folders);
            // --- END DEBUGGING LOGS ---


            if (selectedFolderId === 'new') {
                const newName = newFolderNameInput.value.trim();
                if (!newName) {
                    uploadFolderModalStatus.classList.remove('hidden');
                    uploadFolderModalStatus.className = 'mt-3 text-center text-sm bg-yellow-100 text-yellow-700';
                    uploadFolderModalStatus.textContent = 'Please enter a name for the new folder.';
                    return;
                }
                finalFolderName = newName;
                finalFolderId = newName.toLowerCase().replace(/\s+/g, '-'); // Generate ID from name (consistent with createFolder)
            } else if (selectedFolderId === 'none') {
                // Explicitly set to null if "No Folder" is selected. This is intentional.
                finalFolderId = null;
                finalFolderName = null;
            }
             else { // This block handles existing folders (selectedFolderId is an actual folder ID)
                finalFolderId = selectedFolderId;
                const selectedFolder = folders.find(f => f.id === selectedFolderId);
                if (selectedFolder) {
                    finalFolderName = selectedFolder.name;
                } else {
                    // Fallback if the selected ID wasn't found in the current folders array (shouldn't happen often)
                    console.warn("Selected folder ID not found in global 'folders' array. Falling back to ID as name.", selectedFolderId);
                    finalFolderName = selectedFolderId;
                }
            }

            // --- DEBUGGING LOGS ---
            console.log("Final Folder ID to send:", finalFolderId);
            console.log("Final Folder Name to send:", finalFolderName);
            // --- END DEBUGGING LOGS ---

            uploadFolderModalStatus.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-yellow-100', 'text-yellow-700');
            uploadFolderModalStatus.classList.add('bg-blue-100', 'text-blue-700');
            uploadFolderModalStatus.textContent = 'Processing folder selection...';

            try {
                // If 'new' folder, create it first
                if (selectedFolderId === 'new') {
                    const createFolderResponse = await fetch('/.netlify/functions/createFolder', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            property_id: currentSelectedProperty.id,
                            folder_name: finalFolderName,
                            username: currentLoggedInUsername,
                            password: currentLoggedInPassword
                        })
                    });

                    const createFolderData = await createFolderResponse.json();
                    if (!createFolderResponse.ok) {
                        throw new Error(createFolderData.message || 'Failed to create new folder.');
                    }
                    console.log('New folder created:', createFolderData.message);
                    // The `finalFolderId` generated earlier (kebab-cased name) should match the ID stored by createFolder.
                    // We rely on `finalFolderId` being correctly set above.
                }

                uploadFolderModal.classList.add('hidden'); // Hide folder modal

                // Show main upload status
                if (fileUploadStatus) {
                    fileUploadStatus.classList.remove('hidden');
                    fileUploadStatus.className = 'mt-3 text-center text-sm bg-blue-100 text-blue-700';
                    fileUploadStatus.textContent = 'Uploading file...';
                    // Add progress bar back here if needed for main status, but it's handled by reader.onprogress already
                    // fileUploadStatus.innerHTML += ' <progress value="0" max="100"></progress>';
                }

                // Make the actual file upload call
                const uploadResponse = await fetch('/.netlify/functions/uploadFile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        property_id: currentSelectedProperty.id,
                        filename: fileToUpload.name,
                        file_data_base64: base64DataToUpload,
                        file_mime_type: mimeTypeToUpload, // Pass MIME type (though Cloudinary 'auto' is robust)
                        uploaded_by_username: currentLoggedInUsername,
                        username: currentLoggedInUsername,
                        password: currentLoggedInPassword,
                        folder_id: finalFolderId, // Pass the selected/new folder ID (should not be null unless explicitly "none")
                        folder_name: finalFolderName // Pass the selected/new folder name (should not be null unless explicitly "none")
                    })
                });

                const uploadData = await uploadResponse.json();

                if (uploadResponse.ok) {
                    if (fileUploadStatus) {
                        fileUploadStatus.className = 'mt-3 text-center text-sm bg-green-100 text-green-700';
                        fileUploadStatus.textContent = 'File uploaded successfully!';
                    }
                    fileUploadInput.value = ''; // Clear file input
                    fileToUpload = null; base64DataToUpload = null; mimeTypeToUpload = null;
                    displayPropertyFiles(currentFolder); // Refresh files in current folder
                } else {
                    throw new Error(uploadData.details || uploadData.message || 'Unknown upload error.');
                }

            } catch (error) {
                console.error('Error in folder selection or upload:', error);
                // Display error in the upload folder modal status or main status
                if (uploadFolderModalStatus.style.display !== 'none') {
                    uploadFolderModalStatus.classList.remove('hidden', 'bg-blue-100', 'text-blue-700', 'bg-yellow-100');
                    uploadFolderModalStatus.classList.add('bg-red-100', 'text-red-700');
                    uploadFolderModalStatus.textContent = `Upload failed: ${error.message}`;
                } else if (fileUploadStatus) {
                    fileUploadStatus.classList.remove('hidden');
                    fileUploadStatus.className = 'mt-3 text-center text-sm bg-red-100 text-red-700';
                    fileUploadStatus.textContent = `Upload failed: ${error.message}`;
                }
                fileUploadInput.value = ''; // Clear file input on error
                fileToUpload = null; base64DataToUpload = null; mimeTypeToUpload = null;
            } finally {
                // Hide any temporary status messages after a short delay
                setTimeout(() => {
                    uploadFolderModalStatus.classList.add('hidden');
                    if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
                }, 3000);
            }
        });
    }


    // New: Upload File button functionality (Initial Trigger - this sets up the file reader)
    if (uploadFileButton) {
        uploadFileButton.addEventListener('click', async () => {
            if (!fileUploadInput || !fileUploadInput.files || fileUploadInput.files.length === 0) {
                if (fileUploadStatus) {
                    fileUploadStatus.classList.remove('hidden');
                    fileUploadStatus.className = 'mt-3 text-center text-sm bg-yellow-100 text-yellow-700';
                    fileUploadStatus.textContent = 'Please select a file to upload.';
                }
                return;
            }

            const file = fileUploadInput.files[0];

            // Client-side file type validation
            const allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'application/pdf',
                'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xls, .xlsx
                'text/csv',
                'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .doc, .docx
            ];
            if (!allowedTypes.includes(file.type)) {
                if (fileUploadStatus) {
                    fileUploadStatus.classList.remove('hidden');
                    fileUploadStatus.className = 'mt-3 text-center text-sm bg-red-100 text-red-700';
                    fileUploadStatus.textContent = 'Only images (JPEG, PNG, GIF, WebP), PDFs, Excel (XLS, XLSX), CSV, and Word (DOC, DOCX) files are allowed.';
                }
                return;
            }

            // Read the file as Data URL
            const reader = new FileReader();
            reader.onprogress = (event) => {
                if (event.lengthComputable && fileUploadStatus) {
                    const progressElement = fileUploadStatus.querySelector('progress');
                    if (progressElement) {
                        progressElement.value = event.loaded;
                    }
                }
            };

            reader.onloadend = async () => {
                const base64data = reader.result.split(',')[1];
                const mimeType = reader.result.split(',')[0].split(':')[1].split(';')[0];

                // Now, show the folder selection modal with the file data
                // This function will handle the actual upload after folder selection
                await showUploadFolderSelectionModal(file, base64data, mimeType);

                // Clear main upload status message now that modal is handling it
                if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
            };

            // Show initial status and progress bar in the main upload area
            if (fileUploadStatus) {
                fileUploadStatus.classList.remove('hidden');
                fileUploadStatus.className = 'mt-3 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                fileUploadStatus.innerHTML = 'Preparing file for upload... <progress value="0" max="100"></progress>';
                const progress = fileUploadStatus.querySelector('progress');
                if (progress) progress.max = file.size; // Set max value for progress bar
            }

            if (file) {
                reader.readAsDataURL(file); // Start reading the file
            }
        });
    }


    // New: Display Property Files function - UPDATED TO FETCH FOLDERS SEPARATELY
    async function displayPropertyFiles(folderId = 'all') {
        currentFolder = folderId;

        if (!filesListContainer || !currentSelectedProperty) return;

        filesListContainer.innerHTML = `<p class="text-gray-600 p-4 text-center">Loading files and folders...</p>`;

        if (document.getElementById('current-folder-title')) {
            document.getElementById('current-folder-title').textContent =
                folderId === 'all' ? 'All Files' : `Folder: ${folders.find(f => f.id === folderId)?.name || folderId}`;
        }

        try {
            // 1. Fetch ALL folders for the current property
            const foldersResponse = await fetch('/.netlify/functions/getFolders', {
                method: 'POST', // getFolders function expects POST with auth
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    property_id: currentSelectedProperty.id,
                    username: currentLoggedInUsername,
                    password: currentLoggedInPassword
                })
            });

            if (!foldersResponse.ok) {
                const errorBody = await foldersResponse.json();
                throw new Error(`Failed to load folders: ${errorBody.message || foldersResponse.statusText}`);
            }
            const fetchedFolders = await foldersResponse.json();

            // Update the global folders array with all fetched folders
            folders = fetchedFolders;
            renderFoldersList(); // Render folders based on the global 'folders' array

            // 2. Fetch files for the current property (and optionally filter by folder_id)
            const filesResponse = await fetch(`/.netlify/functions/getFiles?property_id=${currentSelectedProperty.id}`);
            if (!filesResponse.ok) {
                const errorBody = await filesResponse.json();
                throw new Error(`Failed to load files: ${errorBody.message || filesResponse.statusText}`);
            }

            const allFiles = await filesResponse.json();

            const filesToDisplay = folderId === 'all'
                ? allFiles
                : allFiles.filter(file => file.folder_id === folderId);

            renderFilesList(filesToDisplay);

            selectedFiles.clear();
            updateSelectionUI();

        } catch (error) {
            console.error('Error loading files/folders:', error);
            filesListContainer.innerHTML = `<p class="text-red-600 p-4 text-center">Error loading files and folders: ${error.message}</p>`;
        }
    }

    // --- All other event listeners and main logic ---

    // Move to folder functionality
    document.getElementById('move-to-folder-button')?.addEventListener('click', () => {
        if (selectedFiles.size === 0) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white p-6 rounded-lg w-96">
                <h3 class="text-xl font-bold mb-4">Move ${selectedFiles.size} file(s) to:</h3>
                <select id="target-folder-select" class="w-full p-2 border rounded mb-4">
                    <option value="">-- Select Folder --</option>
                    <option value="none">-- No Folder (All Files) --</option>
                    <option value="new">+ Create New Folder</option>
                    ${folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
                </select>
                <div id="new-folder-input" class="hidden mb-4">
                    <input type="text" id="new-folder-name" class="w-full p-2 border rounded" placeholder="New folder name">
                </div>
                <div class="flex justify-end gap-2">
                    <button id="cancel-move" class="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                    <button id="confirm-move" class="bg-blue-600 text-white px-4 py-2 rounded">Move</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#target-folder-select').addEventListener('change', (e) => {
            modal.querySelector('#new-folder-input').style.display =
                e.target.value === 'new' ? 'block' : 'none';
        });

        modal.querySelector('#cancel-move').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#confirm-move').addEventListener('click', async () => {
            const select = modal.querySelector('#target-folder-select');
            let targetFolderId = select.value;
            let targetFolderName = null; // Initialize as null

            if (targetFolderId === 'new') {
                targetFolderName = modal.querySelector('#new-folder-name').value.trim();
                if (!targetFolderName) {
                    showCustomAlert('Please enter a folder name.');
                    return;
                }
                targetFolderId = targetFolderName.toLowerCase().replace(/\s+/g, '-');
            } else if (targetFolderId === 'all' || targetFolderId === 'none') { // Treating 'all' and 'none' as unassigning from a folder
                targetFolderId = null; // Set to null to indicate no specific folder
                targetFolderName = null;
            } else {
                const selectedExistingFolder = folders.find(f => f.id === targetFolderId);
                if (selectedExistingFolder) {
                    targetFolderName = selectedExistingFolder.name;
                } else {
                    targetFolderName = targetFolderId; // Fallback if name isn't found for existing ID
                }
            }

            try {
                const response = await fetch('/.netlify/functions/moveFiles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file_ids: Array.from(selectedFiles).map(id => parseInt(id)),
                        property_id: currentSelectedProperty.id,
                        folder_id: targetFolderId,
                        folder_name: targetFolderName,
                        username: currentLoggedInUsername,
                        password: currentLoggedInPassword
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    showCustomAlert(`Error moving files: ${data.message || 'An unknown error occurred.'}`);
                    throw new Error(data.message || 'Failed to move files');
                }

                showCustomAlert(data.message);

                await displayPropertyFiles(currentFolder);
                document.body.removeChild(modal);

            } catch (error) {
                console.error('Error moving files:', error);
            }
        });
    });

    // --- Create folder button (now triggers an API call) ---
    document.getElementById('create-folder-button')?.addEventListener('click', async () => {
        if (!currentSelectedProperty) {
            showCustomAlert('Please select a property first to create a folder.');
            return;
        }

        const folderName = prompt('Enter folder name:'); // Consider replacing prompt with a custom modal for better UX
        if (folderName === null) {
            return;
        }
        if (folderName.trim() === '') {
            showCustomAlert('Folder name cannot be empty.');
            return;
        }

        const newFolderName = folderName.trim();

        // Check for existing folder name
        const existingFolder = folders.find(f => f.name.toLowerCase() === newFolderName.toLowerCase());
        if (existingFolder) {
            showCustomAlert(`Folder "${newFolderName}" already exists.`);
            return;
        }


        try {
            const response = await fetch('/.netlify/functions/createFolder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    property_id: currentSelectedProperty.id,
                    folder_name: newFolderName,
                    username: currentLoggedInUsername,
                    password: currentLoggedInPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                showCustomAlert(`Folder "${newFolderName}" created successfully!`);
                await displayPropertyFiles(currentFolder);
            } else {
                showCustomAlert(`Failed to create folder: ${data.message || 'An unknown error occurred.'}`);
                console.error('Error creating folder:', data.details || data.message);
            }
        } catch (error) {
            console.error('Network error creating folder:', error);
            showCustomAlert(`Network error: ${error.message}. Could not create folder.`);
        }
    });

    // Delete selected files button
    document.getElementById('delete-selected-files-button')?.addEventListener('click', () => {
        if (selectedFiles.size === 0) return;

        showModal( // Replaced confirm with showModal as per instructions
            verificationModal,
            `${selectedFiles.size} selected file(s)`,
            `deleting`,
            async (username, password) => {
                if (verificationStatus) {
                    verificationStatus.classList.remove('hidden');
                    verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                    verificationStatus.textContent = 'Verifying and deleting files...';
                }
                try {
                    const response = await fetch('/.netlify/functions/deleteFiles', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            file_ids: Array.from(selectedFiles).map(id => parseInt(id)),
                            property_id: currentSelectedProperty.id,
                            username: username,
                            password: password
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        if (verificationStatus) {
                            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                            verificationStatus.textContent = data.message;
                        }
                        setTimeout(async () => {
                            hideModal(verificationModal);
                            await displayPropertyFiles(currentFolder);
                        }, 1500);
                    } else {
                        if (verificationStatus) {
                            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                            verificationStatus.textContent = data.message || 'Deletion failed. Check credentials or try again.';
                            if (modalPasswordInput) modalPasswordInput.value = '';
                        }
                    }
                } catch (error) {
                    console.error('Error during delete verification:', error);
                    if (verificationStatus) {
                        verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                        verificationStatus.textContent = `Network error: ${error.message}`;
                    }
                }
            }
        );
    });

    // --- Initial Load: Show Login Page (Crucially placed at the very end of DOMContentLoaded) ---
    showPage(loginPage);
});
