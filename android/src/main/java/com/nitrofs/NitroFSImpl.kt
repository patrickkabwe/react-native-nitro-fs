package com.nitrofs

import android.content.Context
import android.os.Environment
import android.provider.DocumentsContract
import android.provider.OpenableColumns
import android.util.Log
import android.webkit.MimeTypeMap
import com.facebook.react.bridge.ReactApplicationContext
import com.margelo.nitro.nitrofs.NitroFile
import com.margelo.nitro.nitrofs.NitroFileEncoding
import com.margelo.nitro.nitrofs.NitroFileStat
import com.margelo.nitro.nitrofs.NitroUploadOptions
import android.util.Base64
import java.io.File
import java.io.FileOutputStream
import java.nio.charset.Charset

class NitroFSImpl(val context: ReactApplicationContext) {
    private val nitroFileUploader: NitroFileUploader = NitroFileUploader()
    private val fileDownloader: FileDownloader = FileDownloader()

    private val contentResolver = context.contentResolver

    fun exists(path: String): Boolean {
        val resolved = path.toResolvedPath() ?: return false
        return when(resolved) {
            is ResolvedPath.FilePath -> resolved.file.exists()
            is ResolvedPath.Content -> {
                contentResolver.query(
                    resolved.uri,
                    arrayOf("_id"),
                    null,
                    null,
                    null
                )?.use { cursor -> cursor.moveToFirst()  } ?: false
            }
        }
    }

    fun unlink(path: String): Boolean {
        val resolved = path.toResolvedPath() ?: return false
        return when(resolved) {
            is ResolvedPath.FilePath -> resolved.file.deleteRecursively()
            is ResolvedPath.Content -> {
                contentResolver.delete(resolved.uri, null, null) > 0
            }
        }
    }

    fun writeFile(
        path: String,
        data: String,
        encoding: NitroFileEncoding
    ) {
        val file = File(path)

        try {
            val parentDir = file.parentFile
            if (parentDir != null && !parentDir.exists()) {
                if (!parentDir.mkdirs()) {
                    throw RuntimeException("Failed to create parent directories for: $path")
                }
            }

            if (encoding == NitroFileEncoding.BASE64) {
                val decodedBytes = Base64.decode(data, Base64.DEFAULT)
                val dataSize = decodedBytes.size
                val availableSpace = file.parentFile?.freeSpace ?: 0L

                if (dataSize > availableSpace) {
                    throw RuntimeException("Insufficient disk space. Required: ${dataSize / (1024 * 1024)}MB, Available: ${availableSpace / (1024 * 1024)}MB")
                }

                file.writeBytes(decodedBytes)
            } else {
                val dataSize = data.toByteArray(getFileEncoding(encoding)).size
                val availableSpace = file.parentFile?.freeSpace ?: 0L

                if (dataSize > availableSpace) {
                    throw RuntimeException("Insufficient disk space. Required: ${dataSize / (1024 * 1024)}MB, Available: ${availableSpace / (1024 * 1024)}MB")
                }

                file.writeText(data, charset = getFileEncoding(encoding))
            }
        } catch (_: SecurityException) {
            throw RuntimeException("Permission denied writing to: $path")
        } catch (_: OutOfMemoryError) {
            throw RuntimeException("Failed to write file: Out of memory. Data may be too large.")
        } catch (e: Exception) {
            throw RuntimeException("Failed to write file: ${e.message}")
        }
    }

    fun readFile(
        path: String,
        encoding: NitroFileEncoding
    ): String {
        val file = File(path)

        if (!file.exists()) {
            throw RuntimeException("File does not exist: $path")
        }

        if (!file.isFile) {
            throw RuntimeException("Path is not a file: $path")
        }

        val fileSize = file.length()
        val maxSize = 100 * 1024 * 1024 // 100MB limit

        if (fileSize > maxSize) {
            throw RuntimeException("File too large (${fileSize / (1024 * 1024)}MB). Maximum size is 100MB.")
        }

        return try {
            if (encoding == NitroFileEncoding.BASE64) {
                val bytes = file.readBytes()
                Base64.encodeToString(bytes, Base64.DEFAULT)
            } else if (fileSize < 1024 * 1024) {
                file.readText(charset = getFileEncoding(encoding))
            } else {
                readFileChunked(file, getFileEncoding(encoding))
            }
        } catch (_: OutOfMemoryError) {
            throw RuntimeException("Failed to read file: Out of memory. File may be too large.")
        } catch (e: Exception) {
            throw RuntimeException("Failed to read file: ${e.message}")
        }
    }
    
