import type { Bounds, EmitterConfig, ForceConfig, SpawnArea } from './types'

const MIN_TARGET_PARTICLES = 1
const MIN_SAFETY_CAP = 64
const HARD_SAFETY_CAP = 20000
const MIN_RESIDENCE_TIME = 0.2
const MAX_RESIDENCE_TIME = 240
const MIN_DOWNWARD_SPEED = 2
const MIN_VISIBLE_RESIDENCE = 0.15
const EXIT_PADDING = 12
const OCCUPANCY_COMPENSATION = 1.25

export const DEFAULT_OCCUPANCY_BOUNDS: Bounds = {
  width: 1920,
  height: 1080,
}

function resolveAreaX(value: number): number {
  if (value === -1) return 0
  return value
}

function resolveAreaY(value: number): number {
  if (value === -1) return 0
  return value
}

function resolveAreaWidth(value: number, bounds: Bounds): number {
  if (value === -1) return bounds.width
  return value
}

function resolveAreaHeight(value: number, bounds: Bounds): number {
  if (value === -1) return bounds.height
  return value
}

function estimateSpawnY(area: SpawnArea, bounds: Bounds): number {
  switch (area.type) {
    case 'point':
      return resolveAreaY(area.y)
    case 'line': {
      const y1 = resolveAreaY(area.y1)
      const y2 = resolveAreaY(area.y2)
      return (y1 + y2) * 0.5
    }
    case 'rect':
      return resolveAreaY(area.y) + resolveAreaHeight(area.height, bounds) * 0.5
  }
}

function estimateAverageDownwardSpeed(config: EmitterConfig): number {
  const minSpeed = config.initialSpeed[0]
  const maxSpeed = config.initialSpeed[1]
  const minAngle = config.initialDirection[0]
  const maxAngle = config.initialDirection[1]

  const speedSamples = [minSpeed, (minSpeed + maxSpeed) * 0.5, maxSpeed]
  const angleSamples = [minAngle, (minAngle + maxAngle) * 0.5, maxAngle]

  let sum = 0
  let count = 0
  for (let i = 0; i < speedSamples.length; i++) {
    for (let j = 0; j < angleSamples.length; j++) {
      const vy = Math.sin(angleSamples[j]) * speedSamples[i]
      sum += Math.max(vy, 0)
      count++
    }
  }

  const avgDownward = count > 0 ? sum / count : 0
  const fallbackMidSpeed = Math.abs(Math.sin((minAngle + maxAngle) * 0.5)) * ((minSpeed + maxSpeed) * 0.5) * 0.5
  return Math.max(avgDownward, fallbackMidSpeed, MIN_DOWNWARD_SPEED)
}

function solvePositiveTravelTime(distance: number, initialVy: number, accelerationY: number): number {
  const safeVy = Math.max(initialVy, MIN_DOWNWARD_SPEED)
  if (Math.abs(accelerationY) < 1e-6) {
    return distance / safeVy
  }

  const discriminant = initialVy * initialVy + 2 * accelerationY * distance
  if (discriminant <= 0) {
    return distance / safeVy
  }

  const sqrtDiscriminant = Math.sqrt(discriminant)
  const t1 = (-initialVy + sqrtDiscriminant) / accelerationY
  const t2 = (-initialVy - sqrtDiscriminant) / accelerationY

  let best = Number.POSITIVE_INFINITY
  if (t1 > 0 && Number.isFinite(t1)) best = Math.min(best, t1)
  if (t2 > 0 && Number.isFinite(t2)) best = Math.min(best, t2)

  if (!Number.isFinite(best)) {
    return distance / safeVy
  }
  return best
}

export function estimateAverageLifetime(config: EmitterConfig): number {
  return Math.max((config.particleLifetime[0] + config.particleLifetime[1]) * 0.5, MIN_RESIDENCE_TIME)
}

