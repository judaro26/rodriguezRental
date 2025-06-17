// js/ui/property-renderer.js

import { showPage, showCustomAlert } from '../utils/dom.js';
// Removed: const propertyCardsContainer = document.getElementById('property-cards-container');
// Removed: const filterAllPropertiesBtn = document.getElementById('filter-all-properties');
// Removed: const filterDomesticPropertiesBtn = document.getElementById('filter-domestic-properties');
// Removed: const filterForeignPropertiesBtn = document.getElementById('filter-foreign-properties');

let currentUIFilter = null;

/**
 * Renders a list of properties as cards in the UI.
 * @param {Array<Object>} propertiesToDisplay - The filtered list of properties to render.
 * @param {HTMLElement} containerElement - The DOM element where property cards will be rendered. // ADD THIS
 */
export function renderPropertyCards(propertiesToDisplay, containerElement) { // ADD containerElement parameter
    // Use containerElement instead of the global propertyCardsContainer
    if (!containerElement) {
        console.error('Error: Property cards container element not provided to renderPropertyCards.');
        return;
    }

    containerElement.innerHTML = ''; // Clear existing cards

    if (propertiesToDisplay.length === 0) {
        containerElement.innerHTML = `<p class="text-gray-600 w-full text-center">No properties found matching this filter. Add a new one!</p>`;
        return;
    }

    propertiesToDisplay.forEach(property => {
        const propertyCard = document.createElement('div');
        propertyCard.classList.add(
            'bg-white', 'rounded-xl', 'shadow-md', 'overflow-hidden', 'cursor-pointer',
            'hover:shadow-lg', 'transition-shadow', 'duration-200', 'border', 'border-gray-200',
            'flex', 'flex-col'
        );
        propertyCard.dataset.propertyId = property.id;

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
        containerElement.appendChild(propertyCard); // Use containerElement
    });
}

/**
 * Updates the visual highlight of the property filter buttons.
 * @param {boolean|null} activeFilter - The currently active filter (null, false, or true).
 * @param {HTMLElement} allBtn - The "All Properties" button element. // ADD THIS
 * @param {HTMLElement} domesticBtn - The "Domestic Properties" button element. // ADD THIS
 * @param {HTMLElement} foreignBtn - The "Foreign Properties" button element. // ADD THIS
 */
export function updateFilterButtonsHighlight(activeFilter, allBtn, domesticBtn, foreignBtn) { // ADD button parameters
    currentUIFilter = activeFilter;

    // Remove active styles from all buttons
    // Use the passed button elements
    if (allBtn) {
        allBtn.classList.remove('bg-blue-500', 'text-white');
        allBtn.classList.add('bg-gray-200', 'text-gray-800');
    }
    if (domesticBtn) {
        domesticBtn.classList.remove('bg-blue-500', 'text-white');
        domesticBtn.classList.add('bg-gray-200', 'text-gray-800');
    }
    if (foreignBtn) {
        foreignBtn.classList.remove('bg-blue-500', 'text-white');
        foreignBtn.classList.add('bg-gray-200', 'text-gray-800');
    }

    // Add active style to the selected button
    // Use the passed button elements
    if (activeFilter === null && allBtn) {
        allBtn.classList.remove('bg-gray-200', 'text-gray-800');
        allBtn.classList.add('bg-blue-500', 'text-white');
    } else if (activeFilter === false && domesticBtn) {
        domesticBtn.classList.remove('bg-gray-200', 'text-gray-800');
        domesticBtn.classList.add('bg-blue-500', 'text-white');
    } else if (activeFilter === true && foreignBtn) {
        foreignBtn.classList.remove('bg-gray-200', 'text-gray-800');
        foreignBtn.classList.add('bg-blue-500', 'text-white');
    }
}
