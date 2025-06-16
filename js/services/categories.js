// js/services/categories.js

import { showPage, showCustomAlert } from '../utils/dom.js';
import { getLoggedInCredentials } from './auth.js';
import { presetLogos } from '../constants.js'; // To render logos in forms/pickers

// DOM elements that this module directly interacts with for forms/status
const addNewCategoryStatus = document.getElementById('add-new-category-status');
const addDetailStatus = document.getElementById('add-detail-status');
const updateDetailStatus = document.getElementById('update-detail-status');

// Functions from UI layer (to be imported and called when relevant)
// These will be imported dynamically or passed as callbacks to avoid circular dependencies.
// For simplicity in this outline, imagine they are globally accessible or passed.

/**
 * Fetches and displays details for a given category of a property.
 * This function also handles the rendering of the detail "tiles".
 * @param {number} propertyId - The ID of the current property.
 * @param {string} categoryName - The name of the category to display details for.
 * @param {HTMLElement} container - The DOM element where details should be rendered.
 * @param {HTMLElement} loadingMessageElement - The DOM element for loading status.
 * @param {HTMLElement} addDetailButton - The "Add Vendor's Details" button.
 * @param {HTMLElement} presetLogoPickerAdd - The preset logo picker for add form.
 * @param {HTMLElement} customLogoUrlInputAdd - The custom logo URL input for add form.
 * @param {HTMLElement} presetLogoPickerUpdate - The preset logo picker for update form.
 * @param {HTMLElement} customLogoUrlInputUpdate - The custom logo URL input for update form.
 */
