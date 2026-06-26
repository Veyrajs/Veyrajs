import type { Matrix } from './matrix'
import type { Vec2 } from './vec2'

/**
 * An axis-aligned bounding box (AABB) in some coordinate space.
 *
 * Immutable; all methods return new `Bounds`. An "empty" box has non-positive area and
 * is the identity element for {@link union}.
 */
export class Bounds {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  /** An empty box that contributes nothing to a union. */
  static empty(): Bounds {
    return EMPTY
  }

  static fromRect(x: number, y: number, width: number, height: number): Bounds {
    return new Bounds(x, y, width, height)
  }

  /** Tightest AABB containing all the given points. Empty if no points. */
  static fromPoints(points: readonly Vec2[]): Bounds {
    if (points.length === 0) return EMPTY
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY
    for (const p of points) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
    return new Bounds(minX, minY, maxX - minX, maxY - minY)
  }

  get right(): number {
    return this.x + this.width
  }

  get bottom(): number {
    return this.y + this.height
  }

  get isEmpty(): boolean {
    // Only the sentinel (negative extent) is empty. A degenerate-but-real box — e.g. a
    // horizontal line with height 0 — still has position/extent and participates normally.
    return this.width < 0 || this.height < 0
  }

  /** The four corners, clockwise from top-left. */
  corners(): [Vec2, Vec2, Vec2, Vec2] {
    return [
      { x: this.x, y: this.y },
      { x: this.right, y: this.y },
      { x: this.right, y: this.bottom },
      { x: this.x, y: this.bottom },
    ]
  }

  contains(p: Vec2): boolean {
    return p.x >= this.x && p.x <= this.right && p.y >= this.y && p.y <= this.bottom
  }

  intersects(o: Bounds): boolean {
    return !(o.x > this.right || o.right < this.x || o.y > this.bottom || o.bottom < this.y)
  }

  /** Smallest box containing both. An empty operand is ignored. */
  union(o: Bounds): Bounds {
    if (this.isEmpty) return o
    if (o.isEmpty) return this
    const minX = Math.min(this.x, o.x)
    const minY = Math.min(this.y, o.y)
    const maxX = Math.max(this.right, o.right)
    const maxY = Math.max(this.bottom, o.bottom)
    return new Bounds(minX, minY, maxX - minX, maxY - minY)
  }

  /** Grow the box by `amount` on every side (negative shrinks it). */
  expand(amount: number): Bounds {
    if (this.isEmpty) return this
    return new Bounds(
      this.x - amount,
      this.y - amount,
      this.width + amount * 2,
      this.height + amount * 2,
    )
  }

  /** AABB of this box after transforming its corners by `m`. */
  transform(m: Matrix): Bounds {
    if (this.isEmpty) return EMPTY
    return Bounds.fromPoints(this.corners().map((c) => m.applyToPoint(c)))
  }
}

const EMPTY = new Bounds(0, 0, -1, -1)
