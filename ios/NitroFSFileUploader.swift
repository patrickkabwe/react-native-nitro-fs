//
//  NitroFSFileUploader.swift
//  NitroFS
//
//  Created by Patrick Kabwe on 26/04/2025.
//

import Foundation

final class NitroFSFileUploader: NSObject, URLSessionDataDelegate {
    weak var fileManager: FileManager?
    private var uploadTasks: [String: URLSessionUploadTask] = [:]
    private var uploadSessions: [String: URLSession] = [:]
    private var progressCallbacks: [String: ((Double, Double) -> Void)] = [:]
    private var taskToJobId: [Int: String] = [:]
    private var uploadContinuations: [String: CheckedContinuation<Void, Error>] = [:]
    private let taskQueue = DispatchQueue(label: "com.nitrofs.uploader")

    init(fileManager: FileManager) {
        super.init()
        self.fileManager = fileManager
    }

    func uploadFile(
        file: NitroFile,
        uploadOptions: NitroUploadOptions,
        onProgress: ((Double, Double) -> Void)? = nil
    ) async throws -> String {
        
        guard let uploadURL = URL(string: uploadOptions.url) else {
            throw NitroFSError.networkError(message: "Invalid URL")
        }

        let jobId = UUID().uuidString
        let fieldName = uploadOptions.field ?? "file"
        let boundary = UUID().uuidString
        let fileURL = URL(fileURLWithPath: file.path)

        // Create multipart file body on disk
        let multipartFile = try createMultipartBodyFile(
            fileURL: fileURL,
            fieldName: fieldName,
            boundary: boundary
        )

        var request = URLRequest(url: uploadURL)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        let session = URLSession(configuration: .default, delegate: self, delegateQueue: nil)

        let task = session.uploadTask(with: request, fromFile: multipartFile)

        // Use sync to ensure state is initialized before task.resume() is called
        // This prevents race condition where delegate callbacks fire before state is set up
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            taskQueue.sync {
                self.uploadTasks[jobId] = task
                self.uploadSessions[jobId] = session
                self.taskToJobId[task.taskIdentifier] = jobId
                self.uploadContinuations[jobId] = continuation
                if let onProgress = onProgress {
                    self.progressCallbacks[jobId] = onProgress
                }
            }
            task.resume()
        }
        
        // Cleanup multipart file after completion
        defer {
            try? FileManager.default.removeItem(at: multipartFile)
        }
        
        return jobId
    }
    
    func cancelUpload(jobId: String) -> Bool {
        var cancelled = false
        taskQueue.sync { [weak self] in
            guard let self = self else { return }
            if let task = self.uploadTasks[jobId] {
                task.cancel()
                // Resume continuation with cancellation error if it exists
                if let continuation = self.uploadContinuations[jobId] {
                    continuation.resume(throwing: NitroFSError.networkError(message: "Upload cancelled"))
                    self.uploadContinuations.removeValue(forKey: jobId)
                }
                self.taskToJobId.removeValue(forKey: task.taskIdentifier)
                self.uploadTasks.removeValue(forKey: jobId)
                self.progressCallbacks.removeValue(forKey: jobId)
                cancelled = true
            }
            if let session = self.uploadSessions[jobId] {
                session.invalidateAndCancel()
                self.uploadSessions.removeValue(forKey: jobId)
            }
        }
        return cancelled
    }
}

// MARK: - Helpers

extension NitroFSFileUploader {
    private func createMultipartBodyFile(
        fileURL: URL,
        fieldName: String,
        boundary: String
    ) throws -> URL {
        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)

        guard let output = OutputStream(url: tempURL, append: false) else {
            throw NitroFSError.encodingError(message: "Failed to create output stream")
        }

        output.open()
        defer { output.close() }

        // Write multipart headers with proper CRLF line endings
        let header = """
        --\(boundary)\r\n\
        Content-Disposition: form-data; name="\(fieldName)"; filename="\(fileURL.lastPathComponent)"\r\n\
        Content-Type: application/octet-stream\r\n\
        \r\n
        """
        try output.write(header)

        // Stream file content efficiently
        try streamFileContent(from: fileURL, to: output)

