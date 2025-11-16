package com.nitrofs

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
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.io.File

class NitroFileUploader {
    private val uploadScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val uploadJobs = ConcurrentHashMap<String, Job>()
    private val progressCallbacks = ConcurrentHashMap<String, ((Double, Double) -> Unit)>()

    suspend fun handleUpload(
        file: File,
        uploadOptions: NitroUploadOptions,
        onProgress: ((Double, Double) -> Unit)?
    ): String {
        val jobId = UUID.randomUUID().toString()
        val totalBytes = file.length()
        
        if (onProgress != null) {
            progressCallbacks[jobId] = onProgress
        }

        val client = HttpClient(OkHttp)
        val job = uploadScope.launch {
            try {
                client.use { httpClient ->
                    httpClient.submitFormWithBinaryData(
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
                    ) {
                        method = getMethod(uploadOptions.method)
                        onUpload { totalBytesSent, totalBytes ->
                            if (totalBytesSent > 0 && totalBytes != null) {
                                progressCallbacks[jobId]?.let { callback ->
                                    withContext(Dispatchers.Main) {
                                        callback.invoke(totalBytesSent.toDouble(), totalBytes.toDouble())
                                    }
                                }
                            }
                        }
                    }
                }
            } finally {
                uploadJobs.remove(jobId)
                progressCallbacks.remove(jobId)
            }
        }
        
        uploadJobs[jobId] = job
        return jobId
    }
    
    fun cancelUpload(jobId: String): Boolean {
        val job = uploadJobs[jobId]
        if (job != null) {
            job.cancel()
            uploadJobs.remove(jobId)
            progressCallbacks.remove(jobId)
            return true
        }
        return false
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