    private fun readFileChunked(file: File, charset: Charset): String {
        val buffer = StringBuilder()
        val chunkSize = 64 * 1024
        
        file.inputStream().buffered().reader(charset).use { reader ->
            val charBuffer = CharArray(chunkSize)
            var bytesRead: Int
            
            while (reader.read(charBuffer).also { bytesRead = it } != -1) {
                buffer.append(charBuffer, 0, bytesRead)
            }
        }
        
        return buffer.toString()
    }

    fun copyFile(
        srcPath: String,
        destPath: String
    ) {
        val src = srcPath.toResolvedPath() ?:  throw Error("Invalid source path: $srcPath")
        val dest = destPath.toResolvedPath() ?: throw Error("Invalid destination path: $destPath")

        try {
            src.openInputStream(context)?.use { input ->
                dest.openOutputStream(context)?.use { output ->
                    input.copyTo(output, DEFAULT_BUFFER_SIZE)
                }
            }
        } catch (e: Exception) {
            throw Error("Failed to copy file: ${e.message}")
        }
    }


    fun mkdir(path: String): Boolean {
        val resolved = path.toResolvedPath() ?: return false
        return when(resolved) {
            is ResolvedPath.FilePath -> resolved.file.mkdirs()
            is ResolvedPath.Content -> throw Error("Cannot create directory from content URI: $path")
        }
    }

