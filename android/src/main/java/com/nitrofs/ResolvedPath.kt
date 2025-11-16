package com.nitrofs

import android.content.ContentResolver
import android.content.Context
import android.net.Uri
import java.io.File
import androidx.core.net.toUri
import java.io.InputStream
import java.io.OutputStream

sealed class ResolvedPath {
    data class Content(val uri: Uri) : ResolvedPath()
    data class FilePath(val file: File) : ResolvedPath()
}

fun String.toResolvedPath(): ResolvedPath? {
    return when {
        startsWith("content://") || startsWith("file://") ->
            this.toUri().toResolvedPath()

        else -> ResolvedPath.FilePath(File(this))
    }
}

fun Uri.toResolvedPath(): ResolvedPath? {
    return when (scheme) {
        ContentResolver.SCHEME_CONTENT ->
            ResolvedPath.Content(this)

        ContentResolver.SCHEME_FILE -> {
            val p = path ?: return null
            ResolvedPath.FilePath(File(p))
        }

        else -> null
    }
}

fun ResolvedPath.openInputStream(context: Context): InputStream? {
    return when (this) {
        is ResolvedPath.Content -> context.contentResolver.openInputStream(uri)
        is ResolvedPath.FilePath -> if (file.exists()) file.inputStream() else null
    }
}

fun ResolvedPath.openOutputStream(context: Context, append: Boolean = false): OutputStream? {
    return when (this) {
        is ResolvedPath.Content -> {
            val mode = if (append) "wa" else "w"
            context.contentResolver.openOutputStream(uri, mode)
        }
        is ResolvedPath.FilePath -> {
            file.parentFile?.mkdirs()
            file.outputStream()
        }
    }
}
