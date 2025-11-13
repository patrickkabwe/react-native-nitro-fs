export interface FileItem {
    name: string;
    path: string;
    isDirectory: boolean;
    size?: number;
}

export type DirectoryType = 'BUNDLE' | 'DOCUMENT' | 'CACHE' | 'DOWNLOAD' | 'DCIM' | 'PICTURES' | 'MOVIES' | 'MUSIC'; 