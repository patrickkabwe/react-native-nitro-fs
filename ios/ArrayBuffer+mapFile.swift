import Darwin
import Foundation
import NitroModules

extension ArrayBuffer {
    static func mapFile(atPath path: String) throws -> ArrayBuffer {
        let fileDescriptor = open(path, O_RDWR)
        guard fileDescriptor >= 0 else {
            throw NitroFSError.fileError(message: "Failed to open file for memory mapping. path=\(path), errno=\(errno)")
        }
        defer {
            close(fileDescriptor)
        }

        var fileStat = stat()
        guard fstat(fileDescriptor, &fileStat) == 0 else {
            throw NitroFSError.fileError(message: "Failed to stat file for memory mapping. path=\(path), errno=\(errno)")
        }

        let byteSize = Int(fileStat.st_size)
        guard byteSize >= 0 else {
            throw NitroFSError.fileError(message: "Invalid file size for memory mapping. path=\(path), size=\(fileStat.st_size)")
        }

        if byteSize == 0 {
            return ArrayBuffer.allocate(size: 0)
        }

        let mappedData = mmap(nil, byteSize, PROT_READ | PROT_WRITE, MAP_PRIVATE, fileDescriptor, 0)
        guard mappedData != MAP_FAILED else {
            throw NitroFSError.fileError(message: "Failed to memory map file. path=\(path), size=\(byteSize), errno=\(errno)")
        }
        guard let mappedData else {
            throw NitroFSError.fileError(message: "Memory mapping returned nil. path=\(path), size=\(byteSize)")
        }

        return ArrayBuffer.wrap(dataWithoutCopy: mappedData, size: byteSize) {
            munmap(mappedData, byteSize)
        }
    }
}
