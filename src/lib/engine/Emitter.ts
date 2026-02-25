import { Particle } from './Particle'
import { Vector2 } from './physics/Vector2'
import type { EmitterConfig, SpawnArea, Bounds } from './types'

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function pickColor(color: number | number[]): number {
  if (typeof color === 'number') return color
  return color[Math.floor(Math.random() * color.length)]
}

function spawnPosition(area: SpawnArea, bounds: Bounds): Vector2 {
  switch (area.type) {
    case 'point':
      return new Vector2(area.x, area.y)
    case 'line': {
      const t = Math.random()
      const x1 = area.x1 === -1 ? 0 : area.x1
      const x2 = area.x2 === -1 ? bounds.width : area.x2
      const y1 = area.y1 === -1 ? 0 : area.y1
      const y2 = area.y2 === -1 ? bounds.height : area.y2
      return new Vector2(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)
    }
    case 'rect': {
      const x = area.x === -1 ? 0 : area.x
      const y = area.y === -1 ? 0 : area.y
      const w = area.width === -1 ? bounds.width : area.width
      const h = area.height === -1 ? bounds.height : area.height
      return new Vector2(x + Math.random() * w, y + Math.random() * h)
    }
  }
}

export class Emitter {
  config: EmitterConfig
  particles: Particle[] = []

  private pool: Particle[] = []
  private spawnAccumulator: number = 0

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
    this.spawnAccumulator += this.config.spawnRate * dt

    while (this.spawnAccumulator >= 1) {
      if (this.particles.length >= this.config.maxParticles) break

      this.spawnAccumulator -= 1
      this.spawnOne(bounds)
    }
  }

  private spawnOne(bounds: Bounds): void {
    const c = this.config
    const pos = spawnPosition(c.spawnArea, bounds)
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
  }

  get particleCount(): number {
    return this.particles.length
  }
}
