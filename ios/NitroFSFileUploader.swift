//
//  NitroFSFileUploader.swift
//  NitroFS
//
//  Created by Patrick Kabwe on 26/04/2025.
//

import Foundation

final class NitroFSFileUploader: NSObject, URLSessionDataDelegate {
    weak var fileManager: FileManager?
    private var onProgress: ((Double, Double) -> Void)?

    init(fileManager: FileManager) {
        super.init()
        self.fileManager = fileManager
    }

    func uploadFile(
        file: NitroFile,
        uploadOptions: NitroUploadOptions,
        onProgress: ((Double, Double) -> Void)? = nil
    ) async throws {
        self.onProgress = onProgress
        
        guard let uploadURL = URL(string: uploadOptions.url) else {
            throw NitroFSError.networkError(message: "Invalid URL")
        }

        let fieldName = uploadOptions.field ?? "file"
        let boundary = UUID().uuidString
        let fileURL = URL(fileURLWithPath: file.path)

        // Create multipart file body on disk
        let multipartFile = try await createMultipartBodyFile(
            fileURL: fileURL,
            fieldName: fieldName,
            boundary: boundary
        )

        var request = URLRequest(url: uploadURL)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        return try await withCheckedThrowingContinuation { continuation in
            let session = URLSession(configuration: .default, delegate: self, delegateQueue: nil)

            let task = session.uploadTask(with: request, fromFile: multipartFile) { data, response, error in
                try? FileManager.default.removeItem(at: multipartFile)

                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                guard let httpResponse = response as? HTTPURLResponse,
                      (200...299).contains(httpResponse.statusCode) else {
                    continuation.resume(throwing: NitroFSError.networkError(message: "Invalid server response"))
                    return
                }

                continuation.resume()
            }

            task.resume()
        }
    }
}

// MARK: - Helpers

extension NitroFSFileUploader {
    private func createMultipartBodyFile(
        fileURL: URL,
        fieldName: String,
        boundary: String
    ) async throws -> URL {
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
        try await streamFileContent(from: fileURL, to: output)

        // Write multipart footer
        let footer = "\r\n--\(boundary)--\r\n"
        try output.write(footer)

        return tempURL
    }
    
    private func streamFileContent(from fileURL: URL, to output: OutputStream) async throws {
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
    func urlSession(_ session: URLSession, task: URLSessionTask, didSendBodyData bytesSent: Int64,
                    totalBytesSent: Int64, totalBytesExpectedToSend: Int64) {
        DispatchQueue.main.async {
            self.onProgress?(Double(totalBytesSent), Double(totalBytesExpectedToSend))
        }
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
