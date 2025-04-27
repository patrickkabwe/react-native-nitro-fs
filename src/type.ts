export type NitroFileEncoding = 'utf8' | 'ascii'

export type NitroUploadMethod = 'POST' | 'PUT' | 'PATCH'

export interface NitroUploadOptions {
    /**
     * The URL to fetch
     */
    url: string
    /**
     * The method to use for the fetch request
     */
    method?: NitroUploadMethod
    /**
     * The body to send with the fetch request
     */
    body?: Record<string, string>
}

export interface NitroDownloadOptions {
    /**
     * The URL to download
     */
    serverUrl: string
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
