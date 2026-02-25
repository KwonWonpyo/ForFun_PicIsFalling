import { snowPreset } from './snow'
import type { PresetConfig } from '../engine/types'

export const presets: Record<string, PresetConfig> = {
  snow: snowPreset,
}

export { snowPreset }