        // Write multipart footer
        let footer = "\r\n--\(boundary)--\r\n"
        try output.write(footer)

        return tempURL
    }
    
    private func streamFileContent(from fileURL: URL, to output: OutputStream) throws {
        guard let input = InputStream(url: fileURL) else {
            throw NitroFSError.fileError(message: "Could not read file from disk")
        }

        input.open()
        defer { input.close() }
        
        let bufferSize = 64 * 1024
        var buffer = [UInt8](repeating: 0, count: bufferSize)

        while input.hasBytesAvailable {
            let bytesRead = input.read(&buffer, maxLength: bufferSize)
            
            if bytesRead > 0 {
                let bytesWritten = output.write(buffer, maxLength: bytesRead)
                if bytesWritten != bytesRead {
                    throw NitroFSError.encodingError(message: "Failed to write file data to output stream")
                }
            } else if bytesRead < 0 {
                throw NitroFSError.fileError(message: "Error reading file data")
            }
        }
    }
}


// MARK: - URLSessionTaskDelegate
extension NitroFSFileUploader: URLSessionTaskDelegate {
    func urlSession(_ _: URLSession, task: URLSessionTask, didSendBodyData bytesSent: Int64,
                    totalBytesSent: Int64, totalBytesExpectedToSend: Int64) {
        taskQueue.async { [weak self] in
            guard let self = self,
                  let jobId = self.taskToJobId[task.taskIdentifier],
                  let onProgress = self.progressCallbacks[jobId] else {
                return
            }
            DispatchQueue.main.async {
                onProgress(Double(totalBytesSent), Double(totalBytesExpectedToSend))
            }
        }
    }
    
    func urlSession(
        _ session: URLSession,
        task: URLSessionTask,
        didCompleteWithError error: Error?
    ) {
        var jobId: String?
        var continuation: CheckedContinuation<Void, Error>?
        
        taskQueue.sync {
            jobId = self.taskToJobId[task.taskIdentifier]
            if let jobId = jobId {
                continuation = self.uploadContinuations[jobId]
            }
        }
        
        guard let jobId = jobId else { return }
        
        // Remove continuation immediately to prevent double-resume
        taskQueue.sync {
            self.uploadContinuations.removeValue(forKey: jobId)
        }
        
        if let error = error {
            // Handle cancellation separately
            if (error as NSError).code == NSURLErrorCancelled {
                continuation?.resume(throwing: NitroFSError.networkError(message: "Upload cancelled"))
            } else {
                continuation?.resume(throwing: error)
            }
        } else {
            // Check HTTP response status
            if let httpResponse = task.response as? HTTPURLResponse {
                guard (200...299).contains(httpResponse.statusCode) else {
                    continuation?.resume(throwing: NitroFSError.networkError(
                        message: "Upload failed with status code: \(httpResponse.statusCode)"
                    ))
                    return
                }
            }
            // Success - resume continuation
            continuation?.resume()
        }
        
        // Cleanup
        taskQueue.async {
            self.uploadTasks.removeValue(forKey: jobId)
            self.uploadSessions.removeValue(forKey: jobId)
            self.progressCallbacks.removeValue(forKey: jobId)
            self.taskToJobId.removeValue(forKey: task.taskIdentifier)
        }
        
        session.finishTasksAndInvalidate()
    }
}

// MARK: - OutputStream Extension

private extension OutputStream {
    func write(_ string: String) throws {
        guard let data = string.data(using: .utf8) else {
            throw NitroFSError.encodingError(message: "Failed to encode string to UTF-8.")
        }
        
        try data.withUnsafeBytes { buffer in
            guard let baseAddress = buffer.baseAddress?.assumingMemoryBound(to: UInt8.self) else {
                throw NitroFSError.fileError(message: "Could not get pointer to buffer.")
            }
            
            var bytesRemaining = data.count
            var totalBytesWritten = 0
            
            while bytesRemaining > 0 {
                let written = self.write(baseAddress.advanced(by: totalBytesWritten), maxLength: bytesRemaining)
                if written < 0 {
                    throw NitroFSError.fileError(message: "Failed to write to OutputStream.")
                }
                bytesRemaining -= written
                totalBytesWritten += written
            }
        }
    }
}
