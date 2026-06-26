import type { Bounds, Vec2 } from '../math'
import type { DrawOp, FillStrokeStyle } from '../render/draw-ops'
import type { Renderable } from '../render/renderer'
import { Node, type NodeConfig } from './node'

export interface ShapeConfig extends NodeConfig {
  fill?: string | null
  stroke?: string | null
  strokeWidth?: number
  lineDash?: readonly number[] | null
  lineCap?: CanvasLineCap
  lineJoin?: CanvasLineJoin
}

/** Which part of a shape a hit landed on. */
export type ShapeHitKind = 'fill' | 'stroke'

export interface ShapeHitOptions {
  /** Extra hit radius in local units, additive to the natural geometry (e.g. stroke width). */
  tolerance?: number
  /** Test the filled interior. Default true. */
  fill?: boolean
  /** Test near the stroke/outline. Default true. */
  stroke?: boolean
}

/**
 * Base class for drawable leaf nodes. A shape describes itself as backend-neutral
 * {@link DrawOp}s and answers point queries via {@link containsPoint}; it never touches a
 * rendering context directly. Concrete shapes (Rect, Ellipse, Line, ...) arrive in
 * Phase 3.
 */
export abstract class Shape extends Node implements Renderable {
  private _fill: string | null
  private _stroke: string | null
  private _strokeWidth: number
  private _lineDash: readonly number[] | null
  private _lineCap: CanvasLineCap
  private _lineJoin: CanvasLineJoin

  constructor(config: ShapeConfig = {}) {
    super(config)
    this._fill = config.fill ?? null
    this._stroke = config.stroke ?? null
    this._strokeWidth = config.strokeWidth ?? 1
    this._lineDash = config.lineDash ?? null
    this._lineCap = config.lineCap ?? 'butt'
    this._lineJoin = config.lineJoin ?? 'miter'
  }

  get fill(): string | null {
    return this._fill
  }
  set fill(v: string | null) {
    if (v !== this._fill) {
      this._fill = v
      this.markDirty()
    }
  }

  get stroke(): string | null {
    return this._stroke
  }
  set stroke(v: string | null) {
    if (v !== this._stroke) {
      this._stroke = v
      this.markDirty()
    }
  }

  get strokeWidth(): number {
    return this._strokeWidth
  }
  set strokeWidth(v: number) {
    if (v !== this._strokeWidth) {
      this._strokeWidth = v
      this.markDirty()
    }
  }

  get lineDash(): readonly number[] | null {
    return this._lineDash
  }
  set lineDash(v: readonly number[] | null) {
    this._lineDash = v
    this.markDirty()
  }

  get lineCap(): CanvasLineCap {
    return this._lineCap
  }
  set lineCap(v: CanvasLineCap) {
    this._lineCap = v
    this.markDirty()
  }

  get lineJoin(): CanvasLineJoin {
    return this._lineJoin
  }
  set lineJoin(v: CanvasLineJoin) {
    this._lineJoin = v
    this.markDirty()
  }

  /** Paint properties spread into the DrawOps produced by subclasses. */
  protected get fillStrokeStyle(): FillStrokeStyle {
    return {
      fill: this._fill,
      stroke: this._stroke,
      strokeWidth: this._strokeWidth,
      lineDash: this._lineDash,
      lineCap: this._lineCap,
      lineJoin: this._lineJoin,
    }
  }

  abstract override getLocalBounds(): Bounds
  abstract drawOps(): DrawOp[]

  /**
   * Local-space hit test. Returns which part was hit (`'fill'` or `'stroke'`) or `null`.
   * `tolerance` is in local units and is additive to the natural geometry (e.g. stroke width).
   */
  abstract hitTest(localPoint: Vec2, options?: ShapeHitOptions): ShapeHitKind | null

  /** Convenience boolean hit test (fill or stroke) with an optional local tolerance. */
  containsPoint(localPoint: Vec2, tolerance = 0): boolean {
    return this.hitTest(localPoint, { tolerance }) !== null
  }

  /** Local-space vertices for vertex hit-testing (corners/points), or `null` if none. */
  getVertices(): readonly Vec2[] | null {
    return null
  }
}
