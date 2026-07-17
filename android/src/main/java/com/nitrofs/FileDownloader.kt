package com.nitrofs

import android.util.Log
import com.margelo.nitro.nitrofs.NitroDownloadOptions
import com.margelo.nitro.nitrofs.NitroFile
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.onDownload
import io.ktor.client.request.header
import io.ktor.client.request.prepareGet
import io.ktor.http.HttpMethod
import io.ktor.http.isSuccess
import io.ktor.util.cio.writeChannel
import io.ktor.utils.io.ByteReadChannel
import io.ktor.utils.io.copyAndClose
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class FileDownloader {
    suspend fun downloadFile(
        downloadOptions: NitroDownloadOptions,
        onProgress: ((Double, Double) -> Unit)?
    ): NitroFile? {
        var contentType = ""
        val outputFile = File(downloadOptions.destinationPath)
        outputFile.parentFile?.mkdirs()

        val client = HttpClient(OkHttp)
        

        client.use { it
            it.prepareGet(downloadOptions.url) {
                method = HttpMethod.Get
                downloadOptions.headers?.forEach { (name, value) ->
                    header(name, value)
                }
                onDownload { totalBytesSent, contentLength ->
                    if (totalBytesSent > 0 && contentLength != null){
                        onProgress?.let {
                            withContext(Dispatchers.Main) {
                                onProgress.invoke(totalBytesSent.toDouble(), contentLength.toDouble())
                            }
                        }
                    }
                }
            }.execute { response ->
                Log.d("TAG", "${response.status.isSuccess()} ${response.status.value} ${downloadOptions.url}")
                if (!response.status.isSuccess()) {
                    throw RuntimeException("HTTP ${response.status.value}: Failed to download file")
                }
                contentType = response.headers["Content-Type"] ?: "application/octet-stream"
                val channel: ByteReadChannel = response.body()
                channel.copyAndClose(outputFile.writeChannel())
            }
        }
        
        return NitroFile(
            name = outputFile.name,
            path = outputFile.absolutePath,
            mimeType = contentType
        )
    }
}
