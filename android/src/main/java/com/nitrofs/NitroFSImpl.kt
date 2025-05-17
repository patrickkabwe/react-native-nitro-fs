package com.nitrofs

import android.content.Context
import android.os.Environment
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.margelo.nitro.nitrofs.NitroFile
import com.margelo.nitro.nitrofs.NitroFileEncoding
import com.margelo.nitro.nitrofs.NitroFileStat
import com.margelo.nitro.nitrofs.NitroUploadOptions
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
        file.writeText(data, charset = getFileEncoding(encoding))
    }

    fun readFile(
        path: String,
        encoding: NitroFileEncoding
    ): String {
        val file = File(path)
        return file.readText(charset = getFileEncoding(encoding))
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

    fun getDocumentDir(): String {
        return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)?.absolutePath ?: ""
    }

    fun getCacheDir(): String {
        return context.cacheDir.absolutePath
    }

    fun getDownloadDir(): String {
        return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)?.absolutePath ?: ""
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
        fileName: String,
        destinationPath: String,
        onProgress: ((Double, Double) -> Unit)?
    ) {
        fileDownloader.downloadFile(
            serverUrl,
            fileName,
            destinationPath,
            onProgress
        )
    }

    fun getFileEncoding(encoding: NitroFileEncoding): Charset {
        return when(encoding){
            NitroFileEncoding.UTF8 -> Charsets.UTF_8
            NitroFileEncoding.ASCII -> Charsets.US_ASCII
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