function estimateVisibleTravelWindow(
  config: EmitterConfig,
  bounds: Bounds,
  initialVy: number,
  accelerationY: number,
): { enterTime: number; exitTime: number } {
  const bandHeight = Math.max(0, config.topSpawnBandHeight ?? 0)
  const spawnY = estimateSpawnY(config.spawnArea, bounds) + bandHeight * 0.5
  const distanceToEnter = Math.max(0, -spawnY)
  const distanceToExit = Math.max(distanceToEnter + 1, bounds.height + EXIT_PADDING - spawnY)
  const enterTime = distanceToEnter > 0 ? solvePositiveTravelTime(distanceToEnter, initialVy, accelerationY) : 0
  const exitTime = solvePositiveTravelTime(distanceToExit, initialVy, accelerationY)
  return {
    enterTime: Math.max(0, enterTime),
    exitTime: Math.max(enterTime + MIN_VISIBLE_RESIDENCE, exitTime),
  }
}

export function estimateResidenceTime(config: EmitterConfig, bounds: Bounds): number {
  const avgLifetime = estimateAverageLifetime(config)
  const initialVy = estimateAverageDownwardSpeed(config)
  const accelerationY = config.estimatedVerticalAcceleration ?? 0
  const travelWindow = estimateVisibleTravelWindow(config, bounds, initialVy, accelerationY)
  const visibleUntil = Math.min(avgLifetime, travelWindow.exitTime)
  const hiddenUntil = Math.min(avgLifetime, travelWindow.enterTime)
  const residence = Math.max(MIN_VISIBLE_RESIDENCE, visibleUntil - hiddenUntil)
  return Math.min(MAX_RESIDENCE_TIME, Math.max(MIN_RESIDENCE_TIME, residence))
}

export function calculateAutoSpawnRate(config: EmitterConfig, bounds: Bounds): number {
  const target = Math.max(MIN_TARGET_PARTICLES, Math.round(config.targetOnScreenParticles))
  const residenceTime = estimateResidenceTime(config, bounds)
  return (target / residenceTime) * OCCUPANCY_COMPENSATION
}

export function resolveSafetyCap(config: EmitterConfig): number {
  const target = Math.max(
    MIN_TARGET_PARTICLES,
    Math.round(config.targetOnScreenParticles || config.maxParticles || MIN_TARGET_PARTICLES),
  )
  const fallbackCap = Math.ceil(target * 4)
  const minCap = Math.ceil(target * 1.5)
  const requested = config.safetyCap ?? config.maxParticles ?? fallbackCap
  return Math.min(HARD_SAFETY_CAP, Math.max(MIN_SAFETY_CAP, minCap, Math.ceil(requested)))
}

export function resolveDynamicSafetyCap(config: EmitterConfig, spawnRate: number): number {
  const staticCap = resolveSafetyCap(config)
  const lifetimeCap = Math.ceil(spawnRate * estimateAverageLifetime(config) * 1.25)
  return Math.min(HARD_SAFETY_CAP, Math.max(staticCap, lifetimeCap))
}

export function estimateDownwardAcceleration(forces: ForceConfig[]): number {
  let accelerationY = 0
  for (let i = 0; i < forces.length; i++) {
    const force = forces[i]
    if (force.type === 'gravity') {
      accelerationY += Math.sin(force.angle ?? Math.PI / 2) * force.strength
      continue
    }
    if (force.type === 'wind') {
      accelerationY += Math.sin(force.angle ?? 0) * force.strength
    }
  }
  return accelerationY
}

export function resolveTopBandDefault(area: SpawnArea): number {
  if (area.type !== 'line') return 0
  const isHorizontal = Math.abs(area.y1 - area.y2) < 0.001
  return isHorizontal ? 20 : 0
}

export function normalizeSpawnArea(area: SpawnArea, bounds: Bounds): SpawnArea {
  switch (area.type) {
    case 'point':
      return {
        type: 'point',
        x: resolveAreaX(area.x),
        y: resolveAreaY(area.y),
      }
    case 'line':
      return {
        type: 'line',
        x1: area.x1 === -1 ? 0 : area.x1,
        y1: area.y1 === -1 ? 0 : area.y1,
        x2: area.x2 === -1 ? bounds.width : area.x2,
        y2: area.y2 === -1 ? bounds.height : area.y2,
      }
    case 'rect':
      return {
        type: 'rect',
        x: resolveAreaX(area.x),
        y: resolveAreaY(area.y),
        width: resolveAreaWidth(area.width, bounds),
        height: resolveAreaHeight(area.height, bounds),
      }
  }
}
