///
/// JHybridNitroFSSpec.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#include "JHybridNitroFSSpec.hpp"

// Forward declaration of `NitroFileStat` to properly resolve imports.
namespace margelo::nitro::nitrofs { struct NitroFileStat; }
// Forward declaration of `NitroFile` to properly resolve imports.
namespace margelo::nitro::nitrofs { struct NitroFile; }
// Forward declaration of `NitroFileEncoding` to properly resolve imports.
namespace margelo::nitro::nitrofs { enum class NitroFileEncoding; }
// Forward declaration of `NitroUploadOptions` to properly resolve imports.
namespace margelo::nitro::nitrofs { struct NitroUploadOptions; }
// Forward declaration of `NitroUploadMethod` to properly resolve imports.
namespace margelo::nitro::nitrofs { enum class NitroUploadMethod; }

#include <string>
#include <NitroModules/Promise.hpp>
#include <NitroModules/JPromise.hpp>
#include "NitroFileStat.hpp"
#include "JNitroFileStat.hpp"
#include "NitroFile.hpp"
#include "JNitroFile.hpp"
#include "NitroFileEncoding.hpp"
#include "JNitroFileEncoding.hpp"
#include "NitroUploadOptions.hpp"
#include "JNitroUploadOptions.hpp"
#include <optional>
#include "NitroUploadMethod.hpp"
#include "JNitroUploadMethod.hpp"
#include <functional>
#include "JFunc_void_double_double.hpp"

namespace margelo::nitro::nitrofs {

  jni::local_ref<JHybridNitroFSSpec::jhybriddata> JHybridNitroFSSpec::initHybrid(jni::alias_ref<jhybridobject> jThis) {
    return makeCxxInstance(jThis);
  }

  void JHybridNitroFSSpec::registerNatives() {
    registerHybrid({
      makeNativeMethod("initHybrid", JHybridNitroFSSpec::initHybrid),
    });
  }

  size_t JHybridNitroFSSpec::getExternalMemorySize() noexcept {
    static const auto method = javaClassStatic()->getMethod<jlong()>("getMemorySize");
    return method(_javaPart);
  }

  // Properties
  std::string JHybridNitroFSSpec::getBUNDLE_DIR() {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<jni::JString>()>("getBUNDLE_DIR");
    auto __result = method(_javaPart);
    return __result->toStdString();
  }
  std::string JHybridNitroFSSpec::getDOCUMENT_DIR() {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<jni::JString>()>("getDOCUMENT_DIR");
    auto __result = method(_javaPart);
    return __result->toStdString();
  }
  std::string JHybridNitroFSSpec::getCACHE_DIR() {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<jni::JString>()>("getCACHE_DIR");
    auto __result = method(_javaPart);
    return __result->toStdString();
  }
  std::string JHybridNitroFSSpec::getDOWNLOAD_DIR() {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<jni::JString>()>("getDOWNLOAD_DIR");
    auto __result = method(_javaPart);
    return __result->toStdString();
  }

