///
/// JNitroFileStat.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include "NitroFileStat.hpp"



namespace margelo::nitro::nitrofs {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ struct "NitroFileStat" and the the Kotlin data class "NitroFileStat".
   */
  struct JNitroFileStat final: public jni::JavaClass<JNitroFileStat> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/nitrofs/NitroFileStat;";

  public:
    /**
     * Convert this Java/Kotlin-based struct to the C++ struct NitroFileStat by copying all values to C++.
     */
    [[maybe_unused]]
    [[nodiscard]]
    NitroFileStat toCpp() const {
      static const auto clazz = javaClassStatic();
      static const auto fieldSize = clazz->getField<double>("size");
      double size = this->getFieldValue(fieldSize);
      static const auto fieldCtime = clazz->getField<double>("ctime");
      double ctime = this->getFieldValue(fieldCtime);
      static const auto fieldMtime = clazz->getField<double>("mtime");
      double mtime = this->getFieldValue(fieldMtime);
      static const auto fieldIsFile = clazz->getField<jboolean>("isFile");
      jboolean isFile = this->getFieldValue(fieldIsFile);
      static const auto fieldIsDirectory = clazz->getField<jboolean>("isDirectory");
      jboolean isDirectory = this->getFieldValue(fieldIsDirectory);
      return NitroFileStat(
        size,
        ctime,
        mtime,
        static_cast<bool>(isFile),
        static_cast<bool>(isDirectory)
      );
    }

  public:
    /**
     * Create a Java/Kotlin-based struct by copying all values from the given C++ struct to Java.
     */
    [[maybe_unused]]
    static jni::local_ref<JNitroFileStat::javaobject> fromCpp(const NitroFileStat& value) {
      return newInstance(
        value.size,
        value.ctime,
        value.mtime,
        value.isFile,
        value.isDirectory
      );
    }
  };

} // namespace margelo::nitro::nitrofs
