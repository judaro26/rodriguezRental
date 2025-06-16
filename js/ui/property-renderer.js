// js/ui/property-renderer.js

import { showPage, showCustomAlert } from '../utils/dom.js'; // Assuming you still use showCustomAlert here
import { getPropertyById, fetchProperties } from '../services/properties.js'; // Import data source and fetcher

// DOM elements that this renderer needs to interact with
const propertyCardsContainer = document.getElementById('property-cards-container');
const filterAllPropertiesBtn = document.getElementById('filter-all-properties');
const filterDomesticPropertiesBtn = document.getElementById('filter-domestic-properties');
const filterForeignPropertiesBtn = document.getElementById('filter-foreign-properties');

// Function to store/retrieve current UI selection state (if needed across page refreshes)
let currentUIFilter = null; // null for all, false for domestic, true for foreign

/**
 * Renders a list of properties as cards in the UI.
 * @param {Array<Object>} propertiesToDisplay - The filtered list of properties to render.
 */
export function renderPropertyCards(propertiesToDisplay) {
    if (!propertyCardsContainer) return;

    propertyCardsContainer.innerHTML = ''; // Clear existing cards

    if (propertiesToDisplay.length === 0) {
        propertyCardsContainer.innerHTML = `<p class="text-gray-600 w-full text-center">No properties found matching this filter. Add a new one!</p>`;
        return;
    }

    propertiesToDisplay.forEach(property => {
        const propertyCard = document.createElement('div');
        propertyCard.classList.add(
            'bg-white', 'rounded-xl', 'shadow-md', 'overflow-hidden', 'cursor-pointer',
            'hover:shadow-lg', 'transition-shadow', 'duration-200', 'border', 'border-gray-200',
            'flex', 'flex-col'
        );
        propertyCard.dataset.propertyId = property.id; // Store ID on the card

        const imageUrl = property.image || 'https://placehold.co/400x250/CCCCCC/FFFFFF?text=No+Image';

        propertyCard.innerHTML = `
            <img src="${imageUrl}" alt="${property.title}" class="w-full h-40 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/400x250/CCCCCC/FFFFFF?text=Image+Load+Error';">
            <div class="p-4 flex-grow">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${property.title}</h3>
                <p class="text-gray-600 text-sm">${property.description}</p>
            </div>
            <div class="p-4 pt-0 flex justify-between gap-2">
                <button class="w-1/2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold" data-action="view-property-details" data-property-id="${property.id}">View Details</button>
                <button class="w-1/2 bg-gray-400 text-gray-800 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200 font-semibold" data-action="edit-property" data-property-id="${property.id}">Edit</button>
            </div>
        `;
        propertyCardsContainer.appendChild(propertyCard);

        // Event listeners are set in main.js, which acts as the orchestrator.
        // This renderer focuses purely on creating the HTML.
    });
}

/**
 * Updates the visual highlight of the property filter buttons.
 * @param {boolean|null} activeFilter - The currently active filter (null, false, or true).
 */
export function updateFilterButtonsHighlight(activeFilter) {
    currentUIFilter = activeFilter; // Update internal state

    // Remove active styles from all buttons
    if (filterAllPropertiesBtn) {
        filterAllPropertiesBtn.classList.remove('bg-blue-500', 'text-white');
        filterAllPropertiesBtn.classList.add('bg-gray-200', 'text-gray-800');
    }
    if (filterDomesticPropertiesBtn) {
        filterDomesticPropertiesBtn.classList.remove('bg-blue-500', 'text-white');
        filterDomesticPropertiesBtn.classList.add('bg-gray-200', 'text-gray-800');
    }
    if (filterForeignPropertiesBtn) {
        filterForeignPropertiesBtn.classList.remove('bg-blue-500', 'text-white');
        filterForeignPropertiesBtn.classList.add('bg-gray-200', 'text-gray-800');
    }

    // Add active style to the selected button
    if (activeFilter === null && filterAllPropertiesBtn) {
        filterAllPropertiesBtn.classList.remove('bg-gray-200', 'text-gray-800');
        filterAllPropertiesBtn.classList.add('bg-blue-500', 'text-white');
    } else if (activeFilter === false && filterDomesticPropertiesBtn) {
        filterDomesticPropertiesBtn.classList.remove('bg-gray-200', 'text-gray-800');
        filterDomesticPropertiesBtn.classList.add('bg-blue-500', 'text-white');
    } else if (activeFilter === true && filterForeignPropertiesBtn) {
        filterForeignPropertiesBtn.classList.remove('bg-gray-200', 'text-gray-800');
        filterForeignPropertiesBtn.classList.add('bg-blue-500', 'text-white');
    }
}
