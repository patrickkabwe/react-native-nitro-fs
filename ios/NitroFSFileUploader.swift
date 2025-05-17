//
//  NitroFSFileUploader.swift
//  NitroFS
//
//  Created by Patrick Kabwe on 26/04/2025.
//

import Foundation

final class NitroFSFileUploader: NSObject, URLSessionTaskDelegate, URLSessionDataDelegate {
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
            throw NetworkError.invalidURL(message: "Invalid URL")
        }
        
        let fileURL = URL(fileURLWithPath: file.path)
        _ = uploadOptions.field ?? "file"

        //TODO: Implement upload file
        
        return try await withCheckedThrowingContinuation { continuation in
            continuation.resume()
        }
    }
    
    // MARK: - URLSession Delegate (optional for progress)
    func urlSession(_ session: URLSession, task: URLSessionTask, didSendBodyData bytesSent: Int64,
                    totalBytesSent: Int64, totalBytesExpectedToSend: Int64) {
        DispatchQueue.main.async {
            self.onProgress?( Double(totalBytesSent), Double(totalBytesExpectedToSend))
        }
    }
}
