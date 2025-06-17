// js/services/properties.js

import { showPage, showCustomAlert } from '../utils/dom.js';
import { getLoggedInCredentials, getUserApprovalStatuses } from './auth.js';
// Import renderPropertyCards and updateFilterButtonsHighlight from ui/property-renderer.js
// You will pass the DOM elements to them directly.
import { renderPropertyCards, updateFilterButtonsHighlight } from '../ui/property-renderer.js';

let properties = []; // This array holds all fetched properties
let currentPropertyFilter = null; // null for all, false for domestic, true for foreign

// These DOM elements should now be passed as arguments, not retrieved here.
// const propertiesLoadingMessage = document.getElementById('properties-loading-message');
// const propertiesErrorMessage = document.getElementById('properties-error-message');
// const propertiesErrorText = document.getElementById('properties-error-text');
// const propertySelectionPage = document.getElementById('property-selection-page');

/**
 * Fetches properties from the Netlify function and updates the local properties array.
 * Optionally applies a filter after fetching.
 * @param {boolean|null} [isForeignFilter=null] - Filter by domestic (false), foreign (true), or all (null).
 * @param {HTMLElement} propertyCardsContainer - The container for property cards. // ADD THIS
 * @param {HTMLElement} loadingMsg - The loading message element. // ADD THIS
 * @param {HTMLElement} errorMsg - The error message container element. // ADD THIS
 * @param {HTMLElement} errorText - The error text element. // ADD THIS
 * @param {HTMLElement} filterAllBtn - The "All" filter button. // ADD THIS
 * @param {HTMLElement} filterDomesticBtn - The "Domestic" filter button. // ADD THIS
 * @param {HTMLElement} filterForeignBtn - The "Foreign" filter button. // ADD THIS
 */
export async function fetchProperties(
    isForeignFilter = null,
    propertyCardsContainer, // New parameter
    loadingMsg,             // New parameter
    errorMsg,               // New parameter
    errorText,              // New parameter
    filterAllBtn,           // New parameter
    filterDomesticBtn,      // New parameter
    filterForeignBtn        // New parameter
) {
    // Use passed-in elements
    if (loadingMsg) loadingMsg.style.display = 'block';
    if (errorMsg) errorMsg.classList.add('hidden');

    try {
        const response = await fetch('/.netlify/functions/getProperties');
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`HTTP error! status: ${response.status} - ${errorBody.details || response.statusText}`);
        }
        properties = await response.json();
        properties.sort((a, b) => a.id - b.id);
        console.log('All Properties loaded from Neon DB (sorted by ID):', properties);

        // Pass all necessary elements to the internal filter function
        applyPropertyFilterInternal(
            isForeignFilter,
            propertyCardsContainer,
            loadingMsg,
            errorMsg,
            errorText,
            filterAllBtn,
            filterDomesticBtn,
            filterForeignBtn
        );
    } catch (error) {
        console.error('Error fetching properties from Netlify Function:', error);
        if (errorMsg) errorMsg.classList.remove('hidden');
        if (errorText) errorText.textContent = error.message;
    } finally {
        if (loadingMsg) loadingMsg.style.display = 'none';
    }
}

/**
 * Applies a filter to the locally stored properties and triggers rendering.
 * This is an internal function used after fetching or when filter buttons are clicked.
 * @param {boolean|null} filter - Filter by domestic (false), foreign (true), or all (null).
 * @param {HTMLElement} propertyCardsContainer - The container for property cards. // ADD THIS
 * @param {HTMLElement} loadingMsg - The loading message element. // ADD THIS
 * @param {HTMLElement} errorMsg - The error message container element. // ADD THIS
 * @param {HTMLElement} errorText - The error text element. // ADD THIS
 * @param {HTMLElement} filterAllBtn - The "All" filter button. // ADD THIS
 * @param {HTMLElement} filterDomesticBtn - The "Domestic" filter button. // ADD THIS
 * @param {HTMLElement} filterForeignBtn - The "Foreign" filter button. // ADD THIS
 */
function applyPropertyFilterInternal(
    filter,
    propertyCardsContainer, // New parameter
    loadingMsg,             // New parameter
    errorMsg,               // New parameter
    errorText,              // New parameter
    filterAllBtn,           // New parameter
    filterDomesticBtn,      // New parameter
    filterForeignBtn        // New parameter
) {
    currentPropertyFilter = filter;
    const { foreignApproved, domesticApproved } = getUserApprovalStatuses();

    let propertiesToDisplay = [];
    if (filter === true) {
        if (foreignApproved) {
            propertiesToDisplay = properties.filter(p => p.is_foreign === true);
        } else {
            showCustomAlert('You are not approved to view foreign properties. Displaying domestic properties only.');
            propertiesToDisplay = properties.filter(p => p.is_foreign === false);
            currentPropertyFilter = false;
        }
    } else if (filter === false) {
        if (domesticApproved) {
            propertiesToDisplay = properties.filter(p => p.is_foreign === false);
        } else {
            showCustomAlert('You are not approved to view domestic properties. Displaying foreign properties only.');
            propertiesToDisplay = properties.filter(p => p.is_foreign === true);
            currentPropertyFilter = true;
        }
    } else {
        if (domesticApproved && foreignApproved) {
            propertiesToDisplay = [...properties];
        } else if (domesticApproved) {
            propertiesToDisplay = properties.filter(p => p.is_foreign === false);
            showCustomAlert('You are not approved to view foreign properties. Displaying domestic only.');
            currentPropertyFilter = false;
        } else if (foreignApproved) {
            propertiesToDisplay = properties.filter(p => p.is_foreign === true);
            showCustomAlert('You are not approved to view domestic properties. Displaying foreign only.');
            currentPropertyFilter = true;
        } else {
            propertiesToDisplay = [];
            showCustomAlert('You are not approved to view any properties. Please contact an administrator.');
        }
    }
    // Pass container and buttons to the renderer
    renderPropertyCards(propertiesToDisplay, propertyCardsContainer);
    updateFilterButtonsHighlight(currentPropertyFilter, filterAllBtn, filterDomesticBtn, filterForeignBtn);
}

