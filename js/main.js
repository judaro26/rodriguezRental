// js/main.js

// --- Import Modules ---
import { showPage, showCustomAlert, showModal, hideModal } from './utils/dom.js';
import { login, register, getUserApprovalStatuses } from './services/auth.js';
import { fetchProperties, getPropertyById, saveNewProperty, updateExistingProperty, setPropertiesFilter } from './services/properties.js';
import { addCategoryDetail, updateCategoryDetail, deleteCategoryDetail, getCategoryDetails, addNewCategoryToProperty } from './services/categories.js';
import {
    displayPropertyFiles as fetchFileAndFolderData,
    createFolder as createFolderService, // Use the alias here
    uploadFile as uploadFileService,     // Use the alias here
    moveFiles as moveFilesService,       // Use the alias here
    deleteFiles as deleteFilesService,
    initFileUploadProcess as initFileUploadProcessService
} from './services/files.js';
import { renderPropertyCards, updateFilterButtonsHighlight } from './ui/property-renderer.js';
// Corrected imports for category renderer (including renderPresetLogosForForm)
import { renderPropertyCategories, displayCategoryDetails as renderCategoryDetailsUI, renderPresetLogosForForm } from './ui/category-renderer.js';
// Corrected imports for file renderer (all rendering logic)
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
    const updateCategoryDetailPage = document.getElementById('update-category-detail-page'); // <-- THIS LINE
    console.log('updateCategoryDetailPage:', updateCategoryDetailPage);
    const propertyFilesContent = document.getElementById('property-files-content');
    console.log('propertyFilesContent:', propertyFilesContent);
    const verificationModal = document.getElementById('verification-modal');
    console.log('verificationModal:', verificationModal);
    const uploadFolderModal = document.getElementById('upload-folder-modal');
    console.log('uploadFolderModal:', uploadFolderModal);

    // Login/Register Elements
    const loginForm = document.getElementById('login-form');
    console.log('loginForm:', loginForm);
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
    const categoryDetailsHeading = document.getElementById('current-property-title');
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
    const propertyHeader = document.getElementById('property-header');
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
    const categoryPropertyTitleSpan = document.getElementById('category-property-title');
    console.log('categoryPropertyTitleSpan:', categoryPropertyTitleSpan);
    const cancelNewCategoryButton = document.getElementById('cancel-new-category');
    console.log('cancelNewCategoryButton:', cancelNewCategoryButton);
    const addNewCategoryStatus = document.getElementById('add-new-category-status');
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
    const addDetailStatus = document.getElementById('add-detail-status');
    console.log('addDetailStatus:', addDetailStatus);
    const addDetailCategoryNameSpan = document.getElementById('add-detail-category-name');
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
    const updateDetailStatus = document.getElementById('update-detail-status');
    console.log('updateDetailStatus:', updateDetailStatus);
    const backFromUpdateDetailBtn = document.getElementById('back-from-update-detail-btn');
    console.log('backFromUpdateDetailBtn:', backFromUpdateDetailBtn);
    const updateDetailCategoryNameSpan = document.getElementById('update-detail-category-name');
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
    const updatePropertyStatus = document.getElementById('update-property-status');
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
                        currentPropertyThumbnail,
                        deleteCategoryButton, // ADD THIS
                        addNewCategoryButton, // ADD THIS
                        refreshCategoriesButtonOnCategoriesPage // ADD THIS
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
                        await renderCategoryDetailsUI( // ADD AWAIT
                            currentSelectedProperty.id,
                            currentSelectedCategoryName, // Pass the selected name
                            dynamicCategoryButtonsContainer,
                            categoryLoadingMessage,
                            addCategoryDetailButtonAtBottom,
                            presetLogoPicker,
                            customLogoUrlInput,
                            updatePresetLogoPicker,
                            updateCustomLogoUrlInput,
                            currentSelectedProperty // ADD THIS
                        );
                    } else {
                        // No categories for this property, show default message in details area
                        await renderCategoryDetailsUI( // ADD AWAIT
                            currentSelectedProperty.id,
                            null, // No category selected
                            dynamicCategoryButtonsContainer,
                            categoryLoadingMessage,
                            addCategoryDetailButtonAtBottom,
                            presetLogoPicker,
                            customLogoUrlInput,
                            updatePresetLogoPicker,
                            updateCustomLogoUrlInput,
                            currentSelectedProperty // ADD THIS
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
        propertyCategoriesNav.addEventListener('click', async (event) => { // ADD ASYNC
            const categoryDiv = event.target.closest('[data-category-name]');
            if (categoryDiv) {
                propertyCategoriesNav.querySelectorAll('[data-category-name]').forEach(div => {
                    div.classList.remove('bg-blue-200', 'text-blue-800');
                });
                categoryDiv.classList.add('bg-blue-200', 'text-blue-800');

                currentSelectedCategoryName = categoryDiv.dataset.categoryName;
                propertyCategoriesPage.dataset.selectedCategoryName = currentSelectedCategoryName;

                await renderCategoryDetailsUI( // ADD AWAIT
                    currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty // ADD THIS
                );

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
                newCategoryNameInput.value = ''; // ADD THIS LINE
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
            const success = await addNewCategoryToProperty(currentSelectedProperty.id, newCategoryName, currentSelectedProperty); // ADD CONST SUCCESS
            if (success) { // ADD IF SUCCESS
                showPage(propertyCategoriesPage); // Go back to categories page
                // Re-render categories sidebar and details
                renderPropertyCategories(
                    currentSelectedProperty, null, propertyCategoriesNav,
                    categoryDetailsHeading, currentPropertyThumbnail,
                    deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage // ADD BUTTONS
                );
                await renderCategoryDetailsUI(
                    currentSelectedProperty.id, null, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty // ADD THIS
                );
            } // ADD CLOSING BRACE
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
                            deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage // ADD BUTTONS
                        );
                        await renderCategoryDetailsUI( // Clear details by passing null category
                            currentSelectedProperty.id, null, dynamicCategoryButtonsContainer,
                            categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                            customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                            currentSelectedProperty // ADD THIS
                        );
                        currentSelectedCategoryName = null; // Clear global state
                    }
                }
            );
        });
    }

    if (refreshCategoriesButtonOnCategoriesPage) {
        refreshCategoriesButtonOnCategoriesPage.addEventListener('click', async () => { // ADD ASYNC
            if (currentSelectedProperty) {
                renderPropertyCategories(currentSelectedProperty, currentSelectedCategoryName, propertyCategoriesNav, categoryDetailsHeading, currentPropertyThumbnail, deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage); // ADD BUTTONS
                await renderCategoryDetailsUI(currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer, categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker, customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput, currentSelectedProperty); // ADD AWAIT AND CURRENT SELECTED PROPERTY
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
            const success = await addCategoryDetail(currentSelectedProperty.id, currentSelectedCategoryName, detailData); // ADD CONST SUCCESS
            if (success) { // ADD IF SUCCESS
                showPage(propertyCategoriesPage); // Navigate back
                // Re-render category details
                await renderCategoryDetailsUI(
                    currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty // ADD THIS
                );
            } // ADD CLOSING BRACE
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
            const success = await updateCategoryDetail(detailData, currentSelectedProperty.id, currentSelectedCategoryName); // ADD CONST SUCCESS
            if (success) { // ADD IF SUCCESS
                showPage(propertyCategoriesPage); // Navigate back
                // Re-render category details
                await renderCategoryDetailsUI(
                    currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                    categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                    customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                    currentSelectedProperty // ADD THIS
                );
            } // ADD CLOSING BRACE
        });
    }

    // Detail Tile Actions (Delegated from ui/category-renderer.js's clicks, but handled here)
    if (dynamicCategoryButtonsContainer) {
        dynamicCategoryButtonsContainer.addEventListener('click', async (event) => { // ADD ASYNC
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
                        const success = await deleteCategoryDetail(currentSelectedProperty.id, currentSelectedCategoryName, detailId, username, password); // ADD CONST SUCCESS
                        if (success) { // ADD IF SUCCESS
                            // After deletion, refresh categories in sidebar and details
                            renderPropertyCategories(
                                currentSelectedProperty, currentSelectedCategoryName, propertyCategoriesNav,
                                categoryDetailsHeading, currentPropertyThumbnail,
                                deleteCategoryButton, addNewCategoryButton, refreshCategoriesButtonOnCategoriesPage // ADD BUTTONS
                            );
                            await renderCategoryDetailsUI(
                                currentSelectedProperty.id, currentSelectedCategoryName, dynamicCategoryButtonsContainer,
                                categoryLoadingMessage, addCategoryDetailButtonAtBottom, presetLogoPicker,
                                customLogoUrlInput, updatePresetLogoPicker, updateCustomLogoUrlInput,
                                currentSelectedProperty // ADD THIS
                            );
                        } // ADD CLOSING BRACE
                    }
                );
            } else if (viewBtn) {
                const url = viewBtn.dataset.url;
                if (url) { window.open(url, '_blank'); } else { showCustomAlert('No URL provided.'); }
            }
        });
    }


    // File Management
    // Helper function to encapsulate fetching and rendering files/folders
    async function refreshFilesView(propertyId, folderId = null) {
        console.log('--- Entering refreshFilesView ---'); // ADD THIS
        console.log(`refreshFilesView: propertyId = ${propertyId}, folderId = ${folderId}`); // ADD THIS
    
        if (!propertyId) { // Basic validation
            console.error('refreshFilesView: No propertyId provided.');
            filesListContainer.innerHTML = `<p class="text-red-600 p-4 text-center">Error: Property not selected for file view.</p>`;
            return;
        }
    
        try {
            currentActiveFolderId = folderId;
            filesListContainer.innerHTML = `<p class="text-gray-600 p-4 text-center">Loading files and folders...</p>`;
            console.log('filesListContainer cleared and loading message set.'); // ADD THIS
    
            // Clear any previous selections
            currentSelectedFileIds.clear();
            updateSelectionUI(currentSelectedFileIds, moveToFolderButton, deleteSelectedFilesButton);
            console.log('currentSelectedFileIds cleared and selection UI updated.'); // ADD THIS
    
            // Fetch data
            console.log('Calling fetchFileAndFolderData...'); // ADD THIS
            const { files, folders } = await fetchFileAndFolderData(propertyId, folderId);
            console.log('fetchFileAndFolderData returned:'); // ADD THIS
            console.log('  Files:', files); // ADD THIS
            console.log('  Folders:', folders); // ADD THIS
    
            // Ensure files and folders are arrays
            const safeFiles = Array.isArray(files) ? files : [];
            const safeFolders = Array.isArray(folders) ? folders : [];
            console.log(`After safety check: ${safeFiles.length} files, ${safeFolders.length} folders.`); // ADD THIS
    
            // Render UI
            console.log('Calling renderFoldersList...'); // ADD THIS
            renderFoldersList(safeFolders, foldersList, currentFolderTitle, folderId);
            console.log('Calling renderFilesList...'); // ADD THIS
            renderFilesList(safeFiles, filesListContainer);
    
            // If no files/folders, show appropriate message
            // The condition (folderId ? 1 : 0) assumes '..' parent folder might always be present if not root
            // If your backend doesn't return '..' for subfolders, adjust this logic.
            const effectiveFoldersCount = safeFolders.filter(f => f.id !== 'root').length; // Exclude 'root' if it's implicitly added by renderer
            if (safeFiles.length === 0 && effectiveFoldersCount === 0) { // Adjusted condition for clarity
                filesListContainer.innerHTML = `<p class="text-gray-600 p-4 text-center">No files or subfolders found in this location.</p>`;
                console.log('No files or subfolders message displayed.'); // ADD THIS
            } else {
                console.log('Content rendered: Files or folders found.'); // ADD THIS
            }
            console.log('--- Exiting refreshFilesView successfully ---'); // ADD THIS
    
        } catch (error) {
            console.error('Error refreshing files view:', error); // This is good
            filesListContainer.innerHTML = `<p class="text-red-600 p-4 text-center">Error loading files: ${error.message}</p>`;
            console.log('--- Exiting refreshFilesView with error ---'); // ADD THIS
        }
    }
    
    if (viewFilesButton) {
        viewFilesButton.addEventListener('click', async () => {
            if (currentSelectedProperty) {
                console.log('User clicked "View Files" for property ID:', currentSelectedProperty.id); // ADD THIS
                // Hide category details and show files content
                document.getElementById('category-details-content').style.display = 'none';
                propertyFilesContent.style.display = 'flex';
                console.log('propertyFilesContent display style after click:', propertyFilesContent.style.display); // ADD THIS
    
                // Update property info in files view
                filesPropertyTitleSpan.textContent = currentSelectedProperty.title;
                filesPropertyThumbnail.src = currentSelectedProperty.image || 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
    
                if (addCategoryDetailButtonAtBottom) {
                    addCategoryDetailButtonAtBottom.style.display = 'none';
                }
    
                // Store property ID for file operations
                propertyFilesContent.dataset.selectedPropertyId = currentSelectedProperty.id;
    
                // Refresh the files view
                console.log('Calling refreshFilesView...'); // ADD THIS
                await refreshFilesView(currentSelectedProperty.id, null);
                console.log('refreshFilesView call completed.'); // ADD THIS
            } else {
                showCustomAlert('Please select a property to view files.');
                console.warn('View Files clicked without a selected property.'); // ADD THIS
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
                // Use the aliased name: createFolderService
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
        deleteSelectedFilesButton.addEventListener('click', async () => {
            if (currentSelectedFileIds.size === 0) {
                showCustomAlert('No files selected.');
                return;
            }
            
            const propertyId = parseInt(propertyFilesContent.dataset.selectedPropertyId);
            const filesToDelete = Array.from(currentSelectedFileIds);
    
            showModal(
                verificationModal,
                `${filesToDelete.length} selected file(s)`,
                `deleting`,
                async (username, password) => {
                    const success = await deleteFilesService(propertyId, filesToDelete, username, password);
                    if (success) {
                        await refreshFilesView(propertyId, currentActiveFolderId);
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
    
            // Use the aliased name: initFileUploadProcessService
            const processInitiated = await initFileUploadProcessService(null, Array.from(currentSelectedFileIds));
            if (processInitiated) {
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
            // Use the aliased name: initFileUploadProcessService
            const processInitiated = await initFileUploadProcessService(file);
            if (processInitiated) {
                await showUploadFolderSelectionModal(propertyId, file, null, null);
            } else {
                showCustomAlert('File preparation failed.');
            }
        });
    }

    // Handler for showUploadFolderSelectionModal's confirmation
    // This function encapsulates the UI logic for the modal and calls the service.
    async function showUploadFolderSelectionModal(propertyId, file = null, initialBase64data = null, initialMimeType = null, filesToMove = null) {
        console.log('showUploadFolderSelectionModal called.');
        let fileToUploadTemp = file;
        let base64DataToUploadTemp = initialBase64data;
        let mimeTypeToUploadTemp = initialMimeType;
        let filesToMoveTemp = filesToMove;
    
        // If it's a new file upload and base64 not yet read, read it first
        if (fileToUploadTemp && !base64DataToUploadTemp) {
            console.log('Reading file data for upload...');
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
                if (reader.result) {
                    base64DataToUploadTemp = reader.result.split(',')[1];
                    mimeTypeToUploadTemp = reader.result.split(',')[0].split(':')[1].split(';')[0];
                    console.log('File data read. Mime Type:', mimeTypeToUploadTemp);
                    // Once data is read, show the modal (recursive call to self, but now with data)
                    await showModalLogic(propertyId, fileToUploadTemp, base64DataToUploadTemp, mimeTypeToUploadTemp, filesToMoveTemp);
                } else {
                    console.error('FileReader result was null or empty.');
                    showCustomAlert('Failed to read file for upload.');
                    if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
                    hideModal(uploadFolderModal);
                }
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
            console.log('File data already prepared, showing modal directly.');
            await showModalLogic(propertyId, fileToUploadTemp, base64DataToUploadTemp, mimeTypeToUploadTemp, filesToMoveTemp);
        }
    }

    async function showModalLogic(propertyId, fileToUploadTemp, base64DataToUploadTemp, mimeTypeToUploadTemp, filesToMoveTemp) {
        console.log('showModalLogic called.');
        uploadFolderModalStatus.classList.add('hidden');
        uploadFolderModalStatus.textContent = '';
        newFolderNameContainer.classList.add('hidden');
        newFolderNameInput.value = '';
        folderSelectDropdown.innerHTML = '<option value="none">-- No Folder (All Files) --</option><option value="new">+ Create New Folder</option>';
        folderSelectDropdown.value = 'none'; // Ensure default is selected
    
        try {
            const { username, password } = getUserApprovalStatuses(); // Get credentials here
            console.log('Fetching folders for dropdown...');
            const foldersData = (await fetchFileAndFolderData(propertyId, null)).folders; // Fetch all folders for dropdown
            console.log('Folders fetched for dropdown:', foldersData);
    
            foldersData.forEach(f => {
                const option = document.createElement('option');
                option.value = f.id;
                option.textContent = f.name;
                folderSelectDropdown.insertBefore(option, folderSelectDropdown.lastElementChild); // Insert before '+ Create New Folder'
            });
            uploadFolderModalStatus.classList.add('hidden');
        } catch (error) {
            console.error('Error populating folder dropdown:', error);
            uploadFolderModalStatus.classList.remove('hidden');
            uploadFolderModalStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            uploadFolderModalStatus.textContent = `Error loading folders: ${error.message}`;
        }
    
        // Pass the actual username and password obtained from getUserApprovalStatuses() to showModal
        showModal(uploadFolderModal, '', 'selection', async (modalUsername, modalPassword) => { // Renamed params to avoid confusion
            console.log('Modal confirmed. Initiating file operation...');
            const selectedFolderId = folderSelectDropdown.value;
            let finalFolderId = null;
            let finalFolderName = null;
    
            if (selectedFolderId === 'new') {
                const newName = newFolderNameInput.value.trim();
                if (!newName) {
                    showCustomAlert('Please enter a name for the new folder.');
                    return false; // Prevent modal from closing if input is invalid
                }
                finalFolderName = newName;
                // A simple ID generation; ideally, your backend would return the ID.
                // For now, let's use the provided createFolderService which likely handles ID generation server-side.
                // The folder object returned by createFolderService *should* contain the actual ID.
                console.log('Attempting to create new folder:', finalFolderName);
                const folderCreatedResponse = await createFolderService(propertyId, finalFolderName, modalUsername, modalPassword); // Use modalUsername/modalPassword
                if (!folderCreatedResponse.success) { // Assuming createFolderService returns { success: boolean, folderId?: string }
                    showCustomAlert('Failed to create new folder: ' + (folderCreatedResponse.message || 'Unknown error.'));
                    return false; // Prevent modal from closing
                }
                finalFolderId = folderCreatedResponse.folderId; // Use the ID returned by the service
                console.log('New folder created with ID:', finalFolderId);
    
            } else if (selectedFolderId !== 'none') {
                const selectedFolder = (await fetchFileAndFolderData(propertyId, null)).folders.find(f => f.id === selectedFolderId);
                finalFolderId = selectedFolderId;
                finalFolderName = selectedFolder ? selectedFolder.name : selectedFolderId;
                console.log('Selected existing folder:', finalFolderName, 'ID:', finalFolderId);
            } else {
                console.log('No specific folder selected (root directory).');
            }
    
            let operationSuccess = false;
            if (fileToUploadTemp && base64DataToUploadTemp && mimeTypeToUploadTemp) {
                console.log('Attempting to upload file:', fileToUploadTemp.name, 'to folder:', finalFolderId || 'root');
                operationSuccess = await uploadFileService(propertyId, fileToUploadTemp.name, base64DataToUploadTemp, mimeTypeToUploadTemp, finalFolderId, finalFolderName, modalUsername, modalPassword); // Use modalUsername/modalPassword
                if (operationSuccess) {
                    showCustomAlert('File uploaded successfully!');
                } else {
                    showCustomAlert('File upload failed.');
                }
            } else if (filesToMoveTemp && filesToMoveTemp.length > 0) {
                console.log('Attempting to move files:', filesToMoveTemp, 'to folder:', finalFolderId || 'root');
                operationSuccess = await moveFilesService(propertyId, filesToMoveTemp, finalFolderId, finalFolderName, modalUsername, modalPassword); // Use modalUsername/modalPassword
                if (operationSuccess) {
                    showCustomAlert('Files moved successfully!');
                } else {
                    showCustomAlert('Failed to move files.');
                }
            }
    
            hideModal(uploadFolderModal);
            if (fileUploadInput) fileUploadInput.value = ''; // Clear file input
            if (fileUploadStatus) fileUploadStatus.classList.add('hidden'); // Hide upload status
            await refreshFilesView(propertyId, currentActiveFolderId); // Refresh view after operation
            return true; // Allow modal to close
        });
        uploadFolderModal.classList.remove('hidden'); // Ensure modal is visible if reading file data didn't re-call this
    }

    // --- General File/Folder Event Listeners (Delegated from main.js) ---
    if (filesListContainer) {
        filesListContainer.addEventListener('click', async (event) => {
            const checkbox = event.target.closest('.file-checkbox');
            const fileItem = event.target.closest('.file-item');
            const deleteBtn = event.target.closest('.delete-file-btn');
            const editBtn = event.target.closest('.edit-file-btn');
            const viewLink = event.target.closest('a[target="_blank"]');

            if (checkbox) {
                const fileId = parseInt(checkbox.dataset.fileId);
                // currentSelectedFileIds state is managed in ui/file-renderer's toggleFileSelection
                // and updated there directly.
                toggleFileSelection(fileId, moveToFolderButton, deleteSelectedFilesButton);
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
                        // Use the aliased name: deleteFilesService
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

                // No direct DOM manipulation here, renderFoldersList in ui/file-renderer will handle active class
                await refreshFilesView(propertyId, folderId);
            }
        });
    }

    // Folder Modal Handlers (These were already in main.js previously)
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
            // Clear selection when canceling move
            updateSelectionUI(new Set(), moveToFolderButton, deleteSelectedFilesButton); // Pass empty set
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
