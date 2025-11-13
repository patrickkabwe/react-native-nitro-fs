
import { type HybridObject } from 'react-native-nitro-modules'
import type { NitroFile, NitroFileEncoding, NitroFileStat, NitroUploadOptions } from '../type'

export interface NitroFS extends HybridObject<{ ios: 'swift', android: 'kotlin' }> {
    /**
     * The directory for storing bundle files
     * @platform ios
     */
    readonly BUNDLE_DIR: string
    
    /**
     * The directory for storing documents
     * @platform ios | android
     */
    readonly DOCUMENT_DIR: string

    /**
     * The directory for storing cache
     * @platform ios | android
     */
    readonly CACHE_DIR: string

    /**
     * The directory for storing downloads
     * @platform android
     */
    readonly DOWNLOAD_DIR: string

    /**
     * The directory for storing DCIM
     * @platform android
     */
    readonly DCIM_DIR: string

    /**
     * The directory for storing pictures
     * @platform android
     */
    readonly PICTURES_DIR: string

    /**
     * The directory for storing movies
     * @platform android
     */
    readonly MOVIES_DIR: string

    /**
     * The directory for storing music
     * @platform android
     */
    readonly MUSIC_DIR: string

    /**
     * Check if a file or directory exists
     */
    exists(path: string): Promise<boolean>
    /**
     * Write a file to the file system
     */
    writeFile(path: string, data: string, encoding: NitroFileEncoding): Promise<void>
    /**
     * Read a file from the file system
     */
    readFile(path: string, encoding: NitroFileEncoding): Promise<string>
    /**
     * Copy a file to the file system
     */
    copyFile(srcPath: string, destPath: string): Promise<void>
    /**
     * Copy a file or directory to the file system
     */
    copy(srcPath: string, destPath: string): Promise<void>
    /**
     * Delete a file or directory from the file system
     */
    unlink(path: string): Promise<boolean>
    /**
     * Create a directory in the file system
     */
    mkdir(path: string): Promise<boolean>
    /**
     * Get the stat of a file or directory
     */
    stat(path: string): Promise<NitroFileStat>
    /**
     * List contents of a directory
     */
    readdir(path: string): Promise<NitroFile[]>
    /**
     * Rename or move a file or directory
     */
    rename(oldPath: string, newPath: string): Promise<void>
    /**
     * Get the directory name from a path
     */
    dirname(path: string): string
    /**
     * Get the filename from a path
     */
    basename(path: string, ext?: string): string
    /**
     * Get the file extension from a path
     */
    extname(path: string): string

    /**
     * Upload a file to the file system
     * ```typescript
     * const options: NitroUploadOptions = {
     *  file: {
     *      name: 'test.txt',
     *      mimeType: 'text/plain',
     *      path: 'test.txt',
     *  },
     * 
     *  url: 'https://example.com/upload',
     *  headers: {
     *      'X-Filename': 'test.txt',
     *  },
     * }
     * await NitroFS.uploadFile(options, (uploadedBytes, totalBytes) => {
     *  console.log(`Uploading ${uploadedBytes / totalBytes * 100}%`)
     * })
     * ```
     */
    uploadFile(file: NitroFile, uploadOptions: NitroUploadOptions, onProgress?: (uploadedBytes: number, totalBytes: number) => void): Promise<void>
    /**
     * Upload multiple files to the file system
     * ```typescript
     * const files: NitroFile[] = [
     *  { name: 'test.txt', mimeType: 'text/plain', path: 'test.txt' },
     * ]
     * await NitroFS.uploadFiles(files, requestOptions, (uploadedBytes, totalBytes) => {
     *  console.log(`Uploading ${uploadedBytes / totalBytes * 100}%`)
     * })
     * ```
     */
    // uploadFiles(files: NitroFile[], uploadOptions: NitroUploadOptions, onProgress?: (uploadedBytes: number, totalBytes: number) => void): Promise<void>
    /**
     * Download a file from the internet to the file system
     * ```typescript
     * const serverUrl = 'https://example.com/download'
     * const destinationPath = NitroFS.DOWNLOAD_DIR + '/file.txt'   
     * const file = await NitroFS.downloadFile(serverUrl, destinationPath, (downloadedBytes, totalBytes) => {
     *  console.log(`Downloading ${downloadedBytes / totalBytes * 100}%`)
     * })
     * console.log(file) // { name: 'file.txt', mimeType: 'text/plain', path: 'file.txt' }
     * ```
     */
    downloadFile(serverUrl: string, destinationPath: string, onProgress?: (downloadedBytes: number, totalBytes: number) => void): Promise<NitroFile>
}
