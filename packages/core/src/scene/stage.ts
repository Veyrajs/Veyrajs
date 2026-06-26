import { EventManager } from '../events/event-manager'
import type { Matrix, Vec2 } from '../math'
import { Canvas2DRenderer } from '../render/canvas2d-renderer'
import type { FrameInfo, Renderer } from '../render/renderer'
import { FrameScheduler } from '../scheduler'
import { Camera, type CameraOptions } from './camera'
import { Container } from './container'
import { Layer } from './layer'
import type { Node } from './node'
import { Shape } from './shape'

export interface StageOptions {
  /** Host element the renderer mounts into. */
  container: HTMLElement
  width?: number
  height?: number
  /** Device pixel ratio override. Defaults to `window.devicePixelRatio`. */
  pixelRatio?: number
  /** Background fill cleared each frame. `null`/undefined = transparent. */
  background?: string | null
  /** Inject a custom renderer (e.g. a mock in tests, or a future WebGL backend). */
  renderer?: Renderer
  /** Initial camera (zoom/pan) configuration. */
  camera?: CameraOptions
}

/**
 * Root of the scene graph and owner of the renderer, the frame scheduler, and the
 * viewport size/DPR. Children must be `Layer`s. Mutations anywhere in the tree schedule
 * a single coalesced render via the scheduler; `render()` performs one synchronously.
 */
export class Stage extends Container {
  readonly type = 'Stage'
  readonly container: HTMLElement
  readonly renderer: Renderer
  readonly camera: Camera

  private _width: number
  private _height: number
  private _pixelRatio: number
  private readonly scheduler: FrameScheduler
  private events: EventManager | null = null

  constructor(options: StageOptions) {
    super()
    this.container = options.container
    this._width = options.width ?? 0
    this._height = options.height ?? 0
    this._pixelRatio = options.pixelRatio ?? resolveDevicePixelRatio()
    this.renderer =
      options.renderer ??
      new Canvas2DRenderer({ container: this.container, background: options.background ?? null })
    this.scheduler = new FrameScheduler(() => this.render())
    this.camera = new Camera(options.camera)
    this.camera.onChange = () => this.requestRender()

    this.renderer.setSize(this._width, this._height, this._pixelRatio)
    this.render()
    this.events = new EventManager(this)
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

  /** The renderer's DOM canvas, if it is canvas-based. */
  get canvas(): HTMLCanvasElement | undefined {
    return this.renderer.canvas
  }

  /** Convert a point in stage/screen pixels to world coordinates (via the camera). */
  screenToWorld(point: Vec2): Vec2 {
    return this.camera.screenToWorld(point)
  }

  /** Convert a world-space point to stage/screen pixels (via the camera). */
  worldToScreen(point: Vec2): Vec2 {
    return this.camera.worldToScreen(point)
  }

  /**
   * Topmost listening shape whose geometry contains the given world point, or `null`.
   * Basic geometric hit test; Phase 6 generalizes this into a pluggable, options-aware
   * hit-testing engine.
   */
  getIntersection(worldPoint: Vec2): Node | null {
    return hitTestSubtree(this, worldPoint)
  }

  override add(...layers: Layer[]): this {
    for (const layer of layers) {
      if (!(layer instanceof Layer)) {
        throw new TypeError('Stage children must be Layer instances; use stage.createLayer()')
      }
    }
    return super.add(...layers)
  }

  /** Create a layer, add it to the stage, and return it. */
  createLayer(config?: ConstructorParameters<typeof Layer>[0]): Layer {
    const layer = new Layer(config)
    this.add(layer)
    return layer
  }

  setSize(width: number, height: number): this {
    this._width = width
    this._height = height
    this.renderer.setSize(width, height, this._pixelRatio)
    this.requestRender()
    return this
  }

  setPixelRatio(pixelRatio: number): this {
    this._pixelRatio = pixelRatio
    this.renderer.setSize(this._width, this._height, pixelRatio)
    this.requestRender()
    return this
  }

  /** Schedule a coalesced render on the next animation frame. */
  requestRender(): this {
    this.scheduler.request()
    return this
  }

  /** Render the scene immediately (synchronous). */
  render(): this {
    const frame: FrameInfo = {
      width: this._width,
      height: this._height,
      pixelRatio: this._pixelRatio,
    }
    this.renderer.begin(frame)
    this.renderSubtree(this, this.camera.viewMatrix())
    this.renderer.end()
    return this
  }

  override destroy(): void {
    this.events?.destroy()
    this.scheduler.cancel()
    this.removeChildren()
    this.renderer.destroy()
  }

  protected override onSubtreeDirty(): void {
    this.requestRender()
  }

  private renderSubtree(node: Node, view: Matrix): void {
    if (!node.visible || node.opacity <= 0) return
    if (node instanceof Shape) {
      this.renderer.renderNode(node, view.multiply(node.worldMatrix()))
    }
    if (node instanceof Container) {
      for (const child of node.children) this.renderSubtree(child, view)
    }
    // Note: group opacity does not yet compound onto descendants (Phase 3 refinement).
  }
}

function resolveDevicePixelRatio(): number {
  if (typeof window !== 'undefined' && typeof window.devicePixelRatio === 'number') {
    return window.devicePixelRatio || 1
  }
  return 1
}

function hitTestSubtree(node: Node, worldPoint: Vec2): Node | null {
  if (!node.visible || !node.listening) return null

  if (node instanceof Container) {
    const children = node.children
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i]
      if (child === undefined) continue
      const hit = hitTestSubtree(child, worldPoint)
      if (hit !== null) return hit
    }
  }

  if (node instanceof Shape) {
    const local = node.worldMatrix().invert().applyToPoint(worldPoint)
    if (node.containsPoint(local)) return node
  }

  return null
}
