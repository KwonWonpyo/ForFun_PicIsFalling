export interface SceneBackground {
  color: string
  useImage: boolean
}

export interface SceneParamsV1 {
  spawnRate: number
  maxParticles: number
  minSize: number
  maxSize: number
  opacity: number
  speed: number
  speedVariety: number
  particleColor: string
}

export interface SceneParamsV2 {
  targetOnScreenParticles: number
  minSize: number
  maxSize: number
  opacity: number
  speed: number
  speedVariety: number
  particleColor: string
}

export interface SceneDataV1 {
  version: 1
  preset: string
  params: SceneParamsV1
  background: SceneBackground
}

export interface SceneDataV2 {
  version: 2
  preset: string
  params: SceneParamsV2
  background: SceneBackground
}

export type SceneData = SceneDataV1 | SceneDataV2

export function createSceneData(
  presetName: string,
  params: SceneDataV2['params'],
  background: SceneDataV2['background'],
): SceneDataV2 {
  return {
    version: 2,
    preset: presetName,
    params,
    background,
  }
}

function asFinite(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return value
}

function asString(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  return value
}

export function migrateSceneV1ToV2(scene: SceneDataV1): SceneDataV2 {
  const legacyMaxParticles = asFinite(scene.params.maxParticles, 0)
  const derivedTarget = Math.max(
    20,
    Math.round(legacyMaxParticles > 0 ? legacyMaxParticles : asFinite(scene.params.spawnRate, 40) * 12),
  )

  return createSceneData(
    asString(scene.preset, 'snow'),
    {
      targetOnScreenParticles: derivedTarget,
      minSize: asFinite(scene.params.minSize, 2),
      maxSize: asFinite(scene.params.maxSize, 8),
      opacity: asFinite(scene.params.opacity, 1),
      speed: asFinite(scene.params.speed, 3),
      speedVariety: asFinite(scene.params.speedVariety, 2),
      particleColor: asString(scene.params.particleColor, '#ffffff'),
    },
    {
      color: asString(scene.background.color, '#0d182c'),
      useImage: Boolean(scene.background.useImage),
    },
  )
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function normalizeSceneData(raw: unknown): SceneDataV2 | null {
  if (!isObject(raw)) return null

  const version = raw.version
  if (version === 2) {
    const preset = asString(raw.preset, 'snow')
    const paramsRaw = isObject(raw.params) ? raw.params : {}
    const backgroundRaw = isObject(raw.background) ? raw.background : {}

    return createSceneData(
      preset,
      {
        targetOnScreenParticles: Math.max(20, Math.round(asFinite(paramsRaw.targetOnScreenParticles, 800))),
        minSize: asFinite(paramsRaw.minSize, 2),
        maxSize: asFinite(paramsRaw.maxSize, 8),
        opacity: asFinite(paramsRaw.opacity, 1),
        speed: asFinite(paramsRaw.speed, 3),
        speedVariety: asFinite(paramsRaw.speedVariety, 2),
        particleColor: asString(paramsRaw.particleColor, '#ffffff'),
      },
      {
        color: asString(backgroundRaw.color, '#0d182c'),
        useImage: Boolean(backgroundRaw.useImage),
      },
    )
  }

  if (version === 1) {
    const paramsRaw = isObject(raw.params) ? raw.params : {}
    const backgroundRaw = isObject(raw.background) ? raw.background : {}
    const v1: SceneDataV1 = {
      version: 1,
      preset: asString(raw.preset, 'snow'),
      params: {
        spawnRate: asFinite(paramsRaw.spawnRate, 40),
        maxParticles: asFinite(paramsRaw.maxParticles, 800),
        minSize: asFinite(paramsRaw.minSize, 2),
        maxSize: asFinite(paramsRaw.maxSize, 8),
        opacity: asFinite(paramsRaw.opacity, 1),
        speed: asFinite(paramsRaw.speed, 3),
        speedVariety: asFinite(paramsRaw.speedVariety, 2),
        particleColor: asString(paramsRaw.particleColor, '#ffffff'),
      },
      background: {
        color: asString(backgroundRaw.color, '#0d182c'),
        useImage: Boolean(backgroundRaw.useImage),
      },
    }
    return migrateSceneV1ToV2(v1)
  }

  return null
}
