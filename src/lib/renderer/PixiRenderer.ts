import {
  Application,
  Texture,
  Assets,
  RenderTexture,
  Graphics,
  Sprite,
  ParticleContainer,
  Particle as PixiParticle,
} from 'pixi.js'
import type { ParticleSystem } from '../engine/ParticleSystem'
import type { Particle as EngineParticle } from '../engine/Particle'

const TEXTURE_PATHS: Record<string, string[]> = {
  snowflake: ['assets/particles/snowflake.svg'],
  raindrop: ['assets/particles/raindrop.svg'],
  sakura: ['assets/particles/sakura.svg'],
  leaf: ['assets/particles/leaf1.svg', 'assets/particles/leaf2.svg'],
}

const RASTER_SIZE = 64

interface BucketEntry {
  particle: PixiParticle
  active: boolean
}

interface RenderBucket {
  container: ParticleContainer<PixiParticle>
  texture: Texture
  pool: BucketEntry[]
  activeCount: number
}

interface TextureSelection {
  wantedKey: string
  bucketKey: string
  texture: Texture
}

export class PixiRenderer {
  app: Application
  private buckets: Map<string, RenderBucket> = new Map()
  private textureKeyByTexture: Map<Texture, string> = new Map()
  private textures: Map<string, Texture[]> = new Map()
  private fallbackTexture: Texture | null = null
  private loaded: boolean = false
  private particleTextureCache: WeakMap<EngineParticle, TextureSelection> = new WeakMap()

  constructor(app: Application) {
    this.app = app
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

  private getBucketKey(texture: Texture): string {
    const existing = this.textureKeyByTexture.get(texture)
    if (existing) return existing

    const key = `bucket:${this.textureKeyByTexture.size}`
    this.textureKeyByTexture.set(texture, key)
    return key
  }

  private getTextureSelection(particle: EngineParticle): TextureSelection {
    const cached = this.particleTextureCache.get(particle)
    const wantedKey = particle.textureId ?? ''

    if (cached && cached.wantedKey === wantedKey) {
      return cached
    }

    let texture = this.fallbackTexture!
    if (particle.textureId) {
      const variants = this.textures.get(particle.textureId)
      if (variants && variants.length > 0) {
        texture = variants[Math.floor(Math.random() * variants.length)]
      }
    }

    const selection: TextureSelection = {
      wantedKey,
      bucketKey: this.getBucketKey(texture),
      texture,
    }

    this.particleTextureCache.set(particle, selection)
    return selection
  }

  private createBucket(bucketKey: string, texture: Texture): RenderBucket {
    const container = new ParticleContainer<PixiParticle>({
      texture,
      dynamicProperties: {
        position: true,
        rotation: true,
        vertex: true,
        color: true,
      },
    })
    this.app.stage.addChild(container)

    const bucket: RenderBucket = {
      container,
      texture,
      pool: [],
      activeCount: 0,
    }

    this.buckets.set(bucketKey, bucket)
    return bucket
  }

  private ensureCapacity(bucket: RenderBucket, needed: number): void {
    while (bucket.pool.length < needed) {
      const particle = new PixiParticle({
        texture: bucket.texture,
        anchorX: 0.5,
        anchorY: 0.5,
        alpha: 0,
      })
      bucket.container.addParticle(particle)
      bucket.pool.push({ particle, active: false })
    }
  }

  private hideRange(bucket: RenderBucket, fromIndex: number): void {
    for (let i = fromIndex; i < bucket.activeCount; i++) {
      const entry = bucket.pool[i]
      entry.particle.alpha = 0
      entry.active = false
    }
  }

  sync(system: ParticleSystem): void {
    if (!this.loaded) return

    const neededByBucket: Map<string, number> = new Map()

    // First pass: count live particles per texture bucket
    for (let e = 0; e < system.emitters.length; e++) {
      const particles = system.emitters[e].particles
      for (let p = 0; p < particles.length; p++) {
        const particle = particles[p]
        if (!particle.alive) continue

        const selection = this.getTextureSelection(particle)
        if (!this.buckets.has(selection.bucketKey)) {
          this.createBucket(selection.bucketKey, selection.texture)
        }

        neededByBucket.set(selection.bucketKey, (neededByBucket.get(selection.bucketKey) ?? 0) + 1)
      }
    }

    for (const [bucketKey, bucket] of this.buckets) {
      const needed = neededByBucket.get(bucketKey) ?? 0
      this.ensureCapacity(bucket, needed)
      if (needed < bucket.activeCount) {
        this.hideRange(bucket, needed)
      }
    }

    // Second pass: update visible particles in-place without extra arrays
    const writeIndexByBucket: Map<string, number> = new Map()
    for (let e = 0; e < system.emitters.length; e++) {
      const particles = system.emitters[e].particles
      for (let p = 0; p < particles.length; p++) {
        const source = particles[p]
        if (!source.alive) continue

        const selection = this.getTextureSelection(source)
        const bucket = this.buckets.get(selection.bucketKey)!
        const writeIndex = writeIndexByBucket.get(selection.bucketKey) ?? 0
        const entry = bucket.pool[writeIndex]

        const baseScale = source.size / 8
        entry.particle.x = source.position.x
        entry.particle.y = source.position.y
        entry.particle.scaleX = baseScale * source.currentScaleX
        entry.particle.scaleY = baseScale
        entry.particle.rotation = source.rotation
        entry.particle.alpha = source.opacity
        entry.particle.tint = source.color
        entry.active = true

        writeIndexByBucket.set(selection.bucketKey, writeIndex + 1)
      }
    }

    for (const [bucketKey, bucket] of this.buckets) {
      bucket.activeCount = writeIndexByBucket.get(bucketKey) ?? 0
    }
  }

  clear(): void {
    for (const bucket of this.buckets.values()) {
      this.hideRange(bucket, 0)
      bucket.activeCount = 0
    }
  }

  destroy(): void {
    for (const bucket of this.buckets.values()) {
      bucket.container.destroy({ children: true })
    }
    this.buckets.clear()
    this.textureKeyByTexture.clear()
  }
}
