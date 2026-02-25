import { Emitter } from './Emitter'
import type { Force } from './physics/Forces'
import { createForce } from './physics/Forces'
import type { PresetConfig, Bounds } from './types'

export class ParticleSystem {
  emitters: Emitter[] = []
  forces: Force[] = []
  bounds: Bounds = { width: 800, height: 600 }
  time: number = 0

  loadPreset(preset: PresetConfig): void {
    this.clear()
    this.addEmitter(new Emitter(preset.emitter))
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

    for (const emitter of this.emitters) {
      emitter.emit(dt, this.bounds)

      for (const particle of emitter.particles) {
        for (const force of this.forces) {
          force.apply(particle, dt, this.time)
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
