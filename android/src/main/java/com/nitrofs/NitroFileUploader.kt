package com.nitrofs

import android.os.Handler
import android.os.Looper
import io.ktor.client.HttpClient
import com.margelo.nitro.nitrofs.NitroUploadMethod
import com.margelo.nitro.nitrofs.NitroUploadOptions
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.onUpload
import io.ktor.client.request.forms.formData
import io.ktor.client.request.forms.submitFormWithBinaryData
import io.ktor.http.ContentType
import io.ktor.http.Headers
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.utils.io.streams.asInput
import java.io.File

class NitroFileUploader {
    suspend fun handleUpload(
        file: File,
        uploadOptions: NitroUploadOptions,
        onProgress: ((Double, Double) -> Unit)?
    ) {
        val totalBytes = file.length()
        val client = HttpClient(OkHttp)

        client.use { it
            it.submitFormWithBinaryData(
                url = uploadOptions.url,
                formData = formData {
                    appendInput(
                        key = uploadOptions.field ?: "file",
                        headers = Headers.build {
                            append(HttpHeaders.ContentDisposition, "filename=\"${file.name}\"")
                            append(HttpHeaders.ContentType, ContentType.Application.OctetStream.toString())
                        },
                        size = totalBytes,
                    ) {
                        file.inputStream().asInput()
                    }
                }
            ){
                method = getMethod(uploadOptions.method)
                onUpload { totalBytesSent, totalBytes ->
                    if (totalBytesSent > 0 && totalBytes != null) {
                        onProgress?.let {
                            Handler(Looper.getMainLooper()).post {
                                it.invoke(totalBytesSent.toDouble(), totalBytes.toDouble())
                            }
                        }
                    }
                }
            }
        }
    }

    fun getMethod(method: NitroUploadMethod?): HttpMethod {
        return method.let {
            return when (it) {
                NitroUploadMethod.POST -> HttpMethod.Post
                NitroUploadMethod.PUT -> HttpMethod.Put
                NitroUploadMethod.PATCH -> HttpMethod.Patch
                else -> HttpMethod.Post
            }
        }
    }
}