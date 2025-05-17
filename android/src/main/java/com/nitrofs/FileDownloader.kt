package com.nitrofs

import android.os.Handler
import android.os.Looper
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.onDownload
import io.ktor.client.request.prepareGet
import io.ktor.http.HttpMethod
import io.ktor.util.cio.writeChannel
import io.ktor.utils.io.ByteReadChannel
import io.ktor.utils.io.copyAndClose
import java.io.File

class FileDownloader {
    suspend fun downloadFile(
        serverUrl: String,
        fileName: String,
        destinationPath: String,
        onProgress: ((Double, Double) -> Unit)?
    ) {
        val outputFile = File(destinationPath)
        outputFile.parentFile?.mkdirs()
        val client = HttpClient(OkHttp)

        client.use { it
            it.prepareGet("$serverUrl/$fileName") {
                method = HttpMethod.Get
                onDownload { totalBytesSent, contentLength ->
                    if (totalBytesSent > 0 && contentLength !== null){
                        onProgress?.let {
                            Handler(Looper.getMainLooper()).post {
                                onProgress.invoke(totalBytesSent.toDouble(), contentLength.toDouble())
                            }
                        }
                    }
                }
            }.execute { response ->
                val channel: ByteReadChannel = response.body()
                channel.copyAndClose(outputFile.writeChannel())
            }
        }
    }
}