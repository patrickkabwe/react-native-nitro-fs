package com.nitrofs

import android.util.Log
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import com.margelo.nitro.nitrofs.HybridNitroFSSpec
import com.margelo.nitro.nitrofs.NitroFile
import com.margelo.nitro.nitrofs.NitroFileEncoding
import com.margelo.nitro.nitrofs.NitroFileStat
import com.margelo.nitro.nitrofs.NitroUploadOptions

class HybridNitroFS: HybridNitroFSSpec() {
    val context = NitroModules.applicationContext ?: error("React Native context not found")
    val nitroFsImpl = NitroFSImpl(context)

    override val BUNDLE_DIR: String
        get() = ""
    override val DOCUMENT_DIR: String
        get()  = nitroFsImpl.getDocumentDir()

    override val CACHE_DIR: String
        get() = nitroFsImpl.getCacheDir()
    override val DOWNLOAD_DIR: String
        get() = nitroFsImpl.getDownloadDir()

    override fun exists(path: String): Promise<Boolean> {
        return Promise.async {
            nitroFsImpl.exists(path)
        }
    }

    override fun writeFile(
        path: String,
        data: String,
        encoding: NitroFileEncoding
    ): Promise<Unit> {
        return Promise.async {
            try {
                nitroFsImpl.writeFile(path, data, encoding)
            } catch (e: Exception) {
                Log.e("NitroFS", "Error writing file: ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun readFile(
        path: String,
        encoding: NitroFileEncoding
    ): Promise<String> {
        return Promise.async {
            try {
                nitroFsImpl.readFile(path, encoding)
            } catch (e: Exception) {
                Log.e("NitroFS", "Error reading file: ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun copyFile(
        srcPath: String,
        destPath: String
    ): Promise<Unit> {
        return Promise.async {
            try {
                nitroFsImpl.copyFile(srcPath, destPath)
            } catch (e: Exception) {
                Log.e("NitroFS", "Error copying file: ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun copy(
        srcPath: String,
        destPath: String
    ): Promise<Unit> {
        return copyFile(srcPath, destPath)
    }

    override fun unlink(path: String): Promise<Boolean> {
        return Promise.async {
            try {
                nitroFsImpl.unlink(path)
            } catch (e: Exception) {
                Log.e("NitroFS", "Error unlinking file: ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun mkdir(path: String): Promise<Boolean> {
        return Promise.async {
            try {
                nitroFsImpl.mkdir(path)
            } catch (e: Exception) {
                Log.e("NitroFS", "Error creating directory: ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun stat(path: String): Promise<NitroFileStat> {
        return Promise.async {
            nitroFsImpl.stat(path)
        }
    }

    override fun uploadFile(
        file: NitroFile,
        uploadOptions: NitroUploadOptions,
        onProgress: ((Double, Double) -> Unit)?
    ): Promise<Unit> {
        return Promise.async {
            try {
                nitroFsImpl.uploadFile(file, uploadOptions, onProgress)
            } catch (e: Exception) {
                Log.e("NitroFS", "Error uploading file: ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun downloadFile(
        serverUrl: String,
        fileName: String,
        destinationPath: String,
        onProgress: ((Double, Double) -> Unit)?
    ): Promise<NitroFile> {
        return Promise.async {
            try {
                nitroFsImpl.downloadFile(serverUrl, fileName, destinationPath, onProgress)
                NitroFile(
                    name = fileName,
                    path = destinationPath,
                    mimeType = "",
                )
            } catch (e: Exception) {
                Log.e("NitroFS", "Error downloading file: ${e.message}")
                throw Error(e)
            }
        }
    }
}
