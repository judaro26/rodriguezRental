// js/services/categories.js

import { showCustomAlert } from '../utils/dom.js'; // Only keep utility imports
import { getLoggedInCredentials } from './auth.js';
// Removed: presetLogos - not directly used here for rendering now
// Removed: addNewCategoryStatus, addDetailStatus, updateDetailStatus - handled by main.js or separate UI status functions

// This function now ONLY fetches and returns data
export async function getCategoryDetails(propertyId, categoryName) {
    try {
        const response = await fetch(`/.netlify/functions/getCategoryDetails?property_id=${propertyId}&category_name=${encodeURIComponent(categoryName)}`);

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`HTTP error! status: ${response.status} - ${errorBody.details || response.statusText}`);
        }

        const details = await response.json();
        console.log(`Fetched details for ${categoryName} from backend:`, details);

        // Crucial: Ensure it ALWAYS returns an array, even if empty or null from backend
        return Array.isArray(details) ? details : [];

    } catch (error) {
        console.error('Error fetching category details from Netlify Function:', error);
        showCustomAlert(`Error loading category details: ${error.message}`);
        return []; // Important: Return an empty array on error so .length doesn't fail
    }
}

// addCategoryDetail - will be simplified to return success/failure
export async function addCategoryDetail(propertyId, categoryName, detailData) {
    const addDetailStatus = document.getElementById('add-detail-status'); // Temp: get status element here
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
        return true; // Indicate success

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
        return false; // Indicate failure
    }
}

// updateCategoryDetail - simplified to return success/failure
export async function updateCategoryDetail(detailData) {
    const { username, password } = getLoggedInCredentials();
    const updateDetailStatus = document.getElementById('update-detail-status'); // Temp: get status element here

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

        const result = await response.json();
        console.log('Category detail updated:', result.message);

        if (updateDetailStatus) {
            updateDetailStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
            updateDetailStatus.textContent = 'Detail updated successfully!';
        }
        return true; // Indicate success

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
        return false; // Indicate failure
    }
}

// deleteCategoryDetail - simplified to return success/failure
export async function deleteCategoryDetail(propertyId, categoryName, detailId, username, password) {
    const verificationStatus = document.getElementById('verification-status'); // Temp: get status element here
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
            return true; // Indicate success
        } else {
            if (verificationStatus) {
                verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                verificationStatus.textContent = data.message || 'Deletion failed. Check credentials or try again.';
                document.getElementById('modal-password').value = '';
            }
            return false; // Indicate failure
        }
    } catch (error) {
        console.error('Error during detail delete verification:', error);
        if (verificationStatus) {
            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            verificationStatus.textContent = `Network error: ${error.message}`;
        }
        return false; // Indicate failure
    }
}

// addNewCategoryToProperty - simplified to return success/failure
export async function addNewCategoryToProperty(propertyId, newCategoryName, currentSelectedProperty) {
    const addNewCategoryStatus = document.getElementById('add-new-category-status'); // Temp: get status element here
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
        return true; // Indicate success

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
        return false; // Indicate failure
    }
}

// IMPORTANT: renderPresetLogosForForm should NOT be in services/categories.js.
// It belongs in ui/category-renderer.js as it's purely UI rendering.
// export function renderPresetLogosForForm(...) { ... }
