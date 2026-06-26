import { Bounds, type Vec2 } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig } from '../shape'

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

  containsPoint(p: Vec2): boolean {
    return p.x * p.x + p.y * p.y <= this._radius * this._radius
  }
}
