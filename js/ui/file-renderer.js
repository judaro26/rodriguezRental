// js/ui/file-renderer.js

import { getFileIcon, formatFileSize } from '../utils/helpers.js';
// This module will call back to the files.js service for actual data operations
// It needs the global references to DOM elements that represent its display areas.
const filesListContainer = document.getElementById('files-list-container');
const foldersList = document.getElementById('folders-list');
const moveToFolderButton = document.getElementById('move-to-folder-button');
const deleteSelectedFilesButton = document.getElementById('delete-selected-files-button');
const verificationModal = document.getElementById('verification-modal'); // Assuming global modal for file actions

let currentSelectedFiles = new Set(); // Internal state for selected files


/**
 * Renders the list of files in the main file display area.
 * @param {Array<Object>} files - The array of file objects to render.
 * @param {HTMLElement} container - The DOM element where files should be rendered.
 * @param {Function} onToggleSelection - Callback function when a file's checkbox/row is clicked.
 * @param {Function} onDeleteSingleFile - Callback function when a single file's delete button is clicked.
 */
export function renderFilesList(files, container, onToggleSelection, onDeleteSingleFile) {
    if (!container) return;

    if (files.length === 0) {
        container.innerHTML = `<p class="text-gray-500 p-4 text-center">No files found in this folder.</p>`;
        return;
    }

    container.innerHTML = ''; // Clear existing files

    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.fileId = file.id;

        const fileExtension = file.filename.split('.').pop().toLowerCase();
        const isSelected = currentSelectedFiles.has(file.id);

        if (isSelected) {
            fileItem.classList.add('selected');
        }

        fileItem.innerHTML = `
            <input type="checkbox" class="file-checkbox" ${isSelected ? 'checked' : ''} data-file-id="${file.id}">
            ${getFileIcon(fileExtension)}
            <div class="file-info flex-grow">
                <a href="${file.file_url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${file.filename}</a>
                <div class="text-xs text-gray-500">
                    ${formatFileSize(file.size)} • ${new Date(file.uploaded_at).toLocaleString()}
                </div>
            </div>
            <div class="file-actions">
                <button class="edit-file-btn bg-gray-400 text-gray-800 py-1 px-2 rounded-md hover:bg-gray-500"
                    data-file-id="${file.id}" data-file-name="${file.filename}">
                    Edit
                </button>
                <button class="delete-file-btn bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600"
                    data-file-id="${file.id}" data-file-name="${file.filename}">
                    Delete
                </button>
            </div>
        `;

        // Attach event listeners for individual file actions
        fileItem.querySelector('.file-checkbox').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent parent click
            onToggleSelection(file.id);
        });

        fileItem.addEventListener('click', (e) => {
            // Only toggle selection if not clicking on a specific button/link/checkbox
            if (!e.target.closest('button') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'A') {
                onToggleSelection(file.id);
            }
        });

        fileItem.querySelector('.delete-file-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            onDeleteSingleFile(file.id, file.filename); // Call the callback from the service layer
        });
        // Add listener for edit button (needs a callback to main.js or a dedicated edit modal module)
        fileItem.querySelector('.edit-file-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showCustomAlert(`Edit functionality for file "${file.filename}" is not yet fully implemented.`);
        });

        container.appendChild(fileItem);
    });
}

/**
 * Toggles the selection state of a file and updates the UI.
 * @param {number} fileId - The ID of the file to toggle.
 */
export function toggleFileSelection(fileId) {
    if (currentSelectedFiles.has(fileId)) {
        currentSelectedFiles.delete(fileId);
    } else {
        currentSelectedFiles.add(fileId);
    }
    updateSelectionUI(currentSelectedFiles, moveToFolderButton, deleteSelectedFilesButton);
}

/**
 * Updates the disabled state of "Move" and "Delete Selected" buttons.
 * @param {Set<number>} selectedFilesSet - The set of currently selected file IDs.
 * @param {HTMLElement} moveBtn - The 'Move to Folder' button.
 * @param {HTMLElement} deleteBtn - The 'Delete Selected' button.
 */
export function updateSelectionUI(selectedFilesSet, moveBtn, deleteBtn) {
    const hasSelection = selectedFilesSet.size > 0;
    if (moveBtn) moveBtn.disabled = !hasSelection;
    if (deleteBtn) deleteBtn.disabled = !hasSelection;

    // Update visual state of individual checkboxes
    document.querySelectorAll('.file-item').forEach(item => {
        const fileId = parseInt(item.dataset.fileId);
        const checkbox = item.querySelector('.file-checkbox');
        if (selectedFilesSet.has(fileId)) {
            item.classList.add('selected');
            if (checkbox) checkbox.checked = true;
        } else {
            item.classList.remove('selected');
            if (checkbox) checkbox.checked = false;
        }
    });
}

/**
 * Renders the list of folders in the sidebar.
 * @param {Array<Object>} foldersArray - The array of folder objects to render.
 * @param {string|null} activeFolderId - The ID of the currently active folder (for highlighting).
 * @param {HTMLElement} listContainer - The UL element where folders should be rendered.
 */
export function renderFoldersList(foldersArray, activeFolderId, listContainer) {
    if (!listContainer) return;

    listContainer.innerHTML = `
        <li class="folder-item ${activeFolderId === 'all' ? 'active' : ''}" data-folder-id="all">
            <svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            All Files
        </li>
    `;

    foldersArray.forEach(folder => {
        const folderItem = document.createElement('li');
        folderItem.className = `folder-item ${activeFolderId === folder.id ? 'active' : ''}`;
        folderItem.dataset.folderId = folder.id;

        folderItem.innerHTML = `
            <div class="folder-content">
                <svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                ${folder.name}
            </div>
            <div class="folder-actions">
                <button class="edit-folder-btn text-blue-500 hover:text-blue-700 ml-2" data-folder-id="${folder.id}" data-folder-name="${folder.name}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-folder-btn text-red-500 hover:text-red-700 ml-2" data-folder-id="${folder.id}" data-folder-name="${folder.name}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        listContainer.appendChild(folderItem);
    });

    // Attach event listeners for folder clicks (delegated to main.js for clarity)
    // Attach event listeners for folder edit/delete buttons (delegated to main.js or files.js for clarity)
}

// Private function for single file deletion (called by renderFilesList)
function deleteFileSingle(fileId, fileName) {
    const currentPropertyId = document.getElementById('property-selection-page').dataset.selectedPropertyId; // Get from main.js or state
    showModal(
        document.getElementById('verification-modal'),
        `file: "${fileName}"`,
        `deleting`,
        async (username, password) => {
            await (await import('../services/files.js')).deleteFiles(currentPropertyId, [fileId], username, password);
        }
    );
}

// Event listener for folder sidebar clicks, will trigger service calls
document.addEventListener('DOMContentLoaded', () => {
    const foldersList = document.getElementById('folders-list');
    if (foldersList) {
        foldersList.addEventListener('click', async (event) => {
            const folderItem = event.target.closest('.folder-item');
            if (folderItem) {
                const folderId = folderItem.dataset.folderId;
                const currentPropertyId = document.getElementById('property-selection-page').dataset.selectedPropertyId; // Get from main.js or state

                // Visually highlight selected folder
                foldersList.querySelectorAll('.folder-item').forEach(item => {
                    item.classList.remove('active');
                });
                folderItem.classList.add('active');

                // Call the service function to display files for this folder
                await (await import('../services/files.js')).displayPropertyFiles(parseInt(currentPropertyId), folderId);
            }
        });

        // Event delegation for edit/delete buttons on folders
        foldersList.addEventListener('click', async (event) => {
            const editBtn = event.target.closest('.edit-folder-btn');
            const deleteBtn = event.target.closest('.delete-folder-btn');

            if (editBtn) {
                const folderId = editBtn.dataset.folderId;
                const folderName = editBtn.dataset.folderName;
                const currentPropertyId = document.getElementById('property-selection-page').dataset.selectedPropertyId; // Get from main.js or state
                await (await import('../services/files.js')).editFolder(parseInt(currentPropertyId), folderId, folderName);
            } else if (deleteBtn) {
                const folderId = deleteBtn.dataset.folderId;
                const folderName = deleteBtn.dataset.folderName;
                const currentPropertyId = document.getElementById('property-selection-page').dataset.selectedPropertyId; // Get from main.js or state
                await (await import('../services/files.js')).deleteFolder(parseInt(currentPropertyId), folderId, folderName);
            }
        });
    }
});
