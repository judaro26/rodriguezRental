// js/ui/file-renderer.js

import { getFileIcon, formatFileSize } from '../utils/helpers.js';
// No need for showCustomAlert, as main.js handles top-level alerts.

// Manage selection state here, as it's purely UI-related
let currentSelectedFileIds = new Set();

/**
 * Renders the list of folders in the UI sidebar.
 * @param {Array<Object>} folders - The array of folder objects to render.
 * @param {HTMLElement} foldersListContainer - The UL or DIV element where folders should be rendered.
 * @param {HTMLElement} currentFolderTitleElement - The element displaying the current folder name.
 * @param {string|null} activeFolderId - The ID of the currently active folder (for highlighting).
 */
export function renderFoldersList(folders, foldersListElement, currentFolderTitleElement, activeFolderId) {
    console.log('--- Entering renderFoldersList ---');
    console.log('renderFoldersList received folders:', folders);
    console.log('renderFoldersList target element:', foldersListElement);

    // Clear previous content
    foldersListElement.innerHTML = '';

    // Always add an "All Files" (root) folder option at the top
    // This serves as the "back to root" or initial view
    const isRootView = (activeFolderId === null || activeFolderId === 'none');

    const allFilesFolderDiv = document.createElement('div');
    allFilesFolderDiv.className = `folder-item p-2 hover:bg-gray-100 cursor-pointer rounded-md ${isRootView ? 'bg-blue-200 text-blue-800 font-bold' : ''}`;
    allFilesFolderDiv.dataset.folderId = 'root'; // Consistent ID for the root view
    allFilesFolderDiv.innerHTML = `<i class="fas fa-folder mr-2"></i>All Files`;
    foldersListElement.appendChild(allFilesFolderDiv);
    console.log(`Added "All Files" folder item.`);

    // Sort folders by name for consistent display
    const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));

    // Render actual subfolders of the current property
    // IMPORTANT: This logic assumes your 'folders' table does NOT have a 'parent_folder_id' column
    // and thus only stores top-level folders for a property.
    // If you add nested folders in your DB, you'll need to filter 'folders' here by 'parent_folder_id'.
    sortedFolders.forEach(folder => {
        const folderDiv = document.createElement('div');
        // Ensure folder.id is converted to string for comparison with activeFolderId (which might be string 'null' or actual string ID)
        folderDiv.className = `folder-item p-2 hover:bg-gray-100 cursor-pointer rounded-md ${folder.id.toString() === activeFolderId ? 'bg-blue-200 text-blue-800 font-bold' : ''}`;
        folderDiv.dataset.folderId = folder.id.toString(); // Store ID as string
        folderDiv.innerHTML = `<i class="fas fa-folder mr-2"></i>${folder.name}`;
        foldersListElement.appendChild(folderDiv);
        console.log(`Added folder: ${folder.name} (ID: ${folder.id})`);
    });

    // Set current folder title
    if (currentFolderTitleElement) {
        if (isRootView) {
            currentFolderTitleElement.textContent = 'All Files';
        } else {
            // Find the folder object that matches the activeFolderId
            // Ensure folder.id is converted to string for comparison
            const currentFolder = folders.find(f => f.id.toString() === activeFolderId);
            currentFolderTitleElement.textContent = currentFolder ? currentFolder.name : 'Unknown Folder';
        }
        console.log('Current folder title set to:', currentFolderTitleElement.textContent);
    }

    console.log('--- Exiting renderFoldersList ---');
}

/**
 * Renders the list of files in the main content area.
 * @param {Array<Object>} files - The array of file objects to render.
 * @param {HTMLElement} filesListContainerElement - The DIV element where files should be rendered.
 */
export function renderFilesList(files, filesListContainerElement) {
    console.log('--- Entering renderFilesList ---');
    console.log('renderFilesList received files:', files);
    console.log('renderFilesList target element:', filesListContainerElement);

    // Clear previous content
    filesListContainerElement.innerHTML = '';

    if (!files || files.length === 0) {
        filesListContainerElement.innerHTML = `<p class="text-gray-600 p-4 text-center">No files found in this folder.</p>`;
        console.log('No files message displayed in filesListContainer.');
        return;
    }

    files.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-item flex items-center justify-between p-2 hover:bg-gray-100 rounded-md';
        fileDiv.dataset.fileId = file.id;
        fileDiv.dataset.fileName = file.name; // This should now be populated correctly from 'filename AS name'

        // Determine file icon based on extension
        // This relies on file.name being a string from the backend.
        const fileExtension = file.name ? file.name.split('.').pop().toLowerCase() : '';
        let iconClass = 'fas fa-file'; // Default icon

        // More specific icons based on extension
        if (['pdf'].includes(fileExtension)) iconClass = 'fas fa-file-pdf';
        else if (['doc', 'docx'].includes(fileExtension)) iconClass = 'fas fa-file-word';
        else if (['xls', 'xlsx'].includes(fileExtension)) iconClass = 'fas fa-file-excel';
        else if (['ppt', 'pptx'].includes(fileExtension)) iconClass = 'fas fa-file-powerpoint';
        else if (['zip', 'rar', '7z'].includes(fileExtension)) iconClass = 'fas fa-file-archive';
        else if (['txt', 'log'].includes(fileExtension)) iconClass = 'fas fa-file-alt';
        else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) iconClass = 'fas fa-file-image';
        else if (['mp4', 'mov', 'avi'].includes(fileExtension)) iconClass = 'fas fa-file-video';
        else if (['mp3', 'wav'].includes(fileExtension)) iconClass = 'fas fa-file-audio';


        fileDiv.innerHTML = `
            <div class="flex items-center">
                <input type="checkbox" class="file-checkbox mr-2" data-file-id="${file.id}">
                <i class="${iconClass} mr-2 text-gray-500"></i>
                <a href="${file.url}" target="_blank" class="text-blue-600 hover:underline">${file.name}</a>
            </div>
            <div class="flex items-center space-x-2">
                <button class="edit-file-btn text-gray-500 hover:text-blue-600" data-file-id="${file.id}" data-file-name="${file.name}" title="Edit File"><i class="fas fa-edit"></i></button>
                <button class="delete-file-btn text-red-500 hover:text-red-700" data-file-id="${file.id}" data-file-name="${file.name}" title="Delete File"><i class="fas fa-trash"></i></button>
            </div>
        `;
        filesListContainerElement.appendChild(fileDiv);
        console.log(`Added file: ${file.name} (ID: ${file.id})`);
    });
    console.log('--- Exiting renderFilesList ---');
}

/**
 * Toggles the selection state of a file and updates the UI.
 * This directly modifies `currentSelectedFileIds` and updates buttons.
 * @param {number} fileId - The ID of the file.
 * @param {HTMLElement} moveToButton - The "Move to Folder" button.
 * @param {HTMLElement} deleteButton - The "Delete Selected Files" button.
 */
export function toggleFileSelection(fileId, moveToButton, deleteButton) {
    if (currentSelectedFileIds.has(fileId)) {
        currentSelectedFileIds.delete(fileId);
    } else {
        currentSelectedFileIds.add(fileId);
    }
    updateSelectionUI(currentSelectedFileIds, moveToButton, deleteButton);
    // Also visually update the specific file item's checkbox/highlight
    const checkbox = document.querySelector(`.file-checkbox[data-file-id="${fileId}"]`);
    if (checkbox) checkbox.checked = currentSelectedFileIds.has(fileId);
    const fileItem = document.querySelector(`.file-item[data-file-id="${fileId}"]`);
    if (fileItem) {
        if (currentSelectedFileIds.has(fileId)) {
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
