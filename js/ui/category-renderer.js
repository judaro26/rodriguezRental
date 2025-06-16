// js/ui/category-renderer.js

import { showPage, showCustomAlert } from '../utils/dom.js';
import { getCategoryDetails, addCategoryDetail, updateCategoryDetail, deleteCategoryDetail } from '../services/categories.js';
import { presetLogos } from '../constants.js'; // Used for rendering logo pickers in forms

// DOM elements this renderer needs to interact with
const propertyCategoriesNav = document.getElementById('property-categories-nav');
const categoryDetailsHeading = document.getElementById('current-property-title'); // Span in HTML for Property Title/Category Details
const currentPropertyThumbnail = document.getElementById('current-property-thumbnail');
const dynamicCategoryButtonsContainer = document.getElementById('dynamic-category-buttons-container');
const categoryLoadingMessage = document.getElementById('category-loading-message');
const addCategoryDetailButtonAtBottom = document.getElementById('add-category-detail-button-bottom'); // This button is generally visible in this view
const deleteCategoryButton = document.getElementById('delete-category-button'); // Sidebar button
const addNewCategoryButton = document.getElementById('add-new-category-button'); // Sidebar button
const refreshCategoriesButtonOnCategoriesPage = document.getElementById('refresh-categories-on-page-button'); // Sidebar button

// References to the various forms for populating data during edits
const updateDetailIdInput = document.getElementById('update-detail-id');
const updateDetailNameInput = document.getElementById('update-detail-name');
const updateDetailUrlInput = document.getElementById('update-detail-url');
const updateDetailDescriptionInput = document.getElementById('update-detail-description');
const updateDetailUsernameInput = document.getElementById('update-detail-username');
const updateDetailPasswordInput = document.getElementById('update-detail-password');
const updateDetailCategoryNameSpan = document.getElementById('update-detail-category-name');
const updatePresetLogoPicker = document.getElementById('update-preset-logo-picker');
const updateCustomLogoUrlInput = document.getElementById('update-custom-logo-url');

// Similarly for the Add Detail Form elements
const presetLogoPickerAdd = document.getElementById('preset-logo-picker');
const customLogoUrlInputAdd = document.getElementById('custom-logo-url');


/**
 * Renders the list of categories in the sidebar for the selected property.
 * @param {object} currentSelectedProperty - The property object whose categories are to be rendered.
 * @param {string|null} currentSelectedCategoryName - The name of the currently selected category (for highlighting).
 * @param {HTMLElement} navContainer - The <nav> element for categories.
 * @param {HTMLElement} titleElement - The h2 element for property title.
 * @param {HTMLElement} thumbnailElement - The img element for property thumbnail.
 */
export function renderPropertyCategories(currentSelectedProperty, currentSelectedCategoryName, navContainer, titleElement, thumbnailElement) {
    if (!navContainer) return;

    navContainer.innerHTML = ''; // Clear existing categories

    // Update the property header details
    if (titleElement && thumbnailElement) {
        titleElement.textContent = currentSelectedProperty ? currentSelectedProperty.title : 'Category Details';
        thumbnailElement.src = currentSelectedProperty ? (currentSelectedProperty.image || 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property') : 'https://placehold.co/64x64/CCCCCC/FFFFFF?text=Property';
        thumbnailElement.alt = currentSelectedProperty ? currentSelectedProperty.title : 'Property Thumbnail';
    }

    if (!currentSelectedProperty || !currentSelectedProperty.categories || currentSelectedProperty.categories.length === 0) {
        navContainer.innerHTML = `<p class="text-gray-500 text-sm">No categories defined for this property.</p>`;
        if (deleteCategoryButton) deleteCategoryButton.style.display = 'none';
        if (addCategoryDetailButtonAtBottom) addCategoryDetailButtonAtBottom.style.display = 'none';
        if (addNewCategoryButton) addNewCategoryButton.style.display = 'block';
        if (refreshCategoriesButtonOnCategoriesPage) refreshCategoriesButtonOnCategoriesPage.style.display = 'block';
        return;
    }

    // Ensure buttons are visible if there are categories
    if (deleteCategoryButton) deleteCategoryButton.style.display = 'block';
    if (addNewCategoryButton) addNewCategoryButton.style.display = 'block';
    if (refreshCategoriesButtonOnCategoriesPage) refreshCategoriesButtonOnCategoriesPage.style.display = 'block';
    // addCategoryDetailButtonAtBottom's visibility is tied to a category being selected, handled by displayCategoryDetails

    currentSelectedProperty.categories.forEach(categoryName => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add(
            'cursor-pointer', 'p-3', 'rounded-lg', 'hover:bg-blue-100', 'transition-colors', 'duration-200', 'text-gray-700', 'font-medium', 'mb-2'
        );
        categoryDiv.textContent = categoryName;
        categoryDiv.dataset.categoryName = categoryName;

        if (categoryName === currentSelectedCategoryName) {
            categoryDiv.classList.add('bg-blue-200', 'text-blue-800');
        }

        navContainer.appendChild(categoryDiv);
        // Event listener for category selection is in main.js
    });
}

