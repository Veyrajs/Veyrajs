import type { Matrix } from '../math'
import type { DrawOp } from './draw-ops'

export interface FrameInfo {
  width: number
  height: number
  pixelRatio: number
}

/** What a renderer needs from a node in order to draw it. Implemented by `Shape`. */
export interface Renderable {
  readonly opacity: number
  drawOps(): DrawOp[]
}

/**
 * Backend-neutral rendering contract.
 *
 * The Canvas 2D implementation ships first; a WebGL/WebGPU/OffscreenCanvas backend can
 * implement this same interface with no change to the scene graph, because nodes emit
 * backend-neutral {@link DrawOp}s rather than raw canvas calls.
 */
export interface Renderer {
  /** The DOM canvas, when the backend is canvas-based (used for sizing/DOM wiring). */
  readonly canvas?: HTMLCanvasElement
  setSize(width: number, height: number, pixelRatio: number): void
  begin(frame: FrameInfo): void
  renderNode(node: Renderable, worldMatrix: Matrix): void
  end(): void
  destroy(): void
}
