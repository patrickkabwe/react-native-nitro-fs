export type NitroFileEncoding = 'utf8' | 'ascii' | 'base64'

export type NitroUploadMethod = 'POST' | 'PUT' | 'PATCH'

export interface NitroUploadOptions {
    /**
     * The path to the file to upload
     */
    filePath: string
    /**
     * The URL to fetch
     */
    url: string
    /**
     * The method to use for the fetch request
     */
    method?: NitroUploadMethod
    /**
     * The field name to use for the file upload
     * @default 'file'
     */
    field?: string
    /**
     * The headers to send with the upload request
     */
    headers?: Record<string, string>
}

export interface NitroDownloadOptions {
    /**
     * The URL to download
     */
    url: string
    /**
     * The path to save the downloaded file
     */
    destinationPath: string
    /**
     * The headers to send with the download request
     */
    headers?: Record<string, string>
}

export type NitroFile = {
    name: string
    mimeType: string
    path: string
}

export type NitroFileStat = {
    size: number
    ctime: number
    mtime: number
    isFile: boolean
    isDirectory: boolean
}
