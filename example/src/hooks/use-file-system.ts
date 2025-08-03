import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import NitroFS from 'react-native-nitro-fs';
import { DirectoryType, FileItem } from '../types';

export const useFileSystem = () => {
    const [currentPath, setCurrentPath] = useState('');
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                setLoading(true);
                await listFiles(NitroFS.DOWNLOAD_DIR);
            } catch (error) {
                console.error('Error initializing app:', error);
                Alert.alert('Error', 'Failed to initialize the app');
            } finally {
                setLoading(false);
            }
        };
        initializeApp();
    }, []);


    const listFiles = async (path: string) => {
        try {
            setLoading(true);
            const fileList = await NitroFS.readdir(path);
            const fileItems: FileItem[] = [];

            for (const fileName of fileList) {
                const filePath = path ? `${path}/${fileName}` : fileName;
                try {
                    const stat = await NitroFS.stat(filePath);
                    fileItems.push({
                        name: fileName,
                        path: filePath,
                        isDirectory: stat.isDirectory,
                        size: stat.size,
                    });
                } catch (error) {
                    console.error(`Error getting stat for ${filePath}:`, error);
                }
            }

            setFiles(fileItems);
            setCurrentPath(path);
        } catch (error) {
            console.error('Error listing files:', error);
            Alert.alert('Error', 'Failed to list files');
        } finally {
            setLoading(false);
        }
    };

    const createFile = async (fileName: string, content: string) => {
        if (!fileName.trim()) {
            Alert.alert('Error', 'Please enter a file name');
            return;
        }

        try {
            setLoading(true);
            const filePath = currentPath ? `${currentPath}/${fileName}` : fileName;
            await NitroFS.writeFile(filePath, content || 'Hello from NitroFS!', 'utf8');

            Alert.alert('Success', 'File created successfully');
            await listFiles(currentPath);
        } catch (error) {
            console.error('Error creating file:', error);
            Alert.alert('Error', 'Failed to create file');
        } finally {
            setLoading(false);
        }
    };

    const createDirectory = async (dirName: string) => {
        if (!dirName.trim()) {
            Alert.alert('Error', 'Please enter a directory name');
            return;
        }

        try {
            setLoading(true);
            const dirPath = currentPath ? `${currentPath}/${dirName}` : dirName;
            await NitroFS.mkdir(dirPath);

            Alert.alert('Success', 'Directory created successfully');
            await listFiles(currentPath);
        } catch (error) {
            console.error('Error creating directory:', error);
            Alert.alert('Error', 'Failed to create directory');
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (item: FileItem) => {
        Alert.alert('Confirm Delete', `Are you sure you want to delete "${item.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setLoading(true);
                        await NitroFS.unlink(item.path);
                        Alert.alert('Success', 'Item deleted successfully');
                        await listFiles(currentPath);
                    } catch (error) {
                        console.error('Error deleting item:', error);
                        Alert.alert('Error', 'Failed to delete item');
                    } finally {
                        setLoading(false);
                    }
                },
            },
        ]);
    };

    const readFile = async (item: FileItem) => {
        try {
            setLoading(true);
            const content = await NitroFS.readFile(item.path, 'utf8');
            setSelectedFile(item);
            Alert.alert('File Content', content.substring(0, 500) + (content.length > 500 ? '...' : ''));
            return content;
        } catch (error) {
            console.error('Error reading file:', error);
            Alert.alert('Error', 'Failed to read file');
            return '';
        } finally {
            setLoading(false);
        }
    };

    const saveFile = async (content: string) => {
        if (!selectedFile || selectedFile.isDirectory) {
            Alert.alert('Error', 'Please select a file to save');
            return;
        }

        try {
            setLoading(true);
            await NitroFS.writeFile(selectedFile.path, content, 'utf8');
            Alert.alert('Success', 'File saved successfully');
        } catch (error) {
            console.error('Error saving file:', error);
            Alert.alert('Error', 'Failed to save file');
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async () => {
        if (!selectedFile) {
            Alert.alert('Error', 'Please select a file to upload');
            return;
        }

        try {
            setLoading(true);
            setUploadProgress(0);

            const uploadOptions = {
                url: 'https://httpbin.org/post',
                method: 'POST' as const,
                field: 'file',
            };

            const file = {
                name: selectedFile.name,
                mimeType: 'text/plain',
                path: selectedFile.path,
            };

            await NitroFS.uploadFile(file, uploadOptions, (uploadedBytes, totalBytes) => {
                const progress = (uploadedBytes / totalBytes) * 100;
                setUploadProgress(progress);
            });

            Alert.alert('Success', 'File uploaded successfully');
            setUploadProgress(0);
        } catch (error) {
            console.error('Error uploading file:', error);
            Alert.alert('Error', 'Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async () => {
        try {
            setLoading(true);
            setDownloadProgress(0);

            const serverUrl = 'https://httpbin.org/bytes/1024';
            const destinationPath = `${NitroFS.DOWNLOAD_DIR}/downloaded_file.txt`;

            const file = await NitroFS.downloadFile(serverUrl, destinationPath, (downloadedBytes, totalBytes) => {
                const progress = (downloadedBytes / totalBytes) * 100;
                setDownloadProgress(progress);
            });

            Alert.alert('Success', `File downloaded successfully: ${file.name}`);
            setDownloadProgress(0);
            await listFiles(currentPath);
        } catch (error) {
            console.error('Error downloading file:', error);
            Alert.alert('Error', 'Failed to download file');
        } finally {
            setLoading(false);
        }
    };

    const navigateToDirectory = async (item: FileItem) => {
        if (item.isDirectory) {
            await listFiles(item.path);
        }
    };

    const navigateBack = async () => {
        if (currentPath) {
            const parentPath = NitroFS.dirname(currentPath);
            await listFiles(parentPath);
        }
    };

    const checkExists = async (path: string) => {
        try {
            const exists = await NitroFS.exists(path);
            Alert.alert('File Exists', `${path} ${exists ? 'exists' : 'does not exist'}`);
        } catch (error) {
            console.error('Error checking existence:', error);
            Alert.alert('Error', 'Failed to check file existence');
        }
    };

    const copyItem = async (item: FileItem, newName: string) => {
        if (!newName.trim()) {
            Alert.alert('Error', 'Please enter a destination name');
            return;
        }

        try {
            setLoading(true);
            const destPath = currentPath ? `${currentPath}/${newName}` : newName;
            await NitroFS.copy(item.path, destPath);

            Alert.alert('Success', 'Item copied successfully');
            await listFiles(currentPath);
        } catch (error) {
            console.error('Error copying item:', error);
            Alert.alert('Error', 'Failed to copy item');
        } finally {
            setLoading(false);
        }
    };

    const renameItem = async (item: FileItem, newName: string) => {
        if (!newName.trim()) {
            Alert.alert('Error', 'Please enter a new name');
            return;
        }

        try {
            setLoading(true);
            const newPath = currentPath ? `${currentPath}/${newName}` : newName;
            await NitroFS.rename(item.path, newPath);

            Alert.alert('Success', 'Item renamed successfully');
            await listFiles(currentPath);
        } catch (error) {
            console.error('Error renaming item:', error);
            Alert.alert('Error', 'Failed to rename item');
        } finally {
            setLoading(false);
        }
    };

    const getPathInfo = async (path: string) => {
        try {
            const dirname = NitroFS.dirname(path);
            const basename = NitroFS.basename(path);
            const extname = NitroFS.extname(path);

            const info = `Path: ${path}\nDirectory: ${dirname}\nFilename: ${basename}\nExtension: ${extname}`;
            Alert.alert('Path Information', info);
        } catch (error) {
            console.error('Error getting path info:', error);
            Alert.alert('Error', 'Failed to get path information');
        }
    };

    const navigateToDirectoryType = async (dirType: DirectoryType) => {
        try {
            setLoading(true);
            let path = '';
            switch (dirType) {
                case 'BUNDLE':
                    path = NitroFS.BUNDLE_DIR;
                    break;
                case 'DOCUMENT':
                    path = NitroFS.DOCUMENT_DIR;
                    break;
                case 'CACHE':
                    path = NitroFS.CACHE_DIR;
                    break;
                case 'DOWNLOAD':
                    path = NitroFS.DOWNLOAD_DIR;
                    break;
            }
            await listFiles(path);
        } catch (error) {
            console.error('Error navigating to directory:', error);
            Alert.alert('Error', 'Failed to navigate to directory');
        } finally {
            setLoading(false);
        }
    };

    return {
        currentPath,
        files,
        loading,
        uploadProgress,
        downloadProgress,
        selectedFile,
        setSelectedFile,
        listFiles,
        createFile,
        createDirectory,
        deleteItem,
        readFile,
        saveFile,
        uploadFile,
        downloadFile,
        navigateToDirectory,
        navigateBack,
        checkExists,
        copyItem,
        renameItem,
        getPathInfo,
        navigateToDirectoryType,
    };
}; 