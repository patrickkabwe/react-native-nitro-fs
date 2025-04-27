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
    static var NitroFSDownloadsDir = getDir(for: .downloadsDirectory)
    
    static private func getDir(for searchPath: FileManager.SearchPathDirectory) -> String {
        let dirURL = fileManager.urls(for: searchPath, in: .userDomainMask).first
        return dirURL?.path ?? ""
    }
}

enum NitroFSError: Error {
    case nitroFSUnavailable(message: String)
    case nitroFSWriteFailed(message: String)
    case nitroFSInvalidEncoding(message: String)
    case nitroFSFileNotFound(message: String)
    case nitroFSDownloadFailed(message: String)
}

enum NetworkError: Error {
    case invalidURL(message: String)
    case invalidResponse
    case invalidData
}
