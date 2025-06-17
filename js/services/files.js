// js/services/files.js

import { showCustomAlert, showModal, hideModal } from '../utils/dom.js'; // Keep for service-level alerts/modals
import { getLoggedInCredentials } from './auth.js';
// REMOVE imports of UI-specific helpers and renderers
// import { getFileIcon, formatFileSize } from '../utils/helpers.js'; // These are for rendering, move to ui/file-renderer.js
// REMOVE all document.getElementById calls from the top-level scope.
// Remove all variables related to UI elements: folders, currentFolder, selectedFiles, etc.
// let folders = []; // This will now be managed by main.js or a state module
// let currentFolder = 'all'; // This will now be managed by main.js
// let selectedFiles = new Set(); // This will now be managed by main.js or ui/file-renderer.js directly

// DOM elements should NOT be directly accessed here for rendering purposes.
// They will be passed from main.js when needed for UI-related feedback.
// const filesListContainer = document.getElementById('files-list-container'); // REMOVE
// ... REMOVE ALL OTHER document.getElementById from this file's top level ...


/**
 * Fetches files and folders for a given property and folder.
 * This function now only fetches data and returns it.
 * @param {number} propertyId - The ID of the current property.
 * @param {string|null} folderId - The ID of the folder to display files from (null for root, not 'all').
 * @returns {Promise<{files: Array, folders: Array}>} An object containing 'files' (array) and 'folders' (array).
 * Returns { files: [], folders: [] } on error or no data.
 */
export async function displayPropertyFiles(propertyId, folderId = null) { // Changed default from 'all' to null for API consistency
    try {
        const { username, password } = getLoggedInCredentials();

        // Fetch folders
        const foldersResponse = await fetch('/.netlify/functions/getFolders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ property_id: propertyId, username, password })
        });
        if (!foldersResponse.ok) {
            const errorBody = await foldersResponse.json();
            throw new Error(`Failed to load folders: ${errorBody.message || foldersResponse.statusText}`);
        }
        const foldersData = await foldersResponse.json();

        // Fetch files
        const filesResponse = await fetch(`/.netlify/functions/getFiles?property_id=${propertyId}`);
        if (!filesResponse.ok) {
            const errorBody = await filesResponse.json();
            throw new Error(`Failed to load files: ${errorBody.message || filesResponse.statusText}`);
        }
        const allFilesData = await filesResponse.json();

        // Return raw data. Filtering and rendering will happen in main.js/UI layer.
        return {
            files: Array.isArray(allFilesData) ? allFilesData : [],
            folders: Array.isArray(foldersData) ? foldersData : []
        };

    } catch (error) {
        console.error('Error fetching files/folders from Netlify Function:', error);
        // showCustomAlert is a utility, so it's acceptable here for critical service errors.
        showCustomAlert(`Error loading files and folders: ${error.message}`);
        return { files: [], folders: [] }; // Always return an empty structured object on error
    }
}

/**
 * Initiates the file upload process, including showing folder selection.
 * This function handles the *data part* of preparing for upload/move.
 * It does not directly show the modal or process the file (FileReader).
 * It will return whether a file is ready to upload/move.
 * @param {number} propertyId - The ID of the property.
 * @param {File|null} file - The File object to upload (null if for move).
 * @param {number[]} [filesToMove=null] - Array of file IDs to move (null if for upload).
 * @returns {Promise<boolean>} True if process initiated successfully (modal shown or data prepared), false otherwise.
 */
export async function initFileUploadProcess(propertyId, file = null, filesToMove = null) {
    // This function will now only prepare the data and trigger the modal *via a callback or event*.
    // The modal itself (showUploadFolderSelectionModal) will be called from main.js or a UI module.

    if (!file && !filesToMove?.length) {
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
    // No longer directly handling FileReader or showing the modal here.
    // This function's role is to verify the file/intent and then signal to main.js
    // that the modal needs to be shown, perhaps passing the file/filesToMove along.
    // We'll return true to indicate that `main.js` should proceed to show the modal.
    return true; // Indicate that conditions are met to proceed with modal
}


/**
 * Uploads a file to Cloudinary and saves its metadata to the DB.
 * This function is pure service logic.
 * @param {number} propertyId - The ID of the property.
 * @param {string} filename - The name of the file.
 * @param {string} fileDataAsBase64 - The base64 encoded string of the file.
 * @param {string} mimeType - The MIME type of the file.
 * @param {string|null} folderId - The ID of the folder to save to (null if root).
 * @param {string|null} folderName - The name of the folder (null if root).
 * @param {string} username - User's username for auth.
 * @param {string} password - User's password for auth.
 * @returns {Promise<boolean>} True if upload successful, false otherwise.
 */
export async function uploadFile(propertyId, filename, fileDataAsBase64, mimeType, folderId, folderName, username, password) {
    // UI status updates should ideally be handled by main.js/UI layer.
    // For now, I'll allow direct access to fileUploadStatus as a concession for quick fix.
    const fileUploadStatusElement = document.getElementById('file-upload-status');
    if (fileUploadStatusElement) {
        fileUploadStatusElement.classList.remove('hidden');
        fileUploadStatusElement.className = 'mt-3 text-center text-sm bg-blue-100 text-blue-700';
        fileUploadStatusElement.textContent = 'Uploading file...';
    }

    try {
        const response = await fetch('/.netlify/functions/uploadFile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                property_id: propertyId,
                filename: filename,
                file_data_base64: fileDataAsBase64,
                file_mime_type: mimeType,
                uploaded_by_username: username,
                username: username,
                password: password,
                folder_id: folderId,
                folder_name: folderName
            })
        });

        const data = await response.json();

        if (response.ok) {
            if (fileUploadStatusElement) {
                fileUploadStatusElement.className = 'mt-3 text-center text-sm bg-green-100 text-green-700';
                fileUploadStatusElement.textContent = 'File uploaded successfully!';
            }
            return true;
        } else {
            throw new Error(data.details || data.message || 'Unknown upload error.');
        }
    } catch (error) {
        console.error('Error during file upload:', error);
        if (fileUploadStatusElement) {
            fileUploadStatusElement.classList.remove('hidden');
            fileUploadStatusElement.className = 'mt-3 text-center text-sm bg-red-100 text-red-700';
            fileUploadStatusElement.textContent = `Upload failed: ${error.message}`;
        }
        return false;
    } finally {
        // Clearing input and hiding status after delay should be handled by main.js
        // fileUploadInput.value = ''; // REMOVE
        // setTimeout(() => { if (fileUploadStatus) fileUploadStatus.classList.add('hidden'); }, 3000); // REMOVE
    }
}


