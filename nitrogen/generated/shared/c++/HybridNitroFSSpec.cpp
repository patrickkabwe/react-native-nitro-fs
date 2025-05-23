///
/// HybridNitroFSSpec.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#include "HybridNitroFSSpec.hpp"

namespace margelo::nitro::nitrofs {

  void HybridNitroFSSpec::loadHybridMethods() {
    // load base methods/properties
    HybridObject::loadHybridMethods();
    // load custom methods/properties
    registerHybrids(this, [](Prototype& prototype) {
      prototype.registerHybridGetter("BUNDLE_DIR", &HybridNitroFSSpec::getBUNDLE_DIR);
      prototype.registerHybridGetter("DOCUMENT_DIR", &HybridNitroFSSpec::getDOCUMENT_DIR);
      prototype.registerHybridGetter("CACHE_DIR", &HybridNitroFSSpec::getCACHE_DIR);
      prototype.registerHybridGetter("DOWNLOAD_DIR", &HybridNitroFSSpec::getDOWNLOAD_DIR);
      prototype.registerHybridMethod("exists", &HybridNitroFSSpec::exists);
      prototype.registerHybridMethod("writeFile", &HybridNitroFSSpec::writeFile);
      prototype.registerHybridMethod("readFile", &HybridNitroFSSpec::readFile);
      prototype.registerHybridMethod("copyFile", &HybridNitroFSSpec::copyFile);
      prototype.registerHybridMethod("copy", &HybridNitroFSSpec::copy);
      prototype.registerHybridMethod("unlink", &HybridNitroFSSpec::unlink);
      prototype.registerHybridMethod("mkdir", &HybridNitroFSSpec::mkdir);
      prototype.registerHybridMethod("stat", &HybridNitroFSSpec::stat);
      prototype.registerHybridMethod("uploadFile", &HybridNitroFSSpec::uploadFile);
      prototype.registerHybridMethod("downloadFile", &HybridNitroFSSpec::downloadFile);
    });
  }

} // namespace margelo::nitro::nitrofs
