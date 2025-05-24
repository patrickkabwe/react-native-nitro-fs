
import { type HybridObject } from 'react-native-nitro-modules'
import type { NitroFile, NitroFileEncoding, NitroFileStat, NitroUploadOptions } from '../type'

export interface NitroFS extends HybridObject<{ ios: 'swift', android: 'kotlin' }> {
    /**
     * The directory for storing bundle files
     */
    readonly BUNDLE_DIR: string
    /**
     * The directory for storing documents
     */
    readonly DOCUMENT_DIR: string
    /**
     * The directory for storing cache
     */
    readonly CACHE_DIR: string
    /**
     * The directory for storing downloads
     */
    readonly DOWNLOAD_DIR: string


    /**
     * Check if a file or directory exists
     * ```typescript
     * const exists = await NitroFS.exists('/path/to/file')
     * ```
     */
    exists(path: string): Promise<boolean>
    /**
     * Write a file to the file system
     * ```typescript
     * await NitroFS.writeFile('/path/to/file', 'Hello, world!', 'utf8')
     * ```
     */
    writeFile(path: string, data: string, encoding: NitroFileEncoding): Promise<void>
    /**
     * Read a file from the file system
     * ```typescript
     * const data = await NitroFS.readFile('/path/to/file', 'utf8')
     * ```
     */
    readFile(path: string, encoding: NitroFileEncoding): Promise<string>
    /**
     * Copy a file to the file system
     * ```typescript
     * await NitroFS.copyFile('/path/to/file', '/path/to/destination')
     * ```
     */
    copyFile(srcPath: string, destPath: string): Promise<void>
    /**
     * Copy a file or directory to the file system
     * ```typescript
     * await NitroFS.copy('/path/to/file', '/path/to/destination')
     * ```
     */
    copy(srcPath: string, destPath: string): Promise<void>
    /**
     * Delete a file or directory from the file system
     * ```typescript
     * await NitroFS.unlink('/path/to/file')
     * ```
     */
    unlink(path: string): Promise<boolean>
    /**
     * Create a directory in the file system
     * ```typescript
     * await NitroFS.mkdir('/path/to/directory')
     * ```
     */
    mkdir(path: string): Promise<boolean>
    /**
     * Get the stat of a file or directory
     * ```typescript
     * const stat = await NitroFS.stat('/path/to/file')
     * ```
     */
    stat(path: string): Promise<NitroFileStat>
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