/**
 * Moves selected files to a new folder or to no folder.
 * @param {number} propertyId - The ID of the property.
 * @param {number[]} fileIds - An array of file IDs to move.
 * @param {string|null} targetFolderId - The ID of the target folder (null for root).
 * @param {string|null} targetFolderName - The name of the target folder (null for root).
 * @param {string} username - User's username for auth.
 * @param {string} password - User's password for auth.
 * @returns {Promise<boolean>} True if move successful, false otherwise.
 */
export async function moveFiles(propertyId, fileIds, targetFolderId, targetFolderName, username, password) {
    // UI status updates should ideally be handled by main.js/UI layer.
    const verificationStatusElement = document.getElementById('verification-status');
    if (verificationStatusElement) {
        verificationStatusElement.classList.remove('hidden');
        verificationStatusElement.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
        verificationStatusElement.textContent = 'Verifying and moving files...';
    }
    try {
        const response = await fetch('/.netlify/functions/moveFiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file_ids: fileIds,
                property_id: propertyId,
                folder_id: targetFolderId,
                folder_name: targetFolderName,
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to move files.');
        }

        showCustomAlert(data.message);
        return true;

    } catch (error) {
        console.error('Error moving files:', error);
        if (verificationStatusElement) {
            verificationStatusElement.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            verificationStatusElement.textContent = `Move failed: ${error.message}`;
        }
        return false;
    }
}

/**
 * Creates a new folder.
 * @param {number} propertyId - The ID of the property.
 * @param {string} folderName - The name of the new folder.
 * @param {string} username - User's username for auth.
 * @param {string} password - User's password for auth.
 * @returns {Promise<boolean>} True if folder created successfully, false otherwise.
 */
export async function createFolder(propertyId, folderName, username, password) {
    try {
        const response = await fetch('/.netlify/functions/createFolder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                property_id: propertyId,
                folder_name: folderName,
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            showCustomAlert(`Folder "${folderName}" created successfully!`);
            return true;
        } else {
            showCustomAlert(`Failed to create folder: ${data.message || 'An unknown error occurred.'}`);
            console.error('Error creating folder:', data.details || data.message);
            return false;
        }
    } catch (error) {
        console.error('Network error creating folder:', error);
        showCustomAlert(`Network error: ${error.message}. Could not create folder.`);
        return false;
    }
}

/**
 * Deletes one or more files from a property.
 * @param {number} propertyId - The ID of the property.
 * @param {number[]} fileIds - An array of file IDs to delete.
 * @param {string} username - User's username for verification.
 * @param {string} password - User's password for verification.
 * @returns {Promise<boolean>} True if deletion successful, false otherwise.
 */
export async function deleteFiles(propertyId, fileIds, username, password) {
    // UI status updates should ideally be handled by main.js/UI layer.
    const verificationStatusElement = document.getElementById('verification-status');
    if (verificationStatusElement) {
        verificationStatusElement.classList.remove('hidden');
        verificationStatusElement.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
        verificationStatusElement.textContent = 'Verifying and deleting files...';
    }
    try {
        const response = await fetch('/.netlify/functions/deleteFiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file_ids: fileIds,
                property_id: propertyId,
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            if (verificationStatusElement) {
                verificationStatusElement.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                verificationStatusElement.textContent = data.message;
            }
            return true;
        } else {
            if (verificationStatusElement) {
                verificationStatusElement.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                verificationStatusElement.textContent = data.message || 'Deletion failed. Check credentials or try again.';
                document.getElementById('modal-password').value = '';
            }
            return false;
        }
    } catch (error) {
        console.error('Error during file delete verification:', error);
        if (verificationStatusElement) {
            verificationStatusElement.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            verificationStatusElement.textContent = `Network error: ${error.message}`;
        }
        return false;
    }
}

// REMOVE ALL EVENT LISTENERS FROM THIS FILE.
// They belong in main.js, or in ui/file-renderer.js if they are directly related to UI components managed there.
// document.addEventListener('DOMContentLoaded', () => { ... }); // REMOVE THIS ENTIRE BLOCK
