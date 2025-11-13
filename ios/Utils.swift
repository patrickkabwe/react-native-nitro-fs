//
//  Utils.swift
//  NitroFS
//
//  Created by Patrick Kabwe on 26/04/2025.
//

import Foundation

struct NitroFSDirs {
    static private(set) var fileManager = FileManager.default
    static var NitroFSBundleDir = Bundle.main.bundlePath
    static var NitroFSDocDir = getDir(for: .documentDirectory)
    static var NitroFSCacheDir = getDir(for: .cachesDirectory)
    static var NitroFSDownloadsDir = ""
    
    static private func getDir(for searchPath: FileManager.SearchPathDirectory) -> String {
        let dirURL = fileManager.urls(for: searchPath, in: .userDomainMask).first
        return dirURL?.path ?? ""
    }
}

enum NitroFSError: Error {
    case unavailable(message: String)
    case fileError(message: String)
    case networkError(message: String)
    case encodingError(message: String)
}

extension NitroFSError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .unavailable(let message),
             .fileError(let message),
             .networkError(let message),
             .encodingError(let message):
            return message
        }
    }
}


func generateLargeFile(at path: String, sizeInMB: Int) throws {
    let fileURL = URL(fileURLWithPath: path)
    let fileSize = sizeInMB * 1024 * 1024
    let chunkSize = 1024 * 1024
    let buffer = [UInt8](repeating: 0x41, count: chunkSize)

    guard let outputStream = OutputStream(url: fileURL, append: false) else {
        throw NSError(domain: "FileError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not create file"])
    }

    outputStream.open()
    defer { outputStream.close() }

    var bytesWritten = 0
    while bytesWritten < fileSize {
        let toWrite = min(chunkSize, fileSize - bytesWritten)
        let written = outputStream.write(buffer, maxLength: toWrite)
        if written <= 0 {
            throw NSError(domain: "FileError", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to write data"])
        }
        bytesWritten += written
    }

    print("Generated file at \(path) (\(bytesWritten / 1024 / 1024) MB)")
}
