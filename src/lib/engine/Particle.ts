import { Vector2 } from './physics/Vector2'

export class Particle {
  position: Vector2 = new Vector2()
  velocity: Vector2 = new Vector2()
  size: number = 4
  rotation: number = 0
  rotationSpeed: number = 0
  opacity: number = 1
  color: number = 0xffffff

  skewX: number = 0
  scaleXOscillation: number = 0
  scaleXPhase: number = 0
  scaleXSpeed: number = 0

  age: number = 0
  lifetime: number = 10
  alive: boolean = false

  textureId?: string

  reset(
    x: number,
    y: number,
    vx: number,
    vy: number,
    size: number,
    rotation: number,
    opacity: number,
    lifetime: number,
    color: number,
    textureId?: string,
  ): void {
    this.position.set(x, y)
    this.velocity.set(vx, vy)
    this.size = size
    this.rotation = rotation
    this.rotationSpeed = (Math.random() - 0.5) * 2
    this.opacity = opacity
    this.lifetime = lifetime
    this.color = color
    this.age = 0
    this.alive = true
    this.textureId = textureId

    this.skewX = 0
    this.scaleXOscillation = 0.3 + Math.random() * 0.5
    this.scaleXPhase = Math.random() * Math.PI * 2
    this.scaleXSpeed = 1.5 + Math.random() * 2
  }

  update(dt: number): void {
    if (!this.alive) return

    this.age += dt
    if (this.age >= this.lifetime) {
      this.alive = false
      return
    }

    // Avoid temporary vector allocations in hot path
    this.position.x += this.velocity.x * dt
    this.position.y += this.velocity.y * dt

    this.rotation += this.rotationSpeed * dt

    this.scaleXPhase += this.scaleXSpeed * dt
  }

  get currentScaleX(): number {
    return 1 - Math.sin(this.scaleXPhase) * this.scaleXOscillation
  }

  get lifeRatio(): number {
    return Math.min(this.age / this.lifetime, 1)
  }
}
