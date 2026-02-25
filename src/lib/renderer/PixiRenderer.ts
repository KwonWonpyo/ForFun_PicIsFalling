import { Application, Container, Sprite, Texture, Assets } from 'pixi.js'
import type { ParticleSystem } from '../engine/ParticleSystem'
import type { Particle } from '../engine/Particle'

const TEXTURE_PATHS: Record<string, string[]> = {
  snowflake: ['assets/particles/snowflake.svg'],
  raindrop: ['assets/particles/raindrop.svg'],
  sakura: ['assets/particles/sakura.svg'],
  leaf: ['assets/particles/leaf1.svg', 'assets/particles/leaf2.svg'],
}

interface RenderParticle {
  sprite: Sprite
  active: boolean
  textureKey: string
}

export class PixiRenderer {
  app: Application
  private container: Container
  private renderPool: RenderParticle[] = []
  private activeCount: number = 0
  private textures: Map<string, Texture[]> = new Map()
  private fallbackTexture: Texture | null = null
  private loaded: boolean = false

  constructor(app: Application) {
    this.app = app
    this.container = new Container()
    this.app.stage.addChild(this.container)
    this.loadTextures()
  }

  private async loadTextures(): Promise<void> {
    const base = import.meta.env.BASE_URL ?? '/'

    for (const [key, paths] of Object.entries(TEXTURE_PATHS)) {
      const textures: Texture[] = []
      for (const p of paths) {
        try {
          const fullPath = `${base}${p}`
          const texture = await Assets.load(fullPath)
          textures.push(texture)
        } catch {
          // texture load failed, will use fallback
        }
      }
      if (textures.length > 0) {
        this.textures.set(key, textures)
      }
    }

    this.loaded = true
  }

  private getTexture(textureId?: string): Texture {
    if (textureId && this.textures.has(textureId)) {
      const textures = this.textures.get(textureId)!
      return textures[Math.floor(Math.random() * textures.length)]
    }

    if (!this.fallbackTexture) {
      this.fallbackTexture = Texture.WHITE
    }
    return this.fallbackTexture
  }

  private ensureCapacity(needed: number): void {
    while (this.renderPool.length < needed) {
      const sprite = new Sprite()
      sprite.anchor.set(0.5)
      sprite.visible = false
      this.container.addChild(sprite)
      this.renderPool.push({ sprite, active: false, textureKey: '' })
    }
  }

  sync(system: ParticleSystem): void {
    if (!this.loaded) return

    const allParticles: Particle[] = []
    for (const emitter of system.emitters) {
      for (const p of emitter.particles) {
        if (p.alive) allParticles.push(p)
      }
    }

    this.ensureCapacity(allParticles.length)

    for (let i = this.activeCount; i > allParticles.length; i--) {
      const rp = this.renderPool[i - 1]
      rp.sprite.visible = false
      rp.active = false
    }

    for (let i = 0; i < allParticles.length; i++) {
      const p = allParticles[i]
      const rp = this.renderPool[i]

      const desiredKey = p.textureId ?? ''
      if (!rp.active || rp.textureKey !== desiredKey) {
        rp.sprite.texture = this.getTexture(p.textureId)
        rp.active = true
        rp.textureKey = desiredKey
      }

      rp.sprite.x = p.position.x
      rp.sprite.y = p.position.y

      const baseScale = p.size / 8
      rp.sprite.scale.set(baseScale * p.currentScaleX, baseScale)

      rp.sprite.rotation = p.rotation
      rp.sprite.alpha = p.opacity
      rp.sprite.tint = p.color
      rp.sprite.visible = true
    }

    this.activeCount = allParticles.length
  }

  clear(): void {
    for (let i = 0; i < this.activeCount; i++) {
      const rp = this.renderPool[i]
      rp.sprite.visible = false
      rp.active = false
    }
    this.activeCount = 0
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
