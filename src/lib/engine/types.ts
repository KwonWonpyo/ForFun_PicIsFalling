export type SpawnArea =
  | { type: 'point'; x: number; y: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number }

export interface EmitterConfig {
  targetOnScreenParticles: number
  spawnRateAuto?: number
  safetyCap?: number
  estimatedVerticalAcceleration?: number
  topSpawnBandHeight?: number
  // Legacy compatibility fields (v1 scene data / old presets)
  spawnRate?: number
  maxParticles?: number
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

export interface PresetBackground {
  type: 'solid' | 'gradient'
  color?: string
  gradient?: string
}

export interface PresetConfig {
  name: string
  label: string
  emitter: EmitterConfig
  forces: ForceConfig[]
  background?: PresetBackground
}

export type ForceConfig =
  | { type: 'gravity'; strength: number; angle?: number }
  | { type: 'wind'; strength: number; angle?: number; variability?: number }
  | { type: 'turbulence'; frequency: number; amplitude: number }
  | { type: 'attract'; x: number; y: number; strength: number; radius: number }
  | { type: 'repel'; x: number; y: number; strength: number; radius: number }

export interface Bounds {
  width: number
  height: number
}