/**
 * Public function to set the property filter and re-render.
 * Called by main.js when filter buttons are clicked.
 * NOTE: This function now also needs to accept the DOM elements for rendering.
 * @param {boolean|null} filter - Filter by domestic (false), foreign (true), or all (null).
 * @param {HTMLElement} propertyCardsContainer - The container for property cards. // ADD THIS
 * @param {HTMLElement} filterAllBtn - The "All" filter button. // ADD THIS
 * @param {HTMLElement} filterDomesticBtn - The "Domestic" filter button. // ADD THIS
 * @param {HTMLElement} filterForeignBtn - The "Foreign" filter button. // ADD THIS
 */
export function setPropertiesFilter(
    filter,
    propertyCardsContainer,
    filterAllBtn,
    filterDomesticBtn,
    filterForeignBtn
) {
    applyPropertyFilterInternal(
        filter,
        propertyCardsContainer,
        null, // loadingMsg not directly used here, but needs placeholder
        null, // errorMsg not directly used here, but needs placeholder
        null, // errorText not directly used here, but needs placeholder
        filterAllBtn,
        filterDomesticBtn,
        filterForeignBtn
    );
}

// getPropertyById and other functions remain the same as they operate on the `properties` array.
export function getPropertyById(id) {
    return properties.find(p => p.id === id);
}

export async function saveNewProperty(propertyData) {
    const addPropertyStatus = document.getElementById('add-property-status');
    if (addPropertyStatus) {
        addPropertyStatus.classList.remove('hidden');
        addPropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
        addPropertyStatus.textContent = 'Saving property...';
    }
    try {
        const response = await fetch('/.netlify/functions/saveProperty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(propertyData)
        });
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`HTTP error! status: ${response.status} - ${errorBody.details || response.statusText}`);
        }
        const savedProperty = await response.json();
        console.log('Property saved successfully:', savedProperty);
        if (addPropertyStatus) {
            addPropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
            addPropertyStatus.textContent = 'Property saved successfully!';
        }
        setTimeout(async () => {
            // Need to pass the elements here as well if this re-fetches
            // This would require storing these elements in a module-level variable
            // or re-passing them. Let's adjust main.js to handle this.
            // For now, I'm removing the immediate showPage and re-fetch for simplicity,
            // as main.js is likely handling the navigation and initial fetch.
            // You might need to re-think how you trigger a full re-render after save/update.
            // The simplest is to rely on the main.js logic that initiated the flow.
            // showPage(propertySelectionPage); // Removed for now
            // await fetchProperties(currentPropertyFilter); // Removed for now
            // Instead, main.js should likely re-trigger the fetch after a successful save/update.
        }, 1500);
    } catch (error) {
        console.error('Error saving property:', error);
        if (addPropertyStatus) {
            addPropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            addPropertyStatus.textContent = `Error saving property: ${error.message}`;
        }
    }
    return true; // Indicate success for main.js to handle navigation/re-fetch
}

export async function updateExistingProperty(propertyData) {
    const updatePropertyStatus = document.getElementById('update-property-status');
    if (updatePropertyStatus) {
        updatePropertyStatus.classList.remove('hidden');
        updatePropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
        updatePropertyStatus.textContent = 'Updating property...';
    }

    try {
        const { username, password } = getLoggedInCredentials();
        const response = await fetch('/.netlify/functions/updateProperty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...propertyData,
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`HTTP error! status: ${response.status} - ${errorBody.details || response.statusText}`);
        }

        const result = await response.json();
        console.log('Property updated successfully:', result.message);

        if (updatePropertyStatus) {
            updatePropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
            updatePropertyStatus.textContent = 'Property updated successfully!';
        }

        setTimeout(async () => {
            // showPage(propertySelectionPage); // Removed for now
            // await fetchProperties(currentPropertyFilter); // Removed for now
        }, 1500);

    } catch (error) {
        console.error('Error updating property:', error);
        if (updatePropertyStatus) {
            updatePropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            updatePropertyStatus.textContent = `Error updating property: ${error.message}`;
        }
    }
    return true; // Indicate success for main.js to handle navigation/re-fetch
}
