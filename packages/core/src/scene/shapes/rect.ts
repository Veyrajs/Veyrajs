import { Bounds, type Vec2, distanceToPolyline, rectCorners } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig, type ShapeHitKind, type ShapeHitOptions } from '../shape'

export interface RectConfig extends ShapeConfig {
  width?: number
  height?: number
}

/** Rectangle with a top-left local origin: geometry spans `(0,0)` to `(width,height)`. */
export class Rect extends Shape {
  readonly type = 'Rect'
  private _width: number
  private _height: number

  constructor(config: RectConfig = {}) {
    super(config)
    this._width = config.width ?? 0
    this._height = config.height ?? 0
  }

  get width(): number {
    return this._width
  }
  set width(v: number) {
    if (v !== this._width) {
      this._width = v
      this.markDirty()
    }
  }

  get height(): number {
    return this._height
  }
  set height(v: number) {
    if (v !== this._height) {
      this._height = v
      this.markDirty()
    }
  }

  override getLocalBounds(): Bounds {
    return Bounds.fromRect(0, 0, this._width, this._height)
  }

  protected override serializedExtras(): Record<string, unknown> {
    return { ...super.serializedExtras(), width: this._width, height: this._height }
  }

  drawOps(): DrawOp[] {
    return [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: this._width,
        height: this._height,
        ...this.fillStrokeStyle,
      },
    ]
  }

  override getVertices(): Vec2[] {
    return rectCorners(this._width, this._height)
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    if (
      (options?.fill ?? true) &&
      p.x >= 0 &&
      p.y >= 0 &&
      p.x <= this._width &&
      p.y <= this._height
    ) {
      return 'fill'
    }
    if (options?.stroke ?? true) {
      const band = (options?.tolerance ?? 0) + (this.stroke !== null ? this.strokeWidth / 2 : 0)
      if (distanceToPolyline(p, rectCorners(this._width, this._height), true) <= band)
        return 'stroke'
    }
    return null
  }
}
