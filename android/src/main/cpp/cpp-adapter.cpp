#include <jni.h>
#include "NitroFsOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::nitrofs::initialize(vm);
}
