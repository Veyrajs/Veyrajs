import { Bounds, type Vec2, distanceToPolyline, pointInPolygon } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig } from '../shape'

export interface PolygonConfig extends ShapeConfig {
  points?: Vec2[]
}

/** Closed, fillable polygon through a list of local-space points. */
export class Polygon extends Shape {
  readonly type = 'Polygon'
  private _points: Vec2[]

  constructor(config: PolygonConfig = {}) {
    super(config)
    this._points = (config.points ?? []).map((p) => ({ x: p.x, y: p.y }))
  }

  get points(): readonly Vec2[] {
    return this._points
  }
  set points(v: readonly Vec2[]) {
    this._points = v.map((p) => ({ x: p.x, y: p.y }))
    this.markDirty()
  }

  override getLocalBounds(): Bounds {
    return Bounds.fromPoints(this._points)
  }

  drawOps(): DrawOp[] {
    return [{ type: 'polygon', points: this._points, closed: true, ...this.fillStrokeStyle }]
  }

  containsPoint(p: Vec2): boolean {
    if (this.fill != null && pointInPolygon(p, this._points)) return true
    return distanceToPolyline(p, this._points, true) <= Math.max(this.strokeWidth / 2, 2)
  }
}
