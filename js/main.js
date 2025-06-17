// js/main.js

// --- Import Modules ---
import { showPage, showCustomAlert, showModal, hideModal } from './utils/dom.js';
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

    // --- PART 1: GET ALL DOM ELEMENT REFERENCES ---
    // (Ensure all these elements exist in your HTML and are correctly retrieved here)
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

    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const showRegisterFormBtn = document.getElementById('show-register-form-btn');
    const backToLoginFromRegisterBtn = document.getElementById('back-to-login-from-register-btn');
    const registerForm = document.getElementById('register-form');
    const regUsernameInput = document.getElementById('reg-username');
    const regPasswordInput = document.getElementById('reg-password');

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

    const addPropertyForm = document.getElementById('add-property-form');
    const propertyTitleInput = document.getElementById('property-title');
    const propertyImageInput = document.getElementById('property-image');
    const propertyDescriptionInput = document.getElementById('property-description');
    const propertyCategoriesInput = document.getElementById('property-categories');
    const cancelAddPropertyButton = document.getElementById('cancel-add-property');
    const addPropertyStatus = document.getElementById('add-property-status');
    const backFromAddPropertyBtn = document.getElementById('back-from-add-property-btn');
    const propertyIsForeignInput = document.getElementById('property-is-foreign');

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

    // ... (rest of your DOM element retrievals) ...

    // --- PART 2: INITIAL PAGE LOAD & ATTACH EVENT LISTENERS ---

    showPage(loginPage);

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const success = await login(usernameInput.value, passwordInput.value);
            if (success) {
                currentLoggedInUsername = usernameInput.value;

                // Pass ALL the necessary DOM elements to fetchProperties
                const propertiesLoaded = await fetchProperties(
                    null, // initial filter (all)
                    propertyCardsContainer,
                    propertiesLoadingMessage,
                    propertiesErrorMessage,
                    propertiesErrorText,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn,
                    propertySelectionPage // Pass propertySelectionPage here
                );

                if (propertiesLoaded) {
                    showPage(propertySelectionPage);
                } else {
                    showCustomAlert('Failed to load properties after login. Please try again.');
                }
            } else {
                passwordInput.value = '';
                showCustomAlert('Login failed. Please check your credentials.');
            }
        });
    }

    // ... (register form listeners) ...

    // Property Filters
    if (filterAllPropertiesBtn) {
        filterAllPropertiesBtn.addEventListener('click', () => {
            const { domesticApproved, foreignApproved } = getUserApprovalStatuses();
            if (domesticApproved || foreignApproved) {
                // Pass ALL the necessary DOM elements to setPropertiesFilter
                setPropertiesFilter(
                    null, // filter for all
                    propertyCardsContainer,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn
                );
            } else {
                showCustomAlert('You are not approved to view any properties.');
            }
        });
    }
    if (filterDomesticPropertiesBtn) {
        filterDomesticPropertiesBtn.addEventListener('click', () => {
            const { domesticApproved } = getUserApprovalStatuses();
            if (domesticApproved) {
                // Pass ALL the necessary DOM elements to setPropertiesFilter
                setPropertiesFilter(
                    false, // filter for domestic
                    propertyCardsContainer,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn
                );
            } else {
                showCustomAlert('You are not approved to view domestic properties.');
            }
        });
    }
    if (filterForeignPropertiesBtn) {
        filterForeignPropertiesBtn.addEventListener('click', () => {
            const { foreignApproved } = getUserApprovalStatuses();
            if (foreignApproved) {
                // Pass ALL the necessary DOM elements to setPropertiesFilter
                setPropertiesFilter(
                    true, // filter for foreign
                    propertyCardsContainer,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn
                );
            } else {
                showCustomAlert('You are not approved to view foreign properties. Pre-registered properties are visible to everyone.');
            }
        });
    }

    // Refresh Properties
    if (refreshPropertiesButton) {
        refreshPropertiesButton.addEventListener('click', async () => {
            try {
                // Pass ALL the necessary DOM elements to fetchProperties
                await fetchProperties(
                    null, // Assuming refresh means all properties
                    propertyCardsContainer,
                    propertiesLoadingMessage,
                    propertiesErrorMessage,
                    propertiesErrorText,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn,
                    propertySelectionPage // Pass propertySelectionPage here
                );
                showCustomAlert('Properties refreshed successfully');
            } catch (error) {
                showCustomAlert('Failed to refresh properties');
            }
        });
    }

    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                const propertyData = {
                    title: propertyTitleInput.value.trim(),
                    image: propertyImageInput.value.trim(),
                    description: propertyDescriptionInput.value.trim(),
                    categories: propertyCategoriesInput.value.trim().split(',').map(cat => cat.trim()).filter(cat => cat !== ''),
                    is_foreign: propertyIsForeignInput.checked
                };
                // Pass ALL the necessary DOM elements to saveNewProperty
                const success = await saveNewProperty(
                    propertyData,
                    propertySelectionPage, // Pass propertySelectionPage here
                    propertyCardsContainer,
                    propertiesLoadingMessage,
                    propertiesErrorMessage,
                    propertiesErrorText,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn
                );
                if (success) {
                    // Re-fetching is handled by saveNewProperty's setTimeout now
                    // showPage(propertySelectionPage); // Removed as saveNewProperty handles this
                }
            } catch (error) {
                showCustomAlert('Failed to add property: ' + error.message);
            }
        });
    }

    if (updatePropertyForm) {
        updatePropertyForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                const propertyData = {
                    id: parseInt(updatePropertyIdInput.value),
                    title: updatePropertyTitleInput.value.trim(),
                    image: updatePropertyImageInput.value.trim(),
                    description: updatePropertyDescriptionInput.value.trim(),
                    categories: updatePropertyCategoriesInput.value.trim().split(',').map(cat => cat.trim()).filter(cat => cat !== ''),
                    is_foreign: updatePropertyIsForeignInput.checked
                };
                // Pass ALL the necessary DOM elements to updateExistingProperty
                const success = await updateExistingProperty(
                    propertyData,
                    propertySelectionPage, // Pass propertySelectionPage here
                    propertyCardsContainer,
                    propertiesLoadingMessage,
                    propertiesErrorMessage,
                    propertiesErrorText,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn
                );
                if (success) {
                    // Re-fetching is handled by updateExistingProperty's setTimeout now
                    // showPage(propertySelectionPage); // Removed as updateExistingProperty handles this
                }
            } catch (error) {
                showCustomAlert('Failed to update property: ' + error.message);
            }
        });
    }

    // Property Cards (delegated event listeners)
    if (propertyCardsContainer) {
        propertyCardsContainer.addEventListener('click', async (event) => {
            const viewBtn = event.target.closest('[data-action="view-property-details"]');
            const editBtn = event.target.closest('[data-action="edit"]'); // Changed from edit-property to just edit

            if (viewBtn) {
                try {
                    const propertyId = parseInt(viewBtn.dataset.propertyId);
                    const selectedProperty = getPropertyById(propertyId);
                    
                    if (!selectedProperty) {
                        throw new Error('Property not found');
                    }

                    currentSelectedProperty = selectedProperty;
                    
                    // Load categories data (not just render UI)
                    // The getCategoryDetails function (from services/categories.js) needs to be able to fetch categories
                    // but it also takes UI elements for rendering. Let's adjust its usage.
                    // For now, we only need to call a function that fetches categories and updates the property object if necessary.
                    // Let's assume currentSelectedProperty.categories is already populated by fetchProperties
                    // and getCategoryDetails will be used to fetch the *details for a specific category*.

                    showPage(propertyCategoriesPage); // Navigate first

                    // Update property header visuals
                    if (currentPropertyTitle) {
                        currentPropertyTitle.textContent = currentSelectedProperty.title;
                    }
                    if (currentPropertyThumbnail) {
                        currentPropertyThumbnail.src = currentSelectedProperty.image || 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
                    }

                    // Render categories in the left sidebar
                    renderPropertyCategories(
                        currentSelectedProperty, 
                        null, // Start with no specific category highlighted
                        propertyCategoriesNav, 
                        categoryDetailsHeading, 
                        currentPropertyThumbnail
                    );
                    
                    // Store selected property ID on the page element for easier access by other listeners
                    propertyCategoriesPage.dataset.selectedPropertyId = currentSelectedProperty.id;

                    // --- AUTOMATICALLY SELECT FIRST CATEGORY WHEN PROPERTY IS VIEWED ---
                    if (currentSelectedProperty.categories && currentSelectedProperty.categories.length > 0) {
                        const firstCategoryName = currentSelectedProperty.categories[0];
                        currentSelectedCategoryName = firstCategoryName; // Update global state
                        propertyCategoriesPage.dataset.selectedCategoryName = firstCategoryName; // Update dataset

                        // Explicitly highlight the first category in the sidebar
                        const firstCategoryDiv = propertyCategoriesNav.querySelector(`[data-category-name="${firstCategoryName}"]`);
                        if (firstCategoryDiv) {
                            // Remove existing highlights
                            propertyCategoriesNav.querySelectorAll('[data-category-name]').forEach(div => {
                                div.classList.remove('bg-blue-200', 'text-blue-800');
                            });
                            // Add highlight to the first category
                            firstCategoryDiv.classList.add('bg-blue-200', 'text-blue-800');
                        }

                        // Render details for the first category
                        renderCategoryDetailsUI(
                            currentSelectedProperty.id,
                            currentSelectedCategoryName, // Pass the selected name
                            dynamicCategoryButtonsContainer,
                            categoryLoadingMessage,
                            addCategoryDetailButtonAtBottom,
                            presetLogoPicker,
                            customLogoUrlInput,
                            updatePresetLogoPicker,
                            updateCustomLogoUrlInput
                        );
                    } else {
                        // No categories for this property, show default message in details area
                        renderCategoryDetailsUI(
                            currentSelectedProperty.id,
                            null, // No category selected
                            dynamicCategoryButtonsContainer,
                            categoryLoadingMessage,
                            addCategoryDetailButtonAtBottom,
                            presetLogoPicker,
                            customLogoUrlInput,
                            updatePresetLogoPicker,
                            updateCustomLogoUrlInput
                        );
                        if (addCategoryDetailButtonAtBottom) addCategoryDetailButtonAtBottom.style.display = 'none'; // Hide button if no categories
                    }
                    // --- END AUTOMATIC SELECTION ---

                } catch (error) {
                    console.error('Error viewing property:', error);
                    showCustomAlert('Failed to load property details. Please try again.');
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
                showCustomAlert('Please select a property first.');
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
            if (!propertyId) { showCustomAlert('Error: Property not selected.'); return; }

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
            if (!propertyId) { showCustomAlert('Error: Property not selected.'); return; }

            const filesToDelete = Array.from(filesListContainer.querySelectorAll('.file-checkbox:checked')).map(cb => parseInt(cb.dataset.fileId));
            if (filesToDelete.length === 0) {
                showCustomAlert('No files selected.');
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
            if (!propertyId) { showCustomAlert('Error: Property not selected.'); return; }

            const filesToMove = Array.from(filesListContainer.querySelectorAll('.file-checkbox:checked')).map(cb => parseInt(cb.dataset.fileId));
            if (filesToMove.length === 0) {
                showCustomAlert('No files selected.');
                return;
            }
            await initFileUploadProcess(propertyId, null, null, null, filesToMove);
        });
    }

    if (uploadFileButton) {
        uploadFileButton.addEventListener('click', async () => {
            const propertyId = parseInt(propertyFilesContent.dataset.selectedPropertyId);
            if (!propertyId) { showCustomAlert('Error: Property not selected.'); return; }

            if (!fileUploadInput?.files?.length) {
                showCustomAlert('Please select a file.');
                return;
            }
            await initFileUploadProcess(propertyId, fileUploadInput.files[0]);
        });
    }

    // Folder Modal Handlers
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

    if (backToPropertiesBtn) {
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
