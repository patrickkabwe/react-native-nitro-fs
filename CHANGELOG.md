## [0.8.1](https://github.com/patrickkabwe/react-native-nitro-fs/compare/v0.8.0...v0.8.1) (2025-11-20)

### 🐛 Bug Fixes

* resolve YAML syntax error in bug report template placeholder ([72c2b27](https://github.com/patrickkabwe/react-native-nitro-fs/commit/72c2b27f009a7a01d055bb865e4305d3c2a222a8))

### 🔄 Code Refactors

* simplify bug report template to essential fields only ([197feff](https://github.com/patrickkabwe/react-native-nitro-fs/commit/197feff7085ab6097819a286ee94a1e45a77f0e9))
* simplify feature request template to only include problem statement and optional solution ([56d2299](https://github.com/patrickkabwe/react-native-nitro-fs/commit/56d22998502cbb03969c2b456d82d93acf1462a5))

### 🛠️ Other changes

* add GitHub issue templates for bug reports and feature requests ([32fe404](https://github.com/patrickkabwe/react-native-nitro-fs/commit/32fe40479d50acd950544beac26e045ba481e388))
* convert issue templates to GitHub issue forms with structured inputs ([08e0844](https://github.com/patrickkabwe/react-native-nitro-fs/commit/08e08443036ad974bae17d93bedc8acba12ed0dc))
* update bug report template and increment NitroFS version in Podfile.lock ([d8fa291](https://github.com/patrickkabwe/react-native-nitro-fs/commit/d8fa29197509a0818f9674bb574332d7ea4b4506))

## [0.8.0](https://github.com/patrickkabwe/react-native-nitro-fs/compare/v0.7.0...v0.8.0) (2025-11-16)

### ✨ Features

* Android 16 KB support ([8431cb0](https://github.com/patrickkabwe/react-native-nitro-fs/commit/8431cb0101446990a53972d1e8eb2b7d89bacfdc))
* **android:** adds new dirs `DCIM_DIR`,`PICTURES_DIR` and more ([e4bbfe9](https://github.com/patrickkabwe/react-native-nitro-fs/commit/e4bbfe933ef29484f3bec937c7cff978580795b5))

### 🐛 Bug Fixes

* **android:** enhance error handling for file name and extension retrieval ([260725e](https://github.com/patrickkabwe/react-native-nitro-fs/commit/260725ec690f39cb1b2d87f84df90f19e5f8f291))
* **android:** fix basename syntax and remove ext parameter ([5de2c05](https://github.com/patrickkabwe/react-native-nitro-fs/commit/5de2c051888c053c60af49f5ff0ea0581a03880d))
* **android:** point document/download dirs to app-scoped storage ([1e40d41](https://github.com/patrickkabwe/react-native-nitro-fs/commit/1e40d411fb57b5b6d0671b2f40e5d8414cbbcbb3))
* correct JSX structure in ActionPanel component ([ac0bde0](https://github.com/patrickkabwe/react-native-nitro-fs/commit/ac0bde085a4de882df332241b0dbc047b503e8f3))
* enable copy item button and improve error handling ([7106ec2](https://github.com/patrickkabwe/react-native-nitro-fs/commit/7106ec2eb8563be03d368a2571b3e3f30484655d))
* improve error handling for path resolution and update dirname method ([55eaa58](https://github.com/patrickkabwe/react-native-nitro-fs/commit/55eaa581fa9ce3a8c94cf0c936ba74d839ceeab3))

### 📚 Documentation

* update README and example app to reflect changes in basename function and add new file system methods ([73a3a3d](https://github.com/patrickkabwe/react-native-nitro-fs/commit/73a3a3d5ca710d37bf8742a97432fdc74a25b668))

### 🛠️ Other changes

* bump up nitro to 0.29.8 ([5e163c3](https://github.com/patrickkabwe/react-native-nitro-fs/commit/5e163c37e05927a1792e114065b574305ce48785))
* codegen ([490b251](https://github.com/patrickkabwe/react-native-nitro-fs/commit/490b251def58d31f1f359edf5ec4d4484ea20434))
* **deps:** add react-native-nitro-document-picker dependency ([dac8a7a](https://github.com/patrickkabwe/react-native-nitro-fs/commit/dac8a7a1ff9308152c5496c2604ee65b9c3c287f))
* **deps:** bump activesupport from 7.2.2.2 to 7.2.3 in /example ([63cb714](https://github.com/patrickkabwe/react-native-nitro-fs/commit/63cb7146240c1e7fa3071f0950478d1745a831ad))
* **deps:** bump benchmark from 0.4.1 to 0.5.0 in /example ([d6fc4eb](https://github.com/patrickkabwe/react-native-nitro-fs/commit/d6fc4ebc5e982278d8f39cf06dcfa18b9d0b6a78))
* **deps:** bump bigdecimal from 3.2.2 to 3.3.0 in /example ([56f9cd0](https://github.com/patrickkabwe/react-native-nitro-fs/commit/56f9cd09a9bc0da04b1acb693ff911579b1da70a))
* **deps:** bump bigdecimal from 3.3.0 to 3.3.1 in /example ([d8883ed](https://github.com/patrickkabwe/react-native-nitro-fs/commit/d8883edddb4f76cdc7d35346a912bd1abde5d800))
* **deps:** bump com.android.tools.build:gradle in /android ([3437b48](https://github.com/patrickkabwe/react-native-nitro-fs/commit/3437b484c3d08225e5d4e5036a3383b63adea731))
* **deps:** bump ktor_version from 3.2.3 to 3.3.0 in /android ([948e304](https://github.com/patrickkabwe/react-native-nitro-fs/commit/948e3042dec23f5480af84dc7b879c2882449c3b))
* **deps:** bump ktor_version from 3.3.0 to 3.3.2 in /android ([6e2ae21](https://github.com/patrickkabwe/react-native-nitro-fs/commit/6e2ae21801f769b12447907add1cddfafcf2f90f))
* regenerate bindings after basename signature change ([1da99ea](https://github.com/patrickkabwe/react-native-nitro-fs/commit/1da99ea9973f5240cb0250c2b509dc39b3d99572))
* update react-native-nitro-modules version to 0.31.5 in installation instructions ([b935588](https://github.com/patrickkabwe/react-native-nitro-fs/commit/b93558824ab0f2db36b90a0b82e88252fcd703ce))

## [0.7.0](https://github.com/patrickkabwe/react-native-nitro-fs/compare/v0.6.1...v0.7.0) (2025-10-07)

### ✨ Features

* add base64 encoding support to NitroFS ([50f7be8](https://github.com/patrickkabwe/react-native-nitro-fs/commit/50f7be8f5e10516808f715bf08cdd9ea8fe68b62))

### 🛠️ Other changes

* **deps:** bump actions/checkout from 4 to 5 ([8f37585](https://github.com/patrickkabwe/react-native-nitro-fs/commit/8f37585eb29925677ec0e8cb71ac507379ed6102))
* **deps:** bump actions/setup-java from 4 to 5 ([6b069cd](https://github.com/patrickkabwe/react-native-nitro-fs/commit/6b069cd53ecb163f3208a2c7e3c6e06fb5cc4ca8))
* **deps:** bump activesupport from 7.2.2.1 to 7.2.2.2 in /example ([164c39a](https://github.com/patrickkabwe/react-native-nitro-fs/commit/164c39ae5611dcc2f5452dab7d3b10e279fdd024))
* **deps:** bump benchmark from 0.4.0 to 0.4.1 in /example ([36f6edd](https://github.com/patrickkabwe/react-native-nitro-fs/commit/36f6edd94cfa6bcfd461fe6e506302e0534a0c29))
* **deps:** bump cocoapods from 1.15.2 to 1.16.2 in /example ([de26e68](https://github.com/patrickkabwe/react-native-nitro-fs/commit/de26e68d4b26341a095a61a4a223ad25f7a3cfbd))
* **deps:** bump com.android.tools.build:gradle in /android ([2fb7022](https://github.com/patrickkabwe/react-native-nitro-fs/commit/2fb70224f01a1b5e049df012601bfc4e2c38cf27))
* **deps:** bump com.android.tools.build:gradle in /android ([e6e6bc7](https://github.com/patrickkabwe/react-native-nitro-fs/commit/e6e6bc73feb3e0b47c7b7952212eb194aae0592b))
* **deps:** bump com.android.tools.build:gradle in /android ([e12c654](https://github.com/patrickkabwe/react-native-nitro-fs/commit/e12c65458b142e46b8eb3708178a129bf226c19f))
* **deps:** bump concurrent-ruby from 1.3.3 to 1.3.5 in /example ([7da6aa1](https://github.com/patrickkabwe/react-native-nitro-fs/commit/7da6aa1fb20ddbd7f4b8d355c643e1c73a9b41d4))

## [0.6.1](https://github.com/patrickkabwe/react-native-nitro-fs/compare/v0.6.0...v0.6.1) (2025-08-17)

### 🛠️ Other changes

* add Xcode setup to iOS build workflows ([da22f99](https://github.com/patrickkabwe/react-native-nitro-fs/commit/da22f99376aedca958995175589405e0c81e6500))
* **deps:** bump bigdecimal from 3.1.9 to 3.2.2 in /example ([e3c1109](https://github.com/patrickkabwe/react-native-nitro-fs/commit/e3c11095ded0fd6b4ff257fe2a79987289e94103))
* **deps:** bump com.android.tools.build:gradle in /android ([6522427](https://github.com/patrickkabwe/react-native-nitro-fs/commit/65224274614e782f666d2800e398d7fe5ffc2e50))
* **deps:** bump xcodeproj from 1.25.1 to 1.27.0 in /example ([ebbc096](https://github.com/patrickkabwe/react-native-nitro-fs/commit/ebbc096890b1c7ebf9e723295585a0b6b38975c4))
* update bun.lock and release workflow cache key ([d7fcf88](https://github.com/patrickkabwe/react-native-nitro-fs/commit/d7fcf88db105015d1a21e4fee0155c7093d9c12d))
* update dependencies and configurations ([4933e7d](https://github.com/patrickkabwe/react-native-nitro-fs/commit/4933e7d7e337396cd36784d2d3befb7ca6f90abb))

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
