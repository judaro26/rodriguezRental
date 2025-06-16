// js/main.js

// --- Import Modules ---
import { showPage, showCustomAlert, showModal } from './utils/dom.js';
import { login, register, getUserApprovalStatuses } from './services/auth.js';
import { fetchProperties, getPropertyById, saveNewProperty, updateExistingProperty, setPropertiesFilter } from './services/properties.js';
import { addCategoryDetail, updateCategoryDetail, deleteCategoryDetail, getCategoryDetails, addNewCategoryToProperty, renderPresetLogosForForm } from './services/categories.js';
import { displayPropertyFiles, createFolder, deleteFiles, moveFiles, initFileUploadProcess } from './services/files.js';
import { renderPropertyCards, updateFilterButtonsHighlight } from './ui/property-renderer.js';
import { renderPropertyCategories, displayCategoryDetails as renderCategoryDetailsUI } from './ui/category-renderer.js';
import { renderFilesList, toggleFileSelection, updateSelectionUI, renderFoldersList } from './ui/file-renderer.js';
import { presetLogos } from './constants.js';


// --- Global Application State (kept minimal in main.js) ---
let currentSelectedProperty = null;
let currentSelectedCategoryName = null;
let currentLoggedInUsername = ''; // Keep these here for passing to functions

// --- Declare UI elements at top-level with 'let' ---
// These will be assigned their actual DOM references inside DOMContentLoaded.
let loginPage, registerPage, propertySelectionPage, addPropertyPage, propertyCategoriesPage,
    addCategoryDetailPage, addNewCategoryPage, updatePropertyPage, updateCategoryDetailPage,
    propertyFilesContent, verificationModal, uploadFolderModal;

let loginForm, usernameInput, passwordInput, showRegisterFormBtn;
let registerForm, regUsernameInput, regPasswordInput; // Removed backToLoginFromRegisterBtn from this line

let propertyCardsContainer, propertiesLoadingMessage, propertiesErrorText, propertiesErrorMessage;
let addPropertyButton, refreshPropertiesButton; // Removed backToLoginBtn from this line
let filterAllPropertiesBtn, filterDomesticPropertiesBtn, filterForeignPropertiesBtn;

let propertyCategoriesNav, categoryDetailsHeading, dynamicCategoryButtonsContainer, categoryLoadingMessage;
let backToPropertiesBtn, addNewCategoryButton, deleteCategoryButton, refreshCategoriesButtonOnCategoriesPage, viewFilesButton; // Removed addNewCategoryButton, deleteCategoryButton, refreshCategoriesButtonOnCategoriesPage, viewFilesButton
let propertyHeader, currentPropertyTitle, currentPropertyThumbnail, addCategoryDetailButtonAtBottom;

let addPropertyForm, propertyTitleInput, propertyImageInput, propertyDescriptionInput, propertyCategoriesInput,
    cancelAddPropertyButton, addPropertyStatus, propertyIsForeignInput; // Removed backFromAddPropertyBtn from this line

let updatePropertyForm, updatePropertyIdInput, updatePropertyTitleInput, updatePropertyImageInput,
    updatePropertyDescriptionInput, updatePropertyCategoriesInput, updatePropertyIsForeignInput,
    cancelUpdatePropertyButton, updatePropertyStatus, backFromUpdatePropertyBtn;

let addNewCategoryForm, newCategoryNameInput, categoryPropertyTitleSpan, cancelNewCategoryButton, addNewCategoryStatus; // Removed backFromAddNewCategoryBtn from this line

let addDetailForm, detailNameInput, detailUrlInput, detailDescriptionInput, presetLogoPicker, customLogoUrlInput,
    detailUsernameAddInput, detailPasswordAddInput, cancelAddDetailButton, addDetailStatus, addDetailCategoryNameSpan; // Removed backFromAddDetailBtn from this line

