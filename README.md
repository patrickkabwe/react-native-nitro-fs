# React Native NitroFS

![React Native NitroFS](https://github.com/user-attachments/assets/14fa98eb-fbee-4e00-bc85-eb3a8f0e9832)

[![npm version](https://img.shields.io/npm/v/react-native-nitro-fs?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/react-native-nitro-fs)
[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/7KXUyHjz)
[![npm downloads](https://img.shields.io/npm/dt/react-native-nitro-fs.svg?style=for-the-badge)](https://www.npmjs.org/package/react-native-nitro-fs)
[![npm downloads](https://img.shields.io/npm/dm/react-native-nitro-fs.svg?style=for-the-badge)](https://www.npmjs.org/package/react-native-nitro-fs)
[![mit licence](https://img.shields.io/dub/l/vibe-d.svg?style=for-the-badge)](https://github.com/patrickkabwe/react-native-nitro-fs/blob/main/LICENSE)

A high-performance file system module for React Native that provides native-speed file operations and network transfers using Swift (iOS) and Kotlin (Android) implementations.

## 🚀 Features

- **📁 File Operations**: Read, write, copy, delete, and manage files
- **📂 Directory Management**: Create, navigate, and manage directories
- **⬆️ File Uploads**: Upload files with progress tracking and multipart support
- **⬇️ File Downloads**: Download files with progress tracking
- **🔍 File Inspection**: Check existence, get file stats, and list directory contents
- **⚡ Native Performance**: Direct Swift/Kotlin implementations for optimal speed
- **📱 Cross-Platform**: Full support for iOS and Android
- **🛡️ Error Handling**: Comprehensive error handling with detailed messages
- **💾 Memory Efficient**: Optimized for large files with chunked reading

## 📋 Requirements

- **React Native**: v0.78.0 or higher
- **Node.js**: 18.0.0 or higher
- **Platforms**: iOS 12.0+, Android API 21+

## 📦 Installation

```bash
# Using bun (recommended)
bun add react-native-nitro-fs react-native-nitro-modules@0.31.5

# Using npm
npm install react-native-nitro-fs react-native-nitro-modules@0.31.5

# Using yarn
yarn add react-native-nitro-fs react-native-nitro-modules@0.31.5
```

### iOS Setup

```bash
cd ios && pod install
```

## 🎯 Quick Start

```typescript
import { NitroFS } from 'react-native-nitro-fs'

// Basic file operations
const exists = await NitroFS.exists('/path/to/file')
const content = await NitroFS.readFile('/path/to/file', 'utf8')
await NitroFS.writeFile('/path/to/file', 'Hello, World!', 'utf8')

// Download with progress
const file = await NitroFS.downloadFile(
  'https://example.com/file.txt',
  NitroFS.DOWNLOAD_DIR + '/file.txt',
  (downloadedBytes, totalBytes) => {
    console.log(`Downloading ${(downloadedBytes / totalBytes) * 100}%`)
  }
)

// Upload with progress
await NitroFS.uploadFile(
  { name: 'file.txt', mimeType: 'text/plain', path: '/path/to/file.txt' },
  { url: 'https://example.com/upload', method: 'POST', field: 'file' },
  (uploadedBytes, totalBytes) => {
    console.log(`Uploading ${(uploadedBytes / totalBytes) * 100}%`)
  }
)
```

## 📚 API Reference

### Directory Constants

Access predefined directory paths for different use cases:

```typescript
// Bundle directory (read-only, app resources)
NitroFS.BUNDLE_DIR

// Documents directory (user data, backed up)
NitroFS.DOCUMENT_DIR

// Cache directory (temporary data, not backed up)
NitroFS.CACHE_DIR

// Downloads directory (user downloads)
NitroFS.DOWNLOAD_DIR
```

### File System Operations

#### `exists(path: string): Promise<boolean>`

Check if a file or directory exists at the specified path.

```typescript
// Check if file exists
const fileExists = await NitroFS.exists('/path/to/file.txt')

// Check if directory exists
const dirExists = await NitroFS.exists('/path/to/directory')
```

#### `writeFile(path: string, data: string, encoding: NitroFileEncoding): Promise<void>`

Write data to a file. Creates parent directories automatically and performs atomic writes.

```typescript
// Write text file
await NitroFS.writeFile(
  NitroFS.DOCUMENT_DIR + '/config.json',
  JSON.stringify({ theme: 'dark' }),
  'utf8'
)

// Write with different encoding
await NitroFS.writeFile('/path/to/file.txt', 'Hello World', 'utf8')
```

**Features:**

- ✅ Automatic parent directory creation
- ✅ Atomic write operations
- ✅ Disk space validation
- ✅ Comprehensive error handling

#### `readFile(path: string, encoding: NitroFileEncoding): Promise<string>`

Read the contents of a file with optimized memory handling for large files.

```typescript
// Read text file
const content = await NitroFS.readFile('/path/to/file.txt', 'utf8')

// Read JSON file
const config = JSON.parse(
  await NitroFS.readFile('/path/to/config.json', 'utf8')
)
```

**Performance Features:**

- 🚀 Adaptive chunked reading for large files
- 💾 Memory-efficient handling
- ⚠️ Automatic size limits for very large files

#### `copyFile(srcPath: string, destPath: string): Promise<void>`

Copy a file from source to destination.

```typescript
// Copy file to documents directory
await NitroFS.copyFile(
  '/path/to/source.txt',
  NitroFS.DOCUMENT_DIR + '/backup.txt'
)
```

#### `copy(srcPath: string, destPath: string): Promise<void>`

Copy a file or directory recursively.

```typescript
// Copy entire directory
await NitroFS.copy('/path/to/source', '/path/to/destination')
```

#### `unlink(path: string): Promise<boolean>`

Delete a file or directory.

```typescript
// Delete file
await NitroFS.unlink('/path/to/file.txt')

// Delete directory (recursive)
await NitroFS.unlink('/path/to/directory')
```

#### `mkdir(path: string): Promise<boolean>`

Create a directory.

```typescript
// Create single directory
await NitroFS.mkdir('/path/to/newdir')

// Create nested directories (handled automatically)
await NitroFS.mkdir('/path/to/nested/directories')
```

#### `stat(path: string): Promise<NitroFileStat>`

Get detailed information about a file or directory.

```typescript
const stat = await NitroFS.stat('/path/to/file.txt')
console.log({
  size: stat.size, // File size in bytes
  isDirectory: stat.isDirectory,
  isFile: stat.isFile,
  modifiedTime: stat.mtime, // Last modified timestamp
  createdTime: stat.ctime, // Creation timestamp
})
```

#### `readdir(path: string): Promise<string[]>`

List contents of a directory.

```typescript
// List all files and directories
const items = await NitroFS.readdir('/path/to/directory')
console.log('Directory contents:', items)
```

#### `rename(oldPath: string, newPath: string): Promise<void>`

Rename or move a file or directory.

```typescript
// Rename file
await NitroFS.rename('/path/to/old.txt', '/path/to/new.txt')

// Move file to different directory
await NitroFS.rename('/path/to/file.txt', '/new/path/file.txt')
```

### Path Utilities

#### `dirname(path: string): string`

Get the directory name from a path.

```typescript
const dir = NitroFS.dirname('/path/to/file.txt')
// Returns: '/path/to'
```

#### `basename(path: string): string`

Get the filename from a path, including the file extension.

```typescript
const name = NitroFS.basename('/path/to/file.txt')
// Returns: 'file.txt'

const nameWithExt = NitroFS.basename('/path/to/document.pdf')
// Returns: 'document.pdf'
```

#### `extname(path: string): string`

Get the file extension from a path.

```typescript
const ext = NitroFS.extname('/path/to/file.txt')
// Returns: '.txt'
```

### Network Operations

#### `uploadFile(file: NitroFile, uploadOptions: NitroUploadOptions, onProgress?: (uploadedBytes: number, totalBytes: number) => void): Promise<void>`

Upload a file to a server with progress tracking and multipart support.

```typescript
const file = {
  name: 'document.pdf',
  mimeType: 'application/pdf',
  path: NitroFS.DOCUMENT_DIR + '/document.pdf',
}

const uploadOptions = {
  url: 'https://api.example.com/upload',
  method: 'POST',
  field: 'file',
  headers: {
    'Authorization': 'Bearer your-token',
    'X-Custom-Header': 'value',
  },
}

await NitroFS.uploadFile(file, uploadOptions, (uploadedBytes, totalBytes) => {
  const progress = (uploadedBytes / totalBytes) * 100
  console.log(`Upload progress: ${progress.toFixed(1)}%`)
})
```

#### `downloadFile(serverUrl: string, destinationPath: string, onProgress?: (downloadedBytes: number, totalBytes: number) => void): Promise<NitroFile>`

Download a file from a server with progress tracking.

```typescript
const serverUrl = 'https://example.com/files/document.pdf'
const destinationPath = NitroFS.DOWNLOAD_DIR + '/document.pdf'

const downloadedFile = await NitroFS.downloadFile(
  serverUrl,
  destinationPath,
  (downloadedBytes, totalBytes) => {
    const progress = (downloadedBytes / totalBytes) * 100
    console.log(`Download progress: ${progress.toFixed(1)}%`)
  }
)

console.log('Downloaded file:', downloadedFile)
// Returns: { name: 'document.pdf', mimeType: 'application/pdf', path: '/path/to/file' }
```

## 📝 Type Definitions

### `NitroFile`

```typescript
interface NitroFile {
  name: string // File name with extension
  mimeType: string // MIME type (e.g., 'text/plain', 'application/pdf')
  path: string // Full file path
}
```

### `NitroUploadOptions`

```typescript
interface NitroUploadOptions {
  url: string // Upload endpoint URL
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' // HTTP method
  field: string // Form field name
  headers?: Record<string, string> // Custom headers
}
```

### `NitroFileStat`

```typescript
interface NitroFileStat {
  size: number // File size in bytes
  isDirectory: boolean // True if path is a directory
  isFile: boolean // True if path is a file
  mtime: number // Last modified timestamp
  ctime: number // Creation timestamp
}
```

### `NitroFileEncoding`

```typescript
type NitroFileEncoding = 'utf8' | 'ascii' | 'base64'
```

## 🔧 Advanced Usage

### Error Handling

```typescript
try {
  const content = await NitroFS.readFile('/path/to/file.txt', 'utf8')
  console.log('File content:', content)
} catch (error) {
  if (error.message.includes('File does not exist')) {
    console.log('File not found')
  } else if (error.message.includes('Permission denied')) {
    console.log('No permission to access file')
  } else {
    console.error('Unexpected error:', error.message)
  }
}
```

### Working with Large Files

```typescript
// The library automatically handles large files efficiently
const largeFile = await NitroFS.readFile('/path/to/large-file.txt', 'utf8')

// For very large files (>100MB), consider streaming or chunked processing
const stat = await NitroFS.stat('/path/to/large-file.txt')
if (stat.size > 100 * 1024 * 1024) {
  // 100MB
  console.log('Large file detected, consider streaming')
}
```

### Directory Navigation

```typescript
// List all files in documents directory
const files = await NitroFS.readdir(NitroFS.DOCUMENT_DIR)

// Filter for specific file types
const textFiles = files.filter((file) => file.endsWith('.txt'))

// Get file stats for each file
for (const file of files) {
  const filePath = `${NitroFS.DOCUMENT_DIR}/${file}`
  const stat = await NitroFS.stat(filePath)
  console.log(`${file}: ${stat.size} bytes`)
}
```

### File Backup Example

```typescript
const backupFile = async (sourcePath: string) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = `${NitroFS.DOCUMENT_DIR}/backup-${timestamp}.txt`

  try {
    await NitroFS.copyFile(sourcePath, backupPath)
    console.log('Backup created successfully')
  } catch (error) {
    console.error('Backup failed:', error.message)
  }
}
```

## 🚨 Common Issues & Solutions

### Permission Errors

**Issue**: "Permission denied" errors on Android
**Solution**: Ensure your app has the necessary permissions in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### Large File Handling

**Issue**: Memory issues with large files
**Solution**: The library automatically handles large files with chunked reading, but you can implement custom streaming for very large files.

### Network Timeouts

**Issue**: Upload/download operations hanging
**Solution**: The library includes timeout handling, but you can implement custom timeout logic:

```typescript
const uploadWithTimeout = async (
  file: NitroFile,
  options: NitroUploadOptions
) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Upload timeout')), 30000)
  })

  return Promise.race([NitroFS.uploadFile(file, options), timeoutPromise])
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/patrickkabwe/react-native-nitro-fs.git
cd react-native-nitro-fs

# Install dependencies
bun install

# Run example app
cd example
bun install
npx react-native run-ios  # or run-android
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Bootstrapped with [create-nitro-module](https://github.com/patrickkabwe/create-nitro-module).

---

**Made with ❤️ for the React Native community**

> 💬 Have any questions? Join our [Discord channel](https://discord.gg/7KXUyHjz)
