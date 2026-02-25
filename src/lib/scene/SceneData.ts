export interface SceneData {
  version: 1
  preset: string
  params: {
    spawnRate: number
    maxParticles: number
    minSize: number
    maxSize: number
    opacity: number
    speed: number
    speedVariety: number
    particleColor: string
  }
  background: {
    color: string
    useImage: boolean
  }
}

export function createSceneData(
  presetName: string,
  params: SceneData['params'],
  background: SceneData['background'],
): SceneData {
  return {
    version: 1,
    preset: presetName,
    params,
    background,
  }
}
