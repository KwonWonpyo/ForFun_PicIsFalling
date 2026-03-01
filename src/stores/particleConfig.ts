import { writable, derived } from 'svelte/store'
import type { PresetConfig } from '../lib/engine/types'
import { snowPreset } from '../lib/presets'
import {
  DEFAULT_OCCUPANCY_BOUNDS,
  calculateAutoSpawnRate,
  estimateDownwardAcceleration,
  estimateResidenceTime,
} from '../lib/engine/occupancy'

export const currentPresetName = writable<string>('snow')
export const currentPreset = writable<PresetConfig>(snowPreset)

export const targetOnScreenParticles = writable(snowPreset.emitter.targetOnScreenParticles)
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

function getViewportBounds() {
  if (typeof window === 'undefined') {
    return DEFAULT_OCCUPANCY_BOUNDS
  }
  return {
    width: window.innerWidth || DEFAULT_OCCUPANCY_BOUNDS.width,
    height: window.innerHeight || DEFAULT_OCCUPANCY_BOUNDS.height,
  }
}

export const livePreset = derived(
  [currentPreset, targetOnScreenParticles, minSize, maxSize, opacity, speed, speedVariety, particleColor],
  ([$base, $targetOnScreenParticles, $minSize, $maxSize, $opacity, $speed, $speedVariety, $particleColor]) => {
    const baseSpeed = $speed * 15
    const variety = Math.min(0.95, Math.max(0, $speedVariety * 0.3))
    const target = Math.max(20, Math.round($targetOnScreenParticles))

    const remappedForces = $base.forces.map((f) => {
      if (f.type === 'gravity') {
        return { ...f, strength: $speed * 5 }
      }
      return f
    })

    const emitter = {
      ...$base.emitter,
      targetOnScreenParticles: target,
      safetyCap: Math.max(Math.ceil(target * 1.8), target + 240),
      estimatedVerticalAcceleration: estimateDownwardAcceleration(remappedForces),
      initialSize: [$minSize, $maxSize] as [number, number],
      initialOpacity: [Math.max(0.2, $opacity - 0.3), $opacity] as [number, number],
      initialSpeed: [
        Math.max(1, baseSpeed * (1 - variety)),
        Math.max(1, baseSpeed * (1 + variety)),
      ] as [number, number],
      color: hexToNumber($particleColor),
    }

    const spawnRateAuto = calculateAutoSpawnRate(emitter, getViewportBounds())
    emitter.spawnRateAuto = spawnRateAuto

    const preset: PresetConfig = {
      ...$base,
      emitter,
      forces: remappedForces,
    }
    return preset
  },
)

export const estimatedSpawnRatePerSecond = derived(livePreset, ($livePreset) => {
  const spawnRateAuto = calculateAutoSpawnRate($livePreset.emitter, getViewportBounds())
  return Math.round(spawnRateAuto * 60)
})

export const estimatedResidenceTimeFrames = derived(livePreset, ($livePreset) => {
  return Number(estimateResidenceTime($livePreset.emitter, getViewportBounds()).toFixed(2))
})

export function applyPreset(preset: PresetConfig): void {
  currentPresetName.set(preset.name)
  currentPreset.set(preset)
  targetOnScreenParticles.set(
    Math.round(preset.emitter.targetOnScreenParticles ?? preset.emitter.maxParticles ?? 800),
  )
  minSize.set(preset.emitter.initialSize[0])
  maxSize.set(preset.emitter.initialSize[1])
  opacity.set(preset.emitter.initialOpacity[1])

  const minPresetSpeed = preset.emitter.initialSpeed[0]
  const maxPresetSpeed = preset.emitter.initialSpeed[1]
  const avgSpeed = (minPresetSpeed + maxPresetSpeed) / 2
  const speedValue = Math.max(1, avgSpeed / 15)
  speed.set(Number(speedValue.toFixed(1)))

  const halfRange = Math.max(0, (maxPresetSpeed - minPresetSpeed) * 0.5)
  const varietyRatio = avgSpeed > 0 ? Math.min(0.95, halfRange / avgSpeed) : 0
  speedVariety.set(Number((varietyRatio / 0.3).toFixed(1)))

  const c = typeof preset.emitter.color === 'number' ? preset.emitter.color : preset.emitter.color[0]
  particleColor.set('#' + c.toString(16).padStart(6, '0'))
}
