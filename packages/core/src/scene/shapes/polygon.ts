import { Bounds, type Vec2, distanceToPolyline, pointInPolygon } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig, type ShapeHitKind, type ShapeHitOptions } from '../shape'

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

  protected override serializedExtras(): Record<string, unknown> {
    return { ...super.serializedExtras(), points: this._points.map((p) => ({ x: p.x, y: p.y })) }
  }

  drawOps(): DrawOp[] {
    return [{ type: 'polygon', points: this._points, closed: true, ...this.fillStrokeStyle }]
  }

  override getVertices(): readonly Vec2[] {
    return this._points
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    if ((options?.fill ?? true) && pointInPolygon(p, this._points)) return 'fill'
    if (options?.stroke ?? true) {
      const band = (options?.tolerance ?? 0) + (this.stroke !== null ? this.strokeWidth / 2 : 0)
      if (distanceToPolyline(p, this._points, true) <= band) return 'stroke'
    }
    return null
  }
}
