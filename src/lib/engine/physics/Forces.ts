import type { Particle } from '../Particle'
import type { ForceConfig } from '../types'
import { Vector2 } from './Vector2'

const TWO_PI = Math.PI * 2
const INV_TWO_PI = 1 / TWO_PI
const TRIG_TABLE_SIZE = 4096
const TRIG_TABLE_MASK = TRIG_TABLE_SIZE - 1
const SIN_TABLE = new Float32Array(TRIG_TABLE_SIZE)

for (let i = 0; i < TRIG_TABLE_SIZE; i++) {
  SIN_TABLE[i] = Math.sin((i / TRIG_TABLE_SIZE) * TWO_PI)
}

function fastSin(rad: number): number {
  const unit = rad * INV_TWO_PI
  const wrapped = unit - Math.floor(unit)
  const index = (wrapped * TRIG_TABLE_SIZE) & TRIG_TABLE_MASK
  return SIN_TABLE[index]
}

function fastCos(rad: number): number {
  return fastSin(rad + Math.PI * 0.5)
}

export interface Force {
  apply(particle: Particle, dt: number, time: number): void
}

export class GravityForce implements Force {
  private directionX: number
  private directionY: number

  constructor(strength: number, angle: number = Math.PI / 2) {
    const direction = Vector2.fromAngle(angle, strength)
    this.directionX = direction.x
    this.directionY = direction.y
  }

  apply(particle: Particle, dt: number): void {
    particle.velocity.x += this.directionX * dt
    particle.velocity.y += this.directionY * dt
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
      const noise = fastSin(time * 0.7 + particle.position.y * 0.01) * this.variability
      fx += noise
      fy += fastSin(time * 1.1) * this.variability * 0.3
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
      fastSin(px * 1.7 + t * 0.8) * 0.5 +
      fastSin(py * 2.3 + t * 0.6) * 0.3 +
      fastSin((px + py) * 1.1 + t * 1.2) * 0.2

    const fy =
      fastCos(px * 2.1 + t * 0.9) * 0.4 +
      fastCos(py * 1.5 + t * 0.7) * 0.35 +
      fastCos((px - py) * 1.8 + t * 1.1) * 0.25

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
    const diffX = this.target.x - particle.position.x
    const diffY = this.target.y - particle.position.y
    const distSq = diffX * diffX + diffY * diffY
    if (distSq > this.radius * this.radius || distSq < 1) return

    const dist = Math.sqrt(distSq)
    const factor = (this.strength * (1 - dist / this.radius)) / dist

    particle.velocity.x += diffX * factor * dt
    particle.velocity.y += diffY * factor * dt
  }
}

export class RepelForce implements Force {
  constructor(
    private target: Vector2,
    private strength: number,
    private radius: number,
  ) {}

  apply(particle: Particle, dt: number): void {
    const diffX = particle.position.x - this.target.x
    const diffY = particle.position.y - this.target.y
    const distSq = diffX * diffX + diffY * diffY
    if (distSq > this.radius * this.radius || distSq < 1) return

    const dist = Math.sqrt(distSq)
    const factor = (this.strength * (1 - dist / this.radius)) / dist

    particle.velocity.x += diffX * factor * dt
    particle.velocity.y += diffY * factor * dt
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
