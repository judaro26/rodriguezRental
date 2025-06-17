// js/main.js

// --- Import Modules ---
import { showPage, showCustomAlert, showModal, hideModal } from './utils/dom.js';
import { login, register, getUserApprovalStatuses } from './services/auth.js';
import { fetchProperties, getPropertyById, saveNewProperty, updateExistingProperty, setPropertiesFilter } from './services/properties.js';
import { addCategoryDetail, updateCategoryDetail, deleteCategoryDetail, getCategoryDetails, addNewCategoryToProperty } from './services/categories.js'; // Removed renderPresetLogosForForm
// Renamed imports for clarity: service functions from files.js
import { displayPropertyFiles as fetchFileAndFolderData, createFolder as createFolderService, uploadFile as uploadFileService, moveFiles as moveFilesService, deleteFiles as deleteFilesService, initFileUploadProcess as initFileUploadProcessService } from './services/files.js';
// Added renderPresetLogosForForm here, and ensure renderFilesList, renderFoldersList, toggleFileSelection, updateSelectionUI are here
import { renderPropertyCategories, displayCategoryDetails as renderCategoryDetailsUI, renderPresetLogosForForm } from './ui/category-renderer.js';
import { renderFilesList, toggleFileSelection, updateSelectionUI, renderFoldersList } from './ui/file-renderer.js';


