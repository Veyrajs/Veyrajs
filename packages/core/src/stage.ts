export interface StageOptions {
  /** Host element the stage canvas is appended to. */
  container: HTMLElement
  /** Logical (CSS-pixel) width. */
  width?: number
  /** Logical (CSS-pixel) height. */
  height?: number
  /** Device pixel ratio override. Defaults to `window.devicePixelRatio` (or 1). */
  pixelRatio?: number
  /** Background fill used when clearing the canvas. */
  background?: string
}

/**
 * Phase 1 placeholder `Stage`.
 *
 * Owns the host element and a single `<canvas>`, and handles DPR-correct sizing and
 * clearing. This is the minimal, architecturally-aligned seed that proves canvas
 * mounting and high-DPI sizing.
 *
 * The real engine — logical `Layer`s, the retained scene graph, the `Renderer`
 * abstraction (Canvas 2D first, WebGL/WebGPU reserved), camera/coordinate systems,
 * events, hit-testing, controls, serialization, and the command/undo layer — is built
 * in later phases and will expand this class. Nothing here assumes Canvas 2D on the
 * public surface beyond what a placeholder needs.
 */
export class Stage {
  readonly container: HTMLElement
  readonly canvas: HTMLCanvasElement

  private readonly ctx: CanvasRenderingContext2D | null
  private _width: number
  private _height: number
  private _pixelRatio: number
  private _background: string

  constructor(options: StageOptions) {
    this.container = options.container
    this._width = options.width ?? 0
    this._height = options.height ?? 0
    this._pixelRatio = options.pixelRatio ?? resolveDevicePixelRatio()
    this._background = options.background ?? '#f4f4f5'

    this.canvas = document.createElement('canvas')
    this.canvas.style.display = 'block'
    this.container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')

    this.setSize(this._width, this._height)
  }

  get width(): number {
    return this._width
  }

  get height(): number {
    return this._height
  }

  get pixelRatio(): number {
    return this._pixelRatio
  }

  /** Resize the stage in logical (CSS) pixels, keeping the backing store DPR-correct. */
  setSize(width: number, height: number): this {
    this._width = width
    this._height = height

    const dpr = this._pixelRatio
    this.canvas.width = Math.max(0, Math.round(width * dpr))
    this.canvas.height = Math.max(0, Math.round(height * dpr))
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`

    this.render()
    return this
  }

  /**
   * Phase 1: clears the canvas to the background color in logical-pixel space.
   * The real render pipeline (renderer walks the scene graph) arrives in Phase 3.
   */
  render(): this {
    const ctx = this.ctx
    if (!ctx) return this

    const dpr = this._pixelRatio
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, this._width, this._height)
    ctx.fillStyle = this._background
    ctx.fillRect(0, 0, this._width, this._height)
    return this
  }

  /** Remove the canvas from the DOM. */
  destroy(): void {
    this.canvas.parentElement?.removeChild(this.canvas)
  }
}

function resolveDevicePixelRatio(): number {
  if (typeof window !== 'undefined' && typeof window.devicePixelRatio === 'number') {
    return window.devicePixelRatio || 1
  }
  return 1
}
