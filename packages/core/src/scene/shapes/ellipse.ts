import { Bounds, type Vec2 } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig } from '../shape'

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

  containsPoint(p: Vec2): boolean {
    const { _radiusX: rx, _radiusY: ry } = this
    if (rx <= 0 || ry <= 0) return false
    const nx = p.x / rx
    const ny = p.y / ry
    return nx * nx + ny * ny <= 1
  }
}
