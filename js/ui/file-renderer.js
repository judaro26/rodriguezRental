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
    console.log('--- Entering renderFoldersList ---'); // ADD THIS
    console.log('renderFoldersList received folders:', folders); // ADD THIS
    console.log('renderFoldersList target element:', foldersListElement); // ADD THIS

    // Clear previous content
    foldersListElement.innerHTML = '';

    // Add 'All Files' or 'Back to Parent' folder
    // This logic might need refinement based on your backend's folder hierarchy structure.
    // Assuming 'root' means the top level, and subfolders have a parentId.
    const isRoot = (activeFolderId === null || activeFolderId === 'none');

    const parentFolderDiv = document.createElement('div');
    parentFolderDiv.className = `folder-item p-2 hover:bg-gray-100 cursor-pointer rounded-md ${isRoot ? 'bg-blue-200 text-blue-800 font-bold' : ''}`; // Highlight 'All Files' when at root
    parentFolderDiv.dataset.folderId = 'root'; // Always link 'All Files' to 'root'
    parentFolderDiv.innerHTML = `<i class="fas fa-folder mr-2"></i>${isRoot ? 'All Files' : '.. (Back)'}`;
    foldersListElement.appendChild(parentFolderDiv);
    console.log(`Added "${isRoot ? 'All Files' : '.. (Back)'}" folder item.`); // ADD THIS

    // Render actual subfolders of the current activeFolderId
    // If activeFolderId is null (root), show folders with parentId == null
    const foldersToRender = folders.filter(f => {
        if (isRoot) {
            return f.parentId === null || f.parentId === undefined || f.parentId === 'none';
        } else {
            return f.parentId === activeFolderId;
        }
    });

    console.log('Folders to render based on activeFolderId:', foldersToRender); // ADD THIS

    if (foldersToRender.length === 0 && !isRoot) {
        // If in a subfolder and no more subfolders, no need to show anything but "Back"
    } else {
        foldersToRender.forEach(folder => {
            const folderDiv = document.createElement('div');
            folderDiv.className = `folder-item p-2 hover:bg-gray-100 cursor-pointer rounded-md ${folder.id === activeFolderId ? 'bg-blue-200 text-blue-800 font-bold' : ''}`;
            folderDiv.dataset.folderId = folder.id;
            folderDiv.innerHTML = `<i class="fas fa-folder mr-2"></i>${folder.name}`;
            foldersListElement.appendChild(folderDiv);
            console.log(`Added folder: ${folder.name} (ID: ${folder.id})`); // ADD THIS
        });
    }

    // Set current folder title
    if (currentFolderTitleElement) {
        if (isRoot) {
            currentFolderTitleElement.textContent = 'All Files';
        } else {
            const currentFolder = folders.find(f => f.id === activeFolderId);
            currentFolderTitleElement.textContent = currentFolder ? currentFolder.name : 'Unknown Folder';
        }
        console.log('Current folder title set to:', currentFolderTitleElement.textContent); // ADD THIS
    }

    console.log('--- Exiting renderFoldersList ---'); // ADD THIS
}

export function renderFilesList(files, filesListContainerElement) {
    console.log('--- Entering renderFilesList ---'); // ADD THIS
    console.log('renderFilesList received files:', files); // ADD THIS
    console.log('renderFilesList target element:', filesListContainerElement); // ADD THIS

    // Clear previous content but preserve loading message if it's there
    // This is important: if `filesListContainer.innerHTML` was set to a loading message
    // and no files are returned, you want the "No files" message to replace it,
    // not just append. So clearing is generally fine.
    filesListContainerElement.innerHTML = '';

    if (!files || files.length === 0) {
        filesListContainerElement.innerHTML = `<p class="text-gray-600 p-4 text-center">No files found in this folder.</p>`;
        console.log('No files message displayed in filesListContainer.'); // ADD THIS
        return;
    }

    files.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-item flex items-center justify-between p-2 hover:bg-gray-100 rounded-md';
        fileDiv.dataset.fileId = file.id;
        fileDiv.dataset.fileName = file.name; // Add for easier debugging/access

        // Construct the image URL. Assuming 'file.thumbnailUrl' or similar for visual.
        // If not, maybe a generic icon based on file type.
        const fileIcon = file.mimeType && file.mimeType.startsWith('image/') ? file.url : 'https://placehold.co/24x24/E0E0E0/808080?text=Doc'; // Generic doc icon
        const fileExtension = file.name.split('.').pop().toLowerCase();
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
        console.log(`Added file: ${file.name} (ID: ${file.id})`); // ADD THIS
    });
    console.log('--- Exiting renderFilesList ---'); // ADD THIS
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
