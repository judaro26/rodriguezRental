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
    // Console logs added for debugging purposes. You can remove them once everything works.

    console.log('--- DOM Element Retrieval Start ---');

    // Pages and Modals
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
    const backToPropertiesBtn = document.getElementById('back-to-properties-btn'); // THIS IS THE ONE FROM THE ERROR
    console.log('backToPropertiesBtn:', backToPropertiesBtn); // Crucial log for this variable
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
    console.log('updateCategoryDetailPage:', updateCategoryDetailPage); // Added log for this specific variable
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
