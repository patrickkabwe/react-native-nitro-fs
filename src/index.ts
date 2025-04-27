import { NitroModules } from 'react-native-nitro-modules'
import type { NitroFS as NitroFSSpec } from './specs/nitro-fs.nitro'
export * from './type'

export const NitroFS =
    NitroModules.createHybridObject<NitroFSSpec>('NitroFS')