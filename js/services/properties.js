// js/services/properties.js

import { showPage, showCustomAlert } from '../utils/dom.js';
import { getLoggedInCredentials, getUserApprovalStatuses } from './auth.js';
import { renderPropertyCards, updateFilterButtonsHighlight } from '../ui/property-renderer.js';

let properties = []; // This array holds all fetched properties
let currentPropertyFilter = null; // null for all, false for domestic, true for foreign

// Removed: All document.getElementById calls for DOM elements.
// These will now be passed as arguments from main.js.

/**
 * Fetches properties from the Netlify function and updates the local properties array.
 * Optionally applies a filter after fetching.
 * @param {boolean|null} [isForeignFilter=null] - Filter by domestic (false), foreign (true), or all (null).
 * @param {HTMLElement} propertyCardsContainer - The container for property cards.
 * @param {HTMLElement} loadingMsg - The loading message element.
 * @param {HTMLElement} errorMsg - The error message container element.
 * @param {HTMLElement} errorText - The error text element.
 * @param {HTMLElement} filterAllBtn - The "All" filter button.
 * @param {HTMLElement} filterDomesticBtn - The "Domestic" filter button.
 * @param {HTMLElement} filterForeignBtn - The "Foreign" filter button.
 * @param {HTMLElement} propertySelectionPageElement - The property selection page element (for showPage). // ADDED
 */
export async function fetchProperties(
    isForeignFilter = null,
    propertyCardsContainer,
    loadingMsg,
    errorMsg,
    errorText,
    filterAllBtn,
    filterDomesticBtn,
    filterForeignBtn,
    propertySelectionPageElement // ADDED
) {
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
    return true; // Indicate success for main.js to handle navigation/re-fetch
}

/**
 * Applies a filter to the locally stored properties and triggers rendering.
 * This is an internal function used after fetching or when filter buttons are clicked.
 * @param {boolean|null} filter - Filter by domestic (false), foreign (true), or all (null).
 * @param {HTMLElement} propertyCardsContainer - The container for property cards.
 * @param {HTMLElement} loadingMsg - The loading message element.
 * @param {HTMLElement} errorMsg - The error message container element.
 * @param {HTMLElement} errorText - The error text element.
 * @param {HTMLElement} filterAllBtn - The "All" filter button.
 * @param {HTMLElement} filterDomesticBtn - The "Domestic" filter button.
 * @param {HTMLElement} filterForeignBtn - The "Foreign" filter button.
 */
function applyPropertyFilterInternal(
    filter,
    propertyCardsContainer,
    loadingMsg, // Still passed, but `applyPropertyFilterInternal` doesn't directly use them for display/hide
    errorMsg,   // Still passed, but `applyPropertyFilterInternal` doesn't directly use them for display/hide
    errorText,  // Still passed, but `applyPropertyFilterInternal` doesn't directly use them for display/hide
    filterAllBtn,
    filterDomesticBtn,
    filterForeignBtn
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
    renderPropertyCards(propertiesToDisplay, propertyCardsContainer);
    updateFilterButtonsHighlight(currentPropertyFilter, filterAllBtn, filterDomesticBtn, filterForeignBtn);
}

