package com.nitrofs

import com.margelo.nitro.core.ArrayBuffer
import java.io.File
import java.io.RandomAccessFile
import java.nio.channels.FileChannel

internal fun File.toMappedArrayBuffer(): ArrayBuffer {
    RandomAccessFile(this, "rw").use { randomAccessFile ->
        val channel = randomAccessFile.channel
        val byteSize = channel.size()

        if (byteSize > Int.MAX_VALUE) {
            throw IllegalStateException(
                "File is too large to expose as ArrayBuffer. path=$absolutePath, size=$byteSize"
            )
        }

        if (byteSize == 0L) {
            return ArrayBuffer.allocate(0)
        }

        val mappedBuffer = channel.map(FileChannel.MapMode.PRIVATE, 0, byteSize)
        return ArrayBuffer.wrap(mappedBuffer)
    }
}
