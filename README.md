# react-native-nitro-fs

![ChatGPT Image May 17, 2025, 12_31_35 PM](https://github.com/user-attachments/assets/14fa98eb-fbee-4e00-bc85-eb3a8f0e9832)

A high-performance file system module for React Native that handles file operations and transfers with native speed.

## Features

- 💾 File system operations (read, write, copy, delete)
- 📊 Directory management
- ⬆️ File uploads with progress tracking
- ⬇️ File downloads with progress tracking
- 🔎 File existence and stat checking
- ⚡ Native performance with Swift and Kotlin implementations
- 📲 Cross-platform support (iOS and Android)

## Requirements

- React Native v0.78.0 or higher
- Node 18.0.0 or higher

## Installation

```bash
bun add react-native-nitro-fs react-native-nitro-modules@0.25.2
```

## Quick Start

```typescript
import { NitroFS } from 'react-native-nitro-fs'

// Check if a file exists
const exists = await NitroFS.exists('/path/to/file')

// Read a file
const content = await NitroFS.readFile('/path/to/file', 'utf8')

// Write to a file
await NitroFS.writeFile('/path/to/file', 'Hello, World!', 'utf8')

// Download a file
const file = await NitroFS.downloadFile(
  'https://example.com/file.txt',
  'file.txt',
  NitroFS.DOWNLOAD_DIR + '/file.txt',
  (downloadedBytes, totalBytes) => {
    console.log(`Downloading ${(downloadedBytes / totalBytes) * 100}%`)
  }
)
```

## API Reference

### Constants

The module provides several directory constants:

- `BUNDLE_DIR`: Directory for storing bundle files
- `DOCUMENT_DIR`: Directory for storing documents
- `CACHE_DIR`: Directory for storing cache
- `DOWNLOAD_DIR`: Directory for storing downloads

### Methods

#### `exists(path: string): Promise<boolean>`

Checks if a file or directory exists at the specified path.

```typescript
const exists = await NitroFS.exists('/path/to/file')
```

#### `writeFile(path: string, data: string, encoding: NitroFileEncoding): Promise<void>`

Writes data to a file at the specified path.

```typescript
await NitroFS.writeFile('/path/to/file', 'Hello, world!', 'utf8')
```

#### `readFile(path: string, encoding: NitroFileEncoding): Promise<string>`

Reads the contents of a file at the specified path.

```typescript
const data = await NitroFS.readFile('/path/to/file', 'utf8')
```

#### `copyFile(srcPath: string, destPath: string): Promise<void>`

Copies a file from source path to destination path.

```typescript
await NitroFS.copyFile('/path/to/file', '/path/to/destination')
```

#### `copy(srcPath: string, destPath: string): Promise<void>`

Copies a file or directory from source path to destination path.

```typescript
await NitroFS.copy('/path/to/file', '/path/to/destination')
```

#### `unlink(path: string): Promise<boolean>`

Deletes a file or directory from the file system.

```typescript
await NitroFS.unlink('/path/to/file')
```

#### `mkdir(path: string): Promise<boolean>`

Creates a directory in the file system.

```typescript
await NitroFS.mkdir('/path/to/directory')
```

#### `stat(path: string): Promise<NitroFileStat>`

Gets the stat information of a file or directory.

```typescript
const stat = await NitroFS.stat('/path/to/file')
```

#### `uploadFile(file: NitroFile, uploadOptions: NitroUploadOptions, onProgress?: (uploadedBytes: number, totalBytes: number) => void): Promise<void>`

Uploads a file to a server with progress tracking.

```typescript
const options: NitroUploadOptions = {
  file: {
    name: 'test.txt',
    mimeType: 'text/plain',
    path: 'test.txt',
  },
  url: 'https://example.com/upload',
  headers: {
    'X-Filename': 'test.txt',
  },
}

await NitroFS.uploadFile(options, (uploadedBytes, totalBytes) => {
  console.log(`Uploading ${(uploadedBytes / totalBytes) * 100}%`)
})
```

#### `downloadFile(serverUrl: string, fileName: string, destinationPath: string, onProgress?: (downloadedBytes: number, totalBytes: number) => void): Promise<NitroFile>`

Downloads a file from a server to the specified destination path with progress tracking.

```typescript
const serverUrl = 'https://example.com/download'
const fileName = 'file.txt'
const destinationPath = NitroFS.DOWNLOAD_DIR + '/file.txt'

const file = await NitroFS.downloadFile(
  serverUrl,
  fileName,
  destinationPath,
  (downloadedBytes, totalBytes) => {
    console.log(`Downloading ${(downloadedBytes / totalBytes) * 100}%`)
  }
)
```

### Types

#### `NitroFile`

```typescript
interface NitroFile {
  name: string
  mimeType: string
  path: string
}
```

#### `NitroUploadOptions`

```typescript
interface NitroUploadOptions {
  file: NitroFile
  url: string
  headers?: Record<string, string>
}
```

#### `NitroFileStat`

Contains file/directory statistics information.

#### `NitroFileEncoding`

Type for file encoding options (e.g., 'utf8').

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Credits

Bootstrapped with [create-nitro-module](https://github.com/patrickkabwe/create-nitro-module).

## License

[MIT](LICENSE)
