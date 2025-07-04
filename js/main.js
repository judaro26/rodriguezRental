// js/main.js

// --- Import Modules ---
import { showPage, showCustomAlert, showModal, hideModal } from './utils/dom.js';
import { login, register, getUserApprovalStatuses } from './services/auth.js';
import { fetchProperties, getPropertyById, saveNewProperty, updateExistingProperty, setPropertiesFilter } from './services/properties.js';
import { addCategoryDetail, updateCategoryDetail, deleteCategoryDetail, getCategoryDetails, addNewCategoryToProperty } from './services/categories.js';
import {
    displayPropertyFiles as fetchFileAndFolderData,
    createFolder as createFolderService,
    uploadFileService,
    moveFiles as moveFilesService,
    deleteFiles as deleteFilesService,
    initFileUploadProcess as initFileUploadProcessService
} from './services/files.js';
import { renderPropertyCards, updateFilterButtonsHighlight } from './ui/property-renderer.js';
import { renderPropertyCategories, displayCategoryDetails as renderCategoryDetailsUI, renderPresetLogosForForm } from './ui/category-renderer.js';
import { renderFilesList, toggleFileSelection, updateSelectionUI, renderFoldersList } from './ui/file-renderer.js';

// --- Global Application State (NOT DOM elements - these are data states) ---
let currentSelectedProperty = null;
let currentSelectedCategoryName = null;
let currentLoggedInUsername = '';
let currentSelectedFileIds = new Set(); // Track selected file IDs for operations
// Global state for files module managed by main.js
let currentActiveFolderId = null; // null for 'All Files', stores folder ID for current view

