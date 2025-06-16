// js/services/files.js

import { showCustomAlert, showModal, hideModal } from '../utils/dom.js';
import { getLoggedInCredentials } from './auth.js';
import { getFileIcon, formatFileSize } from '../utils/helpers.js';

let folders = []; // Stores the logical folder data for the current property
let currentFolder = 'all'; // 'all' or a folder ID
let selectedFiles = new Set(); // Tracks selected files by ID for bulk actions

// DOM elements this module directly interacts with
const filesListContainer = document.getElementById('files-list-container');
const createFolderButton = document.getElementById('create-folder-button');
const moveToFolderButton = document.getElementById('move-to-folder-button');
const deleteSelectedFilesButton = document.getElementById('delete-selected-files-button');
const foldersList = document.getElementById('folders-list');
const currentFolderTitle = document.getElementById('current-folder-title');
const fileUploadInput = document.getElementById('file-upload-input');
const fileUploadStatus = document.getElementById('file-upload-status');
const uploadFolderModal = document.getElementById('upload-folder-modal');
const folderSelectDropdown = document.getElementById('folder-select-dropdown');
const newFolderNameContainer = document.getElementById('new-folder-name-container');
const newFolderNameInput = document.getElementById('new-folder-name-input');
const cancelFolderSelectionBtn = document.getElementById('cancel-folder-selection-btn');
const confirmFolderSelectionBtn = document.getElementById('confirm-folder-selection-btn');
const uploadFolderModalStatus = document.getElementById('upload-folder-modal-status');
const verificationModal = document.getElementById('verification-modal'); // For delete/move verification


/**
 * Displays files and folders for a given property and folder.
 * Refreshes the folder list and file list UI.
 * @param {number} propertyId - The ID of the current property.
 * @param {string|null} folderId - The ID of the folder to display files from (null or 'all' for all files).
 */
export async function displayPropertyFiles(propertyId, folderId = 'all') {
    currentFolder = folderId; // Update internal state

    if (!filesListContainer || !propertyId) return;

    filesListContainer.innerHTML = `<p class="text-gray-600 p-4 text-center">Loading files and folders...</p>`;
    if (currentFolderTitle) {
        currentFolderTitle.textContent =
            folderId === 'all' ? 'All Files' : `Folder: ${folders.find(f => f.id === folderId)?.name || folderId}`;
    }

    try {
        // 1. Fetch ALL folders for the current property
        const { username, password } = getLoggedInCredentials();
        const foldersResponse = await fetch('/.netlify/functions/getFolders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ property_id: propertyId, username, password })
        });

        if (!foldersResponse.ok) {
            const errorBody = await foldersResponse.json();
            throw new Error(`Failed to load folders: ${errorBody.message || foldersResponse.statusText}`);
        }
        folders = await foldersResponse.json(); // Update global folders array

        renderFoldersList(folders, currentFolder, foldersList); // Render folders UI

        // 2. Fetch all files for the current property
        const filesResponse = await fetch(`/.netlify/functions/getFiles?property_id=${propertyId}`);
        if (!filesResponse.ok) {
            const errorBody = await filesResponse.json();
            throw new Error(`Failed to load files: ${errorBody.message || filesResponse.statusText}`);
        }

        const allFiles = await filesResponse.json();

        // Filter files by selected folder
        const filesToDisplay = folderId === 'all'
            ? allFiles
            : allFiles.filter(file => file.folder_id === folderId);

        renderFilesList(filesToDisplay, filesListContainer, toggleFileSelection, deleteFileSingle); // Render files UI

        selectedFiles.clear(); // Clear any previous selection
        updateSelectionUI(selectedFiles, moveToFolderButton, deleteSelectedFilesButton); // Update buttons state

    } catch (error) {
        console.error('Error loading files/folders:', error);
        filesListContainer.innerHTML = `<p class="text-red-600 p-4 text-center">Error loading files and folders: ${error.message}</p>`;
    }
}

/**
 * Initiates the file upload process, including reading the file and showing folder selection.
 * @param {number} propertyId - The ID of the property to upload to.
 * @param {File} file - The File object to upload.
 */
