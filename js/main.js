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
let registerForm, regUsernameInput, regPasswordInput, backToLoginFromRegisterBtn;

let propertyCardsContainer, propertiesLoadingMessage, propertiesErrorText, propertiesErrorMessage;
let addPropertyButton, refreshPropertiesButton, backToLoginBtn;
let filterAllPropertiesBtn, filterDomesticPropertiesBtn, filterForeignPropertiesBtn;

let propertyCategoriesNav, categoryDetailsHeading, dynamicCategoryButtonsContainer, categoryLoadingMessage;
let backToPropertiesBtn, addNewCategoryButton, deleteCategoryButton, refreshCategoriesButtonOnCategoriesPage, viewFilesButton;
let propertyHeader, currentPropertyTitle, currentPropertyThumbnail, addCategoryDetailButtonAtBottom;

let addPropertyForm, propertyTitleInput, propertyImageInput, propertyDescriptionInput, propertyCategoriesInput,
    cancelAddPropertyButton, addPropertyStatus, backFromAddPropertyBtn, propertyIsForeignInput;

let updatePropertyForm, updatePropertyIdInput, updatePropertyTitleInput, updatePropertyImageInput,
    updatePropertyDescriptionInput, updatePropertyCategoriesInput, updatePropertyIsForeignInput,
    cancelUpdatePropertyButton, updatePropertyStatus, backFromUpdatePropertyBtn;

let addNewCategoryForm, newCategoryNameInput, categoryPropertyTitleSpan, cancelNewCategoryButton, addNewCategoryStatus;

let addDetailForm, detailNameInput, detailUrlInput, detailDescriptionInput, presetLogoPicker, customLogoUrlInput,
    detailUsernameAddInput, detailPasswordAddInput, cancelAddDetailButton, addDetailStatus, addDetailCategoryNameSpan;

let updateDetailForm, updateDetailIdInput, updateDetailNameInput, updateDetailUrlInput,
    updateDetailDescriptionInput, updatePresetLogoPicker, updateCustomLogoUrlInput, updateDetailUsernameInput,
    updateDetailPasswordInput, cancelUpdateDetailButton, updateDetailStatus, backFromUpdateDetailBtn, updateDetailCategoryNameSpan;

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
    backToLoginFromRegisterBtn = document.getElementById('back-to-login-from-register-btn');
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
    backToLoginBtn = document.getElementById('back-to-login-btn');
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
    backFromAddPropertyBtn = document.getElementById('back-from-add-property-btn');
    propertyIsForeignInput = document.getElementById('property-is-foreign');

    // Property Categories Page Elements
    propertyCategoriesNav = document.getElementById('property-categories-nav');
    categoryDetailsHeading = document.getElementById('current-property-title');
    dynamicCategoryButtonsContainer = document.getElementById('dynamic-category-buttons-container');
    categoryLoadingMessage = document.getElementById('category-loading-message');
    backToPropertiesBtn = document.getElementById('back-to-properties-btn');
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
    backFromAddNewCategoryBtn = document.getElementById('back-from-add-new-category-btn');

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
    backFromAddDetailBtn = document.getElementById('back-from-add-detail-btn');
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
    backFromUpdateDetailBtn = document.getElementById('back-from-update-detail-btn');
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
    backFromUpdatePropertyBtn = document.getElementById('back-from-update-property-btn');

    // Property Files Page Elements
    filesPropertyTitleSpan = document.getElementById('files-property-title');
    filesPropertyThumbnail = document.getElementById('files-property-thumbnail');
    fileUploadInput = document.getElementById('file-upload-input');
    uploadFileButton = document.getElementById('upload-file-button');
    fileUploadStatus = document.getElementById('file-upload-status');
    filesListContainer = document.getElementById('files-list-container');
    backFromFilesButton = document.getElementById('back-from-files-button');
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


    // 1. Show the initial login page
    showPage(loginPage);

    // 2. Attach Event Listeners for Core Functionality (Delegating to imported functions)

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
        refreshPropertiesButton.addEventListener('click', async () => await fetchProperties(null)); // Refresh based on current filter state inside properties.js
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
                    currentSelectedProperty = selectedProperty; // Set global state
                    showPage(propertyCategoriesPage);
                    renderPropertyCategories(currentSelectedProperty, currentSelectedCategoryName, propertyCategoriesNav, categoryDetailsHeading, currentPropertyThumbnail);
                    renderCategoryDetailsUI(currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer, categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker, customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput);

                    // Store selected property ID on the page element for easier access by other listeners
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
    if (propertyCategoriesNav) { // Event delegation for selecting a category
        propertyCategoriesNav.addEventListener('click', (event) => {
            const categoryDiv = event.target.closest('[data-category-name]');
            if (categoryDiv) {
                // Visually highlight selected category
                propertyCategoriesNav.querySelectorAll('[data-category-name]').forEach(div => {
                    div.classList.remove('bg-blue-200', 'text-blue-800');
                });
                categoryDiv.classList.add('bg-blue-200', 'text-blue-800');

                currentSelectedCategoryName = categoryDiv.dataset.categoryName; // Set global state
                propertyCategoriesPage.dataset.selectedCategoryName = currentSelectedCategoryName; // Store on page element

                // Render details for the selected category
                renderCategoryDetailsUI(currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer, categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker, customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput);

                // Show "Add Vendor's Details" button if not already shown
                if (addCategoryDetailButtonAtBottom) addCategoryDetailButtonAtBottom.style.display = 'block';
                // Ensure files content is hidden if category details are shown
                if (propertyFilesContent) propertyFilesContent.style.display = 'none';
                document.getElementById('category-details-content').style.display = 'flex'; // Make sure details are visible
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
                detailPasswordAddInput.sliced = '';
                renderPresetLogosForForm(presetLogoPicker, custom
