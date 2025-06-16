// js/utils/helpers.js

/**
 * Returns the Font Awesome icon class for a given file extension.
 * @param {string} extension - The file extension (e.g., 'pdf', 'jpg').
 * @returns {string} - HTML string for the Font Awesome icon.
 */
export function getFileIcon(extension) { // Removed 'filename' as it's not used
    const iconMap = {
        pdf: 'file-pdf',
        doc: 'file-word',
        docx: 'file-word',
        xls: 'file-excel',
        xlsx: 'file-excel',
        ppt: 'file-powerpoint',
        pptx: 'file-powerpoint',
        jpg: 'file-image',
        jpeg: 'file-image',
        png: 'file-image',
        gif: 'file-image',
        webp: 'file-image',
        txt: 'file-alt',
        csv: 'file-csv',
        zip: 'file-archive',
        mp3: 'file-audio',
        mp4: 'file-video'
    };
    const icon = iconMap[extension] || 'file'; // Default to 'file' if extension not found
    return `<i class="fas fa-${icon} file-icon text-blue-500"></i>`;
}

/**
 * Formats a file size in bytes to a human-readable string.
 * @param {number} bytes - The file size in bytes.
 * @returns {string} - Formatted file size (e.g., "1.2 MB").
 */
export function formatFileSize(bytes) {
    if (isNaN(bytes) || bytes === undefined) return '0 Bytes';
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
