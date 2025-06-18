// js/services/files.js

import { showCustomAlert } from '../utils/dom.js'; // Keep this for service-level alerts

// REMOVE ALL direct DOM element references and UI rendering logic from this file.
// This file only fetches data and sends/receives it from the backend.

/**
 * Fetches files and folders for a given property and folder.
 * This function now only fetches data and returns it.
 * @param {number} propertyId - The ID of the current property.
 * @param {string|null} folderId - The ID of the folder to display files from (null for root).
 * @returns {Promise<{files: Array, folders: Array}>} An object containing 'files' (array) and 'folders' (array).
 * Returns { files: [], folders: [] } on error or no data.
 */
export async function displayPropertyFiles(propertyId, folderId = null) {
    console.log('--- Entering displayPropertyFiles (fetchFileAndFolderData) ---');
    console.log(`Fetching files for propertyId: ${propertyId}, folderId: ${folderId}`);

    try {
        if (!localStorage.getItem('token')) {
            console.warn('No authentication token found. User might not be logged in.');
            return { files: [], folders: [] }; // Return empty if no token
        }

        // This URL can be either the 'pretty' one if your Netlify.toml redirect is working:
        // /api/properties/${propertyId}/files
        // OR the direct function URL if not:
        // /.netlify/functions/getFiles?property_id=${propertyId}
        //
        // Based on our last debugging, it's safer to rely on the direct function URL,
        // but your Netlify.toml should still aim for the pretty one for user experience.
        // The robust getFiles.js backend function handles both.

        // It's still fine to use the pretty URL here in the frontend.
        // The backend's updated getFiles.js will figure out the property_id regardless.
        const url = folderId
            ? `/api/properties/${propertyId}/files?folderId=${folderId}`
            : `/api/properties/${propertyId}/files`;
        console.log('API Request URL:', url);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json' // Ensure content type is set
            }
        });

        console.log('API Response Status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Response not OK. Raw error:', errorText);
            let errorMessage = 'Failed to fetch files and folders.';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.warn('Could not parse error response as JSON:', parseError);
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Successfully received file and folder data:', data);
        // This is the crucial part: it expects 'data' to be an object
        // with 'files' and 'folders' properties, thanks to the backend change.
        return {
            files: Array.isArray(data.files) ? data.files : [],
            folders: Array.isArray(data.folders) ? data.folders : []
        };
    } catch (error) {
        console.error('Error in displayPropertyFiles (fetchFileAndFolderData):', error);
        showCustomAlert('Failed to fetch files: ' + error.message, 'error');
        return { files: [], folders: [] }; // Always return expected structure
    } finally {
        console.log('--- Exiting displayPropertyFiles (fetchFileAndFolderData) ---');
    }
}

/**
 * Initiates the file upload/move process by checking file types/selection.
 * Does NOT directly read file data (FileReader) or show modals.
 * Returns true if conditions are met to proceed with the modal/next step.
 * @param {File|null} file - The file object for upload.
 * @param {Array<number>|null} filesToMove - Array of file IDs for move.
 * @returns {boolean} True if process can proceed, false otherwise.
 */
export function initFileUploadProcess(file = null, filesToMove = null) {
    if (!file && (!filesToMove || filesToMove.length === 0)) {
        showCustomAlert('No file selected for upload or files selected for move.');
        return false;
    }

    if (file) { // If it's an upload
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(file.type)) {
            showCustomAlert('Only images, PDFs, Excel, CSV, and Word files are allowed.');
            return false;
        }
    }
    return true; // Conditions met to proceed
}

/**
 * Uploads a file to Cloudinary and saves its metadata to the DB.
 * @param {number} propertyId
 * @param {string} filename
 * @param {string} fileDataAsBase64
 * @param {string} mimeType
 * @param {string|null} folderId
 * @param {string|null} folderName
 * @param {string} username
 * @param {string} password
 * @returns {Promise<boolean>} True if upload successful, false otherwise.
 */
export async function uploadFile(propertyId, filename, fileDataAsBase64, mimeType, folderId, folderName, username, password) {
    try {
        const response = await fetch('/.netlify/functions/uploadFile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                property_id: propertyId, filename, file_data_base64: fileDataAsBase64, file_mime_type: mimeType,
                uploaded_by_username: username, username, password, folder_id: folderId, folder_name: folderName
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.details || data.message || 'Unknown upload error.');
        showCustomAlert('File uploaded successfully!');
        return true;
    } catch (error) {
        console.error('Error during file upload:', error);
        showCustomAlert(`Upload failed: ${error.message}`);
        return false;
    }
}

/**
 * Moves selected files to a new folder.
 * @param {number} propertyId
 * @param {Array<number>} fileIds
 * @param {string|null} targetFolderId
 * @param {string|null} targetFolderName
 * @param {string} username
 * @param {string} password
 * @returns {Promise<boolean>} True if move successful, false otherwise.
 */
export async function moveFiles(propertyId, fileIds, targetFolderId, targetFolderName, username, password) {
    try {
        const response = await fetch('/.netlify/functions/moveFiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_ids: fileIds, property_id: propertyId, folder_id: targetFolderId, folder_name: targetFolderName, username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to move files.');
        showCustomAlert(data.message);
        return true;
    } catch (error) {
        console.error('Error moving files:', error);
        showCustomAlert(`Move failed: ${error.message}`);
        return false;
    }
}

/**
 * Creates a new folder.
 * @param {number} propertyId
 * @param {string} folderName
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{success: boolean, folderId: string|null, message: string}>} Object indicating success, new folder ID, and message.
 */
export async function createFolder(propertyId, folderName, username, password) {
    try {
        const response = await fetch('/.netlify/functions/createFolder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ property_id: propertyId, folder_name: folderName, username, password })
        });
        const data = await response.json();
        if (response.ok) {
            showCustomAlert(`Folder "${folderName}" created successfully!`);
            return { success: true, folderId: data.folder_id, message: data.message };
        } else {
            const errorMessage = data.message || 'An unknown error occurred.';
            showCustomAlert(`Failed to create folder: ${errorMessage}`);
            console.error('Error creating folder:', data.details || data.message);
            return { success: false, folderId: null, message: errorMessage };
        }
    } catch (error) {
        console.error('Network error creating folder:', error);
        const errorMessage = `Network error: ${error.message}. Could not create folder.`;
        showCustomAlert(errorMessage);
        return { success: false, folderId: null, message: errorMessage };
    }
}

/**
 * Deletes one or more files.
 * @param {number} propertyId
 * @param {Array<number>} fileIds
 * @param {string} username
 * @param {string} password
 * @returns {Promise<boolean>} True if deletion successful, false otherwise.
 */
export async function deleteFiles(propertyId, fileIds, username, password) {
    try {
        const response = await fetch('/.netlify/functions/deleteFiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_ids: fileIds, property_id: propertyId, username, password })
        });
        const data = await response.json();
        if (response.ok) {
            showCustomAlert(data.message);
            return true;
        } else {
            showCustomAlert(data.message || 'Deletion failed. Check credentials or try again.');
            return false;
        }
    } catch (error) {
        console.error('Error during file delete verification:', error);
        showCustomAlert(`Network error: ${error.message}`);
        return false;
    }
}