/**
 * Public function to set the property filter and re-render.
 * Called by main.js when filter buttons are clicked.
 * NOTE: This function now also needs to accept the DOM elements for rendering.
 * @param {boolean|null} filter - Filter by domestic (false), foreign (true), or all (null).
 * @param {HTMLElement} propertyCardsContainer - The container for property cards.
 * @param {HTMLElement} filterAllBtn - The "All" filter button.
 * @param {HTMLElement} filterDomesticBtn - The "Domestic" filter button.
 * @param {HTMLElement} filterForeignBtn - The "Foreign" filter button.
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
        null, // loadingMsg - not used by internal filter logic, only by fetch
        null, // errorMsg - not used by internal filter logic, only by fetch
        null, // errorText - not used by internal filter logic, only by fetch
        filterAllBtn,
        filterDomesticBtn,
        filterForeignBtn
    );
}

export function getPropertyById(id) {
    return properties.find(p => p.id === id);
}

/**
 * Saves a new property via Netlify function.
 * @param {object} propertyData - The data for the new property.
 * @param {HTMLElement} propertySelectionPageElement - The property selection page element (for showPage). // ADDED
 * @param {HTMLElement} propertyCardsContainer - The container for property cards. // ADDED for re-fetch
 * @param {HTMLElement} loadingMsg - The loading message element. // ADDED for re-fetch
 * @param {HTMLElement} errorMsg - The error message container element. // ADDED for re-fetch
 * @param {HTMLElement} errorText - The error text element. // ADDED for re-fetch
 * @param {HTMLElement} filterAllBtn - The "All" filter button. // ADDED for re-fetch
 * @param {HTMLElement} filterDomesticBtn - The "Domestic" filter button. // ADDED for re-fetch
 * @param {HTMLElement} filterForeignBtn - The "Foreign" filter button. // ADDED for re-fetch
 */
export async function saveNewProperty(
    propertyData,
    propertySelectionPageElement, // ADDED
    propertyCardsContainer,
    loadingMsg,
    errorMsg,
    errorText,
    filterAllBtn,
    filterDomesticBtn,
    filterForeignBtn
) {
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
            showPage(propertySelectionPageElement); // Use the passed element
            await fetchProperties(
                currentPropertyFilter,
                propertyCardsContainer,
                loadingMsg,
                errorMsg,
                errorText,
                filterAllBtn,
                filterDomesticBtn,
                filterForeignBtn,
                propertySelectionPageElement // Pass it here too for recursion if needed
            );
        }, 1500);
    } catch (error) {
        console.error('Error saving property:', error);
        if (addPropertyStatus) {
            addPropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            addPropertyStatus.textContent = `Error saving property: ${error.message}`;
        }
        return false; // Indicate failure
    }
    return true; // Indicate success
}

/**
 * Updates an existing property via Netlify function.
 * @param {object} propertyData - The updated data for the property (must include ID).
 * @param {HTMLElement} propertySelectionPageElement - The property selection page element (for showPage). // ADDED
 * @param {HTMLElement} propertyCardsContainer - The container for property cards. // ADDED for re-fetch
 * @param {HTMLElement} loadingMsg - The loading message element. // ADDED for re-fetch
 * @param {HTMLElement} errorMsg - The error message container element. // ADDED for re-fetch
 * @param {HTMLElement} errorText - The error text element. // ADDED for re-fetch
 * @param {HTMLElement} filterAllBtn - The "All" filter button. // ADDED for re-fetch
 * @param {HTMLElement} filterDomesticBtn - The "Domestic" filter button. // ADDED for re-fetch
 * @param {HTMLElement} filterForeignBtn - The "Foreign" filter button. // ADDED for re-fetch
 */
export async function updateExistingProperty(
    propertyData,
    propertySelectionPageElement, // ADDED
    propertyCardsContainer,
    loadingMsg,
    errorMsg,
    errorText,
    filterAllBtn,
    filterDomesticBtn,
    filterForeignBtn
) {
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
            showPage(propertySelectionPageElement); // Use the passed element
            await fetchProperties(
                currentPropertyFilter,
                propertyCardsContainer,
                loadingMsg,
                errorMsg,
                errorText,
                filterAllBtn,
                filterDomesticBtn,
                filterForeignBtn,
                propertySelectionPageElement // Pass it here too for recursion if needed
            );
        }, 1500);

    } catch (error) {
        console.error('Error updating property:', error);
        if (updatePropertyStatus) {
            updatePropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            updatePropertyStatus.textContent = `Error updating property: ${error.message}`;
        }
        return false; // Indicate failure
    }
    return true; // Indicate success
}
