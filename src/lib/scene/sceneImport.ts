import type { SceneData } from './SceneData'
import {
  currentPresetName,
  spawnRate,
  maxParticles,
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

export function applyScene(scene: SceneData): boolean {
  if (scene.version !== 1) return false

  const preset = presetMap[scene.preset]
  if (preset) {
    currentPresetName.set(scene.preset)
    currentPreset.set(preset)
  }

  spawnRate.set(scene.params.spawnRate)
  maxParticles.set(scene.params.maxParticles)
  minSize.set(scene.params.minSize)
  maxSize.set(scene.params.maxSize)
  opacity.set(scene.params.opacity)
  speed.set(scene.params.speed)
  speedVariety.set(scene.params.speedVariety)
  particleColor.set(scene.params.particleColor)

  backgroundColor.set(scene.background.color)
  useBackgroundImage.set(scene.background.useImage)

  return true
}

export function importSceneJSON(json: string): boolean {
  try {
    const scene = JSON.parse(json) as SceneData
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