export async function initFileUploadProcess(propertyId, file) {
    if (!file) {
        showCustomAlert('No file selected.');
        return;
    }

    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xls, .xlsx
        'text/csv',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .doc, .docx
    ];
    if (!allowedTypes.includes(file.type)) {
        if (fileUploadStatus) {
            fileUploadStatus.classList.remove('hidden');
            fileUploadStatus.className = 'mt-3 text-center text-sm bg-red-100 text-red-700';
            fileUploadStatus.textContent = 'Only images (JPEG, PNG, GIF, WebP), PDFs, Excel (XLS, XLSX), CSV, and Word (DOC, DOCX) files are allowed.';
        }
        return;
    }

    const reader = new FileReader();
    reader.onprogress = (event) => {
        if (event.lengthComputable && fileUploadStatus) {
            const progressElement = fileUploadStatus.querySelector('progress');
            if (progressElement) {
                progressElement.value = event.loaded;
            }
        }
    };

    reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        const mimeType = reader.result.split(',')[0].split(':')[1].split(';')[0];
        await showUploadFolderSelectionModal(propertyId, file, base64data, mimeType);
        if (fileUploadStatus) fileUploadStatus.classList.add('hidden'); // Clear main status
    };

    if (fileUploadStatus) {
        fileUploadStatus.classList.remove('hidden');
        fileUploadStatus.className = 'mt-3 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
        fileUploadStatus.innerHTML = 'Preparing file for upload... <progress value="0" max="100"></progress>';
        const progress = fileUploadStatus.querySelector('progress');
        if (progress) progress.max = file.size;
    }

    reader.readAsDataURL(file);
}

/**
 * Shows the modal for selecting or creating a folder before file upload/move.
 * @param {number} propertyId - The ID of the property.
 * @param {File} [file=null] - The file object to be uploaded (if this is for upload).
 * @param {string} [base64data=null] - The base64 data of the file (if for upload).
 * @param {string} [mimeType=null] - The MIME type of the file (if for upload).
 */
