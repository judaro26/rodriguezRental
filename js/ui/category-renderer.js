// js/ui/category-renderer.js

import { showPage, showCustomAlert, showModal } from '../utils/dom.js'; // Added showModal
import { getCategoryDetails, addCategoryDetail, updateCategoryDetail, deleteCategoryDetail } from '../services/categories.js';
import { presetLogos } from '../constants.js'; // Used for rendering logo pickers in forms

// Remove DOM elements being retrieved here. They should be passed as arguments.
// const propertyCategoriesNav = document.getElementById('property-categories-nav');
// const categoryDetailsHeading = document.getElementById('current-property-title');
// const currentPropertyThumbnail = document.getElementById('current-property-thumbnail');
// const dynamicCategoryButtonsContainer = document.getElementById('dynamic-category-buttons-container');
// const categoryLoadingMessage = document.getElementById('category-loading-message');
// const addCategoryDetailButtonAtBottom = document.getElementById('add-category-detail-button-bottom');
// const deleteCategoryButton = document.getElementById('delete-category-button');
// const addNewCategoryButton = document.getElementById('add-new-category-button');
// const refreshCategoriesButtonOnCategoriesPage = document.getElementById('refresh-categories-on-page-button');

// Add these to the parameters of functions that use them, or pass them from main.js
// If you need these for form population here (like updateDetailIdInput), you still need to get them
// or pass them down from main.js. For now, I'll keep them as `document.getElementById` for forms,
// as they are directly tied to the form elements *on this page*.

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
 * @param {HTMLElement} deleteCatButton - The delete category button in the sidebar. // ADDED
 * @param {HTMLElement} addCatButton - The add new category button in the sidebar. // ADDED
 * @param {HTMLElement} refreshCatButton - The refresh categories button in the sidebar. // ADDED
 */
export function renderPropertyCategories(
    currentSelectedProperty,
    currentSelectedCategoryName,
    navContainer,
    titleElement,
    thumbnailElement,
    deleteCatButton, // ADDED
    addCatButton,    // ADDED
    refreshCatButton // ADDED
) {
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
        if (deleteCatButton) deleteCatButton.style.display = 'none'; // Use passed element
        // addCategoryDetailButtonAtBottom's visibility is handled by displayCategoryDetails (main.js calls it)
        if (addCatButton) addCatButton.style.display = 'block'; // Use passed element
        if (refreshCatButton) refreshCatButton.style.display = 'block'; // Use passed element
        return;
    }

    // Ensure buttons are visible if there are categories
    if (deleteCatButton) deleteCatButton.style.display = 'block'; // Use passed element
    if (addCatButton) addCatButton.style.display = 'block'; // Use passed element
    if (refreshCatButton) refreshCatButton.style.display = 'block'; // Use passed element

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
 * @param {HTMLElement} presetLogoPickerAdd - The preset logo picker for add form.
 * @param {HTMLElement} customLogoUrlInputAdd - The custom logo URL input for add form.
 * @param {HTMLElement} updatePresetLogoPicker - The preset logo picker for update form.
 * @param {HTMLElement} updateCustomLogoUrlInput - The custom logo URL input for update form.
 * @param {object} currentSelectedProperty - The currently selected property object (for re-rendering categories if needed). // ADDED for refresh
 */
