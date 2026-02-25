import { Vector2 } from './physics/Vector2'

export class Particle {
  position: Vector2 = new Vector2()
  velocity: Vector2 = new Vector2()
  size: number = 4
  rotation: number = 0
  opacity: number = 1
  color: number = 0xffffff

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
    this.opacity = opacity
    this.lifetime = lifetime
    this.color = color
    this.age = 0
    this.alive = true
    this.textureId = textureId
  }

  update(dt: number): void {
    if (!this.alive) return

    this.age += dt
    if (this.age >= this.lifetime) {
      this.alive = false
      return
    }

    this.position.addMut(this.velocity.scale(dt))
  }

  get lifeRatio(): number {
    return Math.min(this.age / this.lifetime, 1)
  }
}
