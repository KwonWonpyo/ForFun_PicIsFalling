import { Particle } from './Particle'
import { Vector2 } from './physics/Vector2'
import type { EmitterConfig, SpawnArea, Bounds } from './types'
import {
  calculateAutoSpawnRate,
  normalizeSpawnArea,
  resolveDynamicSafetyCap,
  resolveTopBandDefault,
} from './occupancy'

const GOLDEN_RATIO_CONJUGATE = 0.6180339887498949

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function fract(value: number): number {
  return value - Math.floor(value)
}

function pickColor(color: number | number[]): number {
  if (typeof color === 'number') return color
  return color[Math.floor(Math.random() * color.length)]
}

function isHorizontalLine(area: SpawnArea): area is Extract<SpawnArea, { type: 'line' }> {
  return area.type === 'line' && Math.abs(area.y1 - area.y2) < 0.001
}

function resolveTopSpawnBandHeight(config: EmitterConfig): number {
  if (config.topSpawnBandHeight !== undefined) {
    return Math.max(0, config.topSpawnBandHeight)
  }
  return resolveTopBandDefault(config.spawnArea)
}

function estimateJitterStrength(targetOnScreenParticles: number): number {
  const normalizedTarget = Math.max(20, targetOnScreenParticles)
  return Math.min(0.12, 3 / normalizedTarget)
}

function spawnPosition(
  area: SpawnArea,
  bounds: Bounds,
  sequence: number,
  topSpawnBandHeight: number,
  targetOnScreenParticles: number,
): Vector2 {
  const normalizedArea = normalizeSpawnArea(area, bounds)

  const jitter = (Math.random() - 0.5) * estimateJitterStrength(targetOnScreenParticles)
  const t = fract(sequence + jitter)

  switch (normalizedArea.type) {
    case 'point':
      return new Vector2(normalizedArea.x, normalizedArea.y)
    case 'line': {
      const x = normalizedArea.x1 + (normalizedArea.x2 - normalizedArea.x1) * t
      let y = normalizedArea.y1 + (normalizedArea.y2 - normalizedArea.y1) * t
      if (isHorizontalLine(normalizedArea) && topSpawnBandHeight > 0) {
        y += Math.random() * topSpawnBandHeight
      }
      return new Vector2(x, y)
    }
    case 'rect': {
      const v = fract(sequence + GOLDEN_RATIO_CONJUGATE)
      return new Vector2(
        normalizedArea.x + t * normalizedArea.width,
        normalizedArea.y + v * normalizedArea.height,
      )
    }
  }
}

function resolveSpawnRate(config: EmitterConfig, bounds: Bounds): number {
  return calculateAutoSpawnRate(config, bounds)
}

function nextQuasiRandom(index: number, seed: number): number {
  return fract(seed + index * GOLDEN_RATIO_CONJUGATE)
}

export class Emitter {
  config: EmitterConfig
  particles: Particle[] = []

  private pool: Particle[] = []
  private spawnAccumulator: number = 0
  private spawnSequenceIndex: number = 0
  private spawnSequenceSeed: number = Math.random()

  constructor(config: EmitterConfig) {
    this.config = config
  }

  private acquire(): Particle {
    return this.pool.pop() ?? new Particle()
  }

  private release(particle: Particle): void {
    particle.alive = false
    this.pool.push(particle)
  }

  emit(dt: number, bounds: Bounds): void {
    const spawnRate = resolveSpawnRate(this.config, bounds)
    this.config.spawnRateAuto = spawnRate
    const safetyCap = resolveDynamicSafetyCap(this.config, spawnRate)

    this.spawnAccumulator += spawnRate * dt
    const accumulatorCap = Math.max(2, safetyCap * 0.25)
    if (this.spawnAccumulator > accumulatorCap) {
      this.spawnAccumulator = accumulatorCap
    }

    while (this.spawnAccumulator >= 1) {
      if (this.particles.length >= safetyCap) {
        this.spawnAccumulator = Math.min(this.spawnAccumulator, 1)
        break
      }

      this.spawnAccumulator -= 1
      this.spawnOne(bounds)
    }
  }

  private spawnOne(bounds: Bounds): void {
    const c = this.config
    const sequence = nextQuasiRandom(this.spawnSequenceIndex, this.spawnSequenceSeed)
    this.spawnSequenceIndex++
    const pos = spawnPosition(
      c.spawnArea,
      bounds,
      sequence,
      resolveTopSpawnBandHeight(c),
      Math.max(1, c.targetOnScreenParticles),
    )
    const angle = rand(c.initialDirection[0], c.initialDirection[1])
    const speed = rand(c.initialSpeed[0], c.initialSpeed[1])
    const vel = Vector2.fromAngle(angle, speed)

    const particle = this.acquire()
    particle.reset(
      pos.x,
      pos.y,
      vel.x,
      vel.y,
      rand(c.initialSize[0], c.initialSize[1]),
      rand(c.initialRotation[0], c.initialRotation[1]),
      rand(c.initialOpacity[0], c.initialOpacity[1]),
      rand(c.particleLifetime[0], c.particleLifetime[1]),
      pickColor(c.color),
      c.texture,
    )

    this.particles.push(particle)
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.update(dt)

      if (!p.alive) {
        this.release(p)
        this.particles[i] = this.particles[this.particles.length - 1]
        this.particles.pop()
      }
    }
  }

  clear(): void {
    for (const p of this.particles) {
      this.release(p)
    }
    this.particles.length = 0
    this.spawnAccumulator = 0
    this.spawnSequenceIndex = 0
    this.spawnSequenceSeed = Math.random()
  }

  get particleCount(): number {
    return this.particles.length
  }
}
