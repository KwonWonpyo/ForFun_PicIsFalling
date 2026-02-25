import type { SceneData } from './SceneData'
import { captureScene } from './sceneExport'
import { applyScene } from './sceneImport'

export function encodeSceneToUrl(): string {
  const scene = captureScene()
  const json = JSON.stringify(scene)
  const encoded = btoa(encodeURIComponent(json))
  const base = window.location.origin + window.location.pathname
  return `${base}?scene=${encoded}`
}

export function copyShareUrl(): Promise<boolean> {
  const url = encodeSceneToUrl()
  return navigator.clipboard.writeText(url).then(
    () => true,
    () => false,
  )
}

export function loadSceneFromUrl(): boolean {
  const params = new URLSearchParams(window.location.search)
  const sceneParam = params.get('scene')
  if (!sceneParam) return false

  try {
    const json = decodeURIComponent(atob(sceneParam))
    const scene = JSON.parse(json) as SceneData
    return applyScene(scene)
  } catch {
    return false
  }
}
