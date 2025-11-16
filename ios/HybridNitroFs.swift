//
//  HybridNitroFS.swift
//  NitroFS
//
//  Created by Patrick Kabwe on 26/04/2025.
//

import os
import Foundation
import NitroModules

class HybridNitroFS: HybridNitroFSSpec {
    static private(set) var fileManager: FileManager = FileManager.default
    private(set) var nitroFSImpl: NitroFSImpl = NitroFSImpl(fileManager: fileManager)
    
    var DOCUMENT_DIR: String { get { return NitroFSDirs.NitroFSDocDir } }
    var CACHE_DIR: String { get { return NitroFSDirs.NitroFSCacheDir } }
    var BUNDLE_DIR: String { get { return NitroFSDirs.NitroFSBundleDir } }
    var DOWNLOAD_DIR: String = "" // Always returns nil on ios
    var DCIM_DIR: String = ""
    var PICTURES_DIR: String = ""
    var MOVIES_DIR: String = ""
    var MUSIC_DIR: String = ""

    func exists(path: String) throws -> Promise<Bool> {
        return .async { [unowned nitroFSImpl] in
            nitroFSImpl.exists(path: path)
        }
    }
    
    func writeFile(path filepath: String, data: String, encoding: NitroFileEncoding) throws -> Promise<Void>{
        return .async { [unowned self] in
            do {
                try self.nitroFSImpl.writeFile(path: filepath, data: data, encoding: encoding)
            } catch {
                os_log("Failed to write file content: \(error.localizedDescription)")
                throw  NitroFSError.fileError(message: "Failed to write file content to disk")
            }
        }
    }
    
    func readFile(path: String, encoding: NitroFileEncoding) throws -> Promise<String>{
        return .async { [unowned self] in
            do {
                return try self.nitroFSImpl.readFile(path: path, encoding: encoding)
            } catch {
                os_log("Failed to read file content: \(error.localizedDescription)")
                throw  NitroFSError.fileError(message: "Failed to read file content from disk")
            }
        }
    }
    
    func copyFile(srcPath: String, destPath: String) throws -> Promise<Void> {
        return .async { [unowned self] in
            do {
                try self.nitroFSImpl.copy(source: srcPath, destination: destPath)
            } catch {
                os_log("Failed to copy file content: \(error.localizedDescription)")
                throw  NitroFSError.fileError(message: "Failed to copy file file content to disk")
            }
        }
    }
    
    func copy(srcPath: String, destPath: String) throws -> NitroModules.Promise<Void> {
        return .async { [unowned self] in
            do {
                try self.nitroFSImpl.copy(source: srcPath, destination: destPath)
            } catch {
                os_log("Failed to copy file or directory: \(error.localizedDescription)")
                throw RuntimeError.error(withMessage: "Failed to copy file or directory content to disk")
            }
        }
    }
    
    func unlink(path: String) throws -> NitroModules.Promise<Bool> {
        return .async { [unowned self] in
            do {
                try self.nitroFSImpl.unlink(path: path)
                return true
            } catch {
                os_log("Failed to unlink: \(error.localizedDescription)")
                return false
            }
        }
    }
    
    func mkdir(path: String) throws -> NitroModules.Promise<Bool> {
        return .async { [unowned self] in
            do {
                try self.nitroFSImpl.mkdir(path: path)
                return true
            } catch {
                os_log("Failed to mkdir: \(error.localizedDescription)")
                return false
            }
        }
    }
    
    func stat(path: String) throws -> NitroModules.Promise<NitroFileStat> {
        return .async { [unowned self] in
            do {
                return try self.nitroFSImpl.stat(path: path)
            } catch {
                os_log("Failed to get stat: \(error.localizedDescription)")
                throw RuntimeError.error(withMessage: "Failed to get stat: \(error.localizedDescription)")
            }
        }
    }
    
    func readdir(path: String) throws -> NitroModules.Promise<[NitroFile]> {
        return .async {
            do {
                return try self.nitroFSImpl.readdir(atPath: path)
            } catch {
                os_log("An Error occurred in readdir(...): \(error.localizedDescription)")
                throw RuntimeError.error(withMessage: "An Error occurred in readdir(...): \(error.localizedDescription)")
            }
        }
    }
    
    func rename(oldPath: String, newPath: String) throws -> NitroModules.Promise<Void> {
        return .async {
            do {
                return try self.nitroFSImpl.rename(oldPath: oldPath, newPath: newPath)
            } catch {
                os_log("An Error occurred in rename(...): \(error.localizedDescription)")
                throw RuntimeError.error(withMessage: "An Error occurred in rename(...): \(error.localizedDescription)")
            }
        }
    }
    
    func dirname(path: String) throws -> String {
        do {
            return try nitroFSImpl.dirname(path: path)
        } catch {
            os_log("An Error occurred in dirname(...): \(error.localizedDescription)")
            throw RuntimeError.error(withMessage: "An Error occurred in dirname(...): \(error.localizedDescription)")
        }
    }
    
    func extname(path: String) throws -> String {
        do {
            return try nitroFSImpl.extname(path: path)
        } catch {
            os_log("An Error occurred in extname(...): \(error.localizedDescription)")
            throw RuntimeError.error(withMessage: "An Error occurred in extname(...): \(error.localizedDescription)")
        }
    }
    
    func basename(path: String) throws -> String {
        do {
            return try nitroFSImpl.basename(path: path)
        } catch {
            os_log("An Error occurred in basename(...): \(error.localizedDescription)")
            throw RuntimeError.error(withMessage: "An Error occurred in basename(...): \(error.localizedDescription)")
        }
    }

    func uploadFile(
        file: NitroFile,
        uploadOptions: NitroUploadOptions,
        onProgress: ((_ uploadedBytes: Double, _ totalBytes: Double) -> Void)?
    ) throws -> Promise<String>{
        return .async { [unowned self] in
            do {
                return try await self.nitroFSImpl.uploadFile(
                    file: file,
                    uploadOptions: uploadOptions,
                    onProgress: onProgress
                )
            } catch {
                os_log("failed to upload file: \(error.localizedDescription)")
                throw error
            }
        }
    }
    
    func cancelUpload(jobId: String) throws -> Promise<Bool> {
        return .async { [unowned self] in
            return self.nitroFSImpl.cancelUpload(jobId: jobId)
        }
    }
    
    func downloadFile(serverUrl: String, destinationPath: String, onProgress: ((Double, Double) -> Void)?) throws -> NitroModules.Promise<NitroDownloadResult> {
        return .async { [unowned self] in
            do {
                return try await self.nitroFSImpl.downloadFile(
                    serverUrl: serverUrl,
                    destinationPath: destinationPath,
                    onProgress: onProgress
                )
            } catch {
                os_log("failed to download file: \(error.localizedDescription)")
                throw error
            }
        }
    }
    
    func cancelDownload(jobId: String) throws -> NitroModules.Promise<Bool> {
        return .async { [unowned self] in
            return self.nitroFSImpl.cancelDownload(jobId: jobId)
        }
    }
}