/**
 * Renders the detail tiles (vendor details) for a specific category.
 * Also handles initial state of add/update detail forms.
 * @param {number} propertyId - The ID of the current property.
 * @param {string|null} categoryName - The name of the category whose details to render.
 * @param {HTMLElement} container - The container for detail tiles.
 * @param {HTMLElement} loadingMessageElement - The loading message element.
 * @param {HTMLElement} addDetailButton - The "Add Vendor's Details" button.
 */
export async function displayCategoryDetails(propertyId, categoryName, container, loadingMessageElement, addDetailButton) {
    if (!container || !loadingMessageElement) return;

    // Show the category details content area
    container.style.display = 'flex';
    document.getElementById('property-files-content').style.display = 'none'; // Hide files if showing category details

    // Clear previous content and show loading message
    container.innerHTML = '';
    loadingMessageElement.style.display = 'block';
    loadingMessageElement.textContent = `Loading details for "${categoryName}"...`;

    // Ensure "Add Vendor's Details" button is visible
    if (addDetailButton) addDetailButton.style.display = 'block';

    if (!categoryName) {
        loadingMessageElement.textContent = 'Select a property category to view details.';
        if (addDetailButton) addDetailButton.style.display = 'none'; // Hide if no category selected
        return;
    }

    try {
        const details = await getCategoryDetails(propertyId, categoryName); // Call service to fetch data

        loadingMessageElement.style.display = 'none';
        container.innerHTML = ''; // Clear again before populating

        if (details.length === 0) {
            const noDetailsMessage = document.createElement('p');
            noDetailsMessage.classList.add('text-gray-600', 'mt-4');
            noDetailsMessage.textContent = `No details found for category: "${categoryName}".`;
            container.appendChild(noDetailsMessage);
        } else {
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
                container.appendChild(detailTile);
            });
        }
    } catch (error) {
        console.error('Error in displayCategoryDetails:', error);
        loadingMessageElement.classList.add('text-red-600');
        loadingMessageElement.textContent = `Failed to load details: ${error.message}`;
        container.innerHTML = '';
    }
}

