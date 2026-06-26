import { Bounds, type Vec2 } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig, type ShapeHitKind, type ShapeHitOptions } from '../shape'

export interface CircleConfig extends ShapeConfig {
  radius?: number
}

/** Circle centered on the node's local origin `(0,0)`. */
export class Circle extends Shape {
  readonly type = 'Circle'
  private _radius: number

  constructor(config: CircleConfig = {}) {
    super(config)
    this._radius = config.radius ?? 0
  }

  get radius(): number {
    return this._radius
  }
  set radius(v: number) {
    if (v !== this._radius) {
      this._radius = v
      this.markDirty()
    }
  }

  override getLocalBounds(): Bounds {
    const r = this._radius
    return Bounds.fromRect(-r, -r, r * 2, r * 2)
  }

  drawOps(): DrawOp[] {
    return [
      {
        type: 'ellipse',
        x: 0,
        y: 0,
        radiusX: this._radius,
        radiusY: this._radius,
        ...this.fillStrokeStyle,
      },
    ]
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    const r = this._radius
    const dist = Math.hypot(p.x, p.y)
    if ((options?.fill ?? true) && dist <= r) return 'fill'
    if (options?.stroke ?? true) {
      const band = (options?.tolerance ?? 0) + (this.stroke !== null ? this.strokeWidth / 2 : 0)
      if (Math.abs(dist - r) <= band) return 'stroke'
    }
    return null
  }
}
