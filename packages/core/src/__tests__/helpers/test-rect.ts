import { Bounds, type Vec2 } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig } from '../../scene/shape'

export interface TestRectConfig extends ShapeConfig {
  width?: number
  height?: number
}

/**
 * Minimal concrete `Shape` used by Phase 2 tests to exercise the scene graph, transforms
 * and render lifecycle. Real concrete shapes arrive in Phase 3.
 */
export class TestRect extends Shape {
  readonly type = 'TestRect'
  width: number
  height: number

  constructor(config: TestRectConfig = {}) {
    super(config)
    this.width = config.width ?? 0
    this.height = config.height ?? 0
  }

  override getLocalBounds(): Bounds {
    return Bounds.fromRect(0, 0, this.width, this.height)
  }

  drawOps(): DrawOp[] {
    return [
      { type: 'rect', x: 0, y: 0, width: this.width, height: this.height, ...this.fillStrokeStyle },
    ]
  }

  containsPoint(p: Vec2): boolean {
    return p.x >= 0 && p.y >= 0 && p.x <= this.width && p.y <= this.height
  }
}
