//
//  NitroFSFileDownloader.swift
//  NitroFS
//
//  Created by Patrick Kabwe on 27/04/2025.
//

import Foundation
import NitroModules

final class NitroFSFileDownloader: NSObject {
    private weak var fileManager: FileManager?
    private var downloadTasks: [String: URLSessionDownloadTask] = [:]
    private var downloadSessions: [String: URLSession] = [:]
    private var progressCallbacks: [String: ((Double, Double) -> Void)] = [:]
    private var destinationPaths: [String: String] = [:]
    private var taskToJobId: [Int: String] = [:]
    private var fileContinuations: [String: CheckedContinuation<NitroFile, Error>] = [:]
    private let taskQueue = DispatchQueue(label: "com.nitrofs.downloader")
    
    init(fileManager: FileManager) {
        self.fileManager = fileManager
        super.init()
    }
        
    func downloadFile(
        _ serverUrl: String,
        _ destinationPath: String,
        onProgress: ((Double, Double) -> Void)? = nil
    ) async throws -> NitroDownloadResult {
        guard fileManager != nil else {
            throw NitroFSError.unavailable(message: "FileManager is not available")
        }
        
        let jobId = UUID().uuidString
        
        let request = try makeRequest(serverUrl: serverUrl)
        
        let session: URLSession = {
            let config = URLSessionConfiguration.default
            config.requestCachePolicy = .reloadIgnoringLocalCacheData
            return URLSession(configuration: config, delegate: self, delegateQueue: .main)
        }()
        
        let downloadTask = session.downloadTask(with: request)
        
        let file = try await withCheckedThrowingContinuation { continuation in
            // Use sync to ensure state is initialized before downloadTask.resume() is called
            // This prevents race condition where delegate callbacks fire before state is set up
            taskQueue.sync {
                self.downloadTasks[jobId] = downloadTask
                self.downloadSessions[jobId] = session
                self.taskToJobId[downloadTask.taskIdentifier] = jobId
                self.destinationPaths[jobId] = destinationPath
                self.fileContinuations[jobId] = continuation
                if let onProgress = onProgress {
                    self.progressCallbacks[jobId] = onProgress
                }
            }
            downloadTask.resume()
        }
        
        return NitroDownloadResult(jobId: jobId, file: file)
    }
    
    func cancelDownload(jobId: String) -> Bool {
        var cancelled = false
        taskQueue.sync { [weak self] in
            guard let self = self else { return }
            if let task = self.downloadTasks[jobId] {
                task.cancel()
                self.taskToJobId.removeValue(forKey: task.taskIdentifier)
                self.downloadTasks.removeValue(forKey: jobId)
                self.progressCallbacks.removeValue(forKey: jobId)
                self.destinationPaths.removeValue(forKey: jobId)
                if let continuation = self.fileContinuations[jobId] {
                    continuation.resume(throwing: NitroFSError.networkError(message: "Download cancelled"))
                    self.fileContinuations.removeValue(forKey: jobId)
                }
                cancelled = true
            }
            if let session = self.downloadSessions[jobId] {
                session.invalidateAndCancel()
                self.downloadSessions.removeValue(forKey: jobId)
            }
        }
        return cancelled
    }
    
    // MARK: - Private Methods
    
    private func makeRequest(serverUrl: String) throws -> URLRequest {
        guard let encoded = serverUrl.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: encoded) else {
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
    ) throws -> NitroFile? {
        guard let fileManager else {
            throw NitroFSError.unavailable(message: "FileManager is not available")
        }
        
        guard let response = response as? HTTPURLResponse else {
            throw NitroFSError.networkError(message: "Invalid response type")
        }
        
        guard (200...299).contains(response.statusCode) else {
            throw NitroFSError.networkError(message: "HTTP Error: \(response.statusCode)")
        }
        
        var jobId: String?
        var destinationPath: String?
        
        taskQueue.sync {
            jobId = self.taskToJobId[downloadTask.taskIdentifier]
            destinationPath = jobId.flatMap { self.destinationPaths[$0] }
        }
        
        guard let destinationPath = destinationPath else {
            // Download was cancelled or jobId not found
            return nil
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
        var jobId: String?
        var continuation: CheckedContinuation<NitroFile, Error>?
        
        taskQueue.sync {
            jobId = self.taskToJobId[downloadTask.taskIdentifier]
            if let jobId = jobId {
                continuation = self.fileContinuations[jobId]
            }
        }
        
        guard let jobId = jobId, let continuation = continuation else { return }
        
        // Remove continuation immediately to prevent double-resume from didCompleteWithError
        taskQueue.sync {
            self.fileContinuations.removeValue(forKey: jobId)
        }
        
        do {
            let file = try handleDownloadCompletion(
                location: location,
                response: downloadTask.response ?? URLResponse(),
                downloadTask: downloadTask
            )
            if let file = file {
                continuation.resume(returning: file)
            } else {
                continuation.resume(throwing: NitroFSError.networkError(message: "Download was cancelled"))
            }
        } catch {
            continuation.resume(throwing: error)
        }
        
        taskQueue.async {
            self.downloadTasks.removeValue(forKey: jobId)
            self.downloadSessions.removeValue(forKey: jobId)
            self.progressCallbacks.removeValue(forKey: jobId)
            self.destinationPaths.removeValue(forKey: jobId)
            self.taskToJobId.removeValue(forKey: downloadTask.taskIdentifier)
        }
        
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
        
        taskQueue.async { [weak self] in
            guard let self = self,
                  let jobId = self.taskToJobId[downloadTask.taskIdentifier],
                  let onProgress = self.progressCallbacks[jobId] else {
                return
            }
            DispatchQueue.main.async {
                onProgress(Double(totalBytesWritten), Double(totalBytesExpectedToWrite))
            }
        }
    }
    
    func urlSession(
        _ session: URLSession,
        task: URLSessionTask,
        didCompleteWithError error: Error?
    ) {
        var jobId: String?
        var continuation: CheckedContinuation<NitroFile, Error>?
        
        taskQueue.sync {
            jobId = self.taskToJobId[task.taskIdentifier]
            if let jobId = jobId {
                continuation = self.fileContinuations[jobId]
            }
        }
        
        guard let jobId = jobId else { return }
        
        if let error = error, let continuation = continuation {
            // Remove continuation immediately to prevent double-resume
            taskQueue.sync {
                self.fileContinuations.removeValue(forKey: jobId)
            }
            
            continuation.resume(throwing: error)
            taskQueue.async {
                self.downloadTasks.removeValue(forKey: jobId)
                self.downloadSessions.removeValue(forKey: jobId)
                self.progressCallbacks.removeValue(forKey: jobId)
                self.destinationPaths.removeValue(forKey: jobId)
                self.taskToJobId.removeValue(forKey: task.taskIdentifier)
            }
            session.finishTasksAndInvalidate()
        }
    }
}

