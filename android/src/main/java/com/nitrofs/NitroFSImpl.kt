package com.nitrofs

import android.content.Context
import android.os.Environment
import android.util.Log
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

    fun exists(path: String): Boolean {
        val dir = File(path)
        return dir.exists()
    }

    fun unlink(path: String): Boolean {
        val file = File(path)
        return file.deleteRecursively()
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
        } catch (e: SecurityException) {
            throw RuntimeException("Permission denied writing to: $path")
        } catch (e: OutOfMemoryError) {
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
        } catch (e: OutOfMemoryError) {
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
        val file = File(srcPath)
        val dest = File(destPath)
        file.copyTo(dest)
    }


    fun mkdir(path: String): Boolean {
        val file = File(path)
        return file.mkdirs()
    }

    fun stat(path: String): NitroFileStat {
        val file = File(path)
        val stat = NitroFileStat(
            size = file.length().toDouble(),
            isFile = file.isFile,
            isDirectory = file.isDirectory,
            ctime = file.lastModified().toDouble(),
            mtime = file.lastModified().toDouble()
        )
        return stat
    }

    fun readdir(path: String): Array<String> {
        val file = File(path)
        if (!file.isDirectory) {
            throw Error("$path is not a directory")
        }
        return file.list() ?: emptyArray()
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

    fun basename(path: String, ext: String?): String {
        val file = File(path)
        return file.nameWithoutExtension

    }

    fun extname(path: String): String {
        val file = File(path)
        return file.extension
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
}