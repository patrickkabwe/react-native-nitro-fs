package com.nitrofs

import android.util.Log
import com.margelo.nitro.nitrofs.NitroDownloadResult
import com.margelo.nitro.nitrofs.NitroFile
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.onDownload
import io.ktor.client.request.prepareGet
import io.ktor.http.HttpMethod
import io.ktor.http.isSuccess
import io.ktor.util.cio.writeChannel
import io.ktor.utils.io.ByteReadChannel
import io.ktor.utils.io.copyAndClose
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.io.File

class FileDownloader {
    private val downloadScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val downloadJobs = ConcurrentHashMap<String, Job>()
    private val progressCallbacks = ConcurrentHashMap<String, ((Double, Double) -> Unit)>()
    private val fileDeferreds = ConcurrentHashMap<String, CompletableDeferred<NitroFile>>()

    suspend fun downloadFile(
        serverUrl: String,
        destinationPath: String,
        onProgress: ((Double, Double) -> Unit)?
    ): NitroDownloadResult {
        val jobId = UUID.randomUUID().toString()
        val outputFile = File(destinationPath)
        outputFile.parentFile?.mkdirs()

        val fileDeferred = CompletableDeferred<NitroFile>()
        fileDeferreds[jobId] = fileDeferred

        if (onProgress != null) {
            progressCallbacks[jobId] = onProgress
        }

        val client = HttpClient(OkHttp)
        val job = downloadScope.launch {
            try {
                client.use { httpClient ->
                    httpClient.prepareGet(serverUrl) {
                        method = HttpMethod.Get
                        onDownload { totalBytesSent, contentLength ->
                            if (totalBytesSent > 0 && contentLength != null) {
                                progressCallbacks[jobId]?.let { callback ->
                                    withContext(Dispatchers.Main) {
                                        callback.invoke(totalBytesSent.toDouble(), contentLength.toDouble())
                                    }
                                }
                            }
                        }
                    }.execute { response ->
                        Log.d("TAG", "${response.status.isSuccess()} ${response.status.value} $serverUrl")
                        if (!response.status.isSuccess()) {
                            throw RuntimeException("HTTP ${response.status.value}: Failed to download file")
                        }
                        val contentType = response.headers["Content-Type"] ?: "application/octet-stream"
                        val channel: ByteReadChannel = response.body()
                        channel.copyAndClose(outputFile.writeChannel())
                        
                        // Complete the deferred with the file
                        val nitroFile = NitroFile(
                            name = outputFile.name,
                            path = outputFile.absolutePath,
                            mimeType = contentType
                        )
                        fileDeferred.complete(nitroFile)
                    }
                }
            } catch (e: Exception) {
                fileDeferred.completeExceptionally(e)
            } finally {
                downloadJobs.remove(jobId)
                progressCallbacks.remove(jobId)
                fileDeferreds.remove(jobId)
            }
        }
        
        downloadJobs[jobId] = job
        
        // Wait for download to complete and get the file
        val file = fileDeferred.await()
        
        return NitroDownloadResult(jobId = jobId, file = file)
    }
    
    fun cancelDownload(jobId: String): Boolean {
        val job = downloadJobs[jobId]
        if (job != null) {
            job.cancel()
            downloadJobs.remove(jobId)
            progressCallbacks.remove(jobId)
            fileDeferreds[jobId]?.cancel()
            fileDeferreds.remove(jobId)
            return true
        }
        return false
    }
}