    fun stat(path: String): NitroFileStat {
        val resolved = path.toResolvedPath() ?: throw Error("Invalid path: $path")
        return when(resolved) {
            is ResolvedPath.FilePath -> resolved.file.toNitroFileStat()
            is ResolvedPath.Content -> {
                val uri = resolved.uri
                val projection = arrayOf(
                    DocumentsContract.Document.COLUMN_SIZE,
                    DocumentsContract.Document.COLUMN_MIME_TYPE,
                    DocumentsContract.Document.COLUMN_LAST_MODIFIED,
                )
                contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
                    if (!cursor.moveToFirst()) {
                        throw Error("Unable to stat content uri (no row): $path")
                    }

                    fun getString(col: String): String? {
                        val idx = cursor.getColumnIndex(col)
                        return if (idx >= 0 && !cursor.isNull(idx)) cursor.getString(idx) else null
                    }

                    fun getLong(col: String): Long? {
                        val idx = cursor.getColumnIndex(col)
                        return if (idx >= 0 && !cursor.isNull(idx)) cursor.getLong(idx) else null
                    }

                    val size       = getLong(DocumentsContract.Document.COLUMN_SIZE) ?: 0L
                    val mime       = getString(DocumentsContract.Document.COLUMN_MIME_TYPE) ?: contentResolver.getType(uri)
                    val isDirectory      = mime == DocumentsContract.Document.MIME_TYPE_DIR
                    val isFile = !isDirectory
                    val lastModified = getLong(DocumentsContract.Document.COLUMN_LAST_MODIFIED) ?: 0L

                    NitroFileStat(
                        size = size.toDouble(),
                        isFile = isFile,
                        isDirectory = isDirectory,
                        ctime = lastModified.toDouble(),
                        mtime = lastModified.toDouble()
                    )
                } ?: throw Error("Unable to stat content uri (query failed): $path")
            }
        }
    }

    fun readdir(path: String): Array<NitroFile> {
        val file = File(path)
        if (!file.exists()) {
            throw Error("Directory does not exist: $path")
        }
        if (!file.isDirectory) {
            throw Error("$path is not a directory")
        }
        
        if (!file.canRead()) {
            throw Error("Permission denied: Cannot read directory $path")
        }

        val files = file.listFiles() ?: throw Error("Failed to list files in directory: $path")

        val nitroFiles = files.map { fileItem ->
            val fileName = fileItem.name
            val filePath = fileItem.absolutePath
            val mimeType = getMimeType(fileName)
            
            NitroFile(
                name = fileName,
                mimeType = mimeType,
                path = filePath
            )
        }
        
        return nitroFiles.toTypedArray()
    }

    fun rename(
        oldPath: String,
        newPath: String
    ) {
        val oldFile = File(oldPath)
        if (!oldFile.exists()) {
            throw Error("$oldPath does not exist or is not a file")
        }
        val newFile = File(newPath)
        oldFile.renameTo(newFile)
    }

    fun dirname(path: String): String {
        val file = File(path)
        return file.parent ?: ""
    }

    fun basename(path: String): String {
        val resolved = path.toResolvedPath() ?: throw Error("Invalid path: $path")
        return when(resolved) {
            is ResolvedPath.FilePath -> resolved.file.name
            is ResolvedPath.Content -> {
                val uri = resolved.uri
                val fileName = contentResolver.query(
                    uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null
                )?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                        if (nameIndex != -1) {
                            cursor.getString(nameIndex)
                        } else {
                            null
                        }
                    } else {
                        null
                    }
                } ?: throw Error("Unable to get file name from content URI: $path")

                fileName
            }
        }
    }

    fun extname(path: String): String {
        val resolved = path.toResolvedPath() ?: throw Error("Invalid path: $path")

        return when(resolved){
            is ResolvedPath.FilePath -> resolved.file.extension
            is ResolvedPath.Content -> {
                val mimeType: String? = contentResolver.getType(resolved.uri)
                if (mimeType != null) {
                    MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeType) ?: throw  Error("Unable to get extension from mime type: $mimeType")
                } else {
                    throw Error("Unable to get mime type from content URI: $path")
                }
            }
        }
    }

    fun getDocumentDir(): String {
        return context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)?.absolutePath ?: ""
    }

    fun getCacheDir(): String {
        return context.cacheDir.absolutePath
    }

    fun getDownloadDir(): String {
        return context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)?.absolutePath ?: ""
    }

    fun getDCIMDir(): String {
        return context.getExternalFilesDir(Environment.DIRECTORY_DCIM)?.absolutePath ?: ""
    }

    fun getMoviesDir(): String {
        return context.getExternalFilesDir(Environment.DIRECTORY_MOVIES)?.absolutePath ?: ""
    }

    fun getPicturesDir(): String {
        return context.getExternalFilesDir(Environment.DIRECTORY_PICTURES)?.absolutePath ?: ""
    }

    fun getMusicDir(): String {
        return context.getExternalFilesDir(Environment.DIRECTORY_MUSIC)?.absolutePath ?: ""
    }

    suspend fun uploadFile(file: NitroFile,
                   uploadOptions: NitroUploadOptions,
                   onProgress: ((Double, Double) -> Unit)?
    ) {
        val nitroFile = File(file.path)
        nitroFileUploader.handleUpload(nitroFile, uploadOptions, onProgress)
    }

    suspend fun downloadFile(
        serverUrl: String,
        destinationPath: String,
        onProgress: ((Double, Double) -> Unit)?
    ): NitroFile {
        val file = fileDownloader.downloadFile(
            serverUrl,
            destinationPath,
            onProgress
        )
        if (file != null) {
            return file
        } else {
            throw RuntimeException("Failed to download file from: $serverUrl")
        }
    }

    fun getFileEncoding(encoding: NitroFileEncoding): Charset {
        return when(encoding){
            NitroFileEncoding.UTF8 -> Charsets.UTF_8
            NitroFileEncoding.ASCII -> Charsets.US_ASCII
            NitroFileEncoding.BASE64 -> Charsets.UTF_8 // Base64 is handled separately
        }
    }

    // used to generate a large file for testing purposes
    fun generateLargeFile(context: Context, fileName: String = "large_dummy_file.txt", sizeInMB: Int = 100): File {
        val file = File(context.cacheDir, fileName)
        val buffer = ByteArray(1024 * 1024)

        FileOutputStream(file).use { output ->
            repeat(sizeInMB) {
                output.write(buffer)
            }
        }

        Log.d("LargeFile", "Generated file: ${file.absolutePath}, Size: ${file.length()} bytes")
        return file
    }
 
    private fun getMimeType(fileName: String): String {
        val extension = fileName.substringAfterLast('.', "").lowercase()
        if (extension.isEmpty()) {
            return "application/octet-stream"
        }
        
        val mimeTypeMap = MimeTypeMap.getSingleton()
        val mimeType = mimeTypeMap.getMimeTypeFromExtension(extension)
        return mimeType ?: "application/octet-stream"
    }

}