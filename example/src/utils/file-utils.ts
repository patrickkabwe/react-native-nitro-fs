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

export const getFileIcon = (fileName: string, isDirectory: boolean): string => {
    if (isDirectory) {
        return '📁';
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'heic', 'heif'].includes(ext)) {
        return '🖼️';
    }
    
    // Video files
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'mpg', 'mpeg'].includes(ext)) {
        return '🎬';
    }
    
    // Audio files
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'].includes(ext)) {
        return '🎵';
    }
    
    // Document files
    if (['pdf'].includes(ext)) {
        return '📕';
    }
    if (['doc', 'docx'].includes(ext)) {
        return '📘';
    }
    if (['xls', 'xlsx'].includes(ext)) {
        return '📊';
    }
    if (['ppt', 'pptx'].includes(ext)) {
        return '📽️';
    }
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
        return '📦';
    }
    
    // Code files
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'swift', 'kt', 'go', 'rs'].includes(ext)) {
        return '💻';
    }
    if (['html', 'htm', 'css', 'scss', 'sass'].includes(ext)) {
        return '🌐';
    }
    if (['json', 'xml', 'yaml', 'yml'].includes(ext)) {
        return '📋';
    }
    
    // Text files
    if (['txt', 'md', 'readme', 'log'].includes(ext)) {
        return '📄';
    }
    
    // Default file icon
    return '📄';
};

export const getMimeTypeFromExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
        'txt': 'text/plain',
        'json': 'application/json',
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'bmp': 'image/bmp',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
        'heic': 'image/heic',
        'heif': 'image/heif',
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'wmv': 'video/x-ms-wmv',
        'flv': 'video/x-flv',
        'webm': 'video/webm',
        'mkv': 'video/x-matroska',
        'm4v': 'video/x-m4v',
        '3gp': 'video/3gpp',
        'mpg': 'video/mpeg',
        'mpeg': 'video/mpeg',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'flac': 'audio/flac',
        'aac': 'audio/aac',
        'ogg': 'audio/ogg',
        'wma': 'audio/x-ms-wma',
        'm4a': 'audio/mp4',
        'opus': 'audio/opus',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        'tar': 'application/x-tar',
        'gz': 'application/gzip',
        'bz2': 'application/x-bzip2',
        'html': 'text/html',
        'htm': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'jsx': 'application/javascript',
        'ts': 'application/typescript',
        'tsx': 'application/typescript',
        'xml': 'application/xml',
        'yaml': 'text/yaml',
        'yml': 'text/yaml',
        'md': 'text/markdown',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}; 