let updateDetailForm, updateDetailIdInput, updateDetailNameInput, updateDetailUrlInput,
    updateDetailDescriptionInput, updatePresetLogoPicker, updateCustomLogoUrlInput, updateDetailUsernameInput,
    updateDetailPasswordInput, cancelUpdateDetailButton, updateDetailStatus, backFromUpdateDetailBtn, updateDetailCategoryNameSpan; // Added backFromUpdateDetailBtn

let filesPropertyTitleSpan, filesPropertyThumbnail, fileUploadInput, uploadFileButton, fileUploadStatus;
let filesListContainer, backFromFilesButton, createFolderButton, moveToFolderButton, deleteSelectedFilesButton;

let folderSelectDropdown, newFolderNameContainer, newFolderNameInput, cancelFolderSelectionBtn, confirmFolderSelectionBtn, uploadFolderModalStatus;


// --- Application Initialization (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', async () => {
    // --- Get all DOM element references INSIDE DOMContentLoaded ---
    // Pages and Modals
    loginPage = document.getElementById('login-page');
    registerPage = document.getElementById('register-page');
    propertySelectionPage = document.getElementById('property-selection-page');
    addPropertyPage = document.getElementById('add-property-page');
    propertyCategoriesPage = document.getElementById('property-categories-page');
    addCategoryDetailPage = document.getElementById('add-category-detail-page');
    addNewCategoryPage = document.getElementById('add-new-category-page');
    updatePropertyPage = document.getElementById('update-property-page');
    updateCategoryDetailPage = document.getElementById('update-category-detail-page');
    propertyFilesContent = document.getElementById('property-files-content');
    verificationModal = document.getElementById('verification-modal');
    uploadFolderModal = document.getElementById('upload-folder-modal');

    // Login/Register Elements
    loginForm = document.getElementById('login-form');
    usernameInput = document.getElementById('username');
    passwordInput = document.getElementById('password');
    showRegisterFormBtn = document.getElementById('show-register-form-btn');
    registerForm = document.getElementById('register-form');
    regUsernameInput = document.getElementById('reg-username');
    regPasswordInput = document.getElementById('reg-password');


    // Property Selection Page Elements
    propertyCardsContainer = document.getElementById('property-cards-container');
    propertiesLoadingMessage = document.getElementById('properties-loading-message');
    propertiesErrorText = document.getElementById('properties-error-text');
    propertiesErrorMessage = document.getElementById('properties-error-message');
    addPropertyButton = document.getElementById('add-property-button');
    refreshPropertiesButton = document.getElementById('refresh-properties-button');
    filterAllPropertiesBtn = document.getElementById('filter-all-properties');
    filterDomesticPropertiesBtn = document.getElementById('filter-domestic-properties');
    filterForeignPropertiesBtn = document.getElementById('filter-foreign-properties');

    // Add Property Page Elements
    addPropertyForm = document.getElementById('add-property-form');
    propertyTitleInput = document.getElementById('property-title');
    propertyImageInput = document.getElementById('property-image');
    propertyDescriptionInput = document.getElementById('property-description');
    propertyCategoriesInput = document.getElementById('property-categories');
    cancelAddPropertyButton = document.getElementById('cancel-add-property');
    addPropertyStatus = document.getElementById('add-property-status');
    propertyIsForeignInput = document.getElementById('property-is-foreign');

    // Property Categories Page Elements
    propertyCategoriesNav = document.getElementById('property-categories-nav');
    categoryDetailsHeading = document.getElementById('current-property-title');
    dynamicCategoryButtonsContainer = document.getElementById('dynamic-category-buttons-container');
    categoryLoadingMessage = document.getElementById('category-loading-message');
    addNewCategoryButton = document.getElementById('add-new-category-button');
    deleteCategoryButton = document.getElementById('delete-category-button');
    refreshCategoriesButtonOnCategoriesPage = document.getElementById('refresh-categories-on-page-button');
    viewFilesButton = document.getElementById('view-files-button');
    propertyHeader = document.getElementById('property-header');
    currentPropertyTitle = document.getElementById('current-property-title');
    currentPropertyThumbnail = document.getElementById('current-property-thumbnail');
    addCategoryDetailButtonAtBottom = document.getElementById('add-category-detail-button-bottom');

    // Add New Category Page Elements
    addNewCategoryForm = document.getElementById('add-new-category-form');
    newCategoryNameInput = document.getElementById('new-category-name');
    categoryPropertyTitleSpan = document.getElementById('category-property-title');
    cancelNewCategoryButton = document.getElementById('cancel-new-category');
    addNewCategoryStatus = document.getElementById('add-new-category-status');

    // Add Category Detail Page Elements
    addDetailForm = document.getElementById('add-detail-form');
    detailNameInput = document.getElementById('detail-name');
    detailUrlInput = document.getElementById('detail-url');
    detailDescriptionInput = document.getElementById('detail-description');
    presetLogoPicker = document.getElementById('preset-logo-picker');
    customLogoUrlInput = document.getElementById('custom-logo-url');
    detailUsernameAddInput = document.getElementById('detail-username-add');
    detailPasswordAddInput = document.getElementById('detail-password-add');
    cancelAddDetailButton = document.getElementById('cancel-add-detail');
    addDetailStatus = document.getElementById('add-detail-status');
    addDetailCategoryNameSpan = document.getElementById('add-detail-category-name');

    // Update Category Detail Page Elements
    updateCategoryDetailPage = document.getElementById('update-category-detail-page');
    updateDetailForm = document.getElementById('update-detail-form');
    updateDetailIdInput = document.getElementById('update-detail-id');
    updateDetailNameInput = document.getElementById('update-detail-name');
    updateDetailUrlInput = document.getElementById('update-detail-url');
    updateDetailDescriptionInput = document.getElementById('update-detail-description');
    updatePresetLogoPicker = document.getElementById('update-preset-logo-picker');
    updateCustomLogoUrlInput = document.getElementById('update-custom-logo-url');
    updateDetailUsernameInput = document.getElementById('update-detail-username');
    updateDetailPasswordInput = document.getElementById('update-detail-password');
    cancelUpdateDetailButton = document.getElementById('cancel-update-detail');
    updateDetailStatus = document.getElementById('update-detail-status');
    updateDetailCategoryNameSpan = document.getElementById('update-detail-category-name');

    // Update Property Page Elements
    updatePropertyForm = document.getElementById('update-property-form');
    updatePropertyIdInput = document.getElementById('update-property-id');
    updatePropertyTitleInput = document.getElementById('update-property-title');
    updatePropertyImageInput = document.getElementById('update-property-image');
    updatePropertyDescriptionInput = document.getElementById('update-property-description');
    updatePropertyCategoriesInput = document.getElementById('update-property-categories');
    updatePropertyIsForeignInput = document.getElementById('update-property-is-foreign');
    cancelUpdatePropertyButton = document.getElementById('cancel-update-property');
    updatePropertyStatus = document.getElementById('update-property-status');

    // Property Files Page Elements
    filesPropertyTitleSpan = document.getElementById('files-property-title');
    filesPropertyThumbnail = document.getElementById('files-property-thumbnail');
    fileUploadInput = document.getElementById('file-upload-input');
    uploadFileButton = document.getElementById('upload-file-button');
    fileUploadStatus = document.getElementById('file-upload-status');
    filesListContainer = document.getElementById('files-list-container');
    createFolderButton = document.getElementById('create-folder-button');
    moveToFolderButton = document.getElementById('move-to-folder-button');
    deleteSelectedFilesButton = document.getElementById('delete-selected-files-button');
    foldersList = document.getElementById('folders-list');
    currentFolderTitle = document.getElementById('current-folder-title');

    // Upload Folder Modal Elements
    uploadFolderModalStatus = document.getElementById('upload-folder-modal-status');
    folderSelectDropdown = document.getElementById('folder-select-dropdown');
    newFolderNameContainer = document.getElementById('new-folder-name-container');
    newFolderNameInput = document.getElementById('new-folder-name-input');
    cancelFolderSelectionBtn = document.getElementById('cancel-folder-selection-btn');
    confirmFolderSelectionBtn = document.getElementById('confirm-folder-selection-btn');


    // --- Now, attach all event listeners, directly using the assigned variables ---

    // 1. Show the initial login page
    showPage(loginPage);

    // Auth Listeners
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            console.log('Login form listener fired!'); // Debugging check
            event.preventDefault();
            const success = await login(usernameInput.value, passwordInput.value); // Pass values to login function
            if (success) {
                const { foreignApproved, domesticApproved } = getUserApprovalStatuses();
                await fetchProperties(null); // Fetch all properties initially after login
                updateFilterButtonsHighlight(null); // Highlight "All Properties"
                showPage(propertySelectionPage);
            } else {
                passwordInput.value = ''; // Clear password on failed login
            }
        });
    }

    if (showRegisterFormBtn) {
        showRegisterFormBtn.addEventListener('click', () => {
            showPage(registerPage);
            regUsernameInput.value = '';
            regPasswordInput.value = '';
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const success = await register(regUsernameInput.value, regPasswordInput.value); // Pass values to register function
            if (success) {
                showPage(loginPage);
                usernameInput.value = regUsernameInput.value; // Optionally pre-fill
                passwordInput.value = ''; // Clear password field
            } else {
                regPasswordInput.value = ''; // Clear password on failed registration
            }
        });
    }

    // Property Filters
    if (filterAllPropertiesBtn) {
        filterAllPropertiesBtn.addEventListener('click', () => {
            const { domesticApproved, foreignApproved } = getUserApprovalStatuses();
            if (domesticApproved || foreignApproved) {
                setPropertiesFilter(null); // Delegate filtering logic to properties module
            } else {
                showCustomAlert('You are not approved to view any properties.');
            }
        });
    }
    if (filterDomesticPropertiesBtn) {
        filterDomesticPropertiesBtn.addEventListener('click', () => {
            const { domesticApproved } = getUserApprovalStatuses();
            if (domesticApproved) {
                setPropertiesFilter(false); // Delegate filtering logic
            } else {
                showCustomAlert('You are not approved to view domestic properties. Please contact an administrator.');
            }
        });
    }
    if (filterForeignPropertiesBtn) {
        filterForeignPropertiesBtn.addEventListener('click', () => {
            const { foreignApproved } = getUserApprovalStatuses();
            if (foreignApproved) {
                setPropertiesFilter(true); // Delegate filtering logic
            } else {
                showCustomAlert('You are not approved to view foreign properties. Please contact an administrator.');
            }
        });
    }

    // Refresh Properties
    if (refreshPropertiesButton) {
        refreshPropertiesButton.addEventListener('click', async () => await fetchProperties(null));
    }

    // Add New Property
    if (addPropertyButton) {
        addPropertyButton.addEventListener('click', () => {
            showPage(addPropertyPage);
            addPropertyForm.reset();
            propertyIsForeignInput.checked = false;
        });
    }
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const propertyData = {
                title: propertyTitleInput.value.trim(),
                image: propertyImageInput.value.trim(),
                description: propertyDescriptionInput.value.trim(),
                categories: propertyCategoriesInput.value.trim().split(',').map(cat => cat.trim()).filter(cat => cat !== ''),
                is_foreign: propertyIsForeignInput.checked
            };
            await saveNewProperty(propertyData);
        });
    }

    // Update Property
    if (updatePropertyForm) {
        updatePropertyForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const propertyData = {
                id: parseInt(updatePropertyIdInput.value),
                title: updatePropertyTitleInput.value.trim(),
                image: updatePropertyImageInput.value.trim(),
                description: updatePropertyDescriptionInput.value.trim(),
                categories: updatePropertyCategoriesInput.value.trim().split(',').map(cat => cat.trim()).filter(cat => cat !== ''),
                is_foreign: updatePropertyIsForeignInput.checked
            };
            await updateExistingProperty(propertyData);
        });
    }

    // Property Cards (delegated event listeners)
    if (propertyCardsContainer) {
        propertyCardsContainer.addEventListener('click', async (event) => {
            const viewBtn = event.target.closest('[data-action="view-property-details"]');
            const editBtn = event.target.closest('[data-action="edit-property"]');

            if (viewBtn) {
                const propertyId = parseInt(viewBtn.dataset.propertyId);
                const selectedProperty = getPropertyById(propertyId);
                if (selectedProperty) {
                    currentSelectedProperty = selectedProperty;
                    showPage(propertyCategoriesPage);
                    renderPropertyCategories(currentSelectedProperty, currentSelectedCategoryName, propertyCategoriesNav, categoryDetailsHeading, currentPropertyThumbnail);
                    renderCategoryDetailsUI(currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer, categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker, customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput);
                    propertyCategoriesPage.dataset.selectedPropertyId = currentSelectedProperty.id;
                } else {
                    showCustomAlert('Property details not found.');
                }
            } else if (editBtn) {
                const propertyId = parseInt(editBtn.dataset.propertyId);
                const propertyToEdit = getPropertyById(propertyId);
                if (propertyToEdit) {
                    showPage(updatePropertyPage);
                    updatePropertyIdInput.value = propertyToEdit.id;
                    updatePropertyTitleInput.value = propertyToEdit.title;
                    updatePropertyImageInput.value = propertyToEdit.image;
                    updatePropertyDescriptionInput.value = propertyToEdit.description;
                    updatePropertyCategoriesInput.value = propertyToEdit.categories.join(', ');
                    updatePropertyIsForeignInput.checked = propertyToEdit.is_foreign;
                } else {
                    showCustomAlert('Property not found for editing.');
                }
            }
        });
    }

    // Category Actions (on Property Categories Page)
    if (propertyCategoriesNav) {
        propertyCategoriesNav.addEventListener('click', (event) => {
            const categoryDiv = event.target.closest('[data-category-name]');
            if (categoryDiv) {
                propertyCategoriesNav.querySelectorAll('[data-category-name]').forEach(div => {
                    div.classList.remove('bg-blue-200', 'text-blue-800');
                });
                categoryDiv.classList.add('bg-blue-200', 'text-blue-800');

                currentSelectedCategoryName = categoryDiv.dataset.categoryName;
                propertyCategoriesPage.dataset.selectedCategoryName = currentSelectedCategoryName;

                renderCategoryDetailsUI(currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer, categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker, customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput);

                if (addCategoryDetailButtonAtBottom) addCategoryDetailButtonAtBottom.style.display = 'block';
                if (propertyFilesContent) propertyFilesContent.style.display = 'none';
                document.getElementById('category-details-content').style.display = 'flex';
            }
        });
    }

    if (addNewCategoryButton) {
        addNewCategoryButton.addEventListener('click', () => {
            if (currentSelectedProperty) {
                if (categoryPropertyTitleSpan) categoryPropertyTitleSpan.textContent = `"${currentSelectedProperty.title}"`;
                showPage(addNewCategoryPage);
                addNewCategoryForm.reset();
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
                showCustomAlert('Please enter a category name.');
                return;
            }
            await addNewCategoryToProperty(currentSelectedProperty.id, newCategoryName, currentSelectedProperty);
        });
    }

    if (deleteCategoryButton) {
        deleteCategoryButton.addEventListener('click', () => {
            if (!currentSelectedProperty || !currentSelectedCategoryName) {
                showCustomAlert('Please select a category to delete.');
                return;
            }
            showModal(
                verificationModal,
                `category: "${currentSelectedCategoryName}"`,
                `deleting`,
                async (username, password) => {
                    const success = await deleteCategoryDetail(currentSelectedProperty.id, currentSelectedCategoryName, username, password);
                    if (success) {
                        renderPropertyCategories(currentSelectedProperty, null, propertyCategoriesNav, categoryDetailsHeading, currentPropertyThumbnail);
                        renderCategoryDetailsUI(currentSelectedProperty.id, null, dynamicCategoryButtonsContainer, categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker, customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput);
                        currentSelectedCategoryName = null;
                    }
                }
            );
        });
    }

    if (refreshCategoriesButtonOnCategoriesPage) {
        refreshCategoriesButtonOnCategoriesPage.addEventListener('click', () => {
            if (currentSelectedProperty) {
                renderPropertyCategories(currentSelectedProperty, currentSelectedCategoryName, propertyCategoriesNav, categoryDetailsHeading, currentPropertyThumbnail);
                renderCategoryDetailsUI(currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer, categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker, customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput);
            } else {
                showCustomAlert('Please select a property first.');
            }
        });
    }

    // Add/Update Detail Forms
    if (addCategoryDetailButtonAtBottom) {
        addCategoryDetailButtonAtBottom.addEventListener('click', () => {
            if (currentSelectedProperty && currentSelectedCategoryName) {
                if (addDetailCategoryNameSpan) addDetailCategoryNameSpan.textContent = `"${currentSelectedCategoryName}" for ${currentSelectedProperty.title}`;
                showPage(addCategoryDetailPage);
                addDetailForm.reset();
                detailUsernameAddInput.value = '';
                detailPasswordAddInput.value = ''; // Corrected line
                renderPresetLogosForForm(presetLogoPicker, customLogoUrlInput, ''); // Pass empty string for new detail
            } else {
                showCustomAlert('Please select a property category first to add details to it.');
            }
        });
    }

    if (addDetailForm) {
        addDetailForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            let logoUrlToSend = '';
            const selectedPresetRadio = presetLogoPicker.querySelector('input[name="detail-logo"]:checked');
            if (selectedPresetRadio) {
                logoUrlToSend = selectedPresetRadio.value;
            } else if (customLogoUrlInput.value.trim() !== '') {
                logoUrlToSend = customLogoUrlInput.value.trim();
            }

            const detailData = {
                detail_name: detailNameInput.value.trim(),
                detail_url: detailUrlInput.value.trim(),
                detail_description: detailDescriptionInput.value.trim(),
                detail_logo_url: logoUrlToSend,
                detail_username: detailUsernameAddInput.value.trim(),
                detail_password: detailPasswordAddInput.value.trim()
            };
            await addCategoryDetail(currentSelectedProperty.id, currentSelectedCategoryName, detailData);
        });
    }

    if (updateDetailForm) {
        updateDetailForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            let logoUrlToSend = '';
            const selectedUpdatePresetRadio = updatePresetLogoPicker.querySelector('input[name="update-logo"]:checked');
            if (selectedUpdatePresetRadio) {
                logoUrlToSend = selectedUpdatePresetRadio.value;
            } else if (updateCustomLogoUrlInput.value.trim() !== '') {
                logoUrlToSend = updateCustomLogoUrlInput.value.trim();
            }

            const detailData = {
                id: parseInt(updateDetailIdInput.value),
                detail_name: updateDetailNameInput.value.trim(),
                detail_url: updateDetailUrlInput.value.trim(),
                detail_description: updateDetailDescriptionInput.value.trim(),
                detail_logo_url: logoUrlToSend,
                detail_username: updateDetailUsernameInput.value.trim(),
                detail_password: updateDetailPasswordInput.value.trim() // Corrected line
            };
            await updateCategoryDetail(detailData, currentSelectedProperty.id, currentSelectedCategoryName);
        });
    }

    // Detail Tile Actions (Delegated from ui/category-renderer.js's clicks, but handled here)
    if (dynamicCategoryButtonsContainer) {
        dynamicCategoryButtonsContainer.addEventListener('click', (event) => {
            const editBtn = event.target.closest('[data-action="edit"]');
            const deleteBtn = event.target.closest('[data-action="delete-detail"]');
            const viewBtn = event.target.closest('[data-action="view"]');

            if (editBtn) {
                const detailData = editBtn.dataset;
                updateDetailIdInput.value = detailData.id;
                updateDetailNameInput.value = detailData.name;
                updateDetailUrlInput.value = detailData.url;
                updateDetailDescriptionInput.value = detailData.description;
                updateDetailUsernameInput.value = detailData.username;
                updateDetailPasswordInput.value = detailData.password; // Corrected line
                if (updateDetailCategoryNameSpan) updateDetailCategoryNameSpan.textContent = `"${currentSelectedCategoryName}" for ${currentSelectedProperty.title}`;

                renderPresetLogosForForm(updatePresetLogoPicker, updateCustomLogoUrlInput, detailData.logo);
                showPage(updateCategoryDetailPage);

            } else if (deleteBtn) {
                const detailId = parseInt(deleteBtn.dataset.id);
                const detailName = deleteBtn.dataset.name;
                showModal(
                    verificationModal,
                    `detail: "${detailName}"`,
                    `deleting`,
                    async (username, password) => {
                        await deleteCategoryDetail(currentSelectedProperty.id, currentSelectedCategoryName, detailId, username, password);
                    }
                );
            } else if (viewBtn) {
                const url = viewBtn.dataset.url;
                if (url) { window.open(url, '_blank'); } else { showCustomAlert('No URL provided.'); }
            }
        });
    }


    // File Management
    if (viewFilesButton) {
        viewFilesButton.addEventListener('click', () => {
            if (currentSelectedProperty) {
                document.getElementById('category-details-content').style.display = 'none';
                propertyFilesContent.style.display = 'flex';
                filesPropertyTitleSpan.textContent = currentSelectedProperty.title;
                if (addCategoryDetailButtonAtBottom) addCategoryDetailButtonAtBottom.style.display = 'none';

                displayPropertyFiles(currentSelectedProperty.id, null);
                propertyFilesContent.dataset.selectedPropertyId = currentSelectedProperty.id;

            } else {
                showCustomAlert('Please select a property to view files.');
            }
        });
    }

    if (createFolderButton) {
        createFolderButton.addEventListener('click', async () => {
            const propertyId = parseInt(propertyFilesContent.dataset.selectedPropertyId);
            if (!propertyId) { showCustomAlert('Error: Property not selected for folder creation.'); return; }

            const folderName = prompt('Enter folder name:');
            if (folderName && folderName.trim() !== '') {
                await createFolder(propertyId, folderName.trim());
            } else if (folderName !== null) {
                showCustomAlert('Folder name cannot be empty.');
            }
        });
    }

    if (deleteSelectedFilesButton) {
        deleteSelectedFilesButton.addEventListener('click', async () => {
            const propertyId = parseInt(propertyFilesContent.dataset.selectedPropertyId);
            if (!propertyId) { showCustomAlert('Error: Property not selected for file deletion.'); return; }

            const filesToDelete = Array.from(filesListContainer.querySelectorAll('.file-checkbox:checked')).map(cb => parseInt(cb.dataset.fileId));
            if (filesToDelete.length === 0) {
                showCustomAlert('No files selected for deletion.');
                return;
            }
            showModal(
                verificationModal,
                `${filesToDelete.length} selected file(s)`,
                `deleting`,
                async (username, password) => {
                    await deleteFiles(propertyId, filesToDelete, username, password);
                }
            );
        });
    }

    if (moveToFolderButton) {
        moveToFolderButton.addEventListener('click', async () => {
            const propertyId = parseInt(propertyFilesContent.dataset.selectedPropertyId);
            if (!propertyId) { showCustomAlert('Error: Property not selected for file movement.'); return; }

            const filesToMove = Array.from(filesListContainer.querySelectorAll('.file-checkbox:checked')).map(cb => parseInt(cb.dataset.fileId));
            if (filesToMove.length === 0) {
                showCustomAlert('No files selected to move.');
                return;
            }
            await initFileUploadProcess(propertyId, null, null, null, filesToMove);
        });
    }

    if (uploadFileButton) {
        uploadFileButton.addEventListener('click', async () => {
            const propertyId = parseInt(propertyFilesContent.dataset.selectedPropertyId);
            if (!propertyId) { showCustomAlert('Error: Property not selected for file upload.'); return; }

            if (!fileUploadInput || !fileUploadInput.files || fileUploadInput.files.length === 0) {
                showCustomAlert('Please select a file to upload.');
                return;
            }
            const file = fileUploadInput.files[0];
            await initFileUploadProcess(propertyId, file);
        });
    }

    // Event handlers for folder selection modal
    if (folderSelectDropdown) {
        folderSelectDropdown.addEventListener('change', (e) => {
            if (newFolderNameContainer) {
                newFolderNameContainer.style.display = e.target.value === 'new' ? 'block' : 'none';
            }
            if (newFolderNameInput && e.target.value === 'new') {
                newFolderNameInput.focus();
            }
            if (uploadFolderModalStatus) uploadFolderModalStatus.classList.add('hidden');
        });
    }

    if (cancelFolderSelectionBtn) {
        cancelFolderSelectionBtn.addEventListener('click', () => {
            hideModal(uploadFolderModal);
            if (fileUploadInput) fileUploadInput.value = '';
        });
    }

    if (foldersList) {
        foldersList.addEventListener('click', async (event) => {
            const folderItem = event.target.closest('.folder-item');
            if (folderItem) {
                const folderId = folderItem.dataset.folderId;
                const propertyId = parseInt(propertyFilesContent.dataset.selectedPropertyId);

                foldersList.querySelectorAll('.folder-item').forEach(item => item.classList.remove('active'));
                folderItem.classList.add('active');

                await displayPropertyFiles(propertyId, folderId);
            }
        });
    }

    // --- Back Button Event Listeners (Consolidated) ---
    // Moved these here and ensured they use the variables correctly.
    const backToLoginFromRegisterBtn = document.getElementById('back-to-login-from-register-btn'); // Local variable
    if (backToLoginFromRegisterBtn) {
        backToLoginFromRegisterBtn.addEventListener('click', () => showPage(loginPage));
    }

    const backFromAddPropertyBtn = document.getElementById('back-from-add-property-btn'); // Local variable
    if (backFromAddPropertyBtn) {
        backFromAddPropertyBtn.addEventListener('click', () => showPage(propertySelectionPage));
    }

    const backFromAddNewCategoryBtn = document.getElementById('back-from-add-new-category-btn'); // Local variable
    if (backFromAddNewCategoryBtn) {
        backFromAddNewCategoryBtn.addEventListener('click', () => showPage(propertyCategoriesPage));
    }

    const backFromAddDetailBtn = document.getElementById('back-from-add-detail-btn'); // Local variable
    if (backFromAddDetailBtn) {
        backFromAddDetailBtn.addEventListener('click', () => showPage(propertyCategoriesPage));
    }

    // backFromUpdateDetailBtn is already a global let, so its listener is below
    if (backFromUpdateDetailBtn) {
        backFromUpdateDetailBtn.addEventListener('click', () => showPage(propertyCategoriesPage));
    }

    // backFromUpdatePropertyBtn is already a global let, so its listener is below
    if (backFromUpdatePropertyBtn) {
        backFromUpdatePropertyBtn.addEventListener('click', () => showPage(propertySelectionPage));
    }
}); // End DOMContentLoaded
