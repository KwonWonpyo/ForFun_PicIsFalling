export class Vector2 {
  constructor(
    public x: number = 0,
    public y: number = 0,
  ) {}

  set(x: number, y: number): this {
    this.x = x
    this.y = y
    return this
  }

  copyFrom(v: Vector2): this {
    this.x = v.x
    this.y = v.y
    return this
  }

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y)
  }

  addMut(v: Vector2): this {
    this.x += v.x
    this.y += v.y
    return this
  }

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y)
  }

  scale(s: number): Vector2 {
    return new Vector2(this.x * s, this.y * s)
  }

  scaleMut(s: number): this {
    this.x *= s
    this.y *= s
    return this
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y
  }

  normalize(): Vector2 {
    const len = this.length()
    if (len === 0) return new Vector2()
    return this.scale(1 / len)
  }

  distanceTo(v: Vector2): number {
    return this.sub(v).length()
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y
  }

  angle(): number {
    return Math.atan2(this.y, this.x)
  }

  static fromAngle(angle: number, magnitude: number = 1): Vector2 {
    return new Vector2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude)
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }
}
