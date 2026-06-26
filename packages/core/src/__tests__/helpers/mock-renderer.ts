import type { Matrix } from '../../math'
import type { FrameInfo, Renderable, Renderer } from '../../render/renderer'

export interface RenderCall {
  node: Renderable
  world: Matrix
}

/** A `Renderer` that records lifecycle calls for assertions instead of drawing. */
export class MockRenderer implements Renderer {
  beginCount = 0
  endCount = 0
  destroyed = false
  size: { width: number; height: number; pixelRatio: number } | null = null
  frames: FrameInfo[] = []
  /** Render calls from the most recent frame, in traversal order. */
  calls: RenderCall[] = []

  /** Convenience: nodes drawn in the most recent frame, in order. */
  get rendered(): Renderable[] {
    return this.calls.map((c) => c.node)
  }

  setSize(width: number, height: number, pixelRatio: number): void {
    this.size = { width, height, pixelRatio }
  }

  begin(frame: FrameInfo): void {
    this.beginCount += 1
    this.frames.push(frame)
    this.calls = []
  }

  renderNode(node: Renderable, world: Matrix): void {
    this.calls.push({ node, world })
  }

  end(): void {
    this.endCount += 1
  }

  destroy(): void {
    this.destroyed = true
  }
}
