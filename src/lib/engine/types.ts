export interface ParticleState {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  opacity: number
  age: number
  lifetime: number
  color: number
  textureId?: string
}

export interface EmitterConfig {
  spawnRate: number
  spawnArea: SpawnArea
  particleLifetime: [number, number]
  initialSpeed: [number, number]
  initialDirection: [number, number]
  initialSize: [number, number]
  initialRotation: [number, number]
  initialOpacity: [number, number]
  color: number | number[]
  texture?: string
}

export type SpawnArea =
  | { type: 'point'; x: number; y: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number }

export interface ForceConfig {
  type: 'gravity' | 'wind' | 'turbulence' | 'attract' | 'repel'
  strength: number
  [key: string]: unknown
}

export interface PresetConfig {
  name: string
  emitter: EmitterConfig
  forces: ForceConfig[]
}
