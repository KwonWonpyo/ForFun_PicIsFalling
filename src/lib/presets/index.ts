import { snowPreset } from './snow'
import { rainPreset } from './rain'
import { sakuraPreset } from './sakura'
import { leavesPreset } from './leaves'
import type { PresetConfig } from '../engine/types'

export const presets: PresetConfig[] = [snowPreset, rainPreset, sakuraPreset, leavesPreset]

export const presetMap: Record<string, PresetConfig> = {
  snow: snowPreset,
  rain: rainPreset,
  sakura: sakuraPreset,
  leaves: leavesPreset,
}

export { snowPreset, rainPreset, sakuraPreset, leavesPreset }
