import type { Particle } from '../Particle'
import type { ForceConfig } from '../types'
import { Vector2 } from './Vector2'

export interface Force {
  apply(particle: Particle, dt: number, time: number): void
}

export class GravityForce implements Force {
  private direction: Vector2

  constructor(strength: number, angle: number = Math.PI / 2) {
    this.direction = Vector2.fromAngle(angle, strength)
  }

  apply(particle: Particle, dt: number): void {
    particle.velocity.addMut(this.direction.scale(dt))
  }
}

export class WindForce implements Force {
  private baseDirection: Vector2
  private variability: number

  constructor(strength: number, angle: number = 0, variability: number = 0) {
    this.baseDirection = Vector2.fromAngle(angle, strength)
    this.variability = variability
  }

  apply(particle: Particle, dt: number, time: number): void {
    let fx = this.baseDirection.x
    let fy = this.baseDirection.y

    if (this.variability > 0) {
      const noise = Math.sin(time * 0.7 + particle.position.y * 0.01) * this.variability
      fx += noise
      fy += Math.sin(time * 1.1) * this.variability * 0.3
    }

    particle.velocity.x += fx * dt
    particle.velocity.y += fy * dt
  }
}

export class TurbulenceForce implements Force {
  private frequency: number
  private amplitude: number

  constructor(frequency: number, amplitude: number) {
    this.frequency = frequency
    this.amplitude = amplitude
  }

  apply(particle: Particle, dt: number, time: number): void {
    const px = particle.position.x * 0.005 * this.frequency
    const py = particle.position.y * 0.005 * this.frequency
    const t = time * this.frequency

    const fx =
      Math.sin(px * 1.7 + t * 0.8) * 0.5 +
      Math.sin(py * 2.3 + t * 0.6) * 0.3 +
      Math.sin((px + py) * 1.1 + t * 1.2) * 0.2

    const fy =
      Math.cos(px * 2.1 + t * 0.9) * 0.4 +
      Math.cos(py * 1.5 + t * 0.7) * 0.35 +
      Math.cos((px - py) * 1.8 + t * 1.1) * 0.25

    particle.velocity.x += fx * this.amplitude * dt
    particle.velocity.y += fy * this.amplitude * dt
  }
}

export class AttractForce implements Force {
  constructor(
    private target: Vector2,
    private strength: number,
    private radius: number,
  ) {}

  apply(particle: Particle, dt: number): void {
    const diff = this.target.sub(particle.position)
    const distSq = diff.lengthSq()
    if (distSq > this.radius * this.radius || distSq < 1) return

    const dist = Math.sqrt(distSq)
    const factor = (this.strength * (1 - dist / this.radius)) / dist

    particle.velocity.x += diff.x * factor * dt
    particle.velocity.y += diff.y * factor * dt
  }
}

export class RepelForce implements Force {
  constructor(
    private target: Vector2,
    private strength: number,
    private radius: number,
  ) {}

  apply(particle: Particle, dt: number): void {
    const diff = particle.position.sub(this.target)
    const distSq = diff.lengthSq()
    if (distSq > this.radius * this.radius || distSq < 1) return

    const dist = Math.sqrt(distSq)
    const factor = (this.strength * (1 - dist / this.radius)) / dist

    particle.velocity.x += diff.x * factor * dt
    particle.velocity.y += diff.y * factor * dt
  }
}

export function createForce(config: ForceConfig): Force {
  switch (config.type) {
    case 'gravity':
      return new GravityForce(config.strength, config.angle)
    case 'wind':
      return new WindForce(config.strength, config.angle, config.variability)
    case 'turbulence':
      return new TurbulenceForce(config.frequency, config.amplitude)
    case 'attract':
      return new AttractForce(new Vector2(config.x, config.y), config.strength, config.radius)
    case 'repel':
      return new RepelForce(new Vector2(config.x, config.y), config.strength, config.radius)
  }
}