export async function showUploadFolderSelectionModal(propertyId, file = null, base64data = null, mimeType = null) {
    // These variables will temporarily hold the data for upload once a folder is selected
    let fileToUploadTemp = file;
    let base64DataToUploadTemp = base64data;
    let mimeTypeToUploadTemp = mimeType;
    let filesToMoveTemp = null; // For batch move operation

    // If this modal is triggered by 'Move to Folder'
    const currentSelectedFiles = new Set(Array.from(document.querySelectorAll('.file-checkbox:checked')).map(cb => parseInt(cb.dataset.fileId)));
    if (currentSelectedFiles.size > 0 && !file) { // If files are selected and not an upload flow
        filesToMoveTemp = Array.from(currentSelectedFiles);
    }

    if (!uploadFolderModal) {
        showCustomAlert('Cannot open folder selection modal.');
        return;
    }

    // Reset modal state
    uploadFolderModalStatus.classList.add('hidden');
    uploadFolderModalStatus.textContent = '';
    newFolderNameContainer.classList.add('hidden');
    newFolderNameInput.value = '';
    folderSelectDropdown.innerHTML = '<option value="none">-- No Folder (All Files) --</option><option value="new">+ Create New Folder</option>';
    folderSelectDropdown.value = 'none';

    // Populate dropdown with existing folders
    try {
        const { username, password } = getLoggedInCredentials();
        const foldersResponse = await fetch('/.netlify/functions/getFolders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ property_id: propertyId, username, password })
        });
        if (!foldersResponse.ok) {
            const errorBody = await foldersResponse.json();
            throw new Error(errorBody.message || 'Failed to fetch folders for dropdown.');
        }
        const fetchedFolders = await foldersResponse.json();
        fetchedFolders.forEach(f => {
            const option = document.createElement('option');
            option.value = f.id;
            option.textContent = f.name;
            folderSelectDropdown.insertBefore(option, folderSelectDropdown.lastElementChild);
        });
        uploadFolderModalStatus.classList.add('hidden');
    } catch (error) {
        console.error('Error populating folder dropdown:', error);
        uploadFolderModalStatus.classList.remove('hidden');
        uploadFolderModalStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
        uploadFolderModalStatus.textContent = `Error loading folders: ${error.message}`;
    }

    showModal(uploadFolderModal, '', 'selection', async (username, password) => { // Use generic 'selection' action
        const selectedFolderId = folderSelectDropdown.value;
        let finalFolderId = null;
        let finalFolderName = null;

        if (selectedFolderId === 'new') {
            const newName = newFolderNameInput.value.trim();
            if (!newName) {
                showCustomAlert('Please enter a name for the new folder.');
                return;
            }
            finalFolderName = newName;
            finalFolderId = newName.toLowerCase().replace(/\s+/g, '-');
            try {
                const createFolderResponse = await fetch('/.netlify/functions/createFolder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ property_id: propertyId, folder_name: finalFolderName, username, password })
                });
                const createFolderData = await createFolderResponse.json();
                if (!createFolderResponse.ok) throw new Error(createFolderData.message || 'Failed to create new folder.');
                showCustomAlert(`Folder "${finalFolderName}" created.`);
            } catch (error) {
                showCustomAlert(`Error creating folder: ${error.message}`);
                console.error('Error creating folder during upload flow:', error);
                hideModal(uploadFolderModal);
                return;
            }
        } else if (selectedFolderId === 'none') {
            finalFolderId = null;
            finalFolderName = null;
        } else {
            const selectedFolder = folders.find(f => f.id === selectedFolderId);
            finalFolderId = selectedFolderId;
            finalFolderName = selectedFolder ? selectedFolder.name : selectedFolderId;
        }

        // Proceed based on whether it's a file upload or file move
        if (fileToUploadTemp && base64DataToUploadTemp && mimeTypeToUploadTemp) {
            await uploadFile(propertyId, fileToUploadTemp.name, base64DataToUploadTemp, mimeTypeToUploadTemp, finalFolderId, finalFolderName, username, password);
            // Clear temp data after upload
            fileToUploadTemp = null;
            base64DataToUploadTemp = null;
            mimeTypeToUploadTemp = null;
        } else if (filesToMoveTemp && filesToMoveTemp.length > 0) {
            await moveFiles(propertyId, filesToMoveTemp, finalFolderId, finalFolderName, username, password);
            filesToMoveTemp = null;
        }

        hideModal(uploadFolderModal);
        await displayPropertyFiles(propertyId, finalFolderId); // Refresh after operation
    });
    uploadFolderModal.classList.remove('hidden'); // Make sure the modal becomes visible
}


/**
 * Uploads a file to Cloudinary and saves its metadata to the DB.
 * @param {number} propertyId - The ID of the property.
 * @param {string} filename - The name of the file.
 * @param {string} fileDataAsBase64 - The base64 encoded string of the file.
 * @param {string} mimeType - The MIME type of the file.
 * @param {string|null} folderId - The ID of the folder to save to (null if root).
 * @param {string|null} folderName - The name of the folder (null if root).
 * @param {string} username - User's username for auth.
 * @param {string} password - User's password for auth.
 */
