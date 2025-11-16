//
//  NitroFSImpl+Utils.swift
//  Pods
//
//  Created by Patrick Kabwe on 02/08/2025.
//

import NitroModules
import Foundation

extension NitroFSImpl {
    /// Validates if a path string is valid and can be converted to a URL
    func isValidPath(_ path: String) -> Bool {
        guard !path.isEmpty else {
            return false
        }
        
        // Check if it's a file:// URI
        if path.starts(with: "file://") {
            return URL(string: path) != nil
        }
        
        // For regular paths, check if they can be converted to a file URL
        // Empty paths are invalid, but we allow relative paths
        return true
    }
    
    /// Converts a path string to a URL, handling both file:// URIs and regular paths
    func pathToURL(_ path: String) throws -> URL {
        guard isValidPath(path) else {
            throw NitroFSError.encodingError(message: "Invalid path: \(path)")
        }
        
        if path.starts(with: "file://") {
            guard let url = URL(string: path) else {
                throw NitroFSError.encodingError(message: "Failed to parse file URI: \(path)")
            }
            return url
        } else {
            return URL(fileURLWithPath: path)
        }
    }
    
    /// Normalizes a path string to a standard file system path
    func getPath(path: String) throws -> String {
        let pathURL = try pathToURL(path)
        return pathURL.path
    }
}
