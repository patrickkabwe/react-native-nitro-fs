//
//  NitroFSFileUploader.swift
//  NitroFS
//
//  Created by Patrick Kabwe on 26/04/2025.
//

import Foundation

final class NitroFSFileUploader: NSObject {
    weak var fileManager: FileManager?
    private var uploadTask: URLSessionUploadTask?
    private var onProgress: ((Double, Double) -> Void)?

    init(fileManager: FileManager) {
        self.fileManager = fileManager
    }

    func uploadFile(
        file: NitroFile,
        uploadOptions: NitroUploadOptions,
        onProgress: ((Double, Double) -> Void)? = nil
    ) async throws -> String {
        self.onProgress = onProgress

        if let fileExist = fileManager?.fileExists(atPath: file.path), !fileExist {
            throw NitroFSError.nitroFSFileNotFound(message: "Failed to upload file. File does not exist on path \(file.path)")
        }

        let fileURL = URL(fileURLWithPath: file.path)
        
        let newHeaders = ["X-Filename": fileURL.lastPathComponent]

        return try await makeUploadRequest(
            url: uploadOptions.url,
            method: uploadOptions.method?.stringValue ?? "POST",
            headers: newHeaders,
            fileURL: fileURL
        )
    }

    func cancelUpload() {
        uploadTask?.cancel()
    }
    
    private func makeUploadRequest(
        url: String, 
        method: String, 
        headers: [String: String], 
        fileURL: URL
    ) async throws -> String {
        guard let uploadURL = URL(string: url) else {
            throw NetworkError.invalidURL(message: "The URL '\(url)' is not valid.")
        }

        var req = URLRequest(url: uploadURL)
        req.httpMethod = method
        req.timeoutInterval = 60

        for (key, value) in headers {
            req.setValue(value, forHTTPHeaderField: key)
        }

        let session = URLSession(configuration: .default, delegate: self, delegateQueue: nil)

        return try await withCheckedThrowingContinuation { continuation in
            self.uploadTask = session.uploadTask(with: req, fromFile: fileURL) { data, response, error in
                if let error = error as NSError? {
                    if error.code == NSURLErrorCancelled {
                        if error.userInfo[NSURLSessionDownloadTaskResumeData] is Data {
                            // TODO: Store resume data for later use if needed
                            print("Upload cancelled with resume data available")
                        }
                    }
                    continuation.resume(throwing: error)
                    return
                }

                guard let httpResponse = response as? HTTPURLResponse,
                      (200...299).contains(httpResponse.statusCode),
                      let data = data,
                      let responseString = String(data: data, encoding: .utf8) else {
                    let res = (response as? HTTPURLResponse)
                    print("Upload failed with status code:", res?.statusCode ?? 0)
                    print("Response data:", String(data: data ?? Data(), encoding: .utf8) ?? "No data")
                    continuation.resume(throwing: NetworkError.invalidResponse)
                    return
                }

                continuation.resume(returning: responseString)
            }
            self.uploadTask?.resume()
        }
    }

    func resumeUpload(with resumeData: Data, headers: [String: String]) async throws -> String {
        guard let uploadURL = URL(string: headers["url"] ?? "") else {
            throw NetworkError.invalidURL(message: "Invalid URL for resume")
        }

        var req = URLRequest(url: uploadURL)
        req.httpMethod = "PUT"
        req.timeoutInterval = 60

        for (key, value) in headers {
            req.setValue(value, forHTTPHeaderField: key)
        }

        let session = URLSession(configuration: .default, delegate: self, delegateQueue: nil)

        return try await withCheckedThrowingContinuation { continuation in
            if #available(iOS 17.0, *) {
                self.uploadTask = session.uploadTask(withResumeData: resumeData) { data, response, error in
                    if let error = error {
                        continuation.resume(throwing: error)
                        return
                    }
                    
                    guard let httpResponse = response as? HTTPURLResponse,
                          (200...299).contains(httpResponse.statusCode),
                          let data = data,
                          let responseString = String(data: data, encoding: .utf8) else {
                        continuation.resume(throwing: NetworkError.invalidResponse)
                        return
                    }
                    
                    continuation.resume(returning: responseString)
                }
            } else {
                continuation.resume(throwing: NitroFSError.nitroFSUnavailable(message: "Resume upload is not supported on iOS versions below 17.0"))
            }
            self.uploadTask?.resume()
        }
    }
}

extension NitroFSFileUploader: URLSessionTaskDelegate {
    func urlSession(_ session: URLSession, task: URLSessionTask, didSendBodyData bytesSent: Int64,
                    totalBytesSent: Int64, totalBytesExpectedToSend: Int64) {
        guard totalBytesExpectedToSend > 0 else { return }
        DispatchQueue.main.async {
            self.onProgress?(Double(totalBytesSent), Double(totalBytesExpectedToSend))
        }
    }
}
