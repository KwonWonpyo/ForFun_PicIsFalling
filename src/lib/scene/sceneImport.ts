import { normalizeSceneData } from './SceneData'
import {
  currentPresetName,
  targetOnScreenParticles,
  minSize,
  maxSize,
  opacity,
  speed,
  speedVariety,
  particleColor,
  currentPreset,
} from '../../stores/particleConfig'
import { backgroundColor, useBackgroundImage } from '../../stores/appState'
import { presetMap } from '../presets'

export function applyScene(scene: unknown): boolean {
  const normalized = normalizeSceneData(scene)
  if (!normalized) return false

  const preset = presetMap[normalized.preset]
  if (preset) {
    currentPresetName.set(normalized.preset)
    currentPreset.set(preset)
  }

  targetOnScreenParticles.set(normalized.params.targetOnScreenParticles)
  minSize.set(normalized.params.minSize)
  maxSize.set(normalized.params.maxSize)
  opacity.set(normalized.params.opacity)
  speed.set(normalized.params.speed)
  speedVariety.set(normalized.params.speedVariety)
  particleColor.set(normalized.params.particleColor)

  backgroundColor.set(normalized.background.color)
  useBackgroundImage.set(normalized.background.useImage)

  return true
}

export function importSceneJSON(json: string): boolean {
  try {
    const scene = JSON.parse(json) as unknown
    return applyScene(scene)
  } catch {
    return false
  }
}

export function loadSceneFromFile(): Promise<boolean> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(false)
        return
      }
      const text = await file.text()
      resolve(importSceneJSON(text))
    }
    input.click()
  })
}
