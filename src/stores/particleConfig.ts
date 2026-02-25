import { writable, derived } from 'svelte/store'
import type { PresetConfig } from '../lib/engine/types'
import { snowPreset } from '../lib/presets'

export const currentPresetName = writable<string>('snow')
export const currentPreset = writable<PresetConfig>(snowPreset)

export const spawnRate = writable(40)
export const maxParticles = writable(800)
export const minSize = writable(2)
export const maxSize = writable(8)
export const opacity = writable(1.0)
export const speed = writable(3)
export const speedVariety = writable(2)
export const particleColor = writable('#ffffff')

export const customTexture = writable<string | null>(null)
export const useCustomTexture = writable(false)

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

export const livePreset = derived(
  [currentPreset, spawnRate, maxParticles, minSize, maxSize, opacity, speed, speedVariety, particleColor],
  ([$base, $spawnRate, $maxParticles, $minSize, $maxSize, $opacity, $speed, $speedVariety, $particleColor]) => {
    const baseSpeed = $speed * 15
    const variety = $speedVariety * 0.3

    const preset: PresetConfig = {
      ...$base,
      emitter: {
        ...$base.emitter,
        spawnRate: $spawnRate,
        maxParticles: $maxParticles,
        initialSize: [$minSize, $maxSize],
        initialOpacity: [Math.max(0.2, $opacity - 0.3), $opacity],
        initialSpeed: [baseSpeed * (1 - variety), baseSpeed * (1 + variety)],
        color: hexToNumber($particleColor),
      },
      forces: $base.forces.map((f) => {
        if (f.type === 'gravity') {
          return { ...f, strength: $speed * 5 }
        }
        return f
      }),
    }
    return preset
  },
)

export function applyPreset(preset: PresetConfig): void {
  currentPresetName.set(preset.name)
  currentPreset.set(preset)
  spawnRate.set(preset.emitter.spawnRate)
  maxParticles.set(preset.emitter.maxParticles)
  minSize.set(preset.emitter.initialSize[0])
  maxSize.set(preset.emitter.initialSize[1])
  opacity.set(preset.emitter.initialOpacity[1])

  const avgSpeed = (preset.emitter.initialSpeed[0] + preset.emitter.initialSpeed[1]) / 2
  speed.set(Math.round(avgSpeed / 15))
  speedVariety.set(2)

  const c = typeof preset.emitter.color === 'number' ? preset.emitter.color : preset.emitter.color[0]
  particleColor.set('#' + c.toString(16).padStart(6, '0'))
}