export async function displayCategoryDetails(
    propertyId,
    categoryName,
    container,
    loadingMessageElement,
    addDetailButton,
    presetLogoPickerAdd,
    customLogoUrlInputAdd,
    updatePresetLogoPicker,
    updateCustomLogoUrlInput,
    currentSelectedProperty // ADDED
) {
    if (!container || !loadingMessageElement) return;

    // Show the category details content area
    container.style.display = 'flex';
    // This is a specific DOM element, if it's always property-files-content, it can be gotten here
    // or passed down from main.js. For now, it's fine as it's a direct reference outside the loop.
    const propertyFilesContent = document.getElementById('property-files-content');
    if (propertyFilesContent) propertyFilesContent.style.display = 'none';

    // Clear previous content and show loading message
    container.innerHTML = '';
    loadingMessageElement.style.display = 'block';
    loadingMessageElement.textContent = `Loading details for "${categoryName}"...`;

    // Ensure "Add Vendor's Details" button is visible
    if (addDetailButton) addDetailButton.style.display = 'block';

    if (!categoryName) {
        loadingMessageElement.textContent = 'Select a property category to view details.';
        if (addDetailButton) addDetailButton.style.display = 'none';
        return;
    }

    try {
        // --- THIS IS THE KEY CHANGE ---
        // Call the service function to GET the data. It should only return the data.
        const details = await getCategoryDetails(propertyId, categoryName); // Call the service layer, NOT recursively this UI function!

        loadingMessageElement.style.display = 'none';
        container.innerHTML = ''; // Clear again before populating

        if (details.length === 0) {
            const noDetailsMessage = document.createElement('p');
            noDetailsMessage.classList.add('text-gray-600', 'mt-4');
            noDetailsMessage.textContent = `No details found for category: "${categoryName}".`;
            container.appendChild(noDetailsMessage);
        } else {
            // Iterate and render the detail tiles using the received 'details' array
            details.forEach(detail => {
                const detailTile = document.createElement('div');
                detailTile.classList.add('detail-tile'); // Add your Tailwind/CSS classes
                detailTile.dataset.detailId = detail.id;

                const logoHtml = detail.detail_logo_url
                    ? `<img src="<span class="math-inline">\{detail\.detail\_logo\_url\}" alt\="</span>{detail.detail_name}" class="object-contain w-16 h-16 mb-2" onerror="this.onerror=null;this.src='https://placehold.co/64x64/CCCCCC/FFFFFF?text=Logo';">`
                    : `<div class="logo-placeholder w-16 h-16 mb-2">${detail.detail_name.substring(0,3)}</div>`;

                const usernameInputId = `username-${detail.id}`;
                const passwordInputId = `password-${detail.id}`;

                detailTile.innerHTML = `
                    <span class="math-inline">\{logoHtml\}
<h3\></span>{detail.detail_name}</h3>
                    ${detail.detail_description ? `<p>${detail.detail_description}</p>` : ''}
                    <div class="credential-container">
                        <div class="credential-field">
                            <label for="<span class="math-inline">\{usernameInputId\}"\>User\:</label\>
<input type\="text" id\="</span>{usernameInputId}" value="<span class="math-inline">\{detail\.detail\_username \|\| ''\}" placeholder\="Username" readonly\>
<button class\="copy\-btn" data\-target\="</span>{usernameInputId}">Copy</button>
                        </div>
                        <div class="credential-field">
                            <label for="<span class="math-inline">\{passwordInputId\}"\>Pass\:</label\>
<input type\="password" id\="</span>{passwordInputId}" value="<span class="math-inline">\{detail\.detail\_password \|\| ''\}" placeholder\="Password" readonly\>
<button class\="password\-toggle\-btn" data\-target\="</span>{passwordInputId}">👁️</button>
                            <button class="copy-btn" data-target="<span class="math-inline">\{passwordInputId\}"\>Copy</button\>
</div\>
<p class\="text\-xs text\-red\-500 mt\-1"\>
Note\: Credentials are stored directly in your database\. \*\*This is a HIGH SECURITY RISK\.\*\*
Consider using a dedicated password manager for sensitive data\.
</p\>
</div\>
<div class\="detail\-tile\-actions"\>
<button class\="bg\-blue\-500 text\-white hover\:bg\-blue\-600" data\-action\="view" data\-url\="</span>{detail.detail_url}">View Site</button>
                        <button class="bg-gray-400 text-gray-800 hover:bg-gray-500" data-action="edit" data-id="<span class="math-inline">\{detail\.id\}" data\-name\="</span>{detail.detail_name}" data-url="<span class="math-inline">\{detail\.detail\_url\}" data\-description\="</span>{detail.detail_description || ''}" data-logo="<span class="math-inline">\{detail\.detail\_logo\_url \|\| ''\}" data\-username\="</span>{detail.detail_username || ''}" data-password="<span class="math-inline">\{detail\.detail\_password \|\| ''\}"\>Edit</button\>
<button class\="bg\-red\-500 text\-white hover\:bg\-red\-600" data\-action\="delete\-detail" data\-id\="</span>{detail.id}" data-name="${detail.detail_name}">Delete</button>
                    </div>
                `;

                container.appendChild(detailTile); // Append the created tile
            });
        }
    } catch (error) {
        console.error('Error fetching category details in renderer:', error);
        loadingMessageElement.classList.add('text-red-600');
        loadingMessageElement.textContent = `Failed to load details: ${error.message}`;
        container.innerHTML = '';
    } finally {
        // Ensure loading message is hidden in all paths
        loadingMessageElement.style.display = 'none';
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
        radioInput.id = `<span class="math-inline">\{pickerElement\.id\}\-logo\-</span>{logo.name.replace(/\s+/g, '-').toLowerCase()}`;
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
        if (!selectedPresetFound && selectedUrl && selectedUrl !== 'custom') {
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
    const verificationModal = document.getElementById('verification-modal'); // For delete confirmation

    // This section needs to get all the UI elements it passes to functions, OR
    // these are already passed from main.js. Let's assume for now they are passed
    // to displayCategoryDetails from main.js.

    // If these DOM elements are only used here in the event listener, they can stay here.
    // However, if they are passed to the `renderPresetLogosForForm` or other exported
    // functions in this module, they should be parameters to those functions.
    // For update/add forms, the elements are likely tied directly to the page.
    const updateCategoryDetailPage = document.getElementById('update-category-detail-page'); // Page for updating detail
    const addCategoryDetailPage = document.getElementById('add-category-detail-page'); // Page for adding detail

    if (dynamicCategoryButtonsContainer) {
        dynamicCategoryButtonsContainer.addEventListener('click', async (event) => { // Made async for awaits
            const editBtn = event.target.closest('[data-action="edit"]');
            const deleteBtn = event.target.closest('[data-action="delete-detail"]');
            const viewBtn = event.target.closest('[data-action="view"]');

            if (editBtn) {
                const detail = editBtn.dataset;
                const propertyId = propertyCategoriesPage.dataset.selectedPropertyId;
                const categoryName = propertyCategoriesPage.dataset.selectedCategoryName;

                if (updateDetailIdInput) updateDetailIdInput.value = detail.id;
                if (updateDetailNameInput) updateDetailNameInput.value = detail.name;
                if (updateDetailUrlInput) updateDetailUrlInput.value = detail.url;
                if (updateDetailDescriptionInput) updateDetailDescriptionInput.value = detail.description || '';
                if (updateDetailUsernameInput) updateDetailUsernameInput.value = detail.username || '';
                if (updateDetailPasswordInput) updateDetailPasswordInput.value = detail.password || '';
                if (updateDetailCategoryNameSpan) updateDetailCategoryNameSpan.textContent = `"${categoryName}" for Property ID ${propertyId}`;

                renderPresetLogosForForm(updatePresetLogoPicker, updateCustomLogoUrlInput, detail.logo || '');
                showPage(updateCategoryDetailPage); // Use the variable

            } else if (deleteBtn) {
                const detailId = parseInt(deleteBtn.dataset.id);
                const detailName = deleteBtn.dataset.name;
                const propertyId = propertyCategoriesPage.dataset.selectedPropertyId;
                const categoryName = propertyCategoriesPage.dataset.selectedCategoryName;

                showModal(
                    verificationModal, // Use the variable
                    `detail: "${detailName}"`,
                    `deleting`,
                    async (username, password) => {
                        const success = await deleteCategoryDetail(propertyId, categoryName, detailId, username, password);
                        if (success) {
                             // IMPORTANT: After deletion, re-render the category details view.
                             // Need to get access to currentSelectedProperty to trigger this correctly.
                             // For now, these elements need to be passed from main.js or retrieved reliably.
                             const currentSelectedProperty = (await import('../services/properties.js')).getPropertyById(propertyId); // Get updated property
                             if (currentSelectedProperty) {
                                // Need main.js's DOM elements to call displayCategoryDetails.
                                // Best to let main.js handle the re-render after a service call.
                                // Temporarily accessing from here, which is risky.
                                const categoryDetailsContent = document.getElementById('category-details-content');
                                const categoryLoadingMessage = document.getElementById('category-loading-message');
                                const addCategoryDetailButtonAtBottom = document.getElementById('add-category-detail-button-bottom');
                                const presetLogoPickerAdd = document.getElementById('preset-logo-picker');
                                const customLogoUrlInputAdd = document.getElementById('custom-logo-url');
                                const updatePresetLogoPicker = document.getElementById('update-preset-logo-picker');
                                const updateCustomLogoUrlInput = document.getElementById('update-custom-logo-url');

                                await displayCategoryDetails(
                                    propertyId,
                                    categoryName,
                                    categoryDetailsContent,
                                    categoryLoadingMessage,
                                    addCategoryDetailButtonAtBottom,
                                    presetLogoPickerAdd,
                                    customLogoUrlInputAdd,
                                    updatePresetLogoPicker,
                                    updateCustomLogoUrlInput,
                                    currentSelectedProperty // Pass property
                                );
                             } else {
                                 console.error('Could not get updated property after deletion.');
                                 showCustomAlert('Detail deleted, but failed to refresh view. Please refresh manually.');
                             }
                        }
                    }
                );
            } else if (viewBtn) {
                const url = viewBtn.dataset.url;
                if (url) { window.open(url, '_blank'); } else { showCustomAlert('No URL provided.'); }
            }
        });
    }

    // Event listener for copy buttons
    dynamicCategoryButtonsContainer.addEventListener('click', (event) => {
        const copyBtn = event.target.closest('.copy-btn');
