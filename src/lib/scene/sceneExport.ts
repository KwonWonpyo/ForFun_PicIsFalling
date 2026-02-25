import type { SceneData } from './SceneData'
import { createSceneData } from './SceneData'
import { get } from 'svelte/store'
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
} from '../../stores/particleConfig'
import { backgroundColor, useBackgroundImage } from '../../stores/appState'

export function captureScene(): SceneData {
  return createSceneData(
    get(currentPresetName),
    {
      spawnRate: get(spawnRate),
      maxParticles: get(maxParticles),
      minSize: get(minSize),
      maxSize: get(maxSize),
      opacity: get(opacity),
      speed: get(speed),
      speedVariety: get(speedVariety),
      particleColor: get(particleColor),
    },
    {
      color: get(backgroundColor),
      useImage: get(useBackgroundImage),
    },
  )
}

export function exportSceneJSON(): string {
  return JSON.stringify(captureScene(), null, 2)
}

export function downloadScene(filename: string = 'scene.json'): void {
  const json = exportSceneJSON()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
