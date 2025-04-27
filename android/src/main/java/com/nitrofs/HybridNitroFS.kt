package com.nitrofs

import android.os.Environment
import android.util.Log
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import com.margelo.nitro.nitrofs.HybridNitroFSSpec
import com.margelo.nitro.nitrofs.NitroFile
import com.margelo.nitro.nitrofs.NitroFileEncoding
import com.margelo.nitro.nitrofs.NitroFileStat
import com.margelo.nitro.nitrofs.NitroUploadOptions
import java.io.File

class HybridNitroFS: HybridNitroFSSpec() {
    val context = NitroModules.applicationContext ?: error("React Native context not found")

    override val BUNDLE_DIR: String
        get() = ""
    override val DOCUMENT_DIR: String
        get()  = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)?.absolutePath ?: ""

    override val CACHE_DIR: String
        get() = context.cacheDir.absolutePath
    override val DOWNLOAD_DIR: String
        get() = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).absolutePath

    override fun exists(path: String): Promise<Boolean> {
        val dir = File(path)
        return Promise.resolved(dir.exists())
    }

    override fun writeFile(
        path: String,
        data: String,
        encoding: NitroFileEncoding
    ): Promise<Unit> {
        // TODO: handle encoding
        val file = File(path)
        file.writeText(data)
        return Promise.resolved(Unit)
    }

    override fun readFile(
        path: String,
        encoding: NitroFileEncoding
    ): Promise<String> {
        // TODO: handle encoding
        try {
            val file = File(path)
            return Promise.resolved(file.readText(charset = Charsets.UTF_8))
        } catch (e: Exception) {
            Log.e("NitroFS", "Error reading file: ${e.message}")
            return Promise.rejected(e)
        }
    }

    override fun copyFile(
        srcPath: String,
        destPath: String
    ): Promise<Unit> {
        try {
            val file = File(srcPath)
            val dest = File(destPath)
            file.copyTo(dest)
            return Promise.resolved(Unit)
        } catch (e: Exception) {
            Log.e("NitroFS", "Error copying file: ${e.message}")
            return Promise.rejected(e)
        }

    }

    override fun copy(
        srcPath: String,
        destPath: String
    ): Promise<Unit> {
        return copyFile(srcPath, destPath)
    }

    override fun unlink(path: String): Promise<Boolean> {
        val file = File(path)
        return Promise.resolved(file.deleteRecursively())
    }

    override fun mkdir(path: String): Promise<Boolean> {
        val file = File(path)
        return Promise.resolved(file.mkdirs())
    }

    override fun stat(path: String): Promise<NitroFileStat> {
        return Promise.async {
            val file = File(path)
            val stat = NitroFileStat(
                size = file.length().toDouble(),
                isFile = file.isFile,
                isDirectory = file.isDirectory,
                ctime = file.lastModified().toDouble(),
                mtime = file.lastModified().toDouble()
            )
            stat
        }
    }

    override fun uploadFile(
        file: NitroFile,
        uploadOptions: NitroUploadOptions,
        onProgress: ((Double, Double) -> Unit)?
    ): Promise<Unit> {
        TODO("Not yet implemented")
    }

    override fun downloadFile(
        serverUrl: String,
        fileName: String,
        destinationPath: String,
        onProgress: ((Double, Double) -> Unit)?
    ): Promise<NitroFile> {
        TODO("Not yet implemented")
    }
}
