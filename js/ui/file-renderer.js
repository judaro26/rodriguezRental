// js/ui/file-renderer.js

import { getFileIcon, formatFileSize } from '../utils/helpers.js'; // Moved here
import { showCustomAlert } from '../utils/dom.js'; // If needed for UI-specific alerts

// No document.getElementById calls at top-level here either, generally.
// DOM elements should be passed as arguments to rendering functions.

// You might need a way to manage selected files here, as this is the UI layer that reacts to clicks.
let selectedFiles = new Set(); // Manage selection state in the UI layer

/**
 * Renders the list of folders in the UI sidebar.
 * @param {Array<Object>} folders - The array of folder objects to render.
 * @param {HTMLElement} foldersListContainer - The UL or DIV element where folders should be rendered.
 * @param {HTMLElement} currentFolderTitleElement - The element displaying the current folder name.
 * @param {string|null} activeFolderId - The ID of the currently active folder (for highlighting).
 */
export function renderFoldersList(folders, foldersListContainer, currentFolderTitleElement, activeFolderId = null) {
    if (!foldersListContainer) return;
    foldersListContainer.innerHTML = ''; // Clear existing folders

    // Add "All Files" option
    const allFilesItem = document.createElement('li');
    allFilesItem.classList.add('folder-item', 'cursor-pointer', 'p-2', 'rounded-md', 'hover:bg-gray-200');
    if (activeFolderId === null) { // 'all' is represented as null for root
        allFilesItem.classList.add('bg-blue-200', 'text-blue-800');
    }
    allFilesItem.dataset.folderId = 'root'; // Use a special ID for 'all files'
    allFilesItem.textContent = 'All Files';
    foldersListContainer.appendChild(allFilesItem);

    // Render actual folders
    folders.forEach(folder => {
        const folderItem = document.createElement('li');
        folderItem.classList.add('folder-item', 'cursor-pointer', 'p-2', 'rounded-md', 'hover:bg-gray-200');
        if (folder.id === activeFolderId) {
            folderItem.classList.add('bg-blue-200', 'text-blue-800');
        }
        folderItem.dataset.folderId = folder.id;
        folderItem.textContent = folder.name;
        foldersListContainer.appendChild(folderItem);
    });

    // Update current folder title
    if (currentFolderTitleElement) {
        if (activeFolderId === null) {
            currentFolderTitleElement.textContent = 'All Files';
        } else {
            const folder = folders.find(f => f.id === activeFolderId);
            currentFolderTitleElement.textContent = `Folder: ${folder ? folder.name : 'Unknown Folder'}`;
        }
    }
}

/**
 * Renders the list of files in the main content area.
 * @param {Array<Object>} files - The array of file objects to render.
 * @param {HTMLElement} filesListContainer - The DIV or UL element where files should be rendered.
 * @param {Function} toggleSelectionCallback - Callback for when a file is selected/deselected.
 * @param {Function} deleteFileSingleCallback - Callback for single file delete button.
 */
export function renderFilesList(files, filesListContainer) { // Removed toggleFileSelection, deleteFileSingle from params as they are internal or main.js handlers
    if (!filesListContainer) return;

    filesListContainer.innerHTML = ''; // Clear existing files

    if (files.length === 0) {
        filesListContainer.innerHTML = `<p class="text-gray-600 p-4 text-center">No files found in this view.</p>`;
        return;
    }

    files.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.classList.add(
            'file-item', 'flex', 'items-center', 'justify-between', 'p-3', 'border-b', 'border-gray-200',
            'hover:bg-gray-50', 'transition-colors', 'duration-100', 'cursor-pointer'
        );
        fileDiv.dataset.fileId = file.id;

        const isSelected = selectedFiles.has(file.id);
        if (isSelected) {
            fileDiv.classList.add('bg-blue-100'); // Highlight selected files
        }

        const fileIcon = getFileIcon(file.filename); // Use helper here
        const fileSizeFormatted = formatFileSize(file.size); // Use helper here

        fileDiv.innerHTML = `
            <div class="flex items-center gap-3 flex-grow">
                <input type="checkbox" class="file-checkbox mr-2" data-file-id="${file.id}" ${isSelected ? 'checked' : ''}>
                <img src="${fileIcon}" alt="File icon" class="w-8 h-8 flex-shrink-0">
                <div class="flex flex-col min-w-0">
                    <span class="font-medium text-gray-800 truncate" title="${file.filename}">${file.filename}</span>
                    <span class="text-xs text-gray-500">${fileSizeFormatted}</span>
                </div>
            </div>
            <div class="flex-shrink-0 ml-4">
                <a href="${file.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline mr-2">View</a>
                <button class="edit-file-btn text-gray-600 hover:text-gray-800 mr-2" data-file-id="${file.id}" data-file-name="${file.filename}">Edit</button>
                <button class="delete-file-btn text-red-600 hover:text-red-800" data-file-id="${file.id}" data-file-name="${file.filename}">Delete</button>
            </div>
        `;
        filesListContainer.appendChild(fileDiv);
    });
}

/**
 * Toggles the selection state of a file and updates the UI.
 * @param {number} fileId - The ID of the file.
 * @param {HTMLElement} moveToButton - The "Move to Folder" button.
 * @param {HTMLElement} deleteButton - The "Delete Selected Files" button.
 */
export function toggleFileSelection(fileId, moveToButton, deleteButton) {
    if (selectedFiles.has(fileId)) {
        selectedFiles.delete(fileId);
    } else {
        selectedFiles.add(fileId);
    }
    updateSelectionUI(selectedFiles, moveToButton, deleteButton);
    // You might also want to visually update the checkbox/item highlight directly here
    const checkbox = document.querySelector(`.file-checkbox[data-file-id="${fileId}"]`);
    if (checkbox) checkbox.checked = selectedFiles.has(fileId);
    const fileItem = document.querySelector(`.file-item[data-file-id="${fileId}"]`);
    if (fileItem) {
        if (selectedFiles.has(fileId)) {
            fileItem.classList.add('bg-blue-100');
        } else {
            fileItem.classList.remove('bg-blue-100');
        }
    }
}

/**
 * Updates the UI state of bulk action buttons based on selected files.
 * @param {Set<number>} currentSelection - The Set of currently selected file IDs.
 * @param {HTMLElement} moveToButton - The "Move to Folder" button.
 * @param {HTMLElement} deleteButton - The "Delete Selected Files" button.
 */
export function updateSelectionUI(currentSelection, moveToButton, deleteButton) {
    const hasSelection = currentSelection.size > 0;
    if (moveToButton) {
        moveToButton.disabled = !hasSelection;
        moveToButton.classList.toggle('opacity-50', !hasSelection);
    }
    if (deleteButton) {
        deleteButton.disabled = !hasSelection;
        deleteButton.classList.toggle('opacity-50', !hasSelection);
    }
}
