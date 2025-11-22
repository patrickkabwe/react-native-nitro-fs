//
//  NitroFSImpl.swift
//  NitroFS
//
//  Created by Patrick Kabwe on 26/04/2025.
//

import Foundation
import os

class NitroFSImpl {
    weak var fileManager: FileManager?
    
    init(fileManager: FileManager) {
        self.fileManager = fileManager
    }
    
    func exists(path: String) -> Bool {
        guard let fileManager else {
            return false
        }
        guard isValidPath(path) else {
            return false
        }
        // Try to normalize the path, but don't throw if it fails
        if let normalizedPath = try? getPath(path: path) {
            return fileManager.fileExists(atPath: normalizedPath)
        }
        return false
    }
    
    func writeFile(path: String, data: String, encoding: NitroFileEncoding) throws {
        guard fileManager != nil else {
            throw NitroFSError.unavailable(message: "Failed to write file. FileManager is unavailable")
        }
        
        let normalizedPath = try getPath(path: path)

        if encoding == .base64 {
            guard let decodedData = Data(base64Encoded: data) else {
                throw NitroFSError.encodingError(message: "Invalid base64 data")
            }
            try decodedData.write(to: URL(fileURLWithPath: normalizedPath))
        } else {
            try data.write(toFile: normalizedPath, atomically: true, encoding: getEncoding(nitroEncoding: encoding))
        }
    }
    
    func readFile(path: String, encoding: NitroFileEncoding) throws -> String {
        let normalizedPath = try getPath(path: path)
        let pathURL = URL(fileURLWithPath: normalizedPath)
        
        if encoding == .base64 {
            let data = try Data(contentsOf: pathURL)
            return data.base64EncodedString()
        }

        let fileHandle = try FileHandle(forReadingFrom: pathURL)
        defer { try? fileHandle.close() }

        var result = ""
        // TODO: make this chunk configurable?
        let chunkSize = 1024

        while true {
            if let chunk = try fileHandle.read(upToCount: chunkSize), !chunk.isEmpty {
                if let string = String(data: chunk, encoding: getEncoding(nitroEncoding: encoding)) {
                    result += string
                } else {
                    throw NitroFSError.encodingError(message: "Failed to decode chunk")
                }
            } else {
                break
            }
        }

        return result
    }
    
    func copy(source: String, destination: String) throws {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "Failed to copy file. FileManager is unavailable")
        }
        
        let sourcePath = try getPath(path: source)
        let destPath = try getPath(path: destination)
        
        try fileManager.copyItem(atPath: sourcePath, toPath: destPath)
    }
    
    func unlink(path: String) throws {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "Failed to unlink file. FileManager is unavailable")
        }
        let newPath = try getPath(path: path)
        try fileManager.removeItem(atPath: newPath)
    }
    
    func mkdir(path: String, mode: FileManager.ItemReplacementOptions = []) throws {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "Failed to mkdir file. FileManager is unavailable")
        }
        let normalizedPath = try getPath(path: path)
        try fileManager.createDirectory(atPath: normalizedPath, withIntermediateDirectories: true, attributes: nil)
    }
    
    func stat(path: String) throws -> NitroFileStat {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "Failed to stat file. FileManager is unavailable")
        }
        let normalizedPath = try getPath(path: path)
        let attributes = try fileManager.attributesOfItem(atPath: normalizedPath)
        let size = attributes[FileAttributeKey.size] as! Int
        let mtime = attributes[FileAttributeKey.modificationDate] as! Date
        let ctime = attributes[FileAttributeKey.creationDate] as! Date
        
        return NitroFileStat(
            size: Double(size),
            ctime: ctime.timeIntervalSince1970,
            mtime: mtime.timeIntervalSince1970,
            isFile: !IsDirectory(normalizedPath),
            isDirectory: IsDirectory(normalizedPath)
        )
    }
    
    func readdir(atPath path: String) throws -> [NitroFile] {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "Failed to stat file. FileManager is unavailable")
        }
        let normalizedPath = try getPath(path: path)
        let pathURL = URL(fileURLWithPath: normalizedPath)
        let contents = try fileManager.contentsOfDirectory(
            at: pathURL,
            includingPropertiesForKeys: [.isDirectoryKey, .contentTypeKey],
            options: .skipsHiddenFiles
        )
        
        return try contents.map { url in
            let fileName = url.lastPathComponent
            let filePath = url.path
            let mimeType = try getMimeType(for: url)
            
            return NitroFile(
                name: fileName,
                mimeType: mimeType,
                path: filePath
            )
        }
    }
    
    private func getMimeType(for url: URL) throws -> String {
        if let resourceValues = try? url.resourceValues(forKeys: [.contentTypeKey]),
           let contentType = resourceValues.contentType {
            return contentType.identifier
        }
        
        let pathExtension = url.pathExtension.lowercased()
        if pathExtension.isEmpty {
            return "application/octet-stream"
        }
        
        return NitroFSMimeTypes.mimeTypes[pathExtension] ?? "application/octet-stream"
    }
    
    func rename(oldPath: String, newPath: String) throws {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "Failed to rename file. FileManager is unavailable")
        }
        let normalizedOldPath = try getPath(path: oldPath)
        let normalizedNewPath = try getPath(path: newPath)
        let oldFile = URL(fileURLWithPath: normalizedOldPath)
        let newFile = URL(fileURLWithPath: normalizedNewPath)
        try fileManager.moveItem(at: oldFile, to: newFile)
    }
    
    func dirname(path: String) throws -> String {
        let pathURL = try pathToURL(path)
        return pathURL.deletingLastPathComponent().path
    }
    
    func extname(path: String) throws -> String {
        let pathURL = try pathToURL(path)
        return pathURL.pathExtension
    }
    
    func basename(path: String) throws -> String {
        let pathURL = try pathToURL(path)
        return pathURL.lastPathComponent
    }
    
    func uploadFile(
        file: NitroFile,
        uploadOptions: NitroUploadOptions,
        onProgress: ((_ uploadedBytes: Double, _ totalBytes: Double) -> Void)?
    ) async throws {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "Failed to upload file. FileManager is unavailable")
        }
        let fileUploader = NitroFSFileUploader(fileManager: fileManager)
        try await fileUploader.uploadFile(
            file: file,
            uploadOptions: uploadOptions,
            onProgress: onProgress
        )
    }
    
    func downloadFile(
        serverUrl: String,
        destinationPath: String,
        onProgress: ((Double, Double) -> Void)?
    ) async throws -> NitroFile {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "Failed to download file. FileManager is unavailable")
        }
        let fileDownloader = NitroFSFileDownloader(fileManager: fileManager)
        return try await fileDownloader.downloadFile(
            serverUrl,
            destinationPath,
            onProgress: onProgress
        )
    }
    
    private func getEncoding(nitroEncoding: NitroFileEncoding) -> String.Encoding {
        switch(nitroEncoding) {
        case .utf8:
            return .utf8
        case .ascii:
            return .ascii
        case .base64:
            // Base64 is handled separately in readFile/writeFile
            return .utf8
        default :
            fatalError("Unsupported encoding")
        }
    }
    
    private func IsDirectory(_ path: String) -> Bool {
        var isDirObjCBool = ObjCBool(false)
        return FileManager.default.fileExists(atPath: path, isDirectory: &isDirObjCBool) && isDirObjCBool.boolValue
    }
}
