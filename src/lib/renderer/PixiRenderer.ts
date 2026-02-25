import { Application, Container, Graphics } from 'pixi.js'
import type { ParticleSystem } from '../engine/ParticleSystem'
import type { Particle } from '../engine/Particle'

interface RenderParticle {
  graphic: Graphics
  active: boolean
}

export class PixiRenderer {
  app: Application
  private container: Container
  private renderPool: RenderParticle[] = []
  private activeCount: number = 0

  constructor(app: Application) {
    this.app = app
    this.container = new Container()
    this.app.stage.addChild(this.container)
  }

  private ensureCapacity(needed: number): void {
    while (this.renderPool.length < needed) {
      const graphic = new Graphics()
      graphic.visible = false
      this.container.addChild(graphic)
      this.renderPool.push({ graphic, active: false })
    }
  }

  sync(system: ParticleSystem): void {
    const allParticles: Particle[] = []
    for (const emitter of system.emitters) {
      for (const p of emitter.particles) {
        if (p.alive) allParticles.push(p)
      }
    }

    this.ensureCapacity(allParticles.length)

    for (let i = 0; i < this.activeCount; i++) {
      if (i >= allParticles.length) {
        this.renderPool[i].graphic.visible = false
        this.renderPool[i].active = false
      }
    }

    for (let i = 0; i < allParticles.length; i++) {
      const p = allParticles[i]
      const rp = this.renderPool[i]

      if (!rp.active) {
        rp.graphic.clear()
        rp.graphic.circle(0, 0, 1)
        rp.graphic.fill(0xffffff)
        rp.active = true
      }

      rp.graphic.x = p.position.x
      rp.graphic.y = p.position.y
      rp.graphic.scale.set(p.size)
      rp.graphic.rotation = p.rotation
      rp.graphic.alpha = p.opacity
      rp.graphic.tint = p.color
      rp.graphic.visible = true
    }

    this.activeCount = allParticles.length
  }

  clear(): void {
    for (const rp of this.renderPool) {
      rp.graphic.visible = false
      rp.active = false
    }
    this.activeCount = 0
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