export async function uploadFile(propertyId, filename, fileDataAsBase64, mimeType, folderId, folderName, username, password) {
    if (fileUploadStatus) {
        fileUploadStatus.classList.remove('hidden');
        fileUploadStatus.className = 'mt-3 text-center text-sm bg-blue-100 text-blue-700';
        fileUploadStatus.textContent = 'Uploading file...';
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
                username: username, // For Netlify Function authentication
                password: password, // For Netlify Function authentication
                folder_id: folderId,
                folder_name: folderName
            })
        });

        const data = await response.json();

        if (response.ok) {
            if (fileUploadStatus) {
                fileUploadStatus.className = 'mt-3 text-center text-sm bg-green-100 text-green-700';
                fileUploadStatus.textContent = 'File uploaded successfully!';
            }
        } else {
            throw new Error(data.details || data.message || 'Unknown upload error.');
        }
    } catch (error) {
        console.error('Error during file upload:', error);
        if (fileUploadStatus) {
            fileUploadStatus.classList.remove('hidden');
            fileUploadStatus.className = 'mt-3 text-center text-sm bg-red-100 text-red-700';
            fileUploadStatus.textContent = `Upload failed: ${error.message}`;
        }
    } finally {
        // Clear file input and hide status after a delay
        fileUploadInput.value = '';
        setTimeout(() => {
            if (fileUploadStatus) fileUploadStatus.classList.add('hidden');
        }, 3000);
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
 */
export async function moveFiles(propertyId, fileIds, targetFolderId, targetFolderName, username, password) {
    const verificationStatus = document.getElementById('verification-status');
    if (verificationStatus) {
        verificationStatus.classList.remove('hidden');
        verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
        verificationStatus.textContent = 'Verifying and moving files...';
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

        showCustomAlert(data.message); // Use the global alert

        setTimeout(() => {
            hideModal(verificationModal);
            displayPropertyFiles(propertyId, currentFolder); // Refresh after move
        }, 1500);

    } catch (error) {
        console.error('Error moving files:', error);
        if (verificationStatus) {
            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            verificationStatus.textContent = `Move failed: ${error.message}`;
        }
    }
}

/**
 * Creates a new folder.
 * @param {number} propertyId - The ID of the property.
 * @param {string} folderName - The name of the new folder.
 */
export async function createFolder(propertyId, folderName) {
    const { username, password } = getLoggedInCredentials();
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
            await displayPropertyFiles(propertyId, currentFolder); // Refresh files and folders
        } else {
            showCustomAlert(`Failed to create folder: ${data.message || 'An unknown error occurred.'}`);
            console.error('Error creating folder:', data.details || data.message);
        }
    } catch (error) {
        console.error('Network error creating folder:', error);
        showCustomAlert(`Network error: ${error.message}. Could not create folder.`);
    }
}

/**
 * Deletes one or more files from a property.
 * @param {number} propertyId - The ID of the property.
 * @param {number[]} fileIds - An array of file IDs to delete.
 * @param {string} username - User's username for verification.
 * @param {string} password - User's password for verification.
 */
export async function deleteFiles(propertyId, fileIds, username, password) {
    const verificationStatus = document.getElementById('verification-status');
    if (verificationStatus) {
        verificationStatus.classList.remove('hidden');
        verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-blue-100 text-blue-700';
        verificationStatus.textContent = 'Verifying and deleting files...';
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
            if (verificationStatus) {
                verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-green-100 text-green-700';
                verificationStatus.textContent = data.message;
            }
            setTimeout(async () => {
                hideModal(verificationModal);
                await displayPropertyFiles(propertyId, currentFolder); // Refresh the file list after deletion
            }, 1500);
            return true;
        } else {
            if (verificationStatus) {
                verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
                verificationStatus.textContent = data.message || 'Deletion failed. Check credentials or try again.';
                document.getElementById('modal-password').value = '';
            }
            return false;
        }
    } catch (error) {
        console.error('Error during file delete verification:', error);
        if (verificationStatus) {
            verificationStatus.className = 'mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700';
            verificationStatus.textContent = `Network error: ${error.message}`;
        }
        return false;
    }
}

