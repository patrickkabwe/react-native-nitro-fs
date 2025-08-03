//
//  NitroFSImpl+Utils.swift
//  Pods
//
//  Created by Patrick Kabwe on 02/08/2025.
//

import NitroModules

extension NitroFSImpl {
    func getPath(path: String) throws -> String {
        let pathURL: URL
        if path.starts(with: "file://") {
            guard let url = URL(string: path) else {
                throw RuntimeError.error(withMessage: "Failed to get path url from \(path)")
            }
            pathURL = url
        } else {
            pathURL = URL(fileURLWithPath: path)
        }
        return pathURL.path
    }
}
