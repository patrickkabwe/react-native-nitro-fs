## [0.6.0](https://github.com/patrickkabwe/react-native-nitro-fs/compare/v0.5.4...v0.6.0) (2025-08-06)

### ✨ Features

* adds new apis(`readdir`,`rename`,`dirname``basename` and `extname`) ([c634935](https://github.com/patrickkabwe/react-native-nitro-fs/commit/c6349356b2d95a471deb80b8af36602149f1272a))

### 📚 Documentation

* update README.md with enhanced features, installation instructions, and API reference for NitroFS ([84e5c2e](https://github.com/patrickkabwe/react-native-nitro-fs/commit/84e5c2eef4948fc9c5e23f308703ae1d83410d92))

### 🛠️ Other changes

* add concurrency settings to Android and iOS build workflows ([8364156](https://github.com/patrickkabwe/react-native-nitro-fs/commit/8364156276123d25da98bc6b73d9d93af0a05f5e))
* bump react native to 0.80.2 ([98c5a24](https://github.com/patrickkabwe/react-native-nitro-fs/commit/98c5a249293876c0093683adcd2e9143d44f5645))
* update NitroFS to version 0.5.4 and update checksum ([cfff291](https://github.com/patrickkabwe/react-native-nitro-fs/commit/cfff29154e86d29d3e3274ffc0afa7a9a534c2c6))

## [0.5.4](https://github.com/patrickkabwe/react-native-nitro-fs/compare/v0.5.3...v0.5.4) (2025-07-31)

### 🛠️ Other changes

* **deps:** bump ktor_version from 3.2.2 to 3.2.3 in /android ([1797c38](https://github.com/patrickkabwe/react-native-nitro-fs/commit/1797c384d1b6d4e45dbd66fa4b9e4c0ad03a1f9a))

## [0.5.3](https://github.com/patrickkabwe/react-native-nitro-fs/compare/v0.5.2...v0.5.3) (2025-07-21)

### 🛠️ Other changes

* bump up nitro 0.26.4 ([a262969](https://github.com/patrickkabwe/react-native-nitro-fs/commit/a26296958f779aa0e43cebe58ede791dda51ca3c))
* **deps:** bump com.android.tools.build:gradle in /android ([14be4d7](https://github.com/patrickkabwe/react-native-nitro-fs/commit/14be4d7bf9842e04b63d64487b44b60f4d605b99))
* **deps:** bump ktor_version from 3.1.3 to 3.2.2 in /android ([81df62b](https://github.com/patrickkabwe/react-native-nitro-fs/commit/81df62ba59f8b34317f1726c2b9f88559f105b8b))

## [0.5.2](https://github.com/patrickkabwe/react-native-nitro-fs/compare/v0.5.1...v0.5.2) (2025-06-05)

### 🐛 Bug Fixes

* update error message in HybridNitroFS to reflect correct file read operation ([b0cb2e9](https://github.com/patrickkabwe/react-native-nitro-fs/commit/b0cb2e9ab9cb50cbccb55b887085c4668cd0a78e))

### 📚 Documentation

* update installation command in README.md to use the latest react-native-nitro-modules version ([cf74404](https://github.com/patrickkabwe/react-native-nitro-fs/commit/cf744047a4a86b843765fb3158a3fca3cbd0f051))

### 🛠️ Other changes

* update dependencies and improve code generation commands ([ba80df6](https://github.com/patrickkabwe/react-native-nitro-fs/commit/ba80df6c19aa8aef75918e4115213b28d7fb7d39))

## [0.5.1](https://github.com/patrickkabwe/react-native-nitro-fs/compare/v0.5.0...v0.5.1) (2025-06-01)

### 🛠️ Other changes

* update release management tools in package.json ([a215167](https://github.com/patrickkabwe/react-native-nitro-fs/commit/a215167fcfc18778603b2f6bb92a4cb74d05f9db))

## [0.5.0](https://github.com/patrickkabwe/react-native-nitro-fs/compare/v0.4.2...v0.5.0) (2025-05-24)

### ✨ Features

* add localized error descriptions to NitroFSError for improved error handling ([b33a351](https://github.com/patrickkabwe/react-native-nitro-fs/commit/b33a351830f50d4b93dac2c2ce1e57e191144b4f))
* implement file upload functionality in NitroFSFileUploader with multipart support ([d9d87db](https://github.com/patrickkabwe/react-native-nitro-fs/commit/d9d87db2801ed6cf2d833d3f651bb75e079cf5f3))

### 🐛 Bug Fixes

* correct typo in error message for file writing in HybridNitroFS ([6b66e95](https://github.com/patrickkabwe/react-native-nitro-fs/commit/6b66e95207770df2789371d527c49999f0c522e0))
* enhance error handling in FileDownloader and NitroFSImpl with detailed runtime exceptions ([ce42c2d](https://github.com/patrickkabwe/react-native-nitro-fs/commit/ce42c2d3dd5e05e7feaf9f8978514fb7857bedb0))
* ensure proper session termination in NitroFSFileDownloader and NitroFSFileUploader after error handling ([ef95465](https://github.com/patrickkabwe/react-native-nitro-fs/commit/ef954652727a635e95a649d4d1b98cdbd9b6de8f))
* remove unused parameters in upload task completion handler in NitroFSFileUploader for cleaner code ([bfd8c71](https://github.com/patrickkabwe/react-native-nitro-fs/commit/bfd8c71a6ec7425962900d264f321acbeca3bfcb))
* update download URLs and NitroFS version ([8f03632](https://github.com/patrickkabwe/react-native-nitro-fs/commit/8f036324749a7c28fca71095f2cb35300e44be6c))
* update error handling in HybridNitroFS for file operations ([c8d52e0](https://github.com/patrickkabwe/react-native-nitro-fs/commit/c8d52e0d96deaa7042f5c07e3e05c7442dc2e5bd))
* update error message in NitroFSImpl for clarity on fileDownloader availability ([1041a7f](https://github.com/patrickkabwe/react-native-nitro-fs/commit/1041a7f62097fffa5f6b1c14e6280bbb42cbab66))

### 🔄 Code Refactors

* enhance file download method to return NitroFile and streamline parameters ([2633c2b](https://github.com/patrickkabwe/react-native-nitro-fs/commit/2633c2bcc00a8148feceffde96009ba076e0cac5))
* improve URL request handling in NitroFSFileDownloader and update file upload methods in NitroFSFileUploader for better error management ([586050f](https://github.com/patrickkabwe/react-native-nitro-fs/commit/586050f94e6cbc954d78ef9878e332572985ba8f))
* simplify file download logic and improve error handling in NitroFSFileDownloader ([28b343a](https://github.com/patrickkabwe/react-native-nitro-fs/commit/28b343a9f51e7e071b1d50deaa0450caeb4aa0ff))
* update error handling in NitroFS to use consistent error types and simplify downloadFile method signature ([f0277bc](https://github.com/patrickkabwe/react-native-nitro-fs/commit/f0277bc8d20561a8d772b5ed50092c8c1bf73e5a))

### 🛠️ Other changes

* rename Nitrofs to NitroFS ([4c3d846](https://github.com/patrickkabwe/react-native-nitro-fs/commit/4c3d8468b4473bb80cf6a84cc9004f3c7a85c6e2))
* rename Nitrofs to NitroFS ([17183fe](https://github.com/patrickkabwe/react-native-nitro-fs/commit/17183fe2fef6333cee8ea8482fcd5a35df827bec))

## [0.4.2](https://github.com/patrickkabwe/react-native-nitro-fs/compare/v0.4.1...v0.4.2) (2025-05-19)

### 🛠️ Other changes

* update dependencies and release configuration ([4decd47](https://github.com/patrickkabwe/react-native-nitro-fs/commit/4decd470e3a6796f4c4564beb4a42ec50a486864))