// Event Listeners for buttons within the files page, managed by this module
document.addEventListener('DOMContentLoaded', () => {
    // Event delegation for single file delete/edit buttons
    if (filesListContainer) {
        filesListContainer.addEventListener('click', async (event) => {
            const deleteBtn = event.target.closest('.delete-file-btn');
            const editBtn = event.target.closest('.edit-file-btn');
            const checkbox = event.target.closest('.file-checkbox');
            const fileItem = event.target.closest('.file-item');

            if (checkbox) {
                const fileId = parseInt(checkbox.dataset.fileId);
                if (selectedFiles.has(fileId)) {
                    selectedFiles.delete(fileId);
                } else {
                    selectedFiles.add(fileId);
                }
                updateSelectionUI(selectedFiles, moveToFolderButton, deleteSelectedFilesButton);
            } else if (fileItem && !deleteBtn && !editBtn) { // Clicking anywhere else on item toggles selection
                const fileId = parseInt(fileItem.dataset.fileId);
                if (selectedFiles.has(fileId)) {
                    selectedFiles.delete(fileId);
                } else {
                    selectedFiles.add(fileId);
                }
                updateSelectionUI(selectedFiles, moveToFolderButton, deleteSelectedFilesButton);
            }
             else if (deleteBtn) {
                const fileId = parseInt(deleteBtn.dataset.fileId);
                const fileName = deleteBtn.dataset.fileName;
                const currentPropertyId = document.getElementById('property-selection-page').dataset.selectedPropertyId; // Need to get property ID from global state or HTML
                showModal(
                    verificationModal,
                    `file: "${fileName}"`,
                    `deleting`,
                    async (username, password) => {
                        await deleteFiles(currentPropertyId, [fileId], username, password);
                    }
                );
            } else if (editBtn) {
                 const fileId = parseInt(editBtn.dataset.fileId);
                 const fileName = editBtn.dataset.fileName;
                 showCustomAlert(`Edit functionality for file "${fileName}" (ID: ${fileId}) is not yet fully implemented. Implement a modal to edit file details here.`);
            }
        });
    }


    if (createFolderButton) {
        createFolderButton.addEventListener('click', async () => {
            const currentPropertyId = document.getElementById('property-selection-page').dataset.selectedPropertyId; // Assuming you store this
            if (!currentPropertyId) {
                showCustomAlert('Please select a property first.');
                return;
            }
            const folderName = prompt('Enter folder name:');
            if (folderName && folderName.trim() !== '') {
                await createFolder(parseInt(currentPropertyId), folderName.trim());
                // displayPropertyFiles will be called from createFolder
            } else if (folderName !== null) {
                showCustomAlert('Folder name cannot be empty.');
            }
        });
    }

    if (deleteSelectedFilesButton) {
        deleteSelectedFilesButton.addEventListener('click', () => {
            const filesToDelete = Array.from(document.querySelectorAll('.file-checkbox:checked')).map(cb => parseInt(cb.dataset.fileId));
            if (filesToDelete.length === 0) {
                showCustomAlert('No files selected for deletion.');
                return;
            }
            const currentPropertyId = document.getElementById('property-selection-page').dataset.selectedPropertyId; // Assuming you store this
            showModal(
                verificationModal,
                `${filesToDelete.length} selected file(s)`,
                `deleting`,
                async (username, password) => {
                    await deleteFiles(parseInt(currentPropertyId), filesToDelete, username, password);
                }
            );
        });
    }

    if (moveToFolderButton) {
        moveToFolderButton.addEventListener('click', async () => {
            const filesToMove = Array.from(document.querySelectorAll('.file-checkbox:checked')).map(cb => parseInt(cb.dataset.fileId));
            if (filesToMove.length === 0) {
                showCustomAlert('No files selected to move.');
                return;
            }
            const currentPropertyId = document.getElementById('property-selection-page').dataset.selectedPropertyId; // Assuming you store this

            // This will trigger the modal to select or create a folder
            await showUploadFolderSelectionModal(parseInt(currentPropertyId), null, null, null, filesToMove);
        });
    }

    // Handlers for the folder selection modal itself (these were originally in your main script.js)
    if (folderSelectDropdown) {
        folderSelectDropdown.addEventListener('change', (e) => {
            if (newFolderNameContainer) {
                newFolderNameContainer.style.display = e.target.value === 'new' ? 'block' : 'none';
            }
            if (newFolderNameInput && e.target.value === 'new') {
                newFolderNameInput.focus();
            }
            if (uploadFolderModalStatus) uploadFolderModalStatus.classList.add('hidden');
        });
    }

    if (cancelFolderSelectionBtn) {
        cancelFolderSelectionBtn.addEventListener('click', () => {
            hideModal(uploadFolderModal);
            if (fileUploadInput) fileUploadInput.value = ''; // Clear file input on cancel
            // Clear temporary data used for upload/move if it exists.
        });
    }
});
