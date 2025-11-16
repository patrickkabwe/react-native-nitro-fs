package com.nitrofs

import android.util.Log
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import com.margelo.nitro.nitrofs.HybridNitroFSSpec
import com.margelo.nitro.nitrofs.NitroFile
import com.margelo.nitro.nitrofs.NitroFileEncoding
import com.margelo.nitro.nitrofs.NitroFileStat
import com.margelo.nitro.nitrofs.NitroUploadOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers

class HybridNitroFS: HybridNitroFSSpec() {
    val context = NitroModules.applicationContext ?: error("React Native context not found")
    val nitroFsImpl = NitroFSImpl(context)
    val ioScope = CoroutineScope(Dispatchers.IO)

    override val BUNDLE_DIR: String
        get() = ""

    override val DOCUMENT_DIR: String
        get()  = nitroFsImpl.getDocumentDir()

    override val CACHE_DIR: String
        get() = nitroFsImpl.getCacheDir()

    override val DOWNLOAD_DIR: String
        get() = nitroFsImpl.getDownloadDir()

    override val PICTURES_DIR: String
        get() = nitroFsImpl.getPicturesDir()

    override val MOVIES_DIR: String
        get() = nitroFsImpl.getMoviesDir()

    override val DCIM_DIR: String
        get() = nitroFsImpl.getDCIMDir()

    override val MUSIC_DIR: String
        get() = nitroFsImpl.getMusicDir()

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
        return Promise.async(ioScope) {
            try {
                nitroFsImpl.writeFile(path, data, encoding)
            } catch (e: Exception) {
                Log.e(TAG, "Error writing file: ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun readFile(
        path: String,
        encoding: NitroFileEncoding
    ): Promise<String> {
        return Promise.async(ioScope) {
            try {
                nitroFsImpl.readFile(path, encoding)
            } catch (e: Exception) {
                Log.e(TAG, "Error reading file: ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun copyFile(
        srcPath: String,
        destPath: String
    ): Promise<Unit> {
        return Promise.async(ioScope) {
            try {
                nitroFsImpl.copyFile(srcPath, destPath)
            } catch (e: Exception) {
                Log.e(TAG, "Error copying file: ${e.message}")
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
        return Promise.async(ioScope) {
            try {
                nitroFsImpl.unlink(path)
            } catch (e: Exception) {
                Log.e(TAG, "Error unlinking file: ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun mkdir(path: String): Promise<Boolean> {
        return Promise.async(ioScope) {
            try {
                nitroFsImpl.mkdir(path)
            } catch (e: Exception) {
                Log.e(TAG, "Error creating directory: ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun stat(path: String): Promise<NitroFileStat> {
        return Promise.async(ioScope) {
            nitroFsImpl.stat(path)
        }
    }

    override fun readdir(path: String): Promise<Array<NitroFile>> {
        return Promise.async(ioScope) {
            try {
                nitroFsImpl.readdir(path)
            } catch (e: Exception) {
                Log.e(TAG, "Error while calling readdir(...): ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun rename(
        oldPath: String,
        newPath: String
    ): Promise<Unit> {
        return Promise.async(ioScope) {
            try {
                nitroFsImpl.rename(oldPath, newPath)
            } catch (e: Exception) {
                Log.e(TAG, "Error while calling rename(...): ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun dirname(path: String): String {
        try {
            return nitroFsImpl.dirname(path)
        } catch (e: Exception) {
            Log.e(TAG, "Error while calling dirname(...): ${e.message}")
            throw Error(e)
        }
    }

    override fun basename(path: String): String {
        try {
            return nitroFsImpl.basename(path)
        } catch (e: Exception) {
            Log.e(TAG, "Error while calling basename(...): ${e.message}")
            throw Error(e)
        }
    }

    override fun extname(path: String): String {
        try {
            return nitroFsImpl.extname(path)
        } catch (e: Exception) {
            Log.e(TAG, "Error while calling extname(...): ${e.message}")
            throw Error(e)
        }
    }

    override fun uploadFile(
        file: NitroFile,
        uploadOptions: NitroUploadOptions,
        onProgress: ((Double, Double) -> Unit)?
    ): Promise<Unit> {
        return Promise.async(ioScope) {
            try {
                nitroFsImpl.uploadFile(file, uploadOptions, onProgress)
            } catch (e: Exception) {
                Log.e(TAG, "Error uploading file: ${e.message}")
                throw Error(e)
            }
        }
    }

    override fun downloadFile(
        serverUrl: String,
        destinationPath: String,
        onProgress: ((Double, Double) -> Unit)?
    ): Promise<NitroFile> {
        return Promise.async(ioScope) {
            try {
                nitroFsImpl.downloadFile(serverUrl, destinationPath, onProgress)
            } catch (e: Exception) {
                Log.e(TAG, "Error downloading file: ${e.message}")
                throw Error(e)
            }
        }
    }

    companion object {
        const val TAG = "NitroFS"
    }
}
