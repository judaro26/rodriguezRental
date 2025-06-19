// js/main.js

// --- Import Modules ---
import { showPage, showCustomAlert, showModal, hideModal } from './utils/dom.js';
import { login, register, getUserApprovalStatuses } from './services/auth.js';
import { fetchProperties, getPropertyById, saveNewProperty, updateExistingProperty, setPropertiesFilter } from './services/properties.js';
import { addCategoryDetail, updateCategoryDetail, deleteCategoryDetail, getCategoryDetails, addNewCategoryToProperty } from './services/categories.js';
import {
    displayPropertyFiles as fetchFileAndFolderData,
    createFolder as createFolderService,
    uploadFile as uploadFileService,
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

    // --- PART 1: GET ALL DOM ELEMENT REFERENCES ---
    const loginPage = document.getElementById('login-page');
    console.log('loginPage:', loginPage);
    const registerPage = document.getElementById('register-page');
    console.log('registerPage:', registerPage);
    const propertySelectionPage = document.getElementById('property-selection-page');
    console.log('propertySelectionPage:', propertySelectionPage);
    const addPropertyPage = document.getElementById('add-property-page');
    console.log('addPropertyPage:', addPropertyPage);
    const propertyCategoriesPage = document.getElementById('property-categories-page');
    console.log('propertyCategoriesPage:', propertyCategoriesPage);
    const addCategoryDetailPage = document.getElementById('add-category-detail-page');
    console.log('addCategoryDetailPage:', addCategoryDetailPage);
    const addNewCategoryPage = document.getElementById('add-new-category-page');
    console.log('addNewCategoryPage:', addNewCategoryPage);
    const updatePropertyPage = document.getElementById('update-property-page');
    console.log('updatePropertyPage:', updatePropertyPage);
    const updateCategoryDetailPage = document.getElementById('update-category-detail-page');
    console.log('updateCategoryDetailPage:', updateCategoryDetailPage);
    const propertyFilesContent = document.getElementById('property-files-content');
    console.log('propertyFilesContent:', propertyFilesContent);
    const verificationModal = document.getElementById('verification-modal');
    console.log('verificationModal:', verificationModal);
    const uploadFolderModal = document.getElementById('upload-folder-modal');
    console.log('uploadFolderModal:', uploadFolderModal);

    // Login/Register Elements
    const loginForm = document.getElementById('login-form');
    console.log('loginForm (after getElementById):', loginForm); // Add this specific log
    const usernameInput = document.getElementById('username');
    console.log('usernameInput:', usernameInput);
    const passwordInput = document.getElementById('password');
    console.log('passwordInput:', passwordInput);
    const showRegisterFormBtn = document.getElementById('show-register-form-btn');
    console.log('showRegisterFormBtn:', showRegisterFormBtn);
    const backToLoginFromRegisterBtn = document.getElementById('back-to-login-from-register-btn');
    console.log('backToLoginFromRegisterBtn:', backToLoginFromRegisterBtn);
    const registerForm = document.getElementById('register-form');
    console.log('registerForm:', registerForm);
    const regUsernameInput = document.getElementById('reg-username');
    console.log('regUsernameInput:', regUsernameInput);
    const regPasswordInput = document.getElementById('reg-password');
    console.log('regPasswordInput:', regPasswordInput);
    // Added specific elements for registration status messages to ensure they are cleared
    const registrationStatusMessage = document.getElementById('registration-status-message');
    const registerErrorMessage = document.getElementById('register-error-message');
    const registerErrorText = document.getElementById('register-error-text');


    // Property Selection Page Elements
    const propertyCardsContainer = document.getElementById('property-cards-container');
    console.log('propertyCardsContainer:', propertyCardsContainer);
    const propertiesLoadingMessage = document.getElementById('properties-loading-message');
    console.log('propertiesLoadingMessage:', propertiesLoadingMessage);
    const propertiesErrorText = document.getElementById('properties-error-text');
    console.log('propertiesErrorText:', propertiesErrorText);
    const propertiesErrorMessage = document.getElementById('properties-error-message');
    console.log('propertiesErrorMessage:', propertiesErrorMessage);
    const addPropertyButton = document.getElementById('add-property-button');
    console.log('addPropertyButton:', addPropertyButton);
    const refreshPropertiesButton = document.getElementById('refresh-properties-button');
    console.log('refreshPropertiesButton:', refreshPropertiesButton);
    const backToLoginBtn = document.getElementById('back-to-login-btn');
    console.log('backToLoginBtn:', backToLoginBtn);
    const filterAllPropertiesBtn = document.getElementById('filter-all-properties');
    console.log('filterAllPropertiesBtn:', filterAllPropertiesBtn);
    const filterDomesticPropertiesBtn = document.getElementById('filter-domestic-properties');
    console.log('filterDomesticPropertiesBtn:', filterDomesticPropertiesBtn);
    const filterForeignPropertiesBtn = document.getElementById('filter-foreign-properties');
    console.log('filterForeignPropertiesBtn:', filterForeignPropertiesBtn);

    // Add Property Page Elements
    const addPropertyForm = document.getElementById('add-property-form');
    console.log('addPropertyForm:', addPropertyForm);
    const propertyTitleInput = document.getElementById('property-title');
    console.log('propertyTitleInput:', propertyTitleInput);
    const propertyImageInput = document.getElementById('property-image');
    console.log('propertyImageInput:', propertyImageInput);
    const propertyDescriptionInput = document.getElementById('property-description');
    console.log('propertyDescriptionInput:', propertyDescriptionInput);
    const propertyCategoriesInput = document.getElementById('property-categories');
    console.log('propertyCategoriesInput:', propertyCategoriesInput);
    const cancelAddPropertyButton = document.getElementById('cancel-add-property');
    console.log('cancelAddPropertyButton:', cancelAddPropertyButton);
    const addPropertyStatus = document.getElementById('add-property-status');
    console.log('addPropertyStatus:', addPropertyStatus);
    const backFromAddPropertyBtn = document.getElementById('back-from-add-property-btn');
    console.log('backFromAddPropertyBtn:', backFromAddPropertyBtn);
    const propertyIsForeignInput = document.getElementById('property-is-foreign');
    console.log('propertyIsForeignInput:', propertyIsForeignInput);

    // Property Categories Page Elements
    const propertyCategoriesNav = document.getElementById('property-categories-nav');
    console.log('propertyCategoriesNav:', propertyCategoriesNav);
    const categoryDetailsHeading = document.getElementById('current-property-title'); // Used as the heading for category details
    console.log('categoryDetailsHeading:', categoryDetailsHeading);
    const dynamicCategoryButtonsContainer = document.getElementById('dynamic-category-buttons-container');
    console.log('dynamicCategoryButtonsContainer:', dynamicCategoryButtonsContainer);
    const categoryLoadingMessage = document.getElementById('category-loading-message');
    console.log('categoryLoadingMessage:', categoryLoadingMessage);
    const backToPropertiesBtn = document.getElementById('back-to-properties-btn');
    console.log('backToPropertiesBtn:', backToPropertiesBtn);
    const addNewCategoryButton = document.getElementById('add-new-category-button');
    console.log('addNewCategoryButton:', addNewCategoryButton);
    const deleteCategoryButton = document.getElementById('delete-category-button');
    console.log('deleteCategoryButton:', deleteCategoryButton);
    const refreshCategoriesButtonOnCategoriesPage = document.getElementById('refresh-categories-on-page-button');
    console.log('refreshCategoriesButtonOnCategoriesPage:', refreshCategoriesButtonOnCategoriesPage);
    const viewFilesButton = document.getElementById('view-files-button');
    console.log('viewFilesButton:', viewFilesButton);
    const propertyHeader = document.getElementById('property-header'); // This seems redundant with currentPropertyTitle/Thumbnail
    console.log('propertyHeader:', propertyHeader);
    const currentPropertyTitle = document.getElementById('current-property-title');
    console.log('currentPropertyTitle:', currentPropertyTitle);
    const currentPropertyThumbnail = document.getElementById('current-property-thumbnail');
    console.log('currentPropertyThumbnail:', currentPropertyThumbnail);
    const addCategoryDetailButtonAtBottom = document.getElementById('add-category-detail-button-bottom');
    console.log('addCategoryDetailButtonAtBottom:', addCategoryDetailButtonAtBottom);

    // Add New Category Page Elements
    const addNewCategoryForm = document.getElementById('add-new-category-form');
    console.log('addNewCategoryForm:', addNewCategoryForm);
    const newCategoryNameInput = document.getElementById('new-category-name');
    console.log('newCategoryNameInput:', newCategoryNameInput);
    const categoryPropertyTitleSpan = document.getElementById('category-property-title'); // Span to show parent property title
    console.log('categoryPropertyTitleSpan:', categoryPropertyTitleSpan);
    const cancelNewCategoryButton = document.getElementById('cancel-new-category');
    console.log('cancelNewCategoryButton:', cancelNewCategoryButton);
    const addNewCategoryStatus = document.getElementById('add-new-category-status'); // Status message for add new category form
    console.log('addNewCategoryStatus:', addNewCategoryStatus);

    // Add Category Detail Page Elements
    const addDetailForm = document.getElementById('add-detail-form');
    console.log('addDetailForm:', addDetailForm);
    const detailNameInput = document.getElementById('detail-name');
    console.log('detailNameInput:', detailNameInput);
    const detailUrlInput = document.getElementById('detail-url');
    console.log('detailUrlInput:', detailUrlInput);
    const detailDescriptionInput = document.getElementById('detail-description');
    console.log('detailDescriptionInput:', detailDescriptionInput);
    const presetLogoPicker = document.getElementById('preset-logo-picker');
    console.log('presetLogoPicker:', presetLogoPicker);
    const customLogoUrlInput = document.getElementById('custom-logo-url');
    console.log('customLogoUrlInput:', customLogoUrlInput);
    const detailUsernameAddInput = document.getElementById('detail-username-add');
    console.log('detailUsernameAddInput:', detailUsernameAddInput);
    const detailPasswordAddInput = document.getElementById('detail-password-add');
    console.log('detailPasswordAddInput:', detailPasswordAddInput);
    const cancelAddDetailButton = document.getElementById('cancel-add-detail');
    console.log('cancelAddDetailButton:', cancelAddDetailButton);
    const addDetailStatus = document.getElementById('add-detail-status'); // Status message for add detail form
    console.log('addDetailStatus:', addDetailStatus);
    const addDetailCategoryNameSpan = document.getElementById('add-detail-category-name'); // Span to show category and property title
    console.log('addDetailCategoryNameSpan:', addDetailCategoryNameSpan);


    // Update Category Detail Page Elements
    const backFromAddNewCategoryBtn = document.getElementById('back-from-add-new-category-btn');
    console.log('backFromAddNewCategoryBtn:', backFromAddNewCategoryBtn);
    const updateDetailForm = document.getElementById('update-detail-form');
    console.log('updateDetailForm:', updateDetailForm);
    const updateDetailIdInput = document.getElementById('update-detail-id');
    console.log('updateDetailIdInput:', updateDetailIdInput);
    const updateDetailNameInput = document.getElementById('update-detail-name');
    console.log('updateDetailNameInput:', updateDetailNameInput);
    const updateDetailUrlInput = document.getElementById('update-detail-url');
    console.log('updateDetailUrlInput:', updateDetailUrlInput);
    const updateDetailDescriptionInput = document.getElementById('update-detail-description');
    console.log('updateDetailDescriptionInput:', updateDetailDescriptionInput);
    const updatePresetLogoPicker = document.getElementById('update-preset-logo-picker');
    console.log('updatePresetLogoPicker:', updatePresetLogoPicker);
    const updateCustomLogoUrlInput = document.getElementById('update-custom-logo-url');
    console.log('updateCustomLogoUrlInput:', updateCustomLogoUrlInput);
    const updateDetailUsernameInput = document.getElementById('update-detail-username');
    console.log('updateDetailUsernameInput:', updateDetailUsernameInput);
    const updateDetailPasswordInput = document.getElementById('update-detail-password');
    console.log('updateDetailPasswordInput:', updateDetailPasswordInput);
    const cancelUpdateDetailButton = document.getElementById('cancel-update-detail');
    console.log('cancelUpdateDetailButton:', cancelUpdateDetailButton);
    const updateDetailStatus = document.getElementById('update-detail-status'); // Status message for update detail form
    console.log('updateDetailStatus:', updateDetailStatus);
    const backFromUpdateDetailBtn = document.getElementById('back-from-update-detail-btn');
    console.log('backFromUpdateDetailBtn:', backFromUpdateDetailBtn);
    const updateDetailCategoryNameSpan = document.getElementById('update-detail-category-name'); // Span to show category and property title for update
    console.log('updateDetailCategoryNameSpan:', updateDetailCategoryNameSpan);

    // Update Property Page Elements
    const backFromAddDetailBtn = document.getElementById('back-from-add-detail-btn');
    console.log('backFromAddDetailBtn:', backFromAddDetailBtn);
    const updatePropertyForm = document.getElementById('update-property-form');
    console.log('updatePropertyForm:', updatePropertyForm);
    const updatePropertyIdInput = document.getElementById('update-property-id');
    console.log('updatePropertyIdInput:', updatePropertyIdInput);
    const updatePropertyTitleInput = document.getElementById('update-property-title');
    console.log('updatePropertyTitleInput:', updatePropertyTitleInput);
    const updatePropertyImageInput = document.getElementById('update-property-image');
    console.log('updatePropertyImageInput:', updatePropertyImageInput);
    const updatePropertyDescriptionInput = document.getElementById('update-property-description');
    console.log('updatePropertyDescriptionInput:', updatePropertyDescriptionInput);
    const updatePropertyCategoriesInput = document.getElementById('update-property-categories');
    console.log('updatePropertyCategoriesInput:', updatePropertyCategoriesInput);
    const updatePropertyIsForeignInput = document.getElementById('update-property-is-foreign');
    console.log('updatePropertyIsForeignInput:', updatePropertyIsForeignInput);
    const cancelUpdatePropertyButton = document.getElementById('cancel-update-property');
    console.log('cancelUpdatePropertyButton:', cancelUpdatePropertyButton);
    const updatePropertyStatus = document.getElementById('update-property-status'); // Status message for update property form
    console.log('updatePropertyStatus:', updatePropertyStatus);
    const backFromUpdatePropertyBtn = document.getElementById('back-from-update-property-btn');
    console.log('backFromUpdatePropertyBtn:', backFromUpdatePropertyBtn);

    // Property Files Page Elements
    const filesPropertyTitleSpan = document.getElementById('files-property-title');
    console.log('filesPropertyTitleSpan:', filesPropertyTitleSpan);
    const filesPropertyThumbnail = document.getElementById('files-property-thumbnail');
    console.log('filesPropertyThumbnail:', filesPropertyThumbnail);
    const fileUploadInput = document.getElementById('file-upload-input');
    console.log('fileUploadInput:', fileUploadInput);
    const uploadFileButton = document.getElementById('upload-file-button');
    console.log('uploadFileButton:', uploadFileButton);
    const fileUploadStatus = document.getElementById('file-upload-status');
    console.log('fileUploadStatus:', fileUploadStatus);
    const filesListContainer = document.getElementById('files-list-container');
    console.log('filesListContainer:', filesListContainer);
    const backFromFilesButton = document.getElementById('back-from-files-button');
    console.log('backFromFilesButton:', backFromFilesButton);
    const createFolderButton = document.getElementById('create-folder-button');
    console.log('createFolderButton:', createFolderButton);
    const moveToFolderButton = document.getElementById('move-to-folder-button');
    console.log('moveToFolderButton:', moveToFolderButton);
    const deleteSelectedFilesButton = document.getElementById('delete-selected-files-button');
    console.log('deleteSelectedFilesButton:', deleteSelectedFilesButton);
    const foldersList = document.getElementById('folders-list');
    console.log('foldersList:', foldersList);
    const currentFolderTitle = document.getElementById('current-folder-title');
    console.log('currentFolderTitle:', currentFolderTitle);

    // Upload Folder Modal Elements
    const uploadFolderModalStatus = document.getElementById('upload-folder-modal-status');
    console.log('uploadFolderModalStatus:', uploadFolderModalStatus);
    const folderSelectDropdown = document.getElementById('folder-select-dropdown');
    console.log('folderSelectDropdown:', folderSelectDropdown);
    const newFolderNameContainer = document.getElementById('new-folder-name-container');
    console.log('newFolderNameContainer:', newFolderNameContainer);
    const newFolderNameInput = document.getElementById('new-folder-name-input');
    console.log('newFolderNameInput:', newFolderNameInput);
    const cancelFolderSelectionBtn = document.getElementById('cancel-folder-selection-btn');
    console.log('cancelFolderSelectionBtn:', cancelFolderSelectionBtn);
    const confirmFolderSelectionBtn = document.getElementById('confirm-folder-selection-btn');
    console.log('confirmFolderSelectionBtn:', confirmFolderSelectionBtn);

    console.log('--- DOM Element Retrieval End ---');

    // --- PART 2: INITIAL PAGE LOAD & ATTACH EVENT LISTENERS ---

    // Initial page load
    showPage(loginPage);



    // ... (rest of your DOM elements)

    // --- PART 2: INITIAL PAGE LOAD & ATTACH EVENT LISTENERS ---

    showPage(loginPage);
    
    // Login Form Listener
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


    // Register Form Listeners
    if (showRegisterFormBtn) {
        showRegisterFormBtn.addEventListener('click', () => {
            console.log('showRegisterFormBtn clicked. Navigating to register page.');
            showPage(registerPage);
            if (registerForm) registerForm.reset();
            if (regUsernameInput) regUsernameInput.value = '';
            if (regPasswordInput) regPasswordInput.value = '';
            // Clear any status messages when navigating to register page
            if (registrationStatusMessage) registrationStatusMessage.classList.add('hidden');
            if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
            if (registerErrorText) registerErrorText.textContent = '';
        });
    } else {
        console.warn("showRegisterFormBtn element not found.");
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // IMPORTANT: Prevent default form submission and page refresh
            console.log('Register form submitted. Preventing default behavior.');

            try {
                const username = regUsernameInput.value.trim();
                const password = regPasswordInput.value.trim();

                if (!username || !password) {
                    showCustomAlert('Please enter both username and password.');
                    return;
                }

                // Clear any status messages before new attempt
                if (registrationStatusMessage) registrationStatusMessage.classList.add('hidden');
                if (registerErrorMessage) registerErrorMessage.classList.add('hidden');
                if (registerErrorText) registerErrorText.textContent = '';

                console.log('Calling register service for user:', username);
                const success = await register(username, password);
                console.log('Register service returned:', success);

                if (success) {
                    showCustomAlert('Registration successful! Please login with your new credentials.');
                    showPage(loginPage);
                    if (registerForm) registerForm.reset(); // Clear form
                    if (regUsernameInput) regUsernameInput.value = '';
                    if (regPasswordInput) regPasswordInput.value = '';
                } else {
                    // The auth.js register function is expected to display an alert if it fails (e.g., username taken)
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
            console.log('Filter Domestic Properties button clicked.');
            const { domesticApproved } = getUserApprovalStatuses();
            if (domesticApproved) {
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
            console.log('Filter Foreign Properties button clicked.');
            const { foreignApproved } = getUserApprovalStatuses();
            if (foreignApproved) {
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
            console.log('Refresh Properties button clicked.');
            try {
                await fetchProperties(
                    null, // Assuming refresh means all properties
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
            event.preventDefault(); // IMPORTANT: Prevent default form submission
            console.log('Add Property form submitted. Preventing default behavior.');
            try {
                const propertyData = {
                    title: propertyTitleInput.value.trim(),
                    image: propertyImageInput.value.trim(),
                    description: propertyDescriptionInput.value.trim(),
                    // Ensure categories are correctly parsed, handle empty input
                    categories: propertyCategoriesInput.value.trim().split(',').map(cat => cat.trim()).filter(cat => cat !== ''),
                    is_foreign: propertyIsForeignInput.checked
                };

                // Validate required fields for property
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
                    // saveNewProperty should handle navigation and re-fetching
                    console.log('New property saved successfully.');
                    if (addPropertyForm) addPropertyForm.reset(); // Clear form after success
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
            event.preventDefault(); // IMPORTANT: Prevent default form submission
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

                // Validate required fields
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
                    // updateExistingProperty should handle navigation and re-fetching
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

                    showPage(propertyCategoriesPage); // Navigate first

                    // Update property header visuals on the categories page
                    if (currentPropertyTitle) {
                        currentPropertyTitle.textContent = currentSelectedProperty.title;
                    }
                    if (currentPropertyThumbnail) {
                        currentPropertyThumbnail.src = currentSelectedProperty.image || 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
                        currentPropertyThumbnail.alt = `${currentSelectedProperty.title} thumbnail`; // Add alt text
                    }

                    // Store selected property ID on the page element for easier access by other listeners
                    if (propertyCategoriesPage) {
                        propertyCategoriesPage.dataset.selectedPropertyId = currentSelectedProperty.id;
                    }

                    // Render categories in the left sidebar
                    renderPropertyCategories(
                        currentSelectedProperty,
                        null, // Start with no specific category highlighted
                        propertyCategoriesNav,
                        categoryDetailsHeading, // This heading is meant for the *details section*, not the sidebar header
                        currentPropertyThumbnail, // Passed for visual consistency
                        deleteCategoryButton,
                        addNewCategoryButton,
                        refreshCategoriesButtonOnCategoriesPage
                    );

                    // --- AUTOMATICALLY SELECT FIRST CATEGORY WHEN PROPERTY IS VIEWED ---
                    if (currentSelectedProperty.categories && currentSelectedProperty.categories.length > 0) {
                        const firstCategoryName = currentSelectedProperty.categories[0];
                        currentSelectedCategoryName = firstCategoryName; // Update global state
                        if (propertyCategoriesPage) {
                            propertyCategoriesPage.dataset.selectedCategoryName = firstCategoryName; // Update dataset
                        }


                        // Explicitly highlight the first category in the sidebar
                        const firstCategoryDiv = propertyCategoriesNav.querySelector(`[data-category-name="${firstCategoryName}"]`);
                        if (firstCategoryDiv) {
                            propertyCategoriesNav.querySelectorAll('[data-category-name]').forEach(div => {
                                div.classList.remove('bg-blue-200', 'text-blue-800');
                            });
                            firstCategoryDiv.classList.add('bg-blue-200', 'text-blue-800');
                        }

                        // Render details for the first category
                        await renderCategoryDetailsUI(
                            currentSelectedProperty.id,
                            currentSelectedCategoryName, // Pass the selected name
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
                        await renderCategoryDetailsUI( // Clear details by passing null category
                            currentSelectedProperty.id,
                            null, // No category selected
                            dynamicCategoryButtonsContainer,
                            categoryLoadingMessage,
                            addCategoryDetailButtonAtBottom,
                            presetLogoPicker,
                            customLogoUrlInput,
                            updatePresetLogoPicker,
                            updateCustomLogoUrlInput,
                            currentSelectedProperty
                        );
                        if (addCategoryDetailButtonAtBottom) addCategoryDetailButtonAtBottom.style.display = 'none'; // Hide button if no categories
                    }
                    // --- END AUTOMATIC SELECTION ---

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
                    // Populate the update form with existing data
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
                // Remove existing highlights from all category divs
                propertyCategoriesNav.querySelectorAll('[data-category-name]').forEach(div => {
                    div.classList.remove('bg-blue-200', 'text-blue-800');
                });
                // Add highlight to the clicked category
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
                if (propertyFilesContent) propertyFilesContent.style.display = 'none'; // Hide files view
                document.getElementById('category-details-content').style.display = 'flex'; // Show category details
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
            event.preventDefault(); // IMPORTANT: Prevent default form submission
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
                showPage(propertyCategoriesPage); // Go back to categories page
                // Re-render categories sidebar and details
                renderPropertyCategories(
                    currentSelectedProperty, null, propertyCategoriesNav,
                    categoryDetailsHeading, currentPropertyThumbnail,
                    deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage
                );
                await renderCategoryDetailsUI( // Re-render details to show the new category if it becomes the first/selected one
                    currentSelectedProperty.id, newCategoryName, dynamicCategoryButtonsContainer, // Potentially select the new category
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty
                );
                currentSelectedCategoryName = newCategoryName; // Set the newly added category as current
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
                    // NOTE: deleteCategoryDetail service function needs to handle deletion of a category by name,
                    // not just a detail within a category. This might require a separate service function.
                    // Assuming for now deleteCategoryDetail can handle a category name directly if detailId is omitted/null.
                    const success = await deleteCategoryDetail(currentSelectedProperty.id, currentSelectedCategoryName, null, username, password); // Pass null for detailId
                    if (success) {
                        showCustomAlert(`Category "${currentSelectedCategoryName}" deleted successfully!`);
                        // After deletion, refresh categories in sidebar and clear details
                        currentSelectedCategoryName = null; // Clear global state as it's deleted

                        // Re-fetch property to update its categories array
                        await fetchProperties( // Re-fetch all properties to update the cached currentSelectedProperty's categories
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
                        // Re-set currentSelectedProperty from updated list
                        currentSelectedProperty = getPropertyById(currentSelectedProperty.id);

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
                    }
                    return success; // Return success status to the modal
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
                // To ensure up-to-date categories, refetch the property
                await fetchProperties( // Refetch properties to update currentSelectedProperty's categories
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
                currentSelectedProperty = getPropertyById(currentSelectedProperty.id); // Update the global object

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
                // Ensure preset logo picker is rendered and cleared
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
            event.preventDefault(); // IMPORTANT: Prevent default form submission
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

            // Basic validation for detail name
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
                showPage(propertyCategoriesPage); // Navigate back
                // Re-render category details to show the new entry
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
            event.preventDefault(); // IMPORTANT: Prevent default form submission
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

            // Basic validation
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
                showPage(propertyCategoriesPage); // Navigate back
                // Re-render category details
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

    // Detail Tile Actions (Delegated from dynamicCategoryButtonsContainer)
    if (dynamicCategoryButtonsContainer) {
        dynamicCategoryButtonsContainer.addEventListener('click', async (event) => {
            const editBtn = event.target.closest('[data-action="edit"]');
            const deleteBtn = event.target.closest('[data-action="delete-detail"]');
            const viewBtn = event.target.closest('[data-action="view"]');

            if (editBtn) {
                console.log('Edit Detail button clicked.');
                const detailData = editBtn.dataset; // Dataset attributes are strings
                if (updateDetailIdInput) updateDetailIdInput.value = detailData.id;
                if (updateDetailNameInput) updateDetailNameInput.value = detailData.name;
                if (updateDetailUrlInput) updateDetailUrlInput.value = detailData.url;
                if (updateDetailDescriptionInput) updateDetailDescriptionInput.value = detailData.description;
                if (updateDetailUsernameInput) updateDetailUsernameInput.value = detailData.username;
                if (updateDetailPasswordInput) updateDetailPasswordInput.value = detailData.password;
                if (updateDetailCategoryNameSpan) updateDetailCategoryNameSpan.textContent = `"${currentSelectedCategoryName}" for ${currentSelectedProperty.title}`;

                // Render preset logos for the update form, pre-selecting based on current detail's logo
                if (updatePresetLogoPicker && updateCustomLogoUrlInput) {
                    renderPresetLogosForForm(updatePresetLogoPicker, updateCustomLogoUrlInput, detailData.logo);
                }
                showPage(updateCategoryDetailPage);

            } else if (deleteBtn) {
                console.log('Delete Detail button clicked.');
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
                            // After deletion, refresh details for the current category
                            await renderCategoryDetailsUI(
                                currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                                categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                                customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                                currentSelectedProperty
                            );
                        }
                        return success; // Return success status to the modal
                    }
                );
            } else if (viewBtn) {
                console.log('View Detail URL button clicked.');
                const url = viewBtn.dataset.url;
                if (url) { window.open(url, '_blank'); } else { showCustomAlert('No URL provided for this detail.'); }
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

            // Clear any previous selections
            currentSelectedFileIds.clear();
            updateSelectionUI(currentSelectedFileIds, moveToFolderButton, deleteSelectedFilesButton);
            console.log('currentSelectedFileIds cleared and selection UI updated.');

            // Fetch data
            console.log('Calling fetchFileAndFolderData...');
            const { files, folders } = await fetchFileAndFolderData(propertyId, folderId);
            console.log('fetchFileAndFolderData returned:');
            console.log('  Files:', files);
            console.log('  Folders:', folders);

            // Ensure files and folders are arrays
            const safeFiles = Array.isArray(files) ? files : [];
            const safeFolders = Array.isArray(folders) ? folders : [];
            console.log(`After safety check: ${safeFiles.length} files, ${safeFolders.length} folders.`);

            // Render UI
            console.log('Calling renderFoldersList...');
            renderFoldersList(safeFolders, foldersList, currentFolderTitle, folderId);
            console.log('Calling renderFilesList...');
            renderFilesList(safeFiles, filesListContainer);

            // If no files/folders, show appropriate message
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
                // Hide category details and show files content
                const categoryDetailsContent = document.getElementById('category-details-content');
                if (categoryDetailsContent) categoryDetailsContent.style.display = 'none';
                if (propertyFilesContent) propertyFilesContent.style.display = 'flex';
                console.log('propertyFilesContent display style after click:', propertyFilesContent.style.display);

                // Update property info in files view
                if (filesPropertyTitleSpan) filesPropertyTitleSpan.textContent = currentSelectedProperty.title;
                if (filesPropertyThumbnail) {
                    filesPropertyThumbnail.src = currentSelectedProperty.image || 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
                    filesPropertyThumbnail.alt = `${currentSelectedProperty.title} files thumbnail`;
                }

                if (addCategoryDetailButtonAtBottom) {
                    addCategoryDetailButtonAtBottom.style.display = 'none';
                }

                // Store property ID for file operations
                if (propertyFilesContent) {
                    propertyFilesContent.dataset.selectedPropertyId = currentSelectedProperty.id;
                }

                // Refresh the files view, starting at the root (null folderId)
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
            if (folderName === null) { // User clicked cancel
                console.log('Folder creation cancelled by user.');
                return;
            }
            if (folderName.trim() === '') {
                showCustomAlert('Folder name cannot be empty.');
                return;
            }

            const { username, password } = getUserApprovalStatuses();
            const success = await createFolderService(propertyId, folderName.trim(), username, password);
            if (success) {
                showCustomAlert(`Folder "${folderName.trim()}" created successfully!`);
                await refreshFilesView(propertyId, currentActiveFolderId); // Refresh current view
            } else {
                // createFolderService is expected to show its own alert on failure
                console.log('Folder creation failed (handled by service).');
            }
        });
    } else {
        console.warn("createFolderButton element not found.");
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
                    return success; // Return success status to the modal
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

            // initFileUploadProcessService is misused here if it's strictly for "uploading"
            // It might just be a generic "prepare for file operation"
            // If it truly prepares files *to be uploaded*, it should not be used for 'move'.
            // Assuming it's meant to "initiate a file-related process" in a broader sense.
            const processInitiated = await initFileUploadProcessService(null, Array.from(currentSelectedFileIds));
            if (processInitiated) {
                // The `showUploadFolderSelectionModal` is designed for *both* upload and move now.
                await showUploadFolderSelectionModal(propertyId, null, null, null, Array.from(currentSelectedFileIds));
            } else {
                showCustomAlert('Failed to initiate move process.');
            }
        });
    } else {
        console.warn("moveToFolderButton element not found.");
    }

    // Upload File Button
    if (uploadFileButton) {
        uploadFileButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent default form submission
            
            console.log('Upload File button clicked - starting process');
            
            const propertyId = parseInt(propertyFilesContent?.dataset?.selectedPropertyId);
            if (!propertyId) {
                showCustomAlert('Please select a property first');
                return;
            }
    
            if (!fileUploadInput || !fileUploadInput.files || fileUploadInput.files.length === 0) {
                showCustomAlert('Please select a file to upload');
                return;
            }
    
            const file = fileUploadInput.files[0];
            console.log('Selected file:', file.name, file.size, file.type);
    
            // Show loading status
            if (fileUploadStatus) {
                fileUploadStatus.classList.remove('hidden');
                fileUploadStatus.className = 'mt-3 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                fileUploadStatus.innerHTML = 'Preparing file for upload...';
            }
    
            // Read file as base64
            try {
                const { base64Data, mimeType } = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result;
                        const base64Data = result.split(',')[1];
                        const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
                        resolve({ base64Data, mimeType });
                    };
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(file);
                });
    
                // Now show the folder selection modal
                await showUploadFolderSelectionModal(propertyId, file, base64Data, mimeType);
                
            } catch (error) {
                console.error('File upload error:', error);
                showCustomAlert('Failed to prepare file for upload: ' + error.message);
                if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
            }
        });
    }


    async function handleFileUpload(propertyId, file) {
        try {
            // Show loading status
            if (fileUploadStatus) {
                fileUploadStatus.classList.remove('hidden');
                fileUploadStatus.className = 'mt-3 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
                fileUploadStatus.innerHTML = 'Preparing file for upload... <progress value="0" max="100"></progress>';
            }
    
            // Read file as base64
            const { base64Data, mimeType } = await readFileAsBase64(file);
            
            // Show folder selection modal
            await showUploadFolderSelectionModal(propertyId, file, base64Data, mimeType);
            
        } catch (error) {
            console.error('File upload error:', error);
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
    async function showUploadFolderSelectionModal(propertyId, file, base64Data, mimeType) {
        console.log('Showing upload folder modal for property:', propertyId);
        
        // Reset modal UI
        if (uploadFolderModalStatus) {
            uploadFolderModalStatus.classList.add('hidden');
            uploadFolderModalStatus.textContent = '';
        }
        
        if (newFolderNameContainer) newFolderNameContainer.classList.add('hidden');
        if (newFolderNameInput) newFolderNameInput.value = '';
        
        // Populate folder dropdown
        try {
            console.log('Fetching folders for dropdown...');
            const { folders } = await fetchFileAndFolderData(propertyId, null);
            
            if (folderSelectDropdown) {
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
            }
            
            // Set up folder selection change handler
            if (folderSelectDropdown && newFolderNameContainer) {
                folderSelectDropdown.addEventListener('change', () => {
                    newFolderNameContainer.classList.toggle(
                        'hidden', 
                        folderSelectDropdown.value !== 'new'
                    );
                });
            }
            
            // Set up confirm button
            if (confirmFolderSelectionBtn) {
                // Remove any existing listeners to prevent duplicates
                confirmFolderSelectionBtn.replaceWith(confirmFolderSelectionBtn.cloneNode(true));
                
                // Add new listener to the cloned button
                document.getElementById('confirm-folder-selection-btn').addEventListener('click', async () => {
                    try {
                        const selectedFolderId = folderSelectDropdown.value;
                        let finalFolderId = null;
                        let finalFolderName = null;
                        
                        // Handle folder creation if needed
                        if (selectedFolderId === 'new') {
                            const newName = newFolderNameInput.value.trim();
                            if (!newName) {
                                throw new Error('Please enter a folder name');
                            }
                            
                            const createResponse = await createFolderService(
                                propertyId, 
                                newName, 
                                currentLoggedInUsername, 
                                // You might want to get password from a secure source
                                'password' // This should be replaced with actual password handling
                            );
                            
                            if (!createResponse.success) {
                                throw new Error(createResponse.message || 'Failed to create folder');
                            }
                            
                            finalFolderId = createResponse.folderId;
                            finalFolderName = newName;
                        } 
                        else if (selectedFolderId !== 'none') {
                            finalFolderId = selectedFolderId;
                            const allFolders = (await fetchFileAndFolderData(propertyId, null)).folders;
                            const selectedFolder = allFolders.find(f => f.id.toString() === selectedFolderId);
                            finalFolderName = selectedFolder?.name || 'Selected Folder';
                        }
    
                        // Perform the upload
                        const uploadSuccess = await uploadFileService(
                            propertyId,
                            file.name,
                            base64Data,
                            mimeType,
                            finalFolderId,
                            finalFolderName,
                            currentLoggedInUsername, // This is now 'username' parameter
                            'password',              // This is 'password' parameter
                            currentLoggedInUsername  // <--- NEW: This is 'uploadedByUsername' parameter
                        );
                        if (!uploadSuccess) {
                            throw new Error('Upload service returned failure');
                        }
    
                        // Refresh view and clean up
                        await refreshFilesView(propertyId, currentActiveFolderId);
                        if (fileUploadInput) fileUploadInput.value = '';
                        if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
                        hideModal(uploadFolderModal);
                        
                        showCustomAlert('File uploaded successfully!');
                        
                    } catch (error) {
                        console.error('Upload error:', error);
                        if (uploadFolderModalStatus) {
                            uploadFolderModalStatus.textContent = error.message;
                            uploadFolderModalStatus.classList.remove('hidden');
                        }
                    }
                });
            }
            
            // Show the modal
            console.log('Showing modal...');
            uploadFolderModal.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error preparing upload modal:', error);
            showCustomAlert('Failed to prepare upload: ' + error.message);
            if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
        }
    }
       
    async function showModalConfirmation(propertyId, file, base64Data, mimeType, filesToMove, modalTitle, modalItemDescription) {
        console.log('showModalConfirmation called.'); // This confirms you're about to show the modal
        // This is the core logic that runs after file data (if any) is ready, or immediately for move operations.

        // The `showModal` function takes a callback.
        // Let's add logs inside this callback to see if the confirm action is triggered.
        showModal(uploadFolderModal, modalItemDescription, modalTitle, async (modalUsername, modalPassword) => {
            console.log('--- Modal Confirm button CLICKED (callback executing) ---'); // THIS IS CRITICAL
            console.log('Modal Username:', modalUsername);
            console.log('Modal Password:', modalPassword ? '********' : 'N/A'); // Don't log actual password

            const selectedFolderId = folderSelectDropdown?.value;
            console.log('Selected Folder ID from dropdown:', selectedFolderId);

            let finalFolderId = null;
            let finalFolderName = null;
            let operationResult = false;

            if (selectedFolderId === 'new') {
                const newName = newFolderNameInput.value.trim();
                console.log('New folder name input:', newName); // Check if newName is captured
                if (!newName) {
                    showCustomAlert('Please enter a name for the new folder.');
                    console.warn('New folder name empty, returning false.');
                    return false; // Prevent modal from closing if input is invalid
                }
                finalFolderName = newName;
                console.log('Attempting to create new folder:', finalFolderName);
                const folderCreatedResponse = await createFolderService(propertyId, finalFolderName, modalUsername, modalPassword);
                console.log('createFolderService response:', folderCreatedResponse); // Check response
                if (!folderCreatedResponse.success) {
                    showCustomAlert('Failed to create new folder: ' + (folderCreatedResponse.message || 'Unknown error.'));
                    return false;
                }
                finalFolderId = folderCreatedResponse.folderId;
                console.log('New folder created with ID:', finalFolderId);

            } else if (selectedFolderId && selectedFolderId !== 'none') {
                console.log('Existing folder selected.');
                // Fetch folders again just to get the name for logging, could optimize if foldersData is globally available
                const allFolders = (await fetchFileAndFolderData(propertyId, null)).folders;
                const selectedFolder = allFolders.find(f => f.id.toString() === selectedFolderId); // Convert ID to string for robust comparison
                finalFolderId = selectedFolderId;
                finalFolderName = selectedFolder ? selectedFolder.name : 'Unknown Folder';
                console.log('Selected existing folder:', finalFolderName, 'ID:', finalFolderId);
            } else {
                console.log('No specific folder selected (root directory). finalFolderId remains null.');
            }

            // Execute the actual file operation (upload or move)
            if (file && base64Data && mimeType) { // This is an upload operation
                console.log('Proceeding with file upload...');
                operationResult = await uploadFileService(propertyId, file.name, base64Data, mimeType, finalFolderId, finalFolderName, modalUsername, modalPassword);
                console.log('uploadFileService result:', operationResult); // Check upload result
                if (operationResult) {
                    showCustomAlert('File uploaded successfully!');
                } else {
                    showCustomAlert('File upload failed.');
                }
            } else if (filesToMove && filesToMove.length > 0) { // This is a move operation
                console.log('Proceeding with file move...');
                operationResult = await moveFilesService(propertyId, filesToMove, finalFolderId, finalFolderName, modalUsername, modalPassword);
                console.log('moveFilesService result:', operationResult); // Check move result
                if (operationResult) {
                    showCustomAlert('Files moved successfully!');
                } else {
                    showCustomAlert('Failed to move files.');
                }
            } else {
                console.error('No file to upload or files to move specified. This should not happen here.');
                showCustomAlert('No valid file operation detected.');
                operationResult = false;
            }

            hideModal(uploadFolderModal); // Hide the folder selection modal
            if (fileUploadInput) fileUploadInput.value = ''; // Clear file input
            if (fileUploadStatus) fileUploadStatus.classList.add('hidden'); // Hide upload status

            console.log('Refreshing files view after operation. propertyId:', propertyId, 'currentActiveFolderId:', currentActiveFolderId);
            await refreshFilesView(propertyId, currentActiveFolderId); // Refresh the main files view
            
            console.log('--- Modal Confirm callback ENDED. Returning:', operationResult, '---');
            return operationResult; // Return the success status to the verification modal
        });
        if (uploadFolderModal) uploadFolderModal.classList.remove('hidden'); // Ensure modal is visible if reading file data didn't re-call this
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
                // toggleFileSelection manages currentSelectedFileIds internally and updates UI buttons
                toggleFileSelection(fileId, moveToFolderButton, deleteSelectedFilesButton);
            } else if (fileItem && !deleteBtn && !editBtn && !viewLink) {
                // Click on file item itself (but not on specific action buttons or links)
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
                        return success; // Return success status to the modal
                    }
                );
            } else if (editBtn) {
                console.log('Edit individual file button clicked.');
                const fileId = parseInt(editBtn.dataset.fileId);
                const fileName = editBtn.dataset.fileName;
                showCustomAlert(`Edit functionality for file "${fileName}" (ID: ${fileId}) is not yet fully implemented. Implement a modal to edit file details here.`);
                // TODO: Implement actual file edit modal
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
    // ADD THE CANCEL BUTTON HANDLER RIGHT HERE
    if (cancelFolderSelectionBtn) {
        cancelFolderSelectionBtn.addEventListener('click', () => {
            console.log('Cancel folder selection button clicked.');
            hideModal(uploadFolderModal);
            if (fileUploadInput) fileUploadInput.value = '';
            // Clear selection when canceling
            updateSelectionUI(new Set(), moveToFolderButton, deleteSelectedFilesButton);
            if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
        });
    } else {
        console.warn("cancelFolderSelectionBtn element not found.");
    }
    const fileUploadForm = document.getElementById('file-upload-form'); // Make sure your form has this ID
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
            if (currentPropertyTitle) currentPropertyTitle.textContent = 'Category Details'; // Reset title
            if (currentPropertyThumbnail) currentPropertyThumbnail.src = 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property'; // Reset thumbnail
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

    if (backFromFilesButton) {
        backFromFilesButton.addEventListener('click', () => {
            console.log('Back from Files button clicked.');
            showPage(propertyCategoriesPage);
            // Re-show category details content when returning from files
            const categoryDetailsContent = document.getElementById('category-details-content');
            if (categoryDetailsContent) categoryDetailsContent.style.display = 'flex';
            if (propertyFilesContent) propertyFilesContent.style.display = 'none';

            // Ensure addCategoryDetailButtonAtBottom is visible again if a category is selected
            if (currentSelectedCategoryName && addCategoryDetailButtonAtBottom) {
                addCategoryDetailButtonAtBottom.style.display = 'block';
            }
        });
    } else {
        console.warn("backFromFilesButton element not found.");
    }

    console.log('All event listeners attached.');
}); // End DOMContentLoaded
