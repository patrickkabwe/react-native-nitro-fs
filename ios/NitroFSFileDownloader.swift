//
//  NitroFSFileDownloader.swift
//  NitroFS
//
//  Created by Patrick Kabwe on 27/04/2025.
//

import Foundation

final class NitroFSFileDownloader: NSObject {
    // MARK: - Properties
    
    private weak var fileManager: FileManager?
    private var downloadTask: URLSessionDownloadTask?
    private var onProgress: ((Double, Double) -> Void)?
    private var continuation: CheckedContinuation<NitroFile, Error>?
    private var destinationPath: String?
    
    init(fileManager: FileManager) {
        self.fileManager = fileManager
        super.init()
    }
    
    // MARK: - Public Methods
    
    func downloadFile(
        _ serverUrl: String,
        _ fileName: String,
        _ destinationPath: String,
        onProgress: ((Double, Double) -> Void)? = nil
    ) async throws -> NitroFile {
        guard fileManager != nil else {
            throw NitroFSError.nitroFSUnavailable(message: "FileManager is not available")
        }
        
        self.onProgress = onProgress
        self.destinationPath = destinationPath
        
        let request = try makeRequest(serverUrl: serverUrl, fileName: fileName)
        
        let session: URLSession = {
            let config = URLSessionConfiguration.default
            config.requestCachePolicy = .reloadIgnoringLocalCacheData
            return URLSession(configuration: config, delegate: self, delegateQueue: .main)
        }()
            
        
        return try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation
            downloadTask = session.downloadTask(with: request)
            downloadTask?.resume()
        }
    }
    
    func cancelDownload() {
        downloadTask?.cancel()
    }
    
    // MARK: - Private Methods
    
    private func makeRequest(serverUrl: String, fileName: String) throws -> URLRequest {
        guard let encodedFilename = fileName.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed),
              let url = URL(string: "\(serverUrl)/\(encodedFilename)") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.cachePolicy = .reloadIgnoringLocalCacheData
        return request
    }
    
    private func handleDownloadCompletion(
        location: URL,
        response: URLResponse,
        downloadTask: URLSessionDownloadTask
    ) throws -> NitroFile {
        guard let fileManager else {
            throw NitroFSError.nitroFSUnavailable(message: "FileManager is not available")
        }
        
        guard let response = response as? HTTPURLResponse else {
            throw NitroFSError.nitroFSDownloadFailed(message: "Invalid response type")
        }
        
        guard (200...299).contains(response.statusCode) else {
            throw NitroFSError.nitroFSDownloadFailed(message: "HTTP Error: \(response.statusCode)")
        }
        
        guard let destinationPath = self.destinationPath else {
            throw NitroFSError.nitroFSDownloadFailed(message: "Destination path not set")
        }
        
        let destinationURL = URL(fileURLWithPath: destinationPath)
        
        try fileManager.createDirectory(at: destinationURL.deletingLastPathComponent(), withIntermediateDirectories: true)
        
        if fileManager.fileExists(atPath: destinationPath) {
            try fileManager.removeItem(at: destinationURL)
        }
        
        try fileManager.moveItem(at: location, to: destinationURL)
        
        return NitroFile(
            name: destinationURL.lastPathComponent,
            mimeType: response.allHeaderFields["Content-Type"] as? String ?? "application/octet-stream",
            path: destinationPath
        )
    }
}

// MARK: - URLSessionDownloadDelegate

extension NitroFSFileDownloader: URLSessionDownloadDelegate {
    func urlSession(
        _ session: URLSession,
        downloadTask: URLSessionDownloadTask,
        didFinishDownloadingTo location: URL
    ) {
        guard let continuation = self.continuation else { return }
        
        do {
            let file = try handleDownloadCompletion(
                location: location,
                response: downloadTask.response ?? URLResponse(),
                downloadTask: downloadTask
            )
            continuation.resume(returning: file)
        } catch {
            continuation.resume(throwing: error)
        }
        self.continuation = nil
    }
    
    func urlSession(
        _ session: URLSession,
        downloadTask: URLSessionDownloadTask,
        didWriteData bytesWritten: Int64,
        totalBytesWritten: Int64,
        totalBytesExpectedToWrite: Int64
    ) {
        guard totalBytesExpectedToWrite > 0 else { return }
        DispatchQueue.main.async { [weak self] in
            self?.onProgress?(Double(totalBytesWritten), Double(totalBytesExpectedToWrite))
        }
    }
    
    func urlSession(
        _ session: URLSession,
        task: URLSessionTask,
        didCompleteWithError error: Error?
    ) {
        if let error {
            continuation?.resume(throwing: error)
            continuation = nil
        }
    }
}

