import type { Vec2 } from '../math'
import { Container } from '../scene/container'
import type { Node } from '../scene/node'
import { Shape } from '../scene/shape'
import type { HitResult, HitTestOptions, HitTester } from './hit-tester'

/**
 * The default hit tester: a top-down (reverse z-order) walk with a world-AABB broad-phase
 * filter, then a precise per-shape test. Tolerance is zoom-aware — a screen-pixel radius is
 * converted into each shape's local units via the camera `pixelSize` and the node's scale.
 */
export class GeometricHitTester implements HitTester {
  hitTest(
    root: Node,
    worldPoint: Vec2,
    pixelSize: number,
    options: HitTestOptions = {},
  ): HitResult | null {
    return this.walk(root, worldPoint, pixelSize, options)
  }

  private walk(
    node: Node,
    worldPoint: Vec2,
    pixelSize: number,
    options: HitTestOptions,
  ): HitResult | null {
    if (!node.visible || !node.listening) return null

    if (node instanceof Container && (options.deep ?? true)) {
      const children = node.children
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]
        if (child === undefined) continue
        const hit = this.walk(child, worldPoint, pixelSize, options)
        if (hit !== null) return hit
      }
    }

    if (node instanceof Shape) {
      return this.testShape(node, worldPoint, pixelSize, options)
    }
    return null
  }

  private testShape(
    shape: Shape,
    worldPoint: Vec2,
    pixelSize: number,
    options: HitTestOptions,
  ): HitResult | null {
    const worldTolerance = (options.tolerance ?? 0) * pixelSize

    // Broad phase: skip the shape if its (expanded) world AABB misses the point.
    if (!shape.getWorldBounds().expand(worldTolerance).contains(worldPoint)) return null

    const world = shape.worldMatrix()
    const scale = Math.sqrt(Math.abs(world.determinant())) || 1
    const localTolerance = worldTolerance / scale
    const local = world.invert().applyToPoint(worldPoint)
    const match = options.match
    const accepts = (node: Node): boolean => match === undefined || match(node)

    if (options.vertices) {
      const vertices = shape.getVertices()
      if (vertices !== null) {
        for (let i = 0; i < vertices.length; i++) {
          const v = vertices[i]
          if (v === undefined) continue
          if (Math.hypot(local.x - v.x, local.y - v.y) <= localTolerance && accepts(shape)) {
            return { node: shape, type: 'vertex', vertexIndex: i, worldPoint, localPoint: local }
          }
        }
      }
    }

    const kind = shape.hitTest(local, {
      tolerance: localTolerance,
      fill: options.fill ?? true,
      stroke: options.stroke ?? true,
    })
    if (kind !== null && accepts(shape)) {
      return { node: shape, type: kind, worldPoint, localPoint: local }
    }

    if (
      options.bounds &&
      shape.getLocalBounds().expand(localTolerance).contains(local) &&
      accepts(shape)
    ) {
      return { node: shape, type: 'bounds', worldPoint, localPoint: local }
    }

    return null
  }
}
