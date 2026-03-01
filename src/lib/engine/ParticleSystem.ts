import { Emitter } from './Emitter'
import type { Force } from './physics/Forces'
import { createForce } from './physics/Forces'
import { estimateDownwardAcceleration } from './occupancy'
import type { PresetConfig, Bounds } from './types'

export class ParticleSystem {
  emitters: Emitter[] = []
  forces: Force[] = []
  bounds: Bounds = { width: 800, height: 600 }
  time: number = 0

  loadPreset(preset: PresetConfig): void {
    this.clear()
    this.addEmitter(
      new Emitter({
        ...preset.emitter,
        estimatedVerticalAcceleration:
          preset.emitter.estimatedVerticalAcceleration ?? estimateDownwardAcceleration(preset.forces),
      }),
    )
    for (const fc of preset.forces) {
      this.addForce(createForce(fc))
    }
  }

  addEmitter(emitter: Emitter): void {
    this.emitters.push(emitter)
  }

  removeEmitter(emitter: Emitter): void {
    const idx = this.emitters.indexOf(emitter)
    if (idx !== -1) this.emitters.splice(idx, 1)
  }

  addForce(force: Force): void {
    this.forces.push(force)
  }

  clearForces(): void {
    this.forces.length = 0
  }

  setBounds(width: number, height: number): void {
    this.bounds.width = width
    this.bounds.height = height
  }

  update(dt: number): void {
    this.time += dt

    const emitters = this.emitters
    const forces = this.forces
    const forceCount = forces.length
    const time = this.time

    for (let e = 0; e < emitters.length; e++) {
      const emitter = emitters[e]
      emitter.emit(dt, this.bounds)

      if (forceCount > 0) {
        const particles = emitter.particles
        for (let p = 0; p < particles.length; p++) {
          const particle = particles[p]
          for (let f = 0; f < forceCount; f++) {
            forces[f].apply(particle, dt, time)
          }
        }
      }

      emitter.update(dt)
    }
  }

  clear(): void {
    for (const emitter of this.emitters) {
      emitter.clear()
    }
    this.emitters.length = 0
    this.forces.length = 0
    this.time = 0
  }

  get totalParticles(): number {
    let count = 0
    for (const e of this.emitters) {
      count += e.particleCount
    }
    return count
  }
}
