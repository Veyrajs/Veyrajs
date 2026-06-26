import { Bounds, type Vec2 } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig } from '../shape'

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

  containsPoint(p: Vec2): boolean {
    return p.x >= 0 && p.y >= 0 && p.x <= this._width && p.y <= this._height
  }
}
