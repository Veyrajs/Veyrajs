import { Matrix, type Vec2 } from '../math'

export interface CameraOptions {
  /** Initial zoom (scale). Default 1. */
  zoom?: number
  /** Initial pan offset x in screen pixels (where world origin maps). Default 0. */
  x?: number
  /** Initial pan offset y. Default 0. */
  y?: number
  minZoom?: number
  maxZoom?: number
}

/**
 * The viewport's view onto the world: a pan (`x`, `y` in screen pixels) and a uniform
 * `zoom`. Produces the world→screen view matrix `[zoom, 0, 0, zoom, x, y]` and its inverse.
 *
 * The camera is applied by the `Stage` at render time (`screen = view · world`); it never
 * changes nodes' world coordinates. Rotation is reserved (the matrix supports it) but not
 * exposed in the MVP.
 */
export class Camera {
  private _zoom: number
  private _x: number
  private _y: number
  private readonly _minZoom: number
  private readonly _maxZoom: number
  private _viewMatrix: Matrix | null = null

  /** Invoked whenever the camera changes. The `Stage` wires this to `requestRender`. */
  onChange: (() => void) | null = null

  constructor(options: CameraOptions = {}) {
    this._minZoom = options.minZoom ?? 0.02
    this._maxZoom = options.maxZoom ?? 64
    this._zoom = clamp(options.zoom ?? 1, this._minZoom, this._maxZoom)
    this._x = options.x ?? 0
    this._y = options.y ?? 0
  }

  get zoom(): number {
    return this._zoom
  }
  set zoom(v: number) {
    this.setZoom(v)
  }

  get x(): number {
    return this._x
  }

  get y(): number {
    return this._y
  }

  get minZoom(): number {
    return this._minZoom
  }

  get maxZoom(): number {
    return this._maxZoom
  }

  /** World → screen (pre-DPR) transform. Cached until the camera changes. */
  viewMatrix(): Matrix {
    if (this._viewMatrix === null) {
      this._viewMatrix = new Matrix(this._zoom, 0, 0, this._zoom, this._x, this._y)
    }
    return this._viewMatrix
  }

  worldToScreen(point: Vec2): Vec2 {
    return this.viewMatrix().applyToPoint(point)
  }

  screenToWorld(point: Vec2): Vec2 {
    return this.viewMatrix().invert().applyToPoint(point)
  }

  setZoom(zoom: number): this {
    const z = clamp(zoom, this._minZoom, this._maxZoom)
    if (z !== this._zoom) {
      this._zoom = z
      this.invalidate()
    }
    return this
  }

  /** Pan by a delta in screen pixels. */
  panBy(dx: number, dy: number): this {
    if (dx !== 0 || dy !== 0) {
      this._x += dx
      this._y += dy
      this.invalidate()
    }
    return this
  }

  /** Set the pan offset directly (screen pixels). */
  panTo(x: number, y: number): this {
    if (x !== this._x || y !== this._y) {
      this._x = x
      this._y = y
      this.invalidate()
    }
    return this
  }

  /**
   * Zoom by `factor` about a screen anchor, keeping the world point under the anchor fixed
   * (cursor-anchored zoom). No-op if the zoom is already clamped at the limit.
   */
  zoomAt(anchor: Vec2, factor: number): this {
    const newZoom = clamp(this._zoom * factor, this._minZoom, this._maxZoom)
    if (newZoom === this._zoom) return this
    const worldX = (anchor.x - this._x) / this._zoom
    const worldY = (anchor.y - this._y) / this._zoom
    this._zoom = newZoom
    this._x = anchor.x - newZoom * worldX
    this._y = anchor.y - newZoom * worldY
    this.invalidate()
    return this
  }

  /** Reset to identity (zoom 1, no pan). */
  reset(): this {
    if (this._zoom !== 1 || this._x !== 0 || this._y !== 0) {
      this._zoom = 1
      this._x = 0
      this._y = 0
      this.invalidate()
    }
    return this
  }

  private invalidate(): void {
    this._viewMatrix = null
    this.onChange?.()
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}