// --- Global Application State (NOT DOM elements - these are data states) ---
let currentSelectedProperty = null;
let currentSelectedCategoryName = null;
let currentLoggedInUsername = '';
// New state for files module managed by main.js
let currentActiveFolderId = null; // null for 'All Files'
let currentSelectedFileIds = new Set(); // Tracks selected files for batch actions


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

    const propertyCategoriesNav = document.getElementById('property-categories-nav');
    const categoryDetailsHeading = document.getElementById('current-property-title');
    const dynamicCategoryButtonsContainer = document.getElementById('dynamic-category-buttons-container');
    const categoryLoadingMessage = document.getElementById('category-loading-message');
    const backToPropertiesBtn = document.getElementById('back-to-properties-btn');
    const addNewCategoryButton = document.getElementById('add-new-category-button');
    const deleteCategoryButton = document.getElementById('delete-category-button');
    const refreshCategoriesButtonOnCategoriesPage = document.getElementById('refresh-categories-on-page-button');
    const viewFilesButton = document.getElementById('view-files-button');
    const propertyHeader = document.getElementById('property-header');
    const currentPropertyThumbnail = document.getElementById('current-property-thumbnail');
    const addCategoryDetailButtonAtBottom = document.getElementById('add-category-detail-button-bottom');

    const addNewCategoryForm = document.getElementById('add-new-category-form');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const categoryPropertyTitleSpan = document.getElementById('category-property-title');
    const cancelNewCategoryButton = document.getElementById('cancel-new-category');
    const addNewCategoryStatus = document.getElementById('add-new-category-status');

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

    const backFromAddNewCategoryBtn = document.getElementById('back-from-add-new-category-btn');
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

    const backFromAddDetailBtn = document.getElementById('back-from-add-detail-btn');

    // File Management DOM elements
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

    const uploadFolderModalStatus = document.getElementById('upload-folder-modal-status');
    const folderSelectDropdown = document.getElementById('folder-select-dropdown');
    const newFolderNameContainer = document.getElementById('new-folder-name-container');
    const newFolderNameInput = document.getElementById('new-folder-name-input');
    const cancelFolderSelectionBtn = document.getElementById('cancel-folder-selection-btn');
    const confirmFolderSelectionBtn = document.getElementById('confirm-folder-selection-btn');

    // --- PART 2: INITIAL PAGE LOAD & ATTACH EVENT LISTENERS ---

    showPage(loginPage);

    // --- Authentication Listeners ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const success = await login(usernameInput.value, passwordInput.value);
            if (success) {
                currentLoggedInUsername = usernameInput.value;
                const propertiesLoaded = await fetchProperties(
                    null, propertyCardsContainer, propertiesLoadingMessage,
                    propertiesErrorMessage, propertiesErrorText, filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn, filterForeignPropertiesBtn, propertySelectionPage
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
            const success = await register(regUsernameInput.value, regPasswordInput.value);
            if (success) {
                showPage(loginPage);
                usernameInput.value = regUsernameInput.value;
                passwordInput.value = '';
            } else {
                regPasswordInput.value = '';
                showCustomAlert('Registration failed. Please try a different username.');
            }
        });
    }

    // --- Property Filters ---
    if (filterAllPropertiesBtn) {
        filterAllPropertiesBtn.addEventListener('click', () => {
            const { domesticApproved, foreignApproved } = getUserApprovalStatuses();
            if (domesticApproved || foreignApproved) {
                setPropertiesFilter(
                    null, propertyCardsContainer, filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn, filterForeignPropertiesBtn
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
                setPropertiesFilter(
                    false, propertyCardsContainer, filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn, filterForeignPropertiesBtn
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
                setPropertiesFilter(
                    true, propertyCardsContainer, filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn, filterForeignPropertiesBtn
                );
            } else {
                showCustomAlert('You are not approved to view foreign properties. Pre-registered properties are visible to everyone.');
            }
        });
    }

    // --- Refresh Properties ---
    if (refreshPropertiesButton) {
        refreshPropertiesButton.addEventListener('click', async () => {
            try {
                await fetchProperties(
                    null, propertyCardsContainer, propertiesLoadingMessage,
                    propertiesErrorMessage, propertiesErrorText, filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn, filterForeignPropertiesBtn, propertySelectionPage
                );
                showCustomAlert('Properties refreshed successfully');
            } catch (error) {
                showCustomAlert('Failed to refresh properties');
            }
        });
    }

    // --- Add New Property ---
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
            try {
                const propertyData = {
                    title: propertyTitleInput.value.trim(),
                    image: propertyImageInput.value.trim(),
                    description: propertyDescriptionInput.value.trim(),
                    categories: propertyCategoriesInput.value.trim().split(',').map(cat => cat.trim()).filter(cat => cat !== ''),
                    is_foreign: propertyIsForeignInput.checked
                };
                const success = await saveNewProperty(
                    propertyData, propertySelectionPage, propertyCardsContainer,
                    propertiesLoadingMessage, propertiesErrorMessage, propertiesErrorText,
                    filterAllPropertiesBtn, filterDomesticPropertiesBtn, filterForeignPropertiesBtn
                );
                if (success) {
                    // Re-fetching is handled by saveNewProperty's setTimeout now
                }
            } catch (error) {
                showCustomAlert('Failed to add property: ' + error.message);
            }
        });
    }

    // --- Update Property ---
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
                const success = await updateExistingProperty(
                    propertyData, propertySelectionPage, propertyCardsContainer,
                    propertiesLoadingMessage, propertiesErrorMessage, propertiesErrorText,
                    filterAllPropertiesBtn, filterDomesticPropertiesBtn, filterForeignPropertiesBtn
                );
                if (success) {
                    // Re-fetching is handled by updateExistingProperty's setTimeout now
                }
            } catch (error) {
                showCustomAlert('Failed to update property: ' + error.message);
            }
        });
    }

    // --- Property Cards (delegated event listeners) ---
    if (propertyCardsContainer) {
        propertyCardsContainer.addEventListener('click', async (event) => {
            const viewBtn = event.target.closest('[data-action="view-property-details"]');
            const editBtn = event.target.closest('[data-action="edit"]');

            if (viewBtn) {
                try {
                    const propertyId = parseInt(viewBtn.dataset.propertyId);
                    const selectedProperty = getPropertyById(propertyId);

                    if (!selectedProperty) {
                        throw new Error('Property not found');
                    }

                    currentSelectedProperty = selectedProperty;

                    showPage(propertyCategoriesPage);

                    if (currentPropertyTitle) {
                        currentPropertyTitle.textContent = currentSelectedProperty.title;
                    }
                    if (currentPropertyThumbnail) {
                        currentPropertyThumbnail.src = currentSelectedProperty.image || 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
                    }

                    renderPropertyCategories(
                        currentSelectedProperty, null, propertyCategoriesNav,
                        categoryDetailsHeading, currentPropertyThumbnail,
                        deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage
                    );

                    if (currentSelectedProperty.categories && currentSelectedProperty.categories.length > 0) {
                        const firstCategoryName = currentSelectedProperty.categories[0];
                        currentSelectedCategoryName = firstCategoryName;
                        propertyCategoriesPage.dataset.selectedCategoryName = firstCategoryName;

                        const firstCategoryDiv = propertyCategoriesNav.querySelector(`[data-category-name="${firstCategoryName}"]`);
                        if (firstCategoryDiv) {
                            propertyCategoriesNav.querySelectorAll('[data-category-name]').forEach(div => {
                                div.classList.remove('bg-blue-200', 'text-blue-800');
                            });
                            firstCategoryDiv.classList.add('bg-blue-200', 'text-blue-800');
                        }

                        await renderCategoryDetailsUI(
                            currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                            categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                            customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                            currentSelectedProperty // Passed for refresh logic in category-renderer
                        );
                    } else {
                        await renderCategoryDetailsUI(
                            currentSelectedProperty.id, null, dynamicCategoryButtonsContainer,
                            categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                            customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                            currentSelectedProperty // Passed for refresh logic in category-renderer
                        );
                        if (addCategoryDetailButtonAtBottom) addCategoryDetailButtonAtBottom.style.display = 'none';
                    }
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

    // --- Category Actions (on Property Categories Page) ---
    if (propertyCategoriesNav) {
        propertyCategoriesNav.addEventListener('click', async (event) => { // Made async
            const categoryDiv = event.target.closest('[data-category-name]');
            if (categoryDiv) {
                propertyCategoriesNav.querySelectorAll('[data-category-name]').forEach(div => {
                    div.classList.remove('bg-blue-200', 'text-blue-800');
                });
                categoryDiv.classList.add('bg-blue-200', 'text-blue-800');

                currentSelectedCategoryName = categoryDiv.dataset.categoryName;
                propertyCategoriesPage.dataset.selectedCategoryName = currentSelectedCategoryName;

                await renderCategoryDetailsUI(
                    currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty // Passed for refresh logic
                );

                if (addCategoryDetailButtonAtBottom) addCategoryDetailButtonAtBottom.style.display = 'block';
                // propertyFilesContent is a global DOM element, can be accessed directly or passed
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
                newCategoryNameInput.value = ''; // Clear new category name input
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
            const success = await addNewCategoryToProperty(currentSelectedProperty.id, newCategoryName, currentSelectedProperty);
            if (success) {
                showPage(propertyCategoriesPage); // Go back to categories page
                // Re-render categories sidebar and details
                renderPropertyCategories(
                    currentSelectedProperty, null, propertyCategoriesNav,
                    categoryDetailsHeading, currentPropertyThumbnail,
                    deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage
                );
                await renderCategoryDetailsUI(
                    currentSelectedProperty.id, null, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty
                );
            }
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
                        // After deletion, refresh categories in sidebar and clear details
                        renderPropertyCategories(
                            currentSelectedProperty, null, propertyCategoriesNav,
                            categoryDetailsHeading, currentPropertyThumbnail,
                            deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage
                        );
                        await renderCategoryDetailsUI( // Clear details by passing null category
                            currentSelectedProperty.id, null, dynamicCategoryButtonsContainer,
                            categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                            customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                            currentSelectedProperty
                        );
                        currentSelectedCategoryName = null; // Clear global state
                    }
                }
            );
        });
    }

    if (refreshCategoriesButtonOnCategoriesPage) {
        refreshCategoriesButtonOnCategoriesPage.addEventListener('click', async () => {
            if (currentSelectedProperty) {
                renderPropertyCategories(
                    currentSelectedProperty, currentSelectedCategoryName, propertyCategoriesNav,
                    categoryDetailsHeading, currentPropertyThumbnail,
                    deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage
                );
                await renderCategoryDetailsUI(
                    currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty
                );
            } else {
                showCustomAlert('Please select a property first.');
            }
        });
    }

    // --- Add/Update Detail Forms ---
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
            const success = await addCategoryDetail(currentSelectedProperty.id, currentSelectedCategoryName, detailData);
            if (success) {
                showPage(propertyCategoriesPage); // Navigate back
                // Re-render category details
                await renderCategoryDetailsUI(
                    currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty
                );
            }
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
            const success = await updateCategoryDetail(detailData); // Call service
            if (success) {
                showPage(propertyCategoriesPage); // Navigate back
                // Re-render category details
                await renderCategoryDetailsUI(
                    currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty
                );
            }
        });
    }

    // --- Detail Tile Actions (Delegated from ui/category-renderer.js's clicks, but handled here) ---
    if (dynamicCategoryButtonsContainer) {
        dynamicCategoryButtonsContainer.addEventListener('click', async (event) => {
            const editBtn = event.target.closest('[data-action="edit"]');
            const deleteBtn = event.target.closest('[data-action="delete-detail"]');
            const viewBtn = event.target.closest('[data-action="view"]');

            if (editBtn) {
                const detail = editBtn.dataset;
                const propertyId = propertyCategoriesPage.dataset.selectedPropertyId;
                const categoryName = propertyCategoriesPage.dataset.selectedCategoryName;

                updateDetailIdInput.value = detail.id;
                updateDetailNameInput.value = detail.name;
                updateDetailUrlInput.value = detail.url;
                updateDetailDescriptionInput.value = detail.description;
                updateDetailUsernameInput.value = detail.username;
                updateDetailPasswordInput.value = detail.password;
                if (updateDetailCategoryNameSpan) updateDetailCategoryNameSpan.textContent = `"${categoryName}" for Property ID ${propertyId}`;

                renderPresetLogosForForm(updatePresetLogoPicker, updateCustomLogoUrlInput, detail.logo);
                showPage(updateCategoryDetailPage);

            } else if (deleteBtn) {
                const detailId = parseInt(deleteBtn.dataset.id);
                const detailName = deleteBtn.dataset.name;
                const propertyId = propertyCategoriesPage.dataset.selectedPropertyId;
                const categoryName = propertyCategoriesPage.dataset.selectedCategoryName;

                showModal(
                    verificationModal,
                    `detail: "${detailName}"`,
                    `deleting`,
                    async (username, password) => {
                        const success = await deleteCategoryDetail(propertyId, categoryName, detailId, username, password);
                        if (success) {
                            // After deletion, refresh categories in sidebar and details
                            renderPropertyCategories(
                                currentSelectedProperty, currentSelectedCategoryName, propertyCategoriesNav,
                                categoryDetailsHeading, currentPropertyThumbnail,
                                deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage
                            );
                            await renderCategoryDetailsUI(
                                currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                                categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                                customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                                currentSelectedProperty
                            );
                        }
                    }
                );
            } else if (viewBtn) {
                const url = viewBtn.dataset.url;
                if (url) { window.open(url, '_blank'); } else { showCustomAlert('No URL provided.'); }
            }
        });
    }

    // --- File Management ---

    // Helper function to encapsulate fetching and rendering files/folders
    async function refreshFilesView(propertyId, folderId = null) {
        currentActiveFolderId = folderId; // Update global state
        filesListContainer.innerHTML = `<p class="text-gray-600 p-4 text-center">Loading files and folders...</p>`; // Show loading

        const { files, folders } = await fetchFileAndFolderData(propertyId, folderId); // Call the service

        // Render folders list using the UI renderer
        renderFoldersList(folders, foldersList, currentFolderTitle, folderId);

        // Render files list using the UI renderer
        renderFilesList(files, filesListContainer);

        // Update selected files UI after re-render
        currentSelectedFileIds.clear(); // Clear selection on refresh
        updateSelectionUI(currentSelectedFileIds, moveToFolderButton, deleteSelectedFilesButton);
    }

    if (viewFilesButton) {
        viewFilesButton.addEventListener('click', async () => {
            if (currentSelectedProperty) {
                document.getElementById('category-details-content').style.display = 'none';
                propertyFilesContent.style.display = 'flex';
                filesPropertyTitleSpan.textContent = currentSelectedProperty.title;
                filesPropertyThumbnail.src = currentSelectedProperty.image || 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
                if (addCategoryDetailButtonAtBottom) addCategoryDetailButtonAtBottom.style.display = 'none';

                propertyFilesContent.dataset.selectedPropertyId = currentSelectedProperty.id;

                await refreshFilesView(currentSelectedProperty.id, null); // Start with 'All Files'
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
                const { username, password } = getUserApprovalStatuses();
                const success = await createFolderService(propertyId, folderName.trim(), username, password);
                if (success) {
                    await refreshFilesView(propertyId, currentActiveFolderId); // Refresh current view
                }
            } else if (folderName !== null) {
                showCustomAlert('Folder name cannot be empty.');
            }
        });
    }

    if (deleteSelectedFilesButton) {
        deleteSelectedFilesButton.addEventListener('click', () => {
            if (currentSelectedFileIds.size === 0) {
                showCustomAlert('No files selected.');
                return;
            }
            const propertyId = parseInt(propertyFilesContent.dataset.selectedPropertyId);
            const filesToDelete = Array.from(currentSelectedFileIds); // Use the global set

            showModal(
                verificationModal,
                `${filesToDelete.length} selected file(s)`,
                `deleting`,
                async (username, password) => {
                    const success = await deleteFilesService(propertyId, filesToDelete, username, password);
                    if (success) {
                        await refreshFilesView(propertyId, currentActiveFolderId); // Refresh current view
                    }
                }
            );
        });
    }

    if (moveToFolderButton) {
        moveToFolderButton.addEventListener('click', async () => {
            if (currentSelectedFileIds.size === 0) {
                showCustomAlert('No files selected.');
                return;
            }
            const propertyId = parseInt(propertyFilesContent.dataset.selectedPropertyId);

            // Prepare for upload/move modal
            const processInitiated = await initFileUploadProcessService(propertyId, null, Array.from(currentSelectedFileIds));
            if (processInitiated) {
                // Now, show the modal. The modal's confirmation handler will call moveFilesService.
                await showUploadFolderSelectionModal(propertyId, null, null, null, Array.from(currentSelectedFileIds));
            } else {
                showCustomAlert('Failed to initiate move process.');
            }
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
            const file = fileUploadInput.files[0];
            const processInitiated = await initFileUploadProcessService(propertyId, file);
            if (processInitiated) {
                // Now, show the modal and pass the file details it needs for upload
                await showUploadFolderSelectionModal(propertyId, file, null, null); // base64/mime will be read in modal
            } else {
                showCustomAlert('File preparation failed.');
            }
        });
    }

    // Handler for showUploadFolderSelectionModal's confirmation
    // This function encapsulates the UI logic for the modal and calls the service.
    async function showUploadFolderSelectionModal(propertyId, file = null, initialBase64data = null, initialMimeType = null, filesToMove = null) {
        let fileToUploadTemp = file;
        let base64DataToUploadTemp = initialBase64data;
        let mimeTypeToUploadTemp = initialMimeType;
        let filesToMoveTemp = filesToMove;

        // If it's a new file upload and base64 not yet read, read it first
        if (fileToUploadTemp && !base64DataToUploadTemp) {
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
                base64DataToUploadTemp = reader.result.split(',')[1];
                mimeTypeToUploadTemp = reader.result.split(',')[0].split(':')[1].split(';')[0];
                // Once data is read, show the modal (recursive call to self, but now with data)
                await showModalLogic();
            };
            fileUploadStatus.classList.remove('hidden');
            fileUploadStatus.className = 'mt-3 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
            fileUploadStatus.innerHTML = 'Preparing file for upload... <progress value="0" max="100"></progress>';
            const progress = fileUploadStatus.querySelector('progress');
            if (progress) progress.max = file.size;
            reader.readAsDataURL(file);
            return; // Exit, as modal will be shown after reading
        } else {
            // If data is already prepared (for file move or already read base64), show modal directly
            await showModalLogic();
        }

        async function showModalLogic() {
            uploadFolderModalStatus.classList.add('hidden');
            uploadFolderModalStatus.textContent = '';
            newFolderNameContainer.classList.add('hidden');
            newFolderNameInput.value = '';
            folderSelectDropdown.innerHTML = '<option value="none">-- No Folder (All Files) --</option><option value="new">+ Create New Folder</option>';
            folderSelectDropdown.value = 'none';

            try {
                const { username, password } = getUserApprovalStatuses();
                const foldersData = (await fetchFileAndFolderData(propertyId, null)).folders; // Fetch folders for dropdown
                foldersData.forEach(f => {
                    const option = document.createElement('option');
                    option.value = f.id;
                    option.textContent = f.name;
                    folderSelectDropdown.insertBefore(option, folderSelectDropdown.lastElementChild);
                });
                uploadFolderModalStatus.classList.add('hidden');
            } catch (error) {
                console.error('Error populating folder dropdown:', error);
                uploadFolderModalStatus.classList.remove('hidden');
                uploadFolderModalStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                uploadFolderModalStatus.textContent = `Error loading folders: ${error.message}`;
            }

            showModal(uploadFolderModal, '', 'selection', async (username, password) => {
                const selectedFolderId = folderSelectDropdown.value;
                let finalFolderId = null;
                let finalFolderName = null;

                if (selectedFolderId === 'new') {
                    const newName = newFolderNameInput.value.trim();
                    if (!newName) {
                        showCustomAlert('Please enter a name for the new folder.');
                        return;
                    }
                    finalFolderName = newName;
                    finalFolderId = newName.toLowerCase().replace(/\s+/g, '-');
                    const folderCreated = await createFolderService(propertyId, finalFolderName, username, password);
                    if (!folderCreated) {
                        showCustomAlert('Failed to create new folder.');
                        hideModal(uploadFolderModal);
                        return;
                    }
                } else if (selectedFolderId !== 'none') {
                    const selectedFolder = foldersData.find(f => f.id === selectedFolderId);
                    finalFolderId = selectedFolderId;
                    finalFolderName = selectedFolder ? selectedFolder.name : selectedFolderId;
                }

                if (fileToUploadTemp && base64DataToUploadTemp && mimeTypeToUploadTemp) {
                    const success = await uploadFileService(propertyId, fileToUploadTemp.name, base64DataToUploadTemp, mimeTypeToUploadTemp, finalFolderId, finalFolderName, username, password);
                    if (success) {
                        showCustomAlert('File uploaded successfully!');
                    } else {
                        showCustomAlert('File upload failed.');
                    }
                } else if (filesToMoveTemp && filesToMoveTemp.length > 0) {
                    const success = await moveFilesService(propertyId, filesToMoveTemp, finalFolderId, finalFolderName, username, password);
                    if (success) {
                        showCustomAlert('Files moved successfully!');
                    } else {
                        showCustomAlert('Failed to move files.');
                    }
                }

                hideModal(uploadFolderModal);
                if (fileUploadInput) fileUploadInput.value = '';
                if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
                await refreshFilesView(propertyId, currentActiveFolderId); // Refresh view after operation
            });
            uploadFolderModal.classList.remove('hidden');
        }
    }


    // --- General File/Folder Event Listeners (Delegated from main.js) ---
    // These listeners are directly on the containers managed by ui/file-renderer.js
    // They are also placed here in main.js as the orchestrator.
    if (filesListContainer) {
        filesListContainer.addEventListener('click', async (event) => {
            const checkbox = event.target.closest('.file-checkbox');
            const fileItem = event.target.closest('.file-item');
            const deleteBtn = event.target.closest('.delete-file-btn');
            const editBtn = event.target.closest('.edit-file-btn');
            const viewLink = event.target.closest('a[target="_blank"]');

            if (checkbox) {
                const fileId = parseInt(checkbox.dataset.fileId);
                toggleFileSelection(fileId, moveToFolderButton, deleteSelectedFilesButton); // This function is from ui/file-renderer.js
                // selection state is managed internally by file-renderer.js's toggleFileSelection
                // No need to manually add/delete from currentSelectedFileIds here, as toggleFileSelection handles the global state now
            } else if (fileItem && !deleteBtn && !editBtn && !viewLink) {
                const fileId = parseInt(fileItem.dataset.fileId);
                toggleFileSelection(fileId, moveToFolderButton, deleteSelectedFilesButton);
            } else if (deleteBtn) {
                const fileId = parseInt(deleteBtn.dataset.fileId);
                const fileName = deleteBtn.dataset.fileName;
                const propertyId = parseInt(propertyFilesContent.dataset.selectedPropertyId);

                showModal(
                    verificationModal,
                    `file: "${fileName}"`,
                    `deleting`,
                    async (username, password) => {
                        const success = await deleteFilesService(propertyId, [fileId], username, password);
                        if (success) {
                            await refreshFilesView(propertyId, currentActiveFolderId);
                        }
                    }
                );
            } else if (editBtn) {
                const fileId = parseInt(editBtn.dataset.fileId);
                const fileName = editBtn.dataset.fileName;
                showCustomAlert(`Edit functionality for file "${fileName}" (ID: ${fileId}) is not yet fully implemented. Implement a modal to edit file details here.`);
            }
        });
    }

    if (foldersList) {
        foldersList.addEventListener('click', async (event) => {
            const folderItem = event.target.closest('.folder-item');
            if (folderItem) {
                const folderId = folderItem.dataset.folderId === 'root' ? null : folderItem.dataset.folderId;
                const propertyId = parseInt(propertyFilesContent.dataset.selectedPropertyId);

                // renderFoldersList now handles setting the active class internally.
                // We just need to call refreshFilesView with the new folderId.
                await refreshFilesView(propertyId, folderId);
            }
        });
    }

    // --- Folder Modal Handlers (These were already in main.js previously) ---
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
            // Clear temporary data for move/upload logic
            currentSelectedFileIds.clear(); // Clear selection when canceling move
            updateSelectionUI(currentSelectedFileIds, moveToFolderButton, deleteSelectedFilesButton); // Update buttons
            if (fileUploadStatus) fileUploadStatus.classList.add('hidden'); // Hide upload status
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
