import { showCustomAlert } from '../utils/dom.js';

const API_BASE_URL = ''; // Leave empty for relative paths or set your base URL


export async function displayPropertyFiles(propertyId, folderId = null) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No authentication token found');
            return { files: [], folders: [] };
        }

        const url = folderId
            ? `/api/properties/${propertyId}/files?folderId=${folderId}`
            : `/api/properties/${propertyId}/files`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch files');
        }

        return await response.json();
    } catch (error) {
        console.error('File fetch error:', error);
        showCustomAlert(error.message);
        return { files: [], folders: [] };
    }
}

export function initFileUploadProcess(file = null, filesToMove = null) {
    if (!file && (!filesToMove || filesToMove.length === 0)) {
        showCustomAlert('No file selected');
        return false;
    }

    if (file) {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            showCustomAlert('Unsupported file type');
            return false;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showCustomAlert('File size exceeds 10MB limit');
            return false;
        }
    }

    return true;
}

    export async function uploadFileService(
        propertyId,
        fileName,
        base64Data,
        mimeType,
        folderId = null,
        folderName = null,
        username,
        password,
        uploadedByUsername
    ) {
        console.log('Upload parameters:', {
            propertyId, fileName, mimeType, username, uploadedByUsername
        });
    
        try {
            // Validate required fields
            if (!propertyId || !fileName || !base64Data || !mimeType || !username || !password || !uploadedByUsername) {
                throw new Error('Missing required fields for upload');
            }
    
            const response = await fetch('/.netlify/functions/uploadFile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                },
                body: JSON.stringify({
                    property_id: propertyId,
                    filename: fileName,
                    file_data_base64: base64Data,
                    file_mime_type: mimeType,
                    folder_id: folderId,
                    folder_name: folderName,
                    uploaded_by_username: uploadedByUsername,
                    username: username,
                    password: password
                })
            });
    
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }
            return true;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

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
 * @returns {Promise<boolean>} True if folder created successfully, false otherwise.
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
