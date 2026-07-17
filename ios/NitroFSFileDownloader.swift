//
//  NitroFSFileDownloader.swift
//  NitroFS
//
//  Created by Patrick Kabwe on 27/04/2025.
//

import Foundation

final class NitroFSFileDownloader: NSObject {
    private weak var fileManager: FileManager?
    private var downloadTask: URLSessionDownloadTask?
    private var onProgress: ((Double, Double) -> Void)?
    private var continuation: CheckedContinuation<NitroFile, Error>?
    private var destinationPath: String?
    
    init(fileManager: FileManager) {
        self.fileManager = fileManager
        super.init()
    }
        
    func downloadFile(
        _ downloadOptions: NitroDownloadOptions,
        onProgress: ((Double, Double) -> Void)?
    ) async throws -> NitroFile {
        guard fileManager != nil else {
            throw NitroFSError.unavailable(message: "FileManager is not available")
        }
        
        self.onProgress = onProgress
        self.destinationPath = downloadOptions.destinationPath
        
        let request = try makeRequest(
            url: downloadOptions.url,
            headers: downloadOptions.headers
        )
        
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
    
    private func makeRequest(
        url: String,
        headers: [String: String]?
    ) throws -> URLRequest {
        guard let encoded = url.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: encoded) else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.cachePolicy = .reloadIgnoringLocalCacheData
        headers?.forEach { field, value in
            request.setValue(value, forHTTPHeaderField: field)
        }
        return request
    }
    
    private func handleDownloadCompletion(
        location: URL,
        response: URLResponse,
        downloadTask: URLSessionDownloadTask
    ) throws -> NitroFile {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "FileManager is not available")
        }
        
        guard let response = response as? HTTPURLResponse else {
            throw NitroFSError.networkError(message: "Invalid response type")
        }
        
        guard (200...299).contains(response.statusCode) else {
            throw NitroFSError.networkError(message: "HTTP Error: \(response.statusCode)")
        }
        
        guard let destinationPath = self.destinationPath else {
            throw NitroFSError.networkError(message: "Destination path not set")
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
        session.finishTasksAndInvalidate()
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
            session.finishTasksAndInvalidate()
        }
    }
}
