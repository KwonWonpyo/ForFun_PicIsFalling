export { Particle } from './Particle'
export { Emitter } from './Emitter'
export { ParticleSystem } from './ParticleSystem'
export {
  DEFAULT_OCCUPANCY_BOUNDS,
  calculateAutoSpawnRate,
  estimateAverageLifetime,
  estimateResidenceTime,
  estimateDownwardAcceleration,
  resolveDynamicSafetyCap,
  resolveSafetyCap,
} from './occupancy'
export { Vector2, createForce } from './physics'
export type { Force } from './physics'
export type { EmitterConfig, PresetConfig, ForceConfig, SpawnArea, Bounds } from './types'
