// js/services/properties.js

import { showPage, showCustomAlert } from '../utils/dom.js';
import { getLoggedInCredentials, getUserApprovalStatuses } from './auth.js';
import { renderPropertyCards, updateFilterButtonsHighlight } from '../ui/property-renderer.js';

let properties = []; // This array holds all fetched properties
let currentPropertyFilter = null; // null for all, false for domestic, true for foreign

// DOM elements needed by this module
const propertiesLoadingMessage = document.getElementById('properties-loading-message');
const propertiesErrorMessage = document.getElementById('properties-error-message');
const propertiesErrorText = document.getElementById('properties-error-text');
const propertySelectionPage = document.getElementById('property-selection-page'); // Needed for showPage calls


/**
 * Fetches properties from the Netlify function and updates the local properties array.
 * Optionally applies a filter after fetching.
 * @param {boolean|null} [isForeignFilter=null] - Filter by domestic (false), foreign (true), or all (null).
 */
export async function fetchProperties(isForeignFilter = null) {
    if (propertiesLoadingMessage) propertiesLoadingMessage.style.display = 'block';
    if (propertiesErrorMessage) propertiesErrorMessage.classList.add('hidden');
    // propertyCardsContainer is managed by property-renderer, it will be cleared there

    try {
        const response = await fetch('/.netlify/functions/getProperties');
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`HTTP error! status: ${response.status} - ${errorBody.details || response.statusText}`);
        }
        properties = await response.json();
        properties.sort((a, b) => a.id - b.id);
        console.log('All Properties loaded from Neon DB (sorted by ID):', properties);

        applyPropertyFilterInternal(isForeignFilter); // Use internal filter function after fetching
    } catch (error) {
        console.error('Error fetching properties from Netlify Function:', error);
        if (propertiesErrorMessage) propertiesErrorMessage.classList.remove('hidden');
        if (propertiesErrorText) propertiesErrorText.textContent = error.message;
    } finally {
        if (propertiesLoadingMessage) propertiesLoadingMessage.style.display = 'none';
    }
}

/**
 * Applies a filter to the locally stored properties and triggers rendering.
 * This is an internal function used after fetching or when filter buttons are clicked.
 * @param {boolean|null} filter - Filter by domestic (false), foreign (true), or all (null).
 */
function applyPropertyFilterInternal(filter) {
    currentPropertyFilter = filter;
    const { foreignApproved, domesticApproved } = getUserApprovalStatuses(); // Get user permissions

    let propertiesToDisplay = [];
    if (filter === true) { // Filter for Foreign
        if (foreignApproved) {
            propertiesToDisplay = properties.filter(p => p.is_foreign === true);
        } else {
            showCustomAlert('You are not approved to view foreign properties. Displaying domestic properties only.');
            propertiesToDisplay = properties.filter(p => p.is_foreign === false);
            currentPropertyFilter = false; // Adjust filter back if not approved
        }
    } else if (filter === false) { // Filter for Domestic
        if (domesticApproved) {
            propertiesToDisplay = properties.filter(p => p.is_foreign === false);
        } else {
            showCustomAlert('You are not approved to view domestic properties. Displaying foreign properties only.');
            propertiesToDisplay = properties.filter(p => p.is_foreign === true);
            currentPropertyFilter = true; // Adjust filter back if not approved
        }
    } else { // Filter for All (null)
        if (domesticApproved && foreignApproved) {
            propertiesToDisplay = [...properties];
        } else if (domesticApproved) {
            propertiesToDisplay = properties.filter(p => p.is_foreign === false);
            showCustomAlert('You are not approved to view foreign properties. Displaying domestic only.');
            currentPropertyFilter = false; // Adjust filter
        } else if (foreignApproved) {
            propertiesToDisplay = properties.filter(p => p.is_foreign === true);
            showCustomAlert('You are not approved to view domestic properties. Displaying foreign only.');
            currentPropertyFilter = true; // Adjust filter
        } else {
            propertiesToDisplay = [];
            showCustomAlert('You are not approved to view any properties. Please contact an administrator.');
        }
    }
    renderPropertyCards(propertiesToDisplay); // Pass properties to the renderer
    updateFilterButtonsHighlight(currentPropertyFilter); // Pass currentFilter to the renderer
}

/**
 * Public function to set the property filter and re-render.
 * Called by main.js when filter buttons are clicked.
 * @param {boolean|null} filter - Filter by domestic (false), foreign (true), or all (null).
 */
export function setPropertiesFilter(filter) {
    applyPropertyFilterInternal(filter);
}

/**
 * Retrieves a property by its ID from the locally stored list.
 * @param {number} id - The ID of the property.
 * @returns {object|undefined} - The property object or undefined if not found.
 */
export function getPropertyById(id) {
    return properties.find(p => p.id === id);
}

/**
 * Saves a new property via Netlify function.
 * @param {object} propertyData - The data for the new property.
 */
export async function saveNewProperty(propertyData) {
    const addPropertyStatus = document.getElementById('add-property-status'); // Get status element here
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
            showPage(propertySelectionPage);
            await fetchProperties(currentPropertyFilter); // Re-fetch all properties to update the list
        }, 1500);
    } catch (error) {
        console.error('Error saving property:', error);
        if (addPropertyStatus) {
            addPropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            addPropertyStatus.textContent = `Error saving property: ${error.message}`;
        }
    }
}

/**
 * Updates an existing property via Netlify function.
 * @param {object} propertyData - The updated data for the property (must include ID).
 */
export async function updateExistingProperty(propertyData) {
    const updatePropertyStatus = document.getElementById('update-property-status'); // Get status element here
    if (updatePropertyStatus) {
        updatePropertyStatus.classList.remove('hidden');
        updatePropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
        updatePropertyStatus.textContent = 'Updating property...';
    }

    try {
        const { username, password } = getLoggedInCredentials(); // Get credentials for verification
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
            showPage(propertySelectionPage);
            await fetchProperties(currentPropertyFilter); // Re-fetch all properties to update the list
        }, 1500);

    } catch (error) {
        console.error('Error updating property:', error);
        if (updatePropertyStatus) {
            updatePropertyStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            updatePropertyStatus.textContent = `Error updating property: ${error.message}`;
        }
    }
}
