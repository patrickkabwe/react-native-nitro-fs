import { NitroModules } from 'react-native-nitro-modules'
import type { NitroFs as NitroFsSpec } from './specs/nitro-fs.nitro'

export const NitroFs =
  NitroModules.createHybridObject<NitroFsSpec>('NitroFs')