// --- Application Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded fired. Starting DOM element retrieval and event listener setup.');

    // --- PART 1: GET ALL DOM ELEMENT REFERENCES (Keep these as they are) ---
    const loginPage = document.getElementById('login-page');
    // ... (all your other document.getElementById calls) ...
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
    const registrationStatusMessage = document.getElementById('registration-status-message');
    const registerErrorMessage = document.getElementById('register-error-message');
    const registerErrorText = document.getElementById('register-error-text');

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
    const backToPropertiesBtn = document.getElementById('back-to-properties-btn');
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
    const backFromAddNewCategoryBtn = document.getElementById('back-from-add-new-category-btn');
    // NOTE: Re-declarations below will cause errors if the variables above are 'const'.
    // Ensure these are unique or passed into functions that use them.
    // However, if your 'category-renderer.js' still references them globally with `document.getElementById`,
    // it's fine for them to be `const` if they are defined once at the top-level of their respective modules.
    // For now, let's assume the ones declared at the top of category-renderer.js are distinct from these if used within the module.
    // If you intend for these to be shared across modules, consider making them global in a more controlled way,
    // or passing them as arguments.
    // For this main.js, these re-declarations are problematic.
    // Removing the re-declarations here and assuming the imports work,
    // or making these `let` if they are meant to be reassigned.
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
    const backFromAddDetailBtn = document.getElementById('back-from-add-detail-btn');
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
    const backFromFilesButton = document.getElementById('back-from-files-button'); // This is the element not found warning
    const createFolderButton = document.getElementById('create-folder-button');
    const moveToFolderButton = document.getElementById('move-to-folder-button');
    const deleteSelectedFilesButton = document.getElementById('delete-selected-files-button');
    const foldersList = document.getElementById('folders-list');
    const currentFolderTitle = document.getElementById('current-folder-title');

    // Upload Folder Modal Elements
    const uploadFolderModalStatus = document.getElementById('upload-folder-modal-status');
    let folderSelectDropdown = document.getElementById('folder-select-dropdown'); // Keep as let as it's reassigned
    const newFolderNameContainer = document.getElementById('new-folder-name-container');
    const newFolderNameInput = document.getElementById('new-folder-name-input');
    const cancelFolderSelectionBtn = document.getElementById('cancel-folder-selection-btn');
    let confirmFolderSelectionBtn = document.getElementById('confirm-folder-selection-btn'); // Keep as let as it's reassigned

    console.log('--- DOM Element Retrieval End ---');
    console.log('All event listeners attached.'); // This log should now accurately reflect that all initial listeners are set up.

    // --- PART 2: INITIAL PAGE LOAD & ATTACH EVENT LISTENERS ---

    // Initial page load
    showPage(loginPage);

    // Login Form Listener
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const success = await login(usernameInput.value, passwordInput.value);
            if (success) {
                currentLoggedInUsername = usernameInput.value;

                const propertiesLoaded = await fetchProperties(
                    null,
                    propertyCardsContainer,
                    propertiesLoadingMessage,
                    propertiesErrorMessage,
                    propertiesErrorText,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn,
                    propertySelectionPage
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

    // Register Form Listeners
    if (showRegisterFormBtn) {
        showRegisterFormBtn.addEventListener('click', () => {
            console.log('showRegisterFormBtn clicked. Navigating to register page.');
            showPage(registerPage);
            if (registerForm) registerForm.reset();
            if (regUsernameInput) regUsernameInput.value = '';
            if (regPasswordInput) regPasswordInput.value = '';
            if (registrationStatusMessage) registrationStatusMessage.classList.add('hidden');
            if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
            if (registerErrorText) registerErrorText.textContent = '';
        });
    } else {
        console.warn("showRegisterFormBtn element not found.");
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Register form submitted. Preventing default behavior.');

            try {
                const username = regUsernameInput.value.trim();
                const password = regPasswordInput.value.trim();

                if (!username || !password) {
                    showCustomAlert('Please enter both username and password.');
                    return;
                }

                if (registrationStatusMessage) registrationStatusMessage.classList.add('hidden');
                if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
                if (registerErrorText) registerErrorText.textContent = '';

                console.log('Calling register service for user:', username);
                const success = await register(username, password);
                console.log('Register service returned:', success);

                if (success) {
                    showCustomAlert('Registration successful! Please login with your new credentials.');
                    showPage(loginPage);
                    if (registerForm) registerForm.reset();
                    if (regUsernameInput) regUsernameInput.value = '';
                    if (regPasswordInput) regPasswordInput.value = '';
                } else {
                    console.log('Registration failed. Auth service should have displayed an alert.');
                }
            } catch (error) {
                console.error('Registration error caught in main.js:', error);
                showCustomAlert('Registration failed due to an unexpected error. Please try again.');
            }
        });
    } else {
        console.error("Error: registerForm element not found!");
    }

    // Property Filters
    if (filterAllPropertiesBtn) {
        filterAllPropertiesBtn.addEventListener('click', () => {
            console.log('Filter All Properties button clicked.');
            const { domesticApproved, foreignApproved } = getUserApprovalStatuses();
            if (domesticApproved || foreignApproved) {
                setPropertiesFilter(
                    null,
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
            console.log('Filter Domestic Properties button clicked.');
            const { domesticApproved } = getUserApprovalStatuses();
            if (domesticApproved) {
                setPropertiesFilter(
                    false,
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
            console.log('Filter Foreign Properties button clicked.');
            const { foreignApproved } = getUserApprovalStatuses();
            if (foreignApproved) {
                setPropertiesFilter(
                    true,
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
            console.log('Refresh Properties button clicked.');
            try {
                await fetchProperties(
                    null,
                    propertyCardsContainer,
                    propertiesLoadingMessage,
                    propertiesErrorMessage,
                    propertiesErrorText,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn,
                    propertySelectionPage
                );
                showCustomAlert('Properties refreshed successfully!');
            } catch (error) {
                console.error('Error refreshing properties:', error);
                showCustomAlert('Failed to refresh properties.');
            }
        });
    }

    // Add Property Form
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Add Property form submitted. Preventing default behavior.');
            try {
                const propertyData = {
                    title: propertyTitleInput.value.trim(),
                    image: propertyImageInput.value.trim(),
                    description: propertyDescriptionInput.value.trim(),
                    categories: propertyCategoriesInput.value.trim().split(',').map(cat => cat.trim()).filter(cat => cat !== ''),
                    is_foreign: propertyIsForeignInput.checked
                };

                if (!propertyData.title) {
                    showCustomAlert('Property title is required.');
                    return;
                }

                const success = await saveNewProperty(
                    propertyData,
                    propertySelectionPage,
                    propertyCardsContainer,
                    propertiesLoadingMessage,
                    propertiesErrorMessage,
                    propertiesErrorText,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn
                );
                if (success) {
                    console.log('New property saved successfully.');
                    if (addPropertyForm) addPropertyForm.reset();
                } else {
                    console.log('New property saving failed (handled by service).');
                }
            } catch (error) {
                console.error('Error adding new property:', error);
                showCustomAlert('Failed to add property: ' + error.message);
            }
        });
    } else {
        console.warn("addPropertyForm element not found.");
    }

    // Update Property Form
    if (updatePropertyForm) {
        updatePropertyForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Update Property form submitted. Preventing default behavior.');
            try {
                const propertyData = {
                    id: parseInt(updatePropertyIdInput.value),
                    title: updatePropertyTitleInput.value.trim(),
                    image: updatePropertyImageInput.value.trim(),
                    description: updatePropertyDescriptionInput.value.trim(),
                    categories: updatePropertyCategoriesInput.value.trim().split(',').map(cat => cat.trim()).filter(cat => cat !== ''),
                    is_foreign: updatePropertyIsForeignInput.checked
                };

                if (!propertyData.id || isNaN(propertyData.id)) {
                    showCustomAlert('Property ID is missing or invalid.');
                    return;
                }
                if (!propertyData.title) {
                    showCustomAlert('Property title is required.');
                    return;
                }

                const success = await updateExistingProperty(
                    propertyData,
                    propertySelectionPage,
                    propertyCardsContainer,
                    propertiesLoadingMessage,
                    propertiesErrorMessage,
                    propertiesErrorText,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn
                );
                if (success) {
                    console.log('Property updated successfully.');
                } else {
                    console.log('Property update failed (handled by service).');
                }
            } catch (error) {
                console.error('Error updating property:', error);
                showCustomAlert('Failed to update property: ' + error.message);
            }
        });
    } else {
        console.warn("updatePropertyForm element not found.");
    }

    // Property Cards (delegated event listeners for view/edit)
    if (propertyCardsContainer) {
        propertyCardsContainer.addEventListener('click', async (event) => {
            const viewBtn = event.target.closest('[data-action="view-property-details"]');
            const editBtn = event.target.closest('[data-action="edit"]');

            if (viewBtn) {
                console.log('View Property Details button clicked.');
                try {
                    const propertyId = parseInt(viewBtn.dataset.propertyId);
                    const selectedProperty = getPropertyById(propertyId);

                    if (!selectedProperty) {
                        throw new Error(`Property with ID ${propertyId} not found in local cache.`);
                    }

                    currentSelectedProperty = selectedProperty;

                    showPage(propertyCategoriesPage);

                    if (currentPropertyTitle) {
                        currentPropertyTitle.textContent = currentSelectedProperty.title;
                    }
                    if (currentPropertyThumbnail) {
                        currentPropertyThumbnail.src = currentSelectedProperty.image || 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
                        currentPropertyThumbnail.alt = `${currentSelectedProperty.title} thumbnail`;
                    }

                    if (propertyCategoriesPage) {
                        propertyCategoriesPage.dataset.selectedPropertyId = currentSelectedProperty.id;
                    }

                    renderPropertyCategories(
                        currentSelectedProperty,
                        null,
                        propertyCategoriesNav,
                        categoryDetailsHeading,
                        currentPropertyThumbnail,
                        deleteCategoryButton,
                        addNewCategoryButton,
                        refreshCategoriesButtonOnCategoriesPage
                    );

                    if (currentSelectedProperty.categories && currentSelectedProperty.categories.length > 0) {
                        const firstCategoryName = currentSelectedProperty.categories[0];
                        currentSelectedCategoryName = firstCategoryName;
                        if (propertyCategoriesPage) {
                            propertyCategoriesPage.dataset.selectedCategoryName = firstCategoryName;
                        }

                        const firstCategoryDiv = propertyCategoriesNav.querySelector(`[data-category-name="${firstCategoryName}"]`);
                        if (firstCategoryDiv) {
                            propertyCategoriesNav.querySelectorAll('[data-category-name]').forEach(div => {
                                div.classList.remove('bg-blue-200', 'text-blue-800');
                            });
                            firstCategoryDiv.classList.add('bg-blue-200', 'text-blue-800');
                        }

                        await renderCategoryDetailsUI(
                            currentSelectedProperty.id,
                            currentSelectedCategoryName,
                            dynamicCategoryButtonsContainer,
                            categoryLoadingMessage,
                            addCategoryDetailButtonAtBottom,
                            presetLogoPicker,
                            customLogoUrlInput,
                            updatePresetLogoPicker,
                            updateCustomLogoUrlInput,
                            currentSelectedProperty
                        );
                    } else {
                        console.log('No categories found for this property. Displaying empty category details.');
                        await renderCategoryDetailsUI(
                            currentSelectedProperty.id,
                            null,
                            dynamicCategoryButtonsContainer,
                            categoryLoadingMessage,
                            addCategoryDetailButtonAtBottom,
                            presetLogoPicker,
                            customLogoUrlInput,
                            updatePresetLogoPicker,
                            updateCustomLogoUrlInput,
                            currentSelectedProperty
                        );
                        if (addCategoryDetailButtonAtBottom) addCategoryDetailButtonAtBottom.style.display = 'none';
                    }
                } catch (error) {
                    console.error('Error viewing property details:', error);
                    showCustomAlert('Failed to load property details. Please try again.');
                }
            } else if (editBtn) {
                console.log('Edit Property button clicked.');
                const propertyId = parseInt(editBtn.dataset.propertyId);
                const propertyToEdit = getPropertyById(propertyId);
                if (propertyToEdit) {
                    showPage(updatePropertyPage);
                    if (updatePropertyIdInput) updatePropertyIdInput.value = propertyToEdit.id;
                    if (updatePropertyTitleInput) updatePropertyTitleInput.value = propertyToEdit.title;
                    if (updatePropertyImageInput) updatePropertyImageInput.value = propertyToEdit.image;
                    if (updatePropertyDescriptionInput) updatePropertyDescriptionInput.value = propertyToEdit.description;
                    if (updatePropertyCategoriesInput) updatePropertyCategoriesInput.value = propertyToEdit.categories.join(', ');
                    if (updatePropertyIsForeignInput) updatePropertyIsForeignInput.checked = propertyToEdit.is_foreign;
                } else {
                    showCustomAlert('Property not found for editing.');
                }
            }
        });
    } else {
        console.warn("propertyCardsContainer element not found.");
    }

    // Category Actions (on Property Categories Page) - Delegation for category clicks
    if (propertyCategoriesNav) {
        propertyCategoriesNav.addEventListener('click', async (event) => {
            const categoryDiv = event.target.closest('[data-category-name]');
            if (categoryDiv) {
                console.log(`Category "${categoryDiv.dataset.categoryName}" clicked.`);
                propertyCategoriesNav.querySelectorAll('[data-category-name]').forEach(div => {
                    div.classList.remove('bg-blue-200', 'text-blue-800');
                });
                categoryDiv.classList.add('bg-blue-200', 'text-blue-800');

                currentSelectedCategoryName = categoryDiv.dataset.categoryName;
                if (propertyCategoriesPage) {
                    propertyCategoriesPage.dataset.selectedCategoryName = currentSelectedCategoryName;
                }

                await renderCategoryDetailsUI(
                    currentSelectedProperty.id,
                    currentSelectedCategoryName,
                    dynamicCategoryButtonsContainer,
                    categoryLoadingMessage,
                    addCategoryDetailButtonAtBottom,
                    presetLogoPicker,
                    customLogoUrlInput,
                    updatePresetLogoPicker,
                    updateCustomLogoUrlInput,
                    currentSelectedProperty
                );

                if (addCategoryDetailButtonAtBottom) addCategoryDetailButtonAtBottom.style.display = 'block';
                if (propertyFilesContent) propertyFilesContent.style.display = 'none';
                document.getElementById('category-details-content').style.display = 'flex';
            }
        });
    } else {
        console.warn("propertyCategoriesNav element not found.");
    }

    // Add New Category Button
    if (addNewCategoryButton) {
        addNewCategoryButton.addEventListener('click', () => {
            console.log('Add New Category button clicked.');
            if (currentSelectedProperty) {
                if (categoryPropertyTitleSpan) categoryPropertyTitleSpan.textContent = `"${currentSelectedProperty.title}"`;
                showPage(addNewCategoryPage);
                if (addNewCategoryForm) addNewCategoryForm.reset();
                if (newCategoryNameInput) newCategoryNameInput.value = '';
            } else {
                showCustomAlert('Please select a property first to add a new category.');
            }
        });
    } else {
        console.warn("addNewCategoryButton element not found.");
    }

    // Add New Category Form Submission
    if (addNewCategoryForm) {
        addNewCategoryForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Add New Category form submitted. Preventing default behavior.');
            const newCategoryName = newCategoryNameInput.value.trim();
            if (!newCategoryName) {
                showCustomAlert('Please enter a category name.');
                return;
            }
            if (!currentSelectedProperty) {
                showCustomAlert('Error: No property selected for adding category.');
                return;
            }

            const success = await addNewCategoryToProperty(currentSelectedProperty.id, newCategoryName, currentSelectedProperty);
            if (success) {
                showCustomAlert(`Category "${newCategoryName}" added successfully!`);
                showPage(propertyCategoriesPage);
                renderPropertyCategories(
                    currentSelectedProperty, null, propertyCategoriesNav,
                    categoryDetailsHeading, currentPropertyThumbnail,
                    deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage
                );
                await renderCategoryDetailsUI(
                    currentSelectedProperty.id, newCategoryName, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty
                );
                currentSelectedCategoryName = newCategoryName;
                if (propertyCategoriesPage) propertyCategoriesPage.dataset.selectedCategoryName = newCategoryName;
            } else {
                console.log('Add new category failed (handled by service).');
            }
        });
    } else {
        console.warn("addNewCategoryForm element not found.");
    }

    // Delete Category Button
    if (deleteCategoryButton) {
        deleteCategoryButton.addEventListener('click', () => {
            console.log('Delete Category button clicked.');
            if (!currentSelectedProperty || !currentSelectedCategoryName) {
                showCustomAlert('Please select a category to delete.');
                return;
            }
            showModal(
                verificationModal,
                `category: "${currentSelectedCategoryName}"`,
                `deleting`,
                async (username, password) => {
                    const success = await deleteCategoryDetail(currentSelectedProperty.id, currentSelectedCategoryName, null, username, password);
                    if (success) {
                        showCustomAlert(`Category "${currentSelectedCategoryName}" deleted successfully!`);
                        currentSelectedCategoryName = null;

                        await fetchProperties(
                            null,
                            propertyCardsContainer,
                            propertiesLoadingMessage,
                            propertiesErrorMessage,
                            propertiesErrorText,
                            filterAllPropertiesBtn,
                            filterDomesticPropertiesBtn,
                            filterForeignPropertiesBtn,
                            propertySelectionPage
                        );
                        currentSelectedProperty = getPropertyById(currentSelectedProperty.id);

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
                    return success;
                }
            );
        });
    } else {
        console.warn("deleteCategoryButton element not found.");
    }

    // Refresh Categories Button
    if (refreshCategoriesButtonOnCategoriesPage) {
        refreshCategoriesButtonOnCategoriesPage.addEventListener('click', async () => {
            console.log('Refresh Categories button clicked.');
            if (currentSelectedProperty) {
                await fetchProperties(
                    null,
                    propertyCardsContainer,
                    propertiesLoadingMessage,
                    propertiesErrorMessage,
                    propertiesErrorText,
                    filterAllPropertiesBtn,
                    filterDomesticPropertiesBtn,
                    filterForeignPropertiesBtn,
                    propertySelectionPage
                );
                currentSelectedProperty = getPropertyById(currentSelectedProperty.id);

                renderPropertyCategories(currentSelectedProperty, currentSelectedCategoryName, propertyCategoriesNav, categoryDetailsHeading, currentPropertyThumbnail, deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage);
                await renderCategoryDetailsUI(currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer, categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker, customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput, currentSelectedProperty);
                showCustomAlert('Categories refreshed!');
            } else {
                showCustomAlert('Please select a property first.');
            }
        });
    } else {
        console.warn("refreshCategoriesButtonOnCategoriesPage element not found.");
    }

    // Add Detail Button
    if (addCategoryDetailButtonAtBottom) {
        addCategoryDetailButtonAtBottom.addEventListener('click', () => {
            console.log('Add Category Detail button clicked.');
            if (currentSelectedProperty && currentSelectedCategoryName) {
                if (addDetailCategoryNameSpan) addDetailCategoryNameSpan.textContent = `"${currentSelectedCategoryName}" for ${currentSelectedProperty.title}`;
                showPage(addCategoryDetailPage);
                if (addDetailForm) addDetailForm.reset();
                if (detailUsernameAddInput) detailUsernameAddInput.value = '';
                if (detailPasswordAddInput) detailPasswordAddInput.value = '';
                if (presetLogoPicker && customLogoUrlInput) {
                    renderPresetLogosForForm(presetLogoPicker, customLogoUrlInput, '');
                }
            } else {
                showCustomAlert('Please select a property category first to add details to it.');
            }
        });
    } else {
        console.warn("addCategoryDetailButtonAtBottom element not found.");
    }

    // Add Detail Form Submission
    if (addDetailForm) {
        addDetailForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Add Detail form submitted. Preventing default behavior.');
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

            if (!detailData.detail_name) {
                showCustomAlert('Detail name is required.');
                return;
            }

            if (!currentSelectedProperty || !currentSelectedCategoryName) {
                showCustomAlert('Error: Property or category not selected.');
                return;
            }

            const success = await addCategoryDetail(currentSelectedProperty.id, currentSelectedCategoryName, detailData);
            if (success) {
                showCustomAlert('Category detail added successfully!');
                showPage(propertyCategoriesPage);
                await renderCategoryDetailsUI(
                    currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty
                );
            } else {
                console.log('Add category detail failed (handled by service).');
            }
        });
    } else {
        console.warn("addDetailForm element not found.");
    }

    // Update Detail Form Submission
    if (updateDetailForm) {
        updateDetailForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Update Detail form submitted. Preventing default behavior.');
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

            if (!detailData.id || isNaN(detailData.id)) {
                showCustomAlert('Detail ID is missing or invalid.');
                return;
            }
            if (!detailData.detail_name) {
                showCustomAlert('Detail name is required.');
                return;
            }
            if (!currentSelectedProperty || !currentSelectedCategoryName) {
                showCustomAlert('Error: Property or category not selected for update.');
                return;
            }

            const success = await updateCategoryDetail(detailData, currentSelectedProperty.id, currentSelectedCategoryName);
            if (success) {
                showCustomAlert('Category detail updated successfully!');
                showPage(propertyCategoriesPage);
                await renderCategoryDetailsUI(
                    currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty
                );
            } else {
                console.log('Update category detail failed (handled by service).');
            }
        });
    } else {
        console.warn("updateDetailForm element not found.");
    }

    // --- CONSOLIDATED Detail Tile Actions (Delegated from dynamicCategoryButtonsContainer) ---
    // This combines the logic for edit, delete, view, copy, and password toggle
    if (dynamicCategoryButtonsContainer) {
        dynamicCategoryButtonsContainer.addEventListener('click', async (event) => {
            const editBtn = event.target.closest('[data-action="edit"]');
            const deleteBtn = event.target.closest('[data-action="delete-detail"]');
            const viewBtn = event.target.closest('[data-action="view"]');
            const copyBtn = event.target.closest('.copy-btn');
            const toggleBtn = event.target.closest('.password-toggle-btn');


            if (editBtn) {
                console.log('Edit Detail button clicked.');
                const detailData = editBtn.dataset;
                if (updateDetailIdInput) updateDetailIdInput.value = detailData.id;
                if (updateDetailNameInput) updateDetailNameInput.value = detailData.name;
                if (updateDetailUrlInput) updateDetailUrlInput.value = detailData.url;
                if (updateDetailDescriptionInput) updateDetailDescriptionInput.value = detailData.description;
                if (updateDetailUsernameInput) updateDetailUsernameInput.value = detailData.username;
                if (updateDetailPasswordInput) updateDetailPasswordInput.value = detailData.password;
                if (updateDetailCategoryNameSpan) updateDetailCategoryNameSpan.textContent = `"${currentSelectedCategoryName}" for ${currentSelectedProperty.title}`;

                if (updatePresetLogoPicker && updateCustomLogoUrlInput) {
                    renderPresetLogosForForm(updatePresetLogoPicker, updateCustomLogoUrlInput, detailData.logo);
                }
                showPage(updateCategoryDetailPage);

            } else if (deleteBtn) {
                console.log('Delete Detail button clicked.'); // This should now appear only once
                const detailId = parseInt(deleteBtn.dataset.id);
                const detailName = deleteBtn.dataset.name;
                if (isNaN(detailId) || !currentSelectedProperty || !currentSelectedCategoryName) {
                    showCustomAlert('Error: Cannot delete detail. Information missing.');
                    return;
                }

                showModal(
                    verificationModal,
                    `detail: "${detailName}"`,
                    `deleting`,
                    async (username, password) => {
                        const success = await deleteCategoryDetail(currentSelectedProperty.id, currentSelectedCategoryName, detailId, username, password);
                        if (success) {
                            showCustomAlert(`Detail "${detailName}" deleted successfully!`);
                            await renderCategoryDetailsUI(
                                currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                                categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                                customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                                currentSelectedProperty
                            );
                        }
                        return success;
                    }
                );
            } else if (viewBtn) {
                console.log('View Detail URL button clicked.');
                const url = viewBtn.dataset.url;
                if (url) { window.open(url, '_blank'); } else { showCustomAlert('No URL provided for this detail.'); }
            } else if (copyBtn) {
                console.log('Copy button clicked.');
                const targetInput = document.getElementById(copyBtn.dataset.target);
                if (targetInput) {
                    try {
                        navigator.clipboard.writeText(targetInput.value);
                        showCustomAlert('Copied to clipboard!');
                    } catch (err) {
                        console.error('Failed to copy: ', err);
                        showCustomAlert('Failed to copy to clipboard. Please copy manually.');
                    }
                }
            } else if (toggleBtn) {
                console.log('Password toggle button clicked.');
                const targetInput = document.getElementById(toggleBtn.dataset.target);
                if (targetInput) {
                    targetInput.type = targetInput.type === 'password' ? 'text' : 'password';
                    toggleBtn.textContent = targetInput.type === 'password' ? '👁️' : '🙈';
                }
            }
        });
    } else {
        console.warn("dynamicCategoryButtonsContainer element not found.");
    }

    // File Management Helper function to encapsulate fetching and rendering files/folders
    async function refreshFilesView(propertyId, folderId = null) {
        console.log('--- Entering refreshFilesView ---');
        console.log(`refreshFilesView: propertyId = ${propertyId}, folderId = ${folderId}`);

        if (!propertyId) {
            console.error('refreshFilesView: No propertyId provided.');
            if (filesListContainer) {
                filesListContainer.innerHTML = `<p class="text-red-600 p-4 text-center">Error: Property not selected for file view.</p>`;
            }
            return;
        }

        try {
            currentActiveFolderId = folderId;
            if (filesListContainer) {
                filesListContainer.innerHTML = `<p class="text-gray-600 p-4 text-center">Loading files and folders...</p>`;
            }
            console.log('filesListContainer cleared and loading message set.');

            currentSelectedFileIds.clear();
            updateSelectionUI(currentSelectedFileIds, moveToFolderButton, deleteSelectedFilesButton);
            console.log('currentSelectedFileIds cleared and selection UI updated.');

            console.log('Calling fetchFileAndFolderData...');
            const { files, folders } = await fetchFileAndFolderData(propertyId, folderId);
            console.log('fetchFileAndFolderData returned:');
            console.log('  Files:', files);
            console.log('  Folders:', folders);

            const safeFiles = Array.isArray(files) ? files : [];
            const safeFolders = Array.isArray(folders) ? folders : [];
            console.log(`After safety check: ${safeFiles.length} files, ${safeFolders.length} folders.`);

            console.log('Calling renderFoldersList...');
            renderFoldersList(safeFolders, foldersList, currentFolderTitle, folderId);
            console.log('Calling renderFilesList...');
            renderFilesList(safeFiles, filesListContainer);

            const effectiveFoldersCount = safeFolders.filter(f => f.id !== 'root').length;
            if (safeFiles.length === 0 && effectiveFoldersCount === 0) {
                if (filesListContainer) {
                    filesListContainer.innerHTML = `<p class="text-gray-600 p-4 text-center">No files or subfolders found in this location.</p>`;
                }
                console.log('No files or subfolders message displayed.');
            } else {
                console.log('Content rendered: Files or folders found.');
            }
            console.log('--- Exiting refreshFilesView successfully ---');

        } catch (error) {
            console.error('Error refreshing files view:', error);
            if (filesListContainer) {
                filesListContainer.innerHTML = `<p class="text-red-600 p-4 text-center">Error loading files: ${error.message}</p>`;
            }
            console.log('--- Exiting refreshFilesView with error ---');
        }
    }

    // View Files Button
    if (viewFilesButton) {
        viewFilesButton.addEventListener('click', async () => {
            console.log('View Files button clicked.');
            if (currentSelectedProperty) {
                console.log('User clicked "View Files" for property ID:', currentSelectedProperty.id);
                const categoryDetailsContent = document.getElementById('category-details-content');
                if (categoryDetailsContent) categoryDetailsContent.style.display = 'none';
                if (propertyFilesContent) propertyFilesContent.style.display = 'flex';
                console.log('propertyFilesContent display style after click:', propertyFilesContent.style.display);

                if (filesPropertyTitleSpan) filesPropertyTitleSpan.textContent = currentSelectedProperty.title;
                if (filesPropertyThumbnail) {
                    filesPropertyThumbnail.src = currentSelectedProperty.image || 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
                    filesPropertyThumbnail.alt = `${currentSelectedProperty.title} files thumbnail`;
                }

                if (addCategoryDetailButtonAtBottom) {
                    addCategoryDetailButtonAtBottom.style.display = 'none';
                }

                if (propertyFilesContent) {
                    propertyFilesContent.dataset.selectedPropertyId = currentSelectedProperty.id;
                }

                console.log('Calling refreshFilesView...');
                await refreshFilesView(currentSelectedProperty.id, null);
                console.log('refreshFilesView call completed.');
            } else {
                showCustomAlert('Please select a property to view files.');
                console.warn('View Files clicked without a selected property.');
            }
        });
    } else {
        console.warn("viewFilesButton element not found.");
    }

    // Create Folder Button
    if (createFolderButton) {
        createFolderButton.addEventListener('click', async () => {
            console.log('Create Folder button clicked.');
            const propertyId = parseInt(propertyFilesContent?.dataset?.selectedPropertyId);
            if (!propertyId) { showCustomAlert('Error: Property not selected for folder creation.'); return; }

            const folderName = prompt('Enter folder name:');
            if (folderName === null || folderName.trim() === '') {
                showCustomAlert('Folder creation cancelled or name was empty.');
                return;
            }

            showModal(
                verificationModal,
                `for creating folder "${folderName.trim()}"`,
                'Folder Creation Verification',
                async (username, password) => {
                    if (!username || !password) {
                        showCustomAlert('Username and password are required to create a folder.');
                        return false;
                    }

                    try {
                        const createResponse = await createFolderService(propertyId, folderName.trim(), username, password);
                        if (createResponse.success) {
                            showCustomAlert(`Folder "${folderName.trim()}" created successfully!`);
                            await refreshFilesView(propertyId, currentActiveFolderId);
                            return true;
                        } else {
                            showCustomAlert(`Folder creation failed: ${createResponse.message || 'Unknown error.'}`);
                            return false;
                        }
                    } catch (error) {
                        console.error('Error in createFolderService callback:', error);
                        showCustomAlert(`Error creating folder: ${error.message}`);
                        return false;
                    }
                }
            );
        });
    }

    // Delete Selected Files Button
    if (deleteSelectedFilesButton) {
        deleteSelectedFilesButton.addEventListener('click', async () => {
            console.log('Delete Selected Files button clicked.');
            if (currentSelectedFileIds.size === 0) {
                showCustomAlert('No files selected for deletion.');
                return;
            }

            const propertyId = parseInt(propertyFilesContent?.dataset?.selectedPropertyId);
            if (!propertyId) {
                showCustomAlert('Error: Property not selected.');
                return;
            }

            const filesToDelete = Array.from(currentSelectedFileIds);

            showModal(
                verificationModal,
                `${filesToDelete.length} selected file(s)`,
                `deleting`,
                async (username, password) => {
                    const success = await deleteFilesService(propertyId, filesToDelete, username, password);
                    if (success) {
                        showCustomAlert(`${filesToDelete.length} file(s) deleted successfully!`);
                        await refreshFilesView(propertyId, currentActiveFolderId);
                    }
                    return success;
                }
            );
        });
    } else {
        console.warn("deleteSelectedFilesButton element not found.");
    }

    // Move To Folder Button
    if (moveToFolderButton) {
        moveToFolderButton.addEventListener('click', async () => {
            console.log('Move To Folder button clicked.');
            if (currentSelectedFileIds.size === 0) {
                showCustomAlert('No files selected for moving.');
                return;
            }
            const propertyId = parseInt(propertyFilesContent?.dataset?.selectedPropertyId);
            if (!propertyId) {
                showCustomAlert('Error: Property not selected.');
                return;
            }

            const filesToMoveArray = Array.from(currentSelectedFileIds);
            console.log('Initiating move operation for files:', filesToMoveArray);

            await showUploadFolderSelectionModal(propertyId, null, null, null, filesToMoveArray);
        });
    }

    // Upload File Button
    if (uploadFileButton) {
        uploadFileButton.addEventListener('click', async (event) => {
            event.preventDefault();

            console.log('Upload File button clicked - starting process');

            const propertyId = parseInt(propertyFilesContent?.dataset?.selectedPropertyId);
            if (!propertyId) {
                showCustomAlert('Please select a property first.');
                return;
            }

            if (!fileUploadInput || !fileUploadInput.files || fileUploadInput.files.length === 0) {
                showCustomAlert('Please select a file to upload.');
                return;
            }

            const file = fileUploadInput.files[0];
            console.log('Selected file:', file.name, file.size, file.type);

            await handleFileUpload(propertyId, file);
        });
    }

    async function handleFileUpload(propertyId, file) {
        try {
            if (fileUploadStatus) {
                fileUploadStatus.classList.remove('hidden');
                fileUploadStatus.className = 'mt-3 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                fileUploadStatus.innerHTML = 'Preparing file for upload... <progress value="0" max="100"></progress>';
            }
            
            const { base64Data, mimeType } = await readFileAsBase64(file);
            
            await showUploadFolderSelectionModal(propertyId, file, base64Data, mimeType);
            
        } catch (error) {
            console.error('File upload error in handleFileUpload:', error);
            showCustomAlert('Failed to prepare file for upload: ' + error.message);
            if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
        }
    }
    
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onprogress = (event) => {
                if (event.lengthComputable && fileUploadStatus) {
                    const progressElement = fileUploadStatus.querySelector('progress');
                    if (progressElement) {
                        progressElement.value = event.loaded;
                        progressElement.max = event.total;
                    }
                }
            };
            
            reader.onload = () => {
                const result = reader.result;
                const base64Data = result.split(',')[1];
                const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
                resolve({ base64Data, mimeType });
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // showUploadFolderSelectionModal - Unified modal for upload and move
    async function showUploadFolderSelectionModal(propertyId, fileToUpload, base64Data, mimeType, filesToMove = null) {
        console.log('showUploadFolderSelectionModal: Preparing modal for property:', propertyId, 'File to Upload:', fileToUpload?.name, 'Files to Move:', filesToMove?.length);
        
        if (uploadFolderModalStatus) {
            uploadFolderModalStatus.classList.add('hidden');
            uploadFolderModalStatus.textContent = '';
        }
        
        if (newFolderNameContainer) newFolderNameContainer.classList.add('hidden');
        if (newFolderNameInput) newFolderNameInput.value = '';
        
        try {
            const { folders } = await fetchFileAndFolderData(propertyId, null);
            
            if (folderSelectDropdown) {
                const oldFolderSelectDropdown = folderSelectDropdown;
                folderSelectDropdown = oldFolderSelectDropdown.cloneNode(true);
                oldFolderSelectDropdown.parentNode.replaceChild(folderSelectDropdown, oldFolderSelectDropdown);
                
                folderSelectDropdown.innerHTML = `
                    <option value="none">-- No Folder (All Files) --</option>
                    <option value="new">+ Create New Folder</option>
                `;
                
                folders.forEach(folder => {
                    const option = document.createElement('option');
                    option.value = folder.id;
                    option.textContent = folder.name;
                    folderSelectDropdown.appendChild(option);
                });
                
                folderSelectDropdown.addEventListener('change', () => {
                    newFolderNameContainer.classList.toggle(
                        'hidden',
                        folderSelectDropdown.value !== 'new'
                    );
                });
            }
            
            if (confirmFolderSelectionBtn) {
                const oldConfirmBtn = confirmFolderSelectionBtn;
                confirmFolderSelectionBtn = oldConfirmBtn.cloneNode(true);
                oldConfirmBtn.parentNode.replaceChild(confirmFolderSelectionBtn, oldConfirmBtn);
                
                confirmFolderSelectionBtn.addEventListener('click', async () => {
                    console.log('Confirm Folder Selection button clicked inside modal.');
                    hideModal(uploadFolderModal); // Hide the folder selection modal immediately

                    const actionVerb = fileToUpload ? 'uploading' : 'moving';
                    const itemDescription = fileToUpload ? fileToUpload.name : `${filesToMove.length} selected file(s)`;

                    console.log('Attempting to show verification modal for:', itemDescription);
                    console.log('Verification Modal Element:', verificationModal);

                    showModal(
                        verificationModal,
                        `for ${actionVerb} ${itemDescription}`,
                        `${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)} Verification`,
                        async (modalUsername, modalPassword) => {
                            console.log('--- Verification Modal Callback Started ---');
                            try {
                                if (!modalUsername || !modalPassword) {
                                    showCustomAlert('Username and password are required for this operation.');
                                    console.error('Verification failed: Missing username or password.');
                                    return false;
                                }
                                console.log('Verification successful. User:', modalUsername);

                                const selectedFolderId = folderSelectDropdown.value;
                                let targetFolderId = null;
                                let targetFolderName = null;
                                let operationSuccessful = false;

                                if (selectedFolderId === 'new') {
                                    const newName = newFolderNameInput.value.trim();
                                    if (!newName) {
                                        showCustomAlert('Please enter a name for the new folder.');
                                        console.error('New folder name empty.');
                                        return false;
                                    }
                                    console.log('Attempting to create new folder:', newName);
                                    const createResponse = await createFolderService(propertyId, newName, modalUsername, modalPassword);

                                    if (!createResponse.success) {
                                        showCustomAlert(`Failed to create new folder: ${createResponse.message || 'Unknown error.'}`);
                                        console.error('Folder creation failed:', createResponse.message);
                                        return false;
                                    }
                                    targetFolderId = createResponse.folderId;
                                    targetFolderName = createResponse.folderName || newName;
                                    console.log('New folder created with ID:', targetFolderId, 'Name:', targetFolderName);
                                } else if (selectedFolderId && selectedFolderId !== 'none') {
                                    targetFolderId = selectedFolderId;
                                    const currentFolders = (await fetchFileAndFolderData(propertyId, null)).folders;
                                    const selectedFolder = currentFolders.find(f => f.id.toString() === selectedFolderId);
                                    targetFolderName = selectedFolder?.name || 'Selected Folder';
                                    console.log('Existing folder selected:', targetFolderName, 'ID:', targetFolderId);
                                } else {
                                    console.log('No specific folder selected (root directory). targetFolderId remains null.');
                                }

                                console.log('Checking conditions for file operation...');
                                console.log('fileToUpload:', fileToUpload);
                                console.log('base64Data present:', !!base64Data);
                                console.log('mimeType:', mimeType);
                                console.log('filesToMove:', filesToMove);

                                if (fileToUpload && base64Data && mimeType) {
                                    console.log('Condition met: Proceeding with file upload via uploadFileService...');
                                    operationSuccessful = await uploadFileService(
                                        propertyId,
                                        fileToUpload.name,
                                        base64Data,
                                        mimeType,
                                        targetFolderId,
                                        targetFolderName,
                                        modalUsername,
                                        modalPassword,
                                        currentLoggedInUsername // Assuming currentLoggedInUsername is available in this scope
                                    );
                                } else if (filesToMove && filesToMove.length > 0) {
                                    console.log('Condition met: Proceeding with file move via moveFilesService...');
                                    operationSuccessful = await moveFilesService(
                                        propertyId,
                                        filesToMove,
                                        targetFolderId,
                                        targetFolderName,
                                        modalUsername,
                                        modalPassword,
                                        currentLoggedInUsername // Assuming currentLoggedInUsername is available in this scope
                                    );
                                } else {
                                    console.error('Neither fileToUpload nor filesToMove specified. No valid operation detected.');
                                    showCustomAlert('No valid file operation detected. Please try again.');
                                    return false;
                                }

                                if (operationSuccessful) {
                                    showCustomAlert(`${fileToUpload ? 'File' : 'Files'} ${actionVerb} successfully!`);
                                    await refreshFilesView(propertyId, currentActiveFolderId);
                                    // Clear file input only for upload operation
                                    if (fileToUpload && fileUploadInput) {
                                        fileUploadInput.value = '';
                                    }
                                } else {
                                    showCustomAlert(`${fileToUpload ? 'File' : 'Files'} ${actionVerb} failed.`);
                                }
                                return operationSuccessful;

                            } catch (error) {
                                console.error('Operation error during re-verification callback:', error);
                                showCustomAlert('Operation failed: ' + error.message);
                                return false;
                            } finally {
                                console.log('--- Verification Modal Callback Finished ---');
                                if (fileUploadStatus) {
                                    fileUploadStatus.classList.add('hidden');
                                    fileUploadStatus.innerHTML = '';
                                }
                            }
                        }
                    );
                });
            }
            showModal(uploadFolderModal); // Show the initial folder selection modal
            
        } catch (error) {
            console.error('showUploadFolderSelectionModal: Error preparing modal:', error);
            showCustomAlert('Failed to prepare folder selection: ' + error.message);
            if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
        }
    }


    // --- General File/Folder Event Listeners (Delegated) ---
    if (filesListContainer) {
        filesListContainer.addEventListener('click', async (event) => {
            const checkbox = event.target.closest('.file-checkbox');
            const fileItem = event.target.closest('.file-item');
            const deleteBtn = event.target.closest('.delete-file-btn');
            const editBtn = event.target.closest('.edit-file-btn');
            const viewLink = event.target.closest('a[target="_blank"]');

            if (checkbox) {
                console.log('File checkbox clicked.');
                const fileId = parseInt(checkbox.dataset.fileId);
                toggleFileSelection(fileId, moveToFolderButton, deleteSelectedFilesButton);
            } else if (fileItem && !deleteBtn && !editBtn && !viewLink) {
                console.log('File item clicked (not action button).');
                const fileId = parseInt(fileItem.dataset.fileId);
                toggleFileSelection(fileId, moveToFolderButton, deleteSelectedFilesButton);
            } else if (deleteBtn) {
                console.log('Delete individual file button clicked.');
                const fileId = parseInt(deleteBtn.dataset.fileId);
                const fileName = deleteBtn.dataset.fileName;
                const propertyId = parseInt(propertyFilesContent?.dataset?.selectedPropertyId);
                if (isNaN(fileId) || !propertyId) {
                    showCustomAlert('Error: Cannot delete file. Information missing.');
                    return;
                }

                showModal(
                    verificationModal,
                    `file: "${fileName}"`,
                    `deleting`,
                    async (username, password) => {
                        const success = await deleteFilesService(propertyId, [fileId], username, password);
                        if (success) {
                            showCustomAlert(`File "${fileName}" deleted successfully!`);
                            await refreshFilesView(propertyId, currentActiveFolderId);
                        }
                        return success;
                    }
                );
            } else if (editBtn) {
                console.log('Edit individual file button clicked.');
                const fileId = parseInt(editBtn.dataset.fileId);
                const fileName = editBtn.dataset.fileName;
                showCustomAlert(`Edit functionality for file "${fileName}" (ID: ${fileId}) is not yet fully implemented. Implement a modal to edit file details here.`);
            }
        });
    } else {
        console.warn("filesListContainer element not found.");
    }

    if (foldersList) {
        foldersList.addEventListener('click', async (event) => {
            const folderItem = event.target.closest('.folder-item');
            if (folderItem) {
                console.log(`Folder item clicked: ${folderItem.dataset.folderId}`);
                const folderId = folderItem.dataset.folderId === 'root' ? null : folderItem.dataset.folderId;
                const propertyId = parseInt(propertyFilesContent?.dataset?.selectedPropertyId);
                if (!propertyId) {
                    showCustomAlert('Error: Property not selected when navigating folders.');
                    return;
                }

                await refreshFilesView(propertyId, folderId);
            }
        });
    } else {
        console.warn("foldersList element not found.");
    }

    // Folder Modal Handlers
    if (folderSelectDropdown) {
        folderSelectDropdown.addEventListener('change', (e) => {
            console.log('Folder select dropdown changed to:', e.target.value);
            if (newFolderNameContainer) {
                newFolderNameContainer.style.display = e.target.value === 'new' ? 'block' : 'none';
            }
            if (newFolderNameInput && e.target.value === 'new') {
                newFolderNameInput.focus();
            }
            if (uploadFolderModalStatus) uploadFolderModalStatus.classList.add('hidden');
        });
    } else {
        console.warn("folderSelectDropdown element not found.");
    }

    if (cancelFolderSelectionBtn) {
        cancelFolderSelectionBtn.addEventListener('click', () => {
            console.log('Cancel folder selection button clicked.');
            hideModal(uploadFolderModal);
            if (fileUploadInput) fileUploadInput.value = '';
            currentSelectedFileIds.clear();
            updateSelectionUI(currentSelectedFileIds, moveToFolderButton, deleteSelectedFilesButton);
            if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
        });
    }

    const fileUploadForm = document.getElementById('file-upload-form');
    if (fileUploadForm) {
        fileUploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Prevented default file form submission');
        });
    }

    // --- Back Button Event Listeners ---
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            console.log('Back to Login button clicked (from Property Selection).');
            showPage(loginPage);
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';
        });
    } else {
        console.warn("backToLoginBtn element not found.");
    }

    if (backToLoginFromRegisterBtn) {
        backToLoginFromRegisterBtn.addEventListener('click', () => {
            console.log('Back to Login button clicked (from Register).');
            showPage(loginPage);
            if (regUsernameInput) regUsernameInput.value = '';
            if (regPasswordInput) regPasswordInput.value = '';
        });
    } else {
        console.warn("backToLoginFromRegisterBtn element not found.");
    }

    if (backFromAddPropertyBtn) {
        backFromAddPropertyBtn.addEventListener('click', () => {
            console.log('Back from Add Property button clicked.');
            showPage(propertySelectionPage);
            if (addPropertyForm) addPropertyForm.reset();
        });
    } else {
        console.warn("backFromAddPropertyBtn element not found.");
    }

    if (backToPropertiesBtn) {
        backToPropertiesBtn.addEventListener('click', () => {
            console.log('Back to Properties button clicked (from Categories).');
            showPage(propertySelectionPage);
            currentSelectedProperty = null;
            currentSelectedCategoryName = null;
            if (currentPropertyTitle) currentPropertyTitle.textContent = 'Category Details';
            if (currentPropertyThumbnail) currentPropertyThumbnail.src = 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
        });
    } else {
        console.warn("backToPropertiesBtn element not found.");
    }

    if (backFromAddNewCategoryBtn) {
        backFromAddNewCategoryBtn.addEventListener('click', () => {
            console.log('Back from Add New Category button clicked.');
            showPage(propertyCategoriesPage);
        });
    } else {
        console.warn("backFromAddNewCategoryBtn element not found.");
    }

    if (backFromAddDetailBtn) {
        backFromAddDetailBtn.addEventListener('click', () => {
            console.log('Back from Add Detail button clicked.');
            showPage(propertyCategoriesPage);
        });
    } else {
        console.warn("backFromAddDetailBtn element not found.");
    }

    if (backFromUpdateDetailBtn) {
        backFromUpdateDetailBtn.addEventListener('click', () => {
            console.log('Back from Update Detail button clicked.');
            showPage(propertyCategoriesPage);
        });
    } else {
        console.warn("backFromUpdateDetailBtn element not found.");
    }

    if (backFromUpdatePropertyBtn) {
        backFromUpdatePropertyBtn.addEventListener('click', () => {
            console.log('Back from Update Property button clicked.');
            showPage(propertySelectionPage);
        });
    } else {
        console.warn("backFromUpdatePropertyBtn element not found.");
    }

    // Fix for backFromFilesButton element not found:
    // Option 1: Add the button to your HTML in the property-files-content section.
    // Option 2: If it's not needed, remove this 'if' block.
    if (backFromFilesButton) { // This `if` check is essential because the element might not exist
        backFromFilesButton.addEventListener('click', () => {
            console.log('Back from Files button clicked.');
            showPage(propertyCategoriesPage);
            const categoryDetailsContent = document.getElementById('category-details-content');
            if (categoryDetailsContent) categoryDetailsContent.style.display = 'flex';
            if (propertyFilesContent) propertyFilesContent.style.display = 'none';

            if (currentSelectedCategoryName && addCategoryDetailButtonAtBottom) {
                addCategoryDetailButtonAtBottom.style.display = 'block';
            }
        });
    } else {
        console.warn("backFromFilesButton element not found."); // This warning indicates the HTML element is missing
    }


    // Call the initial check for authentication
    await checkAuthAndRenderProperties();
}); // End DOMContentLoaded

// Helper function to get the current logged-in username (used by file services)
// This function needs to be accessible outside the DOMContentLoaded if services use it.
function getLoggedInUsername() {
    return currentLoggedInUsername;
}
