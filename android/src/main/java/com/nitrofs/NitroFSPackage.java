package com.nitrofs;

import androidx.annotation.Nullable;
import androidx.annotation.NonNull;

import com.facebook.react.BaseReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.margelo.nitro.nitrofs.NitroFSOnLoad;

import java.util.HashMap;

public class NitroFSPackage extends BaseReactPackage {
  @Nullable
  @Override
  public NativeModule getModule(@NonNull String name, @NonNull ReactApplicationContext reactContext) {
    return null;
  }

  @NonNull
  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return HashMap::new;
  }

  static {
    NitroFSOnLoad.initializeNative();
  }
}
