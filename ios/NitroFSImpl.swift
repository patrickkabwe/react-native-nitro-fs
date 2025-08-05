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
        return fileManager.fileExists(atPath: path)
    }
    
    func writeFile(path: String, data: String, encoding: NitroFileEncoding) throws {
        guard fileManager != nil else {
            throw NitroFSError.unavailable(message: "Failed to write file. FileManager is unavailable")
        }
        try data.write(toFile: path, atomically: true, encoding: getEncoding(nitroEncoding: encoding))
    }
    
    func readFile(path: String, encoding: NitroFileEncoding) throws -> String {
        let fileHandle = try FileHandle(forReadingFrom: URL(fileURLWithPath: path))
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
        
        try fileManager.copyItem(atPath: source, toPath: destination)
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
        try fileManager.createDirectory(atPath: path, withIntermediateDirectories: true, attributes: nil)
    }
    
    func stat(path: String) throws -> NitroFileStat {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "Failed to stat file. FileManager is unavailable")
        }
        let newPath = try getPath(path: path)
        let attributes = try fileManager.attributesOfItem(atPath: newPath)
        let size = attributes[FileAttributeKey.size] as! Int
        let mtime = attributes[FileAttributeKey.modificationDate] as! Date
        let ctime = attributes[FileAttributeKey.creationDate] as! Date
        
        return NitroFileStat(
            size: Double(size),
            ctime: ctime.timeIntervalSince1970,
            mtime: mtime.timeIntervalSince1970,
            isFile: !IsDirectory(path),
            isDirectory: IsDirectory(path)
        )
    }
    
    func readdir(atPath path: String) throws -> [String] {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "Failed to stat file. FileManager is unavailable")
        }
        let pathURL = URL(fileURLWithPath: path)
        let contents = try fileManager.contentsOfDirectory(
            at: pathURL,
            includingPropertiesForKeys: [.isDirectoryKey],
            options: .skipsHiddenFiles
        )
        return contents.map { $0.lastPathComponent }
    }
    
    func rename(oldPath: String, newPath: String) throws {
        let oldFile = URL(fileURLWithPath: oldPath)
        let newFile = URL(fileURLWithPath: newPath)
        try fileManager?.moveItem(at: oldFile, to: newFile)
    }
    
    func dirname(path: String) throws -> String {
        return URL(fileURLWithPath: path).deletingLastPathComponent().absoluteString
    }
    
    func extname(path: String) throws -> String {
        return URL(fileURLWithPath: path).pathExtension
    }
    
    func basename(path: String, ext: String?) throws -> String {
        return URL(fileURLWithPath: path).lastPathComponent
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
        default :
            fatalError("Unsupported encoding")
        }
    }
    
    private func IsDirectory(_ path: String) -> Bool {
        var isDirObjCBool = ObjCBool(false)
        return FileManager.default.fileExists(atPath: path, isDirectory: &isDirObjCBool) && isDirObjCBool.boolValue
    }
}
