export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileSizeInMB = (bytes: number): number => {
    return bytes / (1024 * 1024);
};

export const isFileTooLargeForPreview = (bytes: number): boolean => {
    return getFileSizeInMB(bytes) > 10; // 10MB limit for preview
};

export const isFileTooLargeForEditor = (bytes: number): boolean => {
    return getFileSizeInMB(bytes) > 0.1; // 100KB limit for editor
}; 