/**
 * Renders the preset logos into a given logo picker element.
 * Handles selection state and interaction with custom URL input.
 * @param {HTMLElement} pickerElement - The div to render preset logos into.
 * @param {HTMLElement} customUrlInput - The input field for a custom logo URL.
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
        radioInput.name = pickerElement.id.includes('update') ? 'update-logo' : 'detail-logo'; // Use name based on picker ID
        radioInput.value = logo.url;
        radioInput.id = `${pickerElement.id}-logo-${logo.name.replace(/\s+/g, '-').toLowerCase()}`;
        radioInput.classList.add('hidden'); // Hide the radio button itself

        const img = document.createElement('img');
        img.src = logo.url;
        img.alt = logo.name;
        img.classList.add('w-full', 'h-full', 'object-contain');

        logoItem.appendChild(img);
        logoItem.appendChild(radioInput);
        pickerElement.appendChild(logoItem);

        if (selectedUrl === logo.url) {
            radioInput.checked = true;
            logoItem.classList.add('selected');
            selectedPresetFound = true;
        }

        logoItem.addEventListener('click', () => {
            pickerElement.querySelectorAll('.logo-picker-item').forEach(item => {
                item.classList.remove('selected');
                item.querySelector('input[type="radio"]').checked = false;
            });
            logoItem.classList.add('selected');
            radioInput.checked = true;
            if (customUrlInput) customUrlInput.value = '';
        });
    });

    if (customUrlInput) {
        if (!selectedPresetFound && selectedUrl && selectedUrl !== 'custom') { // If it's a custom URL not in presets
            customUrlInput.value = selectedUrl;
        } else if (selectedPresetFound) {
            customUrlInput.value = '';
        }

        customUrlInput.addEventListener('input', () => {
            pickerElement.querySelectorAll('.logo-picker-item').forEach(item => {
                item.classList.remove('selected');
                item.querySelector('input[type="radio"]').checked = false;
            });
        });
    }
}


// Event listeners for Category Details Page (delegated from main.js)
// These listen on `dynamicCategoryButtonsContainer` for action buttons
document.addEventListener('DOMContentLoaded', () => {
    const dynamicCategoryButtonsContainer = document.getElementById('dynamic-category-buttons-container');
    const propertyCategoriesPage = document.getElementById('property-categories-page'); // The whole page containing these elements

    if (dynamicCategoryButtonsContainer) {
        dynamicCategoryButtonsContainer.addEventListener('click', (event) => {
            const editBtn = event.target.closest('[data-action="edit"]');
            const deleteBtn = event.target.closest('[data-action="delete-detail"]');
            const viewBtn = event.target.closest('[data-action="view"]');

            if (editBtn) {
                const detail = editBtn.dataset; // Dataset contains all data- attributes
                const propertyId = propertyCategoriesPage.dataset.selectedPropertyId; // Assuming main.js or a state module sets this
                const categoryName = propertyCategoriesPage.dataset.selectedCategoryName; // Assuming main.js or a state module sets this

                // Populate update form fields (DOM elements need to be imported or accessed globally)
                if (updateDetailIdInput) updateDetailIdInput.value = detail.id;
                if (updateDetailNameInput) updateDetailNameInput.value = detail.name;
                if (updateDetailUrlInput) updateDetailUrlInput.value = detail.url;
                if (updateDetailDescriptionInput) updateDetailDescriptionInput.value = detail.description || '';
                if (updateDetailUsernameInput) updateDetailUsernameInput.value = detail.username || '';
                if (updateDetailPasswordInput) updateDetailPasswordInput.value = detail.password || '';
                if (updateDetailCategoryNameSpan) updateDetailCategoryNameSpan.textContent = `"${categoryName}" for Property ID ${propertyId}`;

                renderPresetLogosForForm(updatePresetLogoPicker, updateCustomLogoUrlInput, detail.logo || '');
                showPage(document.getElementById('update-category-detail-page'));
            } else if (deleteBtn) {
                const detailId = parseInt(deleteBtn.dataset.id);
                const detailName = deleteBtn.dataset.name;
                const propertyId = propertyCategoriesPage.dataset.selectedPropertyId;
                const categoryName = propertyCategoriesPage.dataset.selectedCategoryName;

                showModal(
                    document.getElementById('verification-modal'),
                    `detail: "${detailName}"`,
                    `deleting`,
                    async (username, password) => {
                        await deleteCategoryDetail(propertyId, categoryName, detailId, username, password);
                        // Refresh details is handled by deleteCategoryDetail service function
                    }
                );
            } else if (viewBtn) {
                const url = viewBtn.dataset.url;
                if (url) { window.open(url, '_blank'); } else { showCustomAlert('No URL provided.'); }
            }
        });
    }
});
