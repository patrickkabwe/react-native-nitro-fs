package com.nitrofs

import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp

object NitroHttpClient {
    val client: HttpClient = HttpClient(OkHttp)

    fun close() {
        client.close()
    }
}
