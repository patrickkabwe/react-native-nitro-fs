///
/// HybridNitroFSSpecSwift.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include "HybridNitroFSSpec.hpp"

// Forward declaration of `HybridNitroFSSpec_cxx` to properly resolve imports.
namespace NitroFS { class HybridNitroFSSpec_cxx; }

// Forward declaration of `NitroFileEncoding` to properly resolve imports.
namespace margelo::nitro::nitrofs { enum class NitroFileEncoding; }
// Forward declaration of `NitroFileStat` to properly resolve imports.
namespace margelo::nitro::nitrofs { struct NitroFileStat; }
// Forward declaration of `NitroFile` to properly resolve imports.
namespace margelo::nitro::nitrofs { struct NitroFile; }
// Forward declaration of `NitroUploadOptions` to properly resolve imports.
namespace margelo::nitro::nitrofs { struct NitroUploadOptions; }
// Forward declaration of `NitroUploadMethod` to properly resolve imports.
namespace margelo::nitro::nitrofs { enum class NitroUploadMethod; }

#include <string>
#include <NitroModules/Promise.hpp>
#include "NitroFileEncoding.hpp"
#include "NitroFileStat.hpp"
#include "NitroFile.hpp"
#include "NitroUploadOptions.hpp"
#include <optional>
#include "NitroUploadMethod.hpp"
#include <functional>

#include "NitroFS-Swift-Cxx-Umbrella.hpp"

namespace margelo::nitro::nitrofs {

  /**
   * The C++ part of HybridNitroFSSpec_cxx.swift.
   *
   * HybridNitroFSSpecSwift (C++) accesses HybridNitroFSSpec_cxx (Swift), and might
   * contain some additional bridging code for C++ <> Swift interop.
   *
   * Since this obviously introduces an overhead, I hope at some point in
   * the future, HybridNitroFSSpec_cxx can directly inherit from the C++ class HybridNitroFSSpec
   * to simplify the whole structure and memory management.
   */
  class HybridNitroFSSpecSwift: public virtual HybridNitroFSSpec {
  public:
    // Constructor from a Swift instance
    explicit HybridNitroFSSpecSwift(const NitroFS::HybridNitroFSSpec_cxx& swiftPart):
      HybridObject(HybridNitroFSSpec::TAG),
      _swiftPart(swiftPart) { }

  public:
    // Get the Swift part
    inline NitroFS::HybridNitroFSSpec_cxx& getSwiftPart() noexcept {
      return _swiftPart;
    }

  public:
    // Get memory pressure
    inline size_t getExternalMemorySize() noexcept override {
      return _swiftPart.getMemorySize();
    }

  public:
    // Properties
    inline std::string getBUNDLE_DIR() noexcept override {
      auto __result = _swiftPart.getBUNDLE_DIR();
      return __result;
    }
    inline std::string getDOCUMENT_DIR() noexcept override {
      auto __result = _swiftPart.getDOCUMENT_DIR();
      return __result;
    }
    inline std::string getCACHE_DIR() noexcept override {
      auto __result = _swiftPart.getCACHE_DIR();
      return __result;
    }
    inline std::string getDOWNLOAD_DIR() noexcept override {
      auto __result = _swiftPart.getDOWNLOAD_DIR();
      return __result;
    }

  public:
    // Methods
    inline std::shared_ptr<Promise<bool>> exists(const std::string& path) override {
      auto __result = _swiftPart.exists(path);
      if (__result.hasError()) [[unlikely]] {
        std::rethrow_exception(__result.error());
      }
      auto __value = std::move(__result.value());
      return __value;
    }
    inline std::shared_ptr<Promise<void>> writeFile(const std::string& path, const std::string& data, NitroFileEncoding encoding) override {
      auto __result = _swiftPart.writeFile(path, data, static_cast<int>(encoding));
      if (__result.hasError()) [[unlikely]] {
        std::rethrow_exception(__result.error());
      }
      auto __value = std::move(__result.value());
      return __value;
    }
    inline std::shared_ptr<Promise<std::string>> readFile(const std::string& path, NitroFileEncoding encoding) override {
      auto __result = _swiftPart.readFile(path, static_cast<int>(encoding));
      if (__result.hasError()) [[unlikely]] {
        std::rethrow_exception(__result.error());
      }
      auto __value = std::move(__result.value());
      return __value;
    }
    inline std::shared_ptr<Promise<void>> copyFile(const std::string& srcPath, const std::string& destPath) override {
      auto __result = _swiftPart.copyFile(srcPath, destPath);
      if (__result.hasError()) [[unlikely]] {
        std::rethrow_exception(__result.error());
      }
      auto __value = std::move(__result.value());
      return __value;
    }
    inline std::shared_ptr<Promise<void>> copy(const std::string& srcPath, const std::string& destPath) override {
      auto __result = _swiftPart.copy(srcPath, destPath);
      if (__result.hasError()) [[unlikely]] {
        std::rethrow_exception(__result.error());
      }
      auto __value = std::move(__result.value());
      return __value;
    }
    inline std::shared_ptr<Promise<bool>> unlink(const std::string& path) override {
      auto __result = _swiftPart.unlink(path);
      if (__result.hasError()) [[unlikely]] {
        std::rethrow_exception(__result.error());
      }
      auto __value = std::move(__result.value());
      return __value;
    }
    inline std::shared_ptr<Promise<bool>> mkdir(const std::string& path) override {
      auto __result = _swiftPart.mkdir(path);
      if (__result.hasError()) [[unlikely]] {
        std::rethrow_exception(__result.error());
      }
      auto __value = std::move(__result.value());
      return __value;
    }
    inline std::shared_ptr<Promise<NitroFileStat>> stat(const std::string& path) override {
      auto __result = _swiftPart.stat(path);
      if (__result.hasError()) [[unlikely]] {
        std::rethrow_exception(__result.error());
      }
      auto __value = std::move(__result.value());
      return __value;
    }
    inline std::shared_ptr<Promise<void>> uploadFile(const NitroFile& file, const NitroUploadOptions& uploadOptions, const std::optional<std::function<void(double /* uploadedBytes */, double /* totalBytes */)>>& onProgress) override {
      auto __result = _swiftPart.uploadFile(file, uploadOptions, onProgress);
      if (__result.hasError()) [[unlikely]] {
        std::rethrow_exception(__result.error());
      }
      auto __value = std::move(__result.value());
      return __value;
    }
    inline std::shared_ptr<Promise<NitroFile>> downloadFile(const std::string& serverUrl, const std::string& destinationPath, const std::optional<std::function<void(double /* downloadedBytes */, double /* totalBytes */)>>& onProgress) override {
      auto __result = _swiftPart.downloadFile(serverUrl, destinationPath, onProgress);
      if (__result.hasError()) [[unlikely]] {
        std::rethrow_exception(__result.error());
      }
      auto __value = std::move(__result.value());
      return __value;
    }

  private:
    NitroFS::HybridNitroFSSpec_cxx _swiftPart;
  };

} // namespace margelo::nitro::nitrofs
