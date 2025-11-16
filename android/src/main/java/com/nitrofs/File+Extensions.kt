package com.nitrofs

import com.margelo.nitro.nitrofs.NitroFileStat
import java.io.File

fun File.toNitroFileStat(): NitroFileStat {
    return NitroFileStat(
        size = length().toDouble(),
        isFile = isFile,
        isDirectory = isDirectory,
        ctime = lastModified().toDouble(),
        mtime = lastModified().toDouble()
    )
}