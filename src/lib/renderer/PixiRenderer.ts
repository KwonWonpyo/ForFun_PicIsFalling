import {
  Application,
  Container,
  Sprite,
  Texture,
  Assets,
  RenderTexture,
  Graphics,
} from 'pixi.js'
import type { ParticleSystem } from '../engine/ParticleSystem'
import type { Particle } from '../engine/Particle'

const TEXTURE_PATHS: Record<string, string[]> = {
  snowflake: ['assets/particles/snowflake.svg'],
  raindrop: ['assets/particles/raindrop.svg'],
  sakura: ['assets/particles/sakura.svg'],
  leaf: ['assets/particles/leaf1.svg', 'assets/particles/leaf2.svg'],
}

const RASTER_SIZE = 64

interface SpriteEntry {
  sprite: Sprite
  active: boolean
  textureKey: string
}

export class PixiRenderer {
  app: Application
  private container: Container
  private pool: SpriteEntry[] = []
  private activeCount: number = 0
  private textures: Map<string, Texture[]> = new Map()
  private fallbackTexture: Texture | null = null
  private loaded: boolean = false
  private particleTextureCache: WeakMap<Particle, { key: string; tex: Texture }> = new WeakMap()

  constructor(app: Application) {
    this.app = app
    this.container = new Container()
    this.app.stage.addChild(this.container)
    this.loadTextures()
  }

  private async loadTextures(): Promise<void> {
    const base = import.meta.env.BASE_URL ?? '/'

    this.fallbackTexture = this.createCircleTexture()

    for (const [key, paths] of Object.entries(TEXTURE_PATHS)) {
      const textures: Texture[] = []
      for (const p of paths) {
        try {
          const fullPath = `${base}${p}`
          const svgTexture = await Assets.load(fullPath)
          const rasterized = this.rasterize(svgTexture)
          textures.push(rasterized)
        } catch {
          // fallback to circle
        }
      }
      if (textures.length > 0) {
        this.textures.set(key, textures)
      }
    }

    this.loaded = true
  }

  private rasterize(svgTexture: Texture): RenderTexture {
    const rt = RenderTexture.create({ width: RASTER_SIZE, height: RASTER_SIZE })
    const tempSprite = new Sprite(svgTexture)
    tempSprite.width = RASTER_SIZE
    tempSprite.height = RASTER_SIZE
    this.app.renderer.render({ container: tempSprite, target: rt })
    tempSprite.destroy()
    return rt
  }

  private createCircleTexture(): RenderTexture {
    const rt = RenderTexture.create({ width: 32, height: 32 })
    const g = new Graphics()
    g.circle(16, 16, 14)
    g.fill(0xffffff)
    this.app.renderer.render({ container: g, target: rt })
    g.destroy()
    return rt
  }

  private getTexture(particle: Particle): Texture {
    const cached = this.particleTextureCache.get(particle)
    const wantedKey = particle.textureId ?? ''

    if (cached && cached.key === wantedKey) {
      return cached.tex
    }

    let tex: Texture
    if (particle.textureId && this.textures.has(particle.textureId)) {
      const textures = this.textures.get(particle.textureId)!
      tex = textures[Math.floor(Math.random() * textures.length)]
    } else {
      tex = this.fallbackTexture!
    }

    this.particleTextureCache.set(particle, { key: wantedKey, tex })
    return tex
  }

  private ensureCapacity(needed: number): void {
    while (this.pool.length < needed) {
      const sprite = new Sprite()
      sprite.anchor.set(0.5)
      sprite.visible = false
      this.container.addChild(sprite)
      this.pool.push({ sprite, active: false, textureKey: '' })
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

    for (let i = allParticles.length; i < this.activeCount; i++) {
      this.pool[i].sprite.visible = false
      this.pool[i].active = false
    }

    for (let i = 0; i < allParticles.length; i++) {
      const p = allParticles[i]
      const entry = this.pool[i]
      const tex = this.getTexture(p)

      if (entry.sprite.texture !== tex) {
        entry.sprite.texture = tex
      }

      entry.sprite.x = p.position.x
      entry.sprite.y = p.position.y

      const baseScale = p.size / 8
      entry.sprite.scale.set(baseScale * p.currentScaleX, baseScale)
      entry.sprite.rotation = p.rotation
      entry.sprite.alpha = p.opacity
      entry.sprite.tint = p.color
      entry.sprite.visible = true
      entry.active = true
    }

    this.activeCount = allParticles.length
  }

  clear(): void {
    for (let i = 0; i < this.activeCount; i++) {
      this.pool[i].sprite.visible = false
      this.pool[i].active = false
    }
    this.activeCount = 0
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
