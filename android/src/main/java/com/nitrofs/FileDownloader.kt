package com.nitrofs

import com.margelo.nitro.nitrofs.NitroFile
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.onDownload
import io.ktor.client.request.prepareGet
import io.ktor.http.HttpMethod
import io.ktor.util.cio.writeChannel
import io.ktor.utils.io.ByteReadChannel
import io.ktor.utils.io.copyAndClose
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class FileDownloader {
    suspend fun downloadFile(
        serverUrl: String,
        destinationPath: String,
        onProgress: ((Double, Double) -> Unit)?
    ): NitroFile? {
        var contentType = ""
        val outputFile = File(destinationPath)
        outputFile.parentFile?.mkdirs()

        val client = HttpClient(OkHttp)
        

        client.use { it
            it.prepareGet(serverUrl) {
                method = HttpMethod.Get
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