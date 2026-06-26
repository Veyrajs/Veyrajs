import type { FrameInfo, Matrix, Renderable, Renderer } from '@annotacanvas/core'

/**
 * A `Renderer` that does the engine-side per-node work a real backend does — it pulls each
 * node's `drawOps()` — but performs NO rasterization. This lets the render-walk benchmark
 * isolate scene-graph traversal + world-matrix composition + draw-op allocation from the
 * canvas/GPU rasterization cost.
 */
export class CountingRenderer implements Renderer {
  nodeCount = 0
  opCount = 0

  setSize(): void {}

  begin(_frame: FrameInfo): void {
    this.nodeCount = 0
    this.opCount = 0
  }

  renderNode(node: Renderable, _world: Matrix): void {
    this.nodeCount += 1
    this.opCount += node.drawOps().length
  }

  end(): void {}

  destroy(): void {}
}
