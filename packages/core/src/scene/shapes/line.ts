import { Bounds, type Vec2, distanceToPolyline } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig, type ShapeHitKind, type ShapeHitOptions } from '../shape'

export interface LineConfig extends ShapeConfig {
  points?: Vec2[]
  /** Close the path back to the first point. Default `false` (open polyline). */
  closed?: boolean
}

/** Open polyline (or closed outline) through a list of local-space points. */
export class Line extends Shape {
  readonly type = 'Line'
  private _points: Vec2[]
  private _closed: boolean

  constructor(config: LineConfig = {}) {
    super(config)
    this._points = (config.points ?? []).map((p) => ({ x: p.x, y: p.y }))
    this._closed = config.closed ?? false
  }

  get points(): readonly Vec2[] {
    return this._points
  }
  set points(v: readonly Vec2[]) {
    this._points = v.map((p) => ({ x: p.x, y: p.y }))
    this.markDirty()
  }

  get closed(): boolean {
    return this._closed
  }
  set closed(v: boolean) {
    if (v !== this._closed) {
      this._closed = v
      this.markDirty()
    }
  }

  override getLocalBounds(): Bounds {
    return Bounds.fromPoints(this._points)
  }

  drawOps(): DrawOp[] {
    return [
      { type: 'polygon', points: this._points, closed: this._closed, ...this.fillStrokeStyle },
    ]
  }

  override getVertices(): readonly Vec2[] {
    return this._points
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    if (!(options?.stroke ?? true)) return null
    const band = (options?.tolerance ?? 0) + this.strokeWidth / 2
    return distanceToPolyline(p, this._points, this._closed) <= band ? 'stroke' : null
  }
}
