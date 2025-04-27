//
//  NitroFSImpl.swift
//  NitroFS
//
//  Created by Patrick Kabwe on 26/04/2025.
//

import Foundation

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
            throw NitroFSError.nitroFSUnavailable(message: "Failed to write file. FileManager is unavailable")
        }
        try data.write(toFile: path, atomically: true, encoding: getEncoding(nitroEncoding: encoding))
    }
    
    func readFile(path: String, encoding: NitroFileEncoding) throws -> String {
        let fileHandle = try FileHandle(forReadingFrom: URL(fileURLWithPath: path))
        defer { try? fileHandle.close() }
        
        var result = ""
        let chunkSize = 1024
        
        while true {
            if let chunk = try fileHandle.read(upToCount: chunkSize), !chunk.isEmpty {
                if let string = String(data: chunk, encoding: getEncoding(nitroEncoding: encoding)) {
                    result += string
                } else {
                    throw NitroFSError.nitroFSInvalidEncoding(message: "Failed to decode chunk")
                }
            } else {
                break
            }
        }
        
        return result
    }
    
    func copy(source: String, destination: String) throws {
        guard let fileManager else {
            throw NitroFSError.nitroFSUnavailable(message: "Failed to copy file. FileManager is unavailable")
        }
        try fileManager.copyItem(atPath: source, toPath: destination)
    }
    
    func unlink(path: String) throws {
        guard let fileManager else {
            throw NitroFSError.nitroFSUnavailable(message: "Failed to unlink file. FileManager is unavailable")
        }
        try fileManager.removeItem(atPath: path)
    }
    
    func mkdir(path: String, mode: FileManager.ItemReplacementOptions = []) throws {
        guard let fileManager else {
            throw NitroFSError.nitroFSUnavailable(message: "Failed to mkdir file. FileManager is unavailable")
        }
        try fileManager.createDirectory(atPath: path, withIntermediateDirectories: true, attributes: nil)
    }
    
    func stat(path: String) throws -> NitroFileStat {
        guard let fileManager else {
            throw NitroFSError.nitroFSUnavailable(message: "Failed to stat file. FileManager is unavailable")
        }
        
        let attributes = try fileManager.attributesOfItem(atPath: path)
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
