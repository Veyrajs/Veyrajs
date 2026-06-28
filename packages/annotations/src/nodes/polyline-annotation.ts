import { Bounds, distanceToPolyline } from '@veyrajs/core'
import type { DrawOp, ShapeHitKind, ShapeHitOptions, Vec2 } from '@veyrajs/core'
import { type AnnotationConfig, AnnotationNode } from './annotation-node'

export interface PolylineAnnotationConfig extends AnnotationConfig {
  points?: Vec2[]
}

/**
 * An open polyline annotation with editable vertices. Like {@link PolygonAnnotation} but not
 * closed and stroke-only (no interior fill); hit-testing is along the line.
 */
export class PolylineAnnotation extends AnnotationNode {
  readonly type = 'PolylineAnnotation'
  private _points: Vec2[]

  constructor(config: PolylineAnnotationConfig = {}) {
    super({ stroke: '#2563eb', strokeWidth: 2, ...config })
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
    return [
      { type: 'polygon', points: this._points, closed: false, ...this.fillStrokeStyle },
      ...this.labelOps(this._points[0] ?? { x: 0, y: 0 }),
    ]
  }

  override getVertices(): readonly Vec2[] {
    return this._points
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    if (!(options?.stroke ?? true)) return null
    const band = (options?.tolerance ?? 0) + this.strokeWidth / 2
    return distanceToPolyline(p, this._points, false) <= band ? 'stroke' : null
  }

  protected override serializedExtras(): Record<string, unknown> {
    return { ...super.serializedExtras(), points: this._points.map((p) => ({ x: p.x, y: p.y })) }
  }
}
