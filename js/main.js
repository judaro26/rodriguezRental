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


// --- Global Application State (NOT DOM elements - these are data states) ---
let currentSelectedProperty = null;
let currentSelectedCategoryName = null;
let currentLoggedInUsername = ''; // Keep these here for passing to functions


// --- Application Initialization ---
document.addEventListener('DOMContentLoaded', async () => {

    // --- PART 1: GET ALL DOM ELEMENT REFERENCES (Declared as const, locally within DOMContentLoaded) ---
    // This section MUST be executed first inside DOMContentLoaded.
    // Every variable here will reliably hold either the HTMLElement or null.

    // Pages and Modals
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const propertySelectionPage = document.getElementById('property-selection-page');
    const addPropertyPage = document.getElementById('add-property-page');
    const propertyCategoriesPage = document.getElementById('property-categories-page');
    const addCategoryDetailPage = document.getElementById('add-category-detail-page');
    const addNewCategoryPage = document.getElementById('add-new-category-page');
    const updatePropertyPage = document.getElementById('update-property-page');
    const updateCategoryDetailPage = document.getElementById('update-category-detail-page');
    const propertyFilesContent = document.getElementById('property-files-content');
    const verificationModal = document.getElementById('verification-modal');
    const uploadFolderModal = document.getElementById('upload-folder-modal');

    // Login/Register Elements
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const showRegisterFormBtn = document.getElementById('show-register-form-btn');
    const backToLoginFromRegisterBtn = document.getElementById('back-to-login-from-register-btn');
    const registerForm = document.getElementById('register-form');
    const regUsernameInput = document.getElementById('reg-username');
    const regPasswordInput = document.getElementById('reg-password');


    // Property Selection Page Elements
    const propertyCardsContainer = document.getElementById('property-cards-container');
    const propertiesLoadingMessage = document.getElementById('properties-loading-message');
    const propertiesErrorText = document.getElementById('properties-error-text');
    const propertiesErrorMessage = document.getElementById('properties-error-message');
    const addPropertyButton = document.getElementById('add-property-button');
    const refreshPropertiesButton = document.getElementById('refresh-properties-button');
    const backToLoginBtn = document.getElementById('back-to-login-btn');
    const filterAllPropertiesBtn = document.getElementById('filter-all-properties');
    const filterDomesticPropertiesBtn = document.getElementById('filter-domestic-properties');
    const filterForeignPropertiesBtn = document.getElementById('filter-foreign-properties');

    // Add Property Page Elements
    const addPropertyForm = document.getElementById('add-property-form');
    const propertyTitleInput = document.getElementById('property-title');
    const propertyImageInput = document.getElementById('property-image');
    const propertyDescriptionInput = document.getElementById('property-description');
    const propertyCategoriesInput = document.getElementById('property-categories');
    const cancelAddPropertyButton = document.getElementById('cancel-add-property');
    const addPropertyStatus = document.getElementById('add-property-status');
    const backFromAddPropertyBtn = document.getElementById('back-from-add-property-btn');
    const propertyIsForeignInput = document.getElementById('property-is-foreign');

    // Property Categories Page Elements
    const propertyCategoriesNav = document.getElementById('property-categories-nav');
    const categoryDetailsHeading = document.getElementById('current-property-title');
    const dynamicCategoryButtonsContainer = document.getElementById('dynamic-category-buttons-container');
    const categoryLoadingMessage = document.getElementById('category-loading-message');
    const backToPropertiesBtn = document.getElementById('back-to-properties-btn'); // THIS IS THE ONE FROM THE ERROR
    const addNewCategoryButton = document.getElementById('add-new-category-button');
    const deleteCategoryButton = document.getElementById('delete-category-button');
    const refreshCategoriesButtonOnCategoriesPage = document.getElementById('refresh-categories-on-page-button');
    const viewFilesButton = document.getElementById('view-files-button');
    const propertyHeader = document.getElementById('property-header');
    const currentPropertyTitle = document.getElementById('current-property-title');
    const currentPropertyThumbnail = document.getElementById('current-property-thumbnail');
    const addCategoryDetailButtonAtBottom = document.getElementById('add-category-detail-button-bottom');

    // Add New Category Page Elements
    const addNewCategoryForm = document.getElementById('add-new-category-form');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const categoryPropertyTitleSpan = document.getElementById('category-property-title');
    const cancelNewCategoryButton = document.getElementById('cancel-new-category');
    const addNewCategoryStatus = document.getElementById('add-new-category-status');

    // Add Category Detail Page Elements
    const addDetailForm = document.getElementById('add-detail-form');
    const detailNameInput = document.getElementById('detail-name');
    const detailUrlInput = document.getElementById('detail-url');
    const detailDescriptionInput = document.getElementById('detail-description');
    const presetLogoPicker = document.getElementById('preset-logo-picker');
    const customLogoUrlInput = document.getElementById('custom-logo-url');
    const detailUsernameAddInput = document.getElementById('detail-username-add');
    const detailPasswordAddInput = document.getElementById('detail-password-add');
    const cancelAddDetailButton = document.getElementById('cancel-add-detail');
    const addDetailStatus = document.getElementById('add-detail-status');
    const addDetailCategoryNameSpan = document.getElementById('add-detail-category-name');

    // Update Category Detail Page Elements
    const updateCategoryDetailPage = document.getElementById('update-category-detail-page');
    const updateDetailForm = document.getElementById('update-detail-form');
    const updateDetailIdInput = document.getElementById('update-detail-id');
    const updateDetailNameInput = document.getElementById('update-detail-name');
    const updateDetailUrlInput = document.getElementById('update-detail-url');
    const updateDetailDescriptionInput = document.getElementById('update-detail-description');
    const updatePresetLogoPicker = document.getElementById('update-preset-logo-picker');
    const updateCustomLogoUrlInput = document.getElementById('update-custom-logo-url');
    const updateDetailUsernameInput = document.getElementById('update-detail-username');
    const updateDetailPasswordInput = document.getElementById('update-detail-password');
    const cancelUpdateDetailButton = document.getElementById('cancel-update-detail');
    const updateDetailStatus = document.getElementById('update-detail-status');
    const backFromUpdateDetailBtn = document.getElementById('back-from-update-detail-btn');
    const updateDetailCategoryNameSpan = document.getElementById('update-detail-category-name');

    // Update Property Page Elements
    const updatePropertyForm = document.getElementById('update-property-form');
    const updatePropertyIdInput = document.getElementById('update-property-id');
    const updatePropertyTitleInput = document.getElementById('update-property-title');
    const updatePropertyImageInput = document.getElementById('update-property-image');
    const updatePropertyDescriptionInput = document.getElementById('update-property-description');
    const updatePropertyCategoriesInput = document.getElementById('update-property-categories');
    const updatePropertyIsForeignInput = document.getElementById('update-property-is-foreign');
    const cancelUpdatePropertyButton = document.getElementById('cancel-update-property');
    const updatePropertyStatus = document.getElementById('update-property-status');
    const backFromUpdatePropertyBtn = document.getElementById('back-from-update-property-btn');

    // Property Files Page Elements
    const filesPropertyTitleSpan = document.getElementById('files-property-title');
    const filesPropertyThumbnail = document.getElementById('files-property-thumbnail');
    const fileUploadInput = document.getElementById('file-upload-input');
    const uploadFileButton = document.getElementById('upload-file-button');
    const fileUploadStatus = document.getElementById('file-upload-status');
    const filesListContainer = document.getElementById('files-list-container');
    const backFromFilesButton = document.getElementById('back-from-files-button');
    const createFolderButton = document.getElementById('create-folder-button');
    const moveToFolderButton = document.getElementById('move-to-folder-button');
    const deleteSelectedFilesButton = document.getElementById('delete-selected-files-button');
    const foldersList = document.getElementById('folders-list');
    const currentFolderTitle = document.getElementById('current-folder-title');

    // Upload Folder Modal Elements
    const uploadFolderModalStatus = document.getElementById('upload-folder-modal-status');
    const folderSelectDropdown = document.getElementById('folder-select-dropdown');
    const newFolderNameContainer = document.getElementById('new-folder-name-container');
    const newFolderNameInput = document.getElementById('new-folder-name-input');
    const cancelFolderSelectionBtn = document.getElementById('cancel-folder-selection-btn');
    const confirmFolderSelectionBtn = document.getElementById('confirm-folder-selection-btn');


    // Debugging logs for critical elements:
    console.log('--- DOM Element Retrieval Check ---');
    console.log('loginPage:', loginPage);
    console.log('loginForm:', loginForm);
    console.log('backToPropertiesBtn:', backToPropertiesBtn); // Check this specific one
    console.log('foldersList:', foldersList); // And this one too
    console.log('backToLoginFromRegisterBtn:', backToLoginFromRegisterBtn); // Check this one
    console.log('backFromAddPropertyBtn:', backFromAddPropertyBtn); // Check this one
    console.log('backFromAddNewCategoryBtn:', backFromAddNewCategoryBtn); // Check this one
    console.log('backFromAddDetailBtn:', backFromAddDetailBtn); // Check this one
    console.log('backFromUpdateDetailBtn:', backFromUpdateDetailBtn); // Check this one
    console.log('backFromUpdatePropertyBtn:', backFromUpdatePropertyBtn); // Check this one
    console.log('backFromFilesButton:', backFromFilesButton); // Check this one
    console.log('--- End DOM Element Retrieval Check ---');


    // --- PART 2: INITIAL PAGE LOAD & ATTACH EVENT LISTENERS ---
    // This section MUST come AFTER all document.getElementById calls from PART 1.

    // Initial page load
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
                showCustomAlert('You are not approved to view foreign properties. Pre-registered properties are visible to everyone.');
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
            const editBtn = event.target.closest('[data-action="edit"]');

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
                detailPasswordAddInput.value = '';
                renderPresetLogosForForm(presetLogoPicker, customLogoUrlInput, '');
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
                detail_password: updateDetailPasswordInput.value.trim()
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
                updateDetailPasswordInput.value = detailData.password;
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

    // --- Back Button Event Listeners ---
    // These are assigned here after all elements have been guaranteed to be retrieved.

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            showPage(loginPage);
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';
        });
    }

    if (backToLoginFromRegisterBtn) {
        backToLoginFromRegisterBtn.addEventListener('click', () => {
            showPage(loginPage);
            if (regUsernameInput) regUsernameInput.value = '';
            if (regPasswordInput) regPasswordInput.value = '';
        });
    }

    if (backFromAddPropertyBtn) {
        backFromAddPropertyBtn.addEventListener('click', () => {
            showPage(propertySelectionPage);
            addPropertyForm.reset();
        });
    }

    if (backToPropertiesBtn) { // This is the button linked to the error.
        backToPropertiesBtn.addEventListener('click', () => {
            showPage(propertySelectionPage);
            currentSelectedProperty = null;
            currentSelectedCategoryName = null;
            if (currentPropertyTitle) currentPropertyTitle.textContent = 'Category Details';
            if (currentPropertyThumbnail) currentPropertyThumbnail.src = 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
        });
    }

    if (backFromAddNewCategoryBtn) {
        backFromAddNewCategoryBtn.addEventListener('click', () => showPage(propertyCategoriesPage));
    }

    if (backFromAddDetailBtn) {
        backFromAddDetailBtn.addEventListener('click', () => showPage(propertyCategoriesPage));
    }

    if (backFromUpdateDetailBtn) {
        backFromUpdateDetailBtn.addEventListener('click', () => showPage(propertyCategoriesPage));
    }

    if (backFromUpdatePropertyBtn) {
        backFromUpdatePropertyBtn.addEventListener('click', () => showPage(propertySelectionPage));
    }

    if (backFromFilesButton) {
        backFromFilesButton.addEventListener('click', () => showPage(propertyCategoriesPage));
    }

}); // End DOMContentLoaded