  // Methods
  std::shared_ptr<Promise<bool>> JHybridNitroFSSpec::exists(const std::string& path) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* path */)>("exists");
    auto __result = method(_javaPart, jni::make_jstring(path));
    return [&]() {
      auto __promise = Promise<bool>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<jni::JBoolean>(__boxedResult);
        __promise->resolve(static_cast<bool>(__result->value()));
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<void>> JHybridNitroFSSpec::writeFile(const std::string& path, const std::string& data, NitroFileEncoding encoding) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* path */, jni::alias_ref<jni::JString> /* data */, jni::alias_ref<JNitroFileEncoding> /* encoding */)>("writeFile");
    auto __result = method(_javaPart, jni::make_jstring(path), jni::make_jstring(data), JNitroFileEncoding::fromCpp(encoding));
    return [&]() {
      auto __promise = Promise<void>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& /* unit */) {
        __promise->resolve();
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<std::string>> JHybridNitroFSSpec::readFile(const std::string& path, NitroFileEncoding encoding) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* path */, jni::alias_ref<JNitroFileEncoding> /* encoding */)>("readFile");
    auto __result = method(_javaPart, jni::make_jstring(path), JNitroFileEncoding::fromCpp(encoding));
    return [&]() {
      auto __promise = Promise<std::string>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<jni::JString>(__boxedResult);
        __promise->resolve(__result->toStdString());
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<void>> JHybridNitroFSSpec::copyFile(const std::string& srcPath, const std::string& destPath) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* srcPath */, jni::alias_ref<jni::JString> /* destPath */)>("copyFile");
    auto __result = method(_javaPart, jni::make_jstring(srcPath), jni::make_jstring(destPath));
    return [&]() {
      auto __promise = Promise<void>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& /* unit */) {
        __promise->resolve();
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<void>> JHybridNitroFSSpec::copy(const std::string& srcPath, const std::string& destPath) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* srcPath */, jni::alias_ref<jni::JString> /* destPath */)>("copy");
    auto __result = method(_javaPart, jni::make_jstring(srcPath), jni::make_jstring(destPath));
    return [&]() {
      auto __promise = Promise<void>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& /* unit */) {
        __promise->resolve();
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<bool>> JHybridNitroFSSpec::unlink(const std::string& path) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* path */)>("unlink");
    auto __result = method(_javaPart, jni::make_jstring(path));
    return [&]() {
      auto __promise = Promise<bool>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<jni::JBoolean>(__boxedResult);
        __promise->resolve(static_cast<bool>(__result->value()));
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<bool>> JHybridNitroFSSpec::mkdir(const std::string& path) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* path */)>("mkdir");
    auto __result = method(_javaPart, jni::make_jstring(path));
    return [&]() {
      auto __promise = Promise<bool>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<jni::JBoolean>(__boxedResult);
        __promise->resolve(static_cast<bool>(__result->value()));
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<NitroFileStat>> JHybridNitroFSSpec::stat(const std::string& path) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* path */)>("stat");
    auto __result = method(_javaPart, jni::make_jstring(path));
    return [&]() {
      auto __promise = Promise<NitroFileStat>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<JNitroFileStat>(__boxedResult);
        __promise->resolve(__result->toCpp());
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<void>> JHybridNitroFSSpec::uploadFile(const NitroFile& file, const NitroUploadOptions& uploadOptions, const std::optional<std::function<void(double /* uploadedBytes */, double /* totalBytes */)>>& onProgress) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<JNitroFile> /* file */, jni::alias_ref<JNitroUploadOptions> /* uploadOptions */, jni::alias_ref<JFunc_void_double_double::javaobject> /* onProgress */)>("uploadFile_cxx");
    auto __result = method(_javaPart, JNitroFile::fromCpp(file), JNitroUploadOptions::fromCpp(uploadOptions), onProgress.has_value() ? JFunc_void_double_double_cxx::fromCpp(onProgress.value()) : nullptr);
    return [&]() {
      auto __promise = Promise<void>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& /* unit */) {
        __promise->resolve();
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<NitroFile>> JHybridNitroFSSpec::downloadFile(const std::string& serverUrl, const std::string& destinationPath, const std::optional<std::function<void(double /* downloadedBytes */, double /* totalBytes */)>>& onProgress) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* serverUrl */, jni::alias_ref<jni::JString> /* destinationPath */, jni::alias_ref<JFunc_void_double_double::javaobject> /* onProgress */)>("downloadFile_cxx");
    auto __result = method(_javaPart, jni::make_jstring(serverUrl), jni::make_jstring(destinationPath), onProgress.has_value() ? JFunc_void_double_double_cxx::fromCpp(onProgress.value()) : nullptr);
    return [&]() {
      auto __promise = Promise<NitroFile>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<JNitroFile>(__boxedResult);
        __promise->resolve(__result->toCpp());
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }

} // namespace margelo::nitro::nitrofs
