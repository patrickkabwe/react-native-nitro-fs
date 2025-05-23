///
/// NitroUploadOptions.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

import NitroModules

/**
 * Represents an instance of `NitroUploadOptions`, backed by a C++ struct.
 */
public typealias NitroUploadOptions = margelo.nitro.nitrofs.NitroUploadOptions

public extension NitroUploadOptions {
  private typealias bridge = margelo.nitro.nitrofs.bridge.swift

  /**
   * Create a new instance of `NitroUploadOptions`.
   */
  init(url: String, method: NitroUploadMethod?, field: String?) {
    self.init(std.string(url), { () -> bridge.std__optional_NitroUploadMethod_ in
      if let __unwrappedValue = method {
        return bridge.create_std__optional_NitroUploadMethod_(__unwrappedValue)
      } else {
        return .init()
      }
    }(), { () -> bridge.std__optional_std__string_ in
      if let __unwrappedValue = field {
        return bridge.create_std__optional_std__string_(std.string(__unwrappedValue))
      } else {
        return .init()
      }
    }())
  }

  var url: String {
    @inline(__always)
    get {
      return String(self.__url)
    }
    @inline(__always)
    set {
      self.__url = std.string(newValue)
    }
  }
  
  var method: NitroUploadMethod? {
    @inline(__always)
    get {
      return self.__method.value
    }
    @inline(__always)
    set {
      self.__method = { () -> bridge.std__optional_NitroUploadMethod_ in
        if let __unwrappedValue = newValue {
          return bridge.create_std__optional_NitroUploadMethod_(__unwrappedValue)
        } else {
          return .init()
        }
      }()
    }
  }
  
  var field: String? {
    @inline(__always)
    get {
      return { () -> String? in
        if let __unwrapped = self.__field.value {
          return String(__unwrapped)
        } else {
          return nil
        }
      }()
    }
    @inline(__always)
    set {
      self.__field = { () -> bridge.std__optional_std__string_ in
        if let __unwrappedValue = newValue {
          return bridge.create_std__optional_std__string_(std.string(__unwrappedValue))
        } else {
          return .init()
        }
      }()
    }
  }
}
