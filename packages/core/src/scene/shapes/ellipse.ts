import { Bounds, type Vec2 } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig, type ShapeHitKind, type ShapeHitOptions } from '../shape'

export interface EllipseConfig extends ShapeConfig {
  radiusX?: number
  radiusY?: number
}

/** Ellipse centered on the node's local origin `(0,0)`. */
export class Ellipse extends Shape {
  readonly type = 'Ellipse'
  private _radiusX: number
  private _radiusY: number

  constructor(config: EllipseConfig = {}) {
    super(config)
    this._radiusX = config.radiusX ?? 0
    this._radiusY = config.radiusY ?? 0
  }

  get radiusX(): number {
    return this._radiusX
  }
  set radiusX(v: number) {
    if (v !== this._radiusX) {
      this._radiusX = v
      this.markDirty()
    }
  }

  get radiusY(): number {
    return this._radiusY
  }
  set radiusY(v: number) {
    if (v !== this._radiusY) {
      this._radiusY = v
      this.markDirty()
    }
  }

  override getLocalBounds(): Bounds {
    return Bounds.fromRect(-this._radiusX, -this._radiusY, this._radiusX * 2, this._radiusY * 2)
  }

  protected override serializedExtras(): Record<string, unknown> {
    return { ...super.serializedExtras(), radiusX: this._radiusX, radiusY: this._radiusY }
  }

  drawOps(): DrawOp[] {
    return [
      {
        type: 'ellipse',
        x: 0,
        y: 0,
        radiusX: this._radiusX,
        radiusY: this._radiusY,
        ...this.fillStrokeStyle,
      },
    ]
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    const { _radiusX: rx, _radiusY: ry } = this
    if (rx <= 0 || ry <= 0) return null
    if ((options?.fill ?? true) && (p.x / rx) ** 2 + (p.y / ry) ** 2 <= 1) return 'fill'
    if (options?.stroke ?? true) {
      const band = (options?.tolerance ?? 0) + (this.stroke !== null ? this.strokeWidth / 2 : 0)
      const outer = (p.x / (rx + band)) ** 2 + (p.y / (ry + band)) ** 2
      const inner = (p.x / Math.max(rx - band, 1e-6)) ** 2 + (p.y / Math.max(ry - band, 1e-6)) ** 2
      if (outer <= 1 && inner >= 1) return 'stroke'
    }
    return null
  }
}