export async function getCategoryDetails(
    propertyId,
    categoryName,
    container,
    loadingMessageElement,
    addDetailButton,
    presetLogoPickerAdd,
    customLogoUrlInputAdd,
    presetLogoPickerUpdate,
    customLogoUrlInputUpdate
) {
    if (!container || !loadingMessageElement) return;

    // Clear previous content and show loading message
    container.innerHTML = '';
    loadingMessageElement.style.display = 'block';
    loadingMessageElement.textContent = `Loading details for "${categoryName}"...`;

    // Ensure the "Add Vendor's Details" button is visible when details section is active
    if (addDetailButton) addDetailButton.style.display = 'block';

    try {
        const response = await fetch(`/.netlify/functions/getCategoryDetails?property_id=${propertyId}&category_name=${encodeURIComponent(categoryName)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const details = await response.json();
        console.log(`Details for ${categoryName}:`, details);

        loadingMessageElement.style.display = 'none';
        container.innerHTML = ''; // Clear previous content before rendering new

        if (details.length === 0) {
            const noDetailsMessage = document.createElement('p');
            noDetailsMessage.classList.add('text-gray-600', 'mt-4');
            noDetailsMessage.textContent = `No details found for category: "${categoryName}".`;
            container.appendChild(noDetailsMessage);
        } else {
            // Render the detail tiles directly here, or call a UI renderer function
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

                // Add event listeners (can be moved to ui/category-renderer.js if it handles clicks)
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
                detailTile.querySelectorAll('.password-toggle-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const targetInput = document.getElementById(e.target.dataset.target);
                        if (targetInput) {
                            targetInput.type = targetInput.type === 'password' ? 'text' : 'password';
                            e.target.textContent = targetInput.type === 'password' ? '👁️' : '🙈';
                        }
                    });
                });
                detailTile.querySelector('[data-action="view"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const url = e.target.dataset.url;
                    if (url) { window.open(url, '_blank'); } else { showCustomAlert(`Detail: "${detail.detail_name}" has no URL.`); }
                });
                detailTile.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Get relevant update form elements from main.js or pass them down
                    const updateDetailIdInput = document.getElementById('update-detail-id');
                    const updateDetailNameInput = document.getElementById('update-detail-name');
                    const updateDetailUrlInput = document.getElementById('update-detail-url');
                    const updateDetailDescriptionInput = document.getElementById('update-detail-description');
                    const updateDetailUsernameInput = document.getElementById('update-detail-username');
                    const updateDetailPasswordInput = document.getElementById('update-detail-password');
                    const updateDetailCategoryNameSpan = document.getElementById('update-detail-category-name'); // to set category name in heading

                    // Populate and show the update detail page/modal
                    if (updateDetailIdInput) updateDetailIdInput.value = detail.id;
                    if (updateDetailNameInput) updateDetailNameInput.value = detail.detail_name;
                    if (updateDetailUrlInput) updateDetailUrlInput.value = detail.detail_url;
                    if (updateDetailDescriptionInput) updateDetailDescriptionInput.value = detail.detail_description || '';
                    if (updateDetailUsernameInput) updateDetailUsernameInput.value = detail.detail_username || '';
                    if (updateDetailPasswordInput) updateDetailPasswordInput.value = detail.detail_password || '';
                    if (updateDetailCategoryNameSpan) updateDetailCategoryNameSpan.textContent = `"${categoryName}" for Property ID ${propertyId}`;

                    // Re-render logo picker for update form
                    renderPresetLogosForForm(presetLogoPickerUpdate, customLogoUrlInputUpdate, detail.detail_logo_url);
                    showPage(document.getElementById('update-category-detail-page')); // Assuming a page switch

                });
                detailTile.querySelector('[data-action="delete-detail"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    showModal(
                        document.getElementById('verification-modal'),
                        `detail: "${detail.detail_name}"`,
                        `deleting`,
                        async (username, password) => {
                            await deleteCategoryDetail(propertyId, categoryName, detail.id, username, password);
                            // After deletion, refresh the category details
                            await getCategoryDetails(propertyId, categoryName, container, loadingMessageElement, addDetailButton, presetLogoPickerAdd, customLogoUrlInputAdd, presetLogoPickerUpdate, customLogoUrlInputUpdate);
                        }
                    );
                });

                container.appendChild(detailTile);
            });
        }
    } catch (error) {
        console.error('Error fetching category details:', error);
        if (loadingMessageElement) {
            loadingMessageElement.classList.add('text-red-600');
            loadingMessageElement.textContent = `Failed to load details: ${error.message}`;
        }
        container.innerHTML = '';
    }
}


/**
 * Adds a new category detail to a property and category.
 * @param {number} propertyId - The ID of the property.
 * @param {string} categoryName - The name of the category.
 * @param {object} detailData - Object containing detail_name, detail_url, detail_description, detail_logo_url, detail_username, detail_password.
 */
export async function addCategoryDetail(propertyId, categoryName, detailData) {
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
                property_id: propertyId,
                category_name: categoryName,
                ...detailData
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

        setTimeout(async () => {
            showPage(document.getElementById('property-categories-page'));
            // Refresh category details view
            // This will require passing the DOM elements down, or getting them directly within main.js/UI module
            // For now, directly access the common category details UI elements
            const categoryDetailsContent = document.getElementById('category-details-content');
            const categoryLoadingMessage = document.getElementById('category-loading-message');
            const addCategoryDetailButtonAtBottom = document.getElementById('add-category-detail-button-bottom');
            const presetLogoPickerAdd = document.getElementById('preset-logo-picker');
            const customLogoUrlInputAdd = document.getElementById('custom-logo-url');
            const updatePresetLogoPicker = document.getElementById('update-preset-logo-picker');
            const updateCustomLogoUrlInput = document.getElementById('update-custom-logo-url');

            await getCategoryDetails(
                propertyId,
                categoryName,
                categoryDetailsContent,
                categoryLoadingMessage,
                addCategoryDetailButtonAtBottom,
                presetLogoPickerAdd,
                customLogoUrlInputAdd,
                updatePresetLogoPicker,
                customLogoUrlInput
            );
        }, 1500);

    } catch (error) {
        console.error('Error saving detail:', error);
        if (addDetailStatus) {
            addDetailStatus.classList.remove('hidden');
            addDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
                addDetailStatus.textContent = 'Detail with this name already exists for this category.';
            } else {
                addDetailStatus.textContent = `Error saving detail: ${error.message}`;
            }
        }
    }
}


/**
 * Updates an existing category detail.
 * @param {object} detailData - The updated detail data (must include ID).
 */
export async function updateCategoryDetail(detailData) {
    const { username, password } = getLoggedInCredentials();
    const updateDetailStatus = document.getElementById('update-detail-status');

    if (updateDetailStatus) {
        updateDetailStatus.classList.remove('hidden');
        updateDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
        updateDetailStatus.textContent = 'Updating detail...';
    }

    try {
        const response = await fetch('/.netlify/functions/updateCategoryDetail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...detailData,
                username: username,
                password: password
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

        setTimeout(async () => {
            showPage(document.getElementById('property-categories-page'));
            // Refresh category details view
            const propertyCategoriesPage = document.getElementById('property-categories-page');
            const categoryDetailsContent = document.getElementById('category-details-content');
            const categoryLoadingMessage = document.getElementById('category-loading-message');
            const addCategoryDetailButtonAtBottom = document.getElementById('add-category-detail-button-bottom');
            const presetLogoPickerAdd = document.getElementById('preset-logo-picker');
            const customLogoUrlInputAdd = document.getElementById('custom-logo-url');
            const updatePresetLogoPicker = document.getElementById('update-preset-logo-picker');
            const updateCustomLogoUrlInput = document.getElementById('update-custom-logo-url');
            await getCategoryDetails(
                updatedDetail.property_id, // assuming updatedDetail contains property_id and category_name
                updatedDetail.category_name,
                categoryDetailsContent,
                categoryLoadingMessage,
                addCategoryDetailButtonAtBottom,
                presetLogoPickerAdd,
                customLogoUrlInputAdd,
                updatePresetLogoPicker,
                customLogoUrlInput
            );
        }, 1500);

    } catch (error) {
        console.error('Error updating detail:', error);
        if (updateDetailStatus) {
            updateDetailStatus.classList.remove('hidden');
            updateDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
                updateDetailStatus.textContent = 'Detail with this name and URL already exists for this category.';
            } else {
                updateDetailStatus.textContent = `Error updating detail: ${error.message}`;
            }
        }
    }
}


/**
 * Deletes a category detail.
 * @param {number} propertyId - The ID of the property.
 * @param {string} categoryName - The name of the category.
 * @param {number} detailId - The ID of the detail to delete.
 * @param {string} username - Username for verification.
 * @param {string} password - Password for verification.
 */
export async function deleteCategoryDetail(propertyId, categoryName, detailId, username, password) {
    const verificationStatus = document.getElementById('verification-status'); // Get status element here
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
                property_id: propertyId,
                category_name: categoryName,
                detail_id: detailId,
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
                // hideModal is a DOM utility, so pass the element explicitly.
                document.getElementById('verification-modal').classList.add('hidden');
                document.getElementById('verification-modal').style.display = 'none';

                // Refresh category details view
                const categoryDetailsContent = document.getElementById('category-details-content');
                const categoryLoadingMessage = document.getElementById('category-loading-message');
                const addCategoryDetailButtonAtBottom = document.getElementById('add-category-detail-button-bottom');
                const presetLogoPickerAdd = document.getElementById('preset-logo-picker');
                const customLogoUrlInputAdd = document.getElementById('custom-logo-url');
                const updatePresetLogoPicker = document.getElementById('update-preset-logo-picker');
                const updateCustomLogoUrlInput = document.getElementById('update-custom-logo-url');

                await getCategoryDetails(
                    propertyId,
                    categoryName,
                    categoryDetailsContent,
                    categoryLoadingMessage,
                    addCategoryDetailButtonAtBottom,
                    presetLogoPickerAdd,
                    customLogoUrlInputAdd,
                    updatePresetLogoPicker,
                    updateCustomLogoUrlInput
                );
            }, 1500);
            return true;
        } else {
            if (verificationStatus) {
                verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                verificationStatus.textContent = data.message || 'Deletion failed. Check credentials or try again.';
                document.getElementById('modal-password').value = ''; // Clear password field on failure
            }
            return false;
        }
    } catch (error) {
        console.error('Error during detail delete verification:', error);
        if (verificationStatus) {
            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            verificationStatus.textContent = `Network error: ${error.message}`;
        }
        return false;
    }
}

/**
 * Adds a new category name to an existing property's categories array.
 * @param {number} propertyId - The ID of the property.
 * @param {string} newCategoryName - The new category name to add.
 * @param {object} currentSelectedProperty - Reference to the property object (for updating its categories array locally)
 */
export async function addNewCategoryToProperty(propertyId, newCategoryName, currentSelectedProperty) {
    const addNewCategoryStatus = document.getElementById('add-new-category-status');
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
                property_id: propertyId,
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

        // Update the categories array of the global currentSelectedProperty
        if (currentSelectedProperty && result.updatedProperty && Array.isArray(result.updatedProperty.categories)) {
            currentSelectedProperty.categories = result.updatedProperty.categories;
        }

        setTimeout(async () => {
            showPage(document.getElementById('property-categories-page'));
            // This will refresh the category list in the UI
            const propertyCategoriesNav = document.getElementById('property-categories-nav');
            const categoryDetailsHeading = document.getElementById('current-property-title');
            const currentPropertyThumbnail = document.getElementById('current-property-thumbnail');
            await (await import('../ui/category-renderer.js')).renderPropertyCategories(currentSelectedProperty, null, propertyCategoriesNav, categoryDetailsHeading, currentPropertyThumbnail);
        }, 1500);

    } catch (error) {
        console.error('Error adding new category:', error);
        if (addNewCategoryStatus) {
            addNewCategoryStatus.classList.remove('hidden');
            addNewCategoryStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
                addNewCategoryStatus.textContent = 'Category with this name already exists for this property.';
            } else {
                addNewCategoryStatus.textContent = `Error adding category: ${error.message}`;
            }
        }
    }
}

/**
 * Renders the preset logos for a given form.
 * @param {HTMLElement} pickerElement - The div element acting as the logo picker container.
 * @param {HTMLElement} customUrlInput - The input field for custom logo URLs.
 * @param {string} [selectedUrl=''] - The URL of the currently selected logo to pre-select.
 */
export function renderPresetLogosForForm(pickerElement, customUrlInput, selectedUrl = '') {
    if (!pickerElement) {
        console.error("Logo picker element not found.");
        return;
    }
    pickerElement.innerHTML = ''; // Clear existing logos

    let selectedPresetFound = false;

    presetLogos.forEach(logo => {
        const logoItem = document.createElement('div');
        logoItem.classList.add('logo-picker-item');

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = 'detail-logo'; // Use a consistent name for both add/update forms
        radioInput.value = logo.url;
        radioInput.id = `logo-${logo.name.replace(/\s+/g, '-').toLowerCase()}`;
        radioInput.classList.add('hidden'); // Hide the radio button itself

        const img = document.createElement('img');
        img.src = logo.url;
        img.alt = logo.name;
        img.classList.add('w-full', 'h-full', 'object-contain');

        logoItem.appendChild(img);
        logoItem.appendChild(radioInput); // Append radio input so it's part of the item for click
        pickerElement.appendChild(logoItem);

        // Pre-select if this is the chosen logo
        if (selectedUrl === logo.url) {
            radioInput.checked = true;
            logoItem.classList.add('selected');
            selectedPresetFound = true;
        }

        logoItem.addEventListener('click', () => {
            // Remove 'selected' from all items first
            pickerElement.querySelectorAll('.logo-picker-item').forEach(item => {
                item.classList.remove('selected');
                item.querySelector('input[type="radio"]').checked = false;
            });
            // Add 'selected' to the clicked item
            logoItem.classList.add('selected');
            radioInput.checked = true;
            // Clear custom URL if a preset is selected
            if (customUrlInput) customUrlInput.value = '';
        });
    });

    // Handle custom URL input
    if (customUrlInput) {
        if (!selectedPresetFound && selectedUrl && selectedUrl !== 'custom') {
            customUrlInput.value = selectedUrl;
        } else if (selectedPresetFound) {
            customUrlInput.value = ''; // Clear if a preset was selected
        }

        customUrlInput.addEventListener('input', () => {
            // Unselect all preset logos if custom URL is being typed
            pickerElement.querySelectorAll('.logo-picker-item').forEach(item => {
                item.classList.remove('selected');
                item.querySelector('input[type="radio"]').checked = false;
            });
        });
    }
}
