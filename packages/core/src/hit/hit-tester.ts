import type { Vec2 } from '../math'
import type { Node } from '../scene/node'

export type HitType = 'fill' | 'stroke' | 'bounds' | 'vertex'

export interface HitTestOptions {
  /** Extra grab radius in SCREEN pixels (zoom-invariant). Default 0. */
  tolerance?: number
  /** Test filled interiors. Default true. */
  fill?: boolean
  /** Test near strokes/outlines. Default true. */
  stroke?: boolean
  /** Also test bounding boxes (yields `'bounds'` hits). Default false. */
  bounds?: boolean
  /** Also test shape vertices/corners (yields `'vertex'` hits). Default false. */
  vertices?: boolean
  /** Descend into containers. Default true. */
  deep?: boolean
  /** Accept only nodes for which this predicate returns true. */
  match?: (node: Node) => boolean
}

export interface HitResult {
  node: Node
  type: HitType
  worldPoint: Vec2
  localPoint: Vec2
  /** Index into `getVertices()` for `'vertex'` hits. */
  vertexIndex?: number
}

/**
 * Pluggable hit-testing strategy. The default is {@link GeometricHitTester}; future
 * strategies (spatial-index/quadtree, color-buffer, pixel-perfect) implement the same
 * interface and can be swapped in per stage.
 *
 * `pixelSize` is world units per screen pixel (`= 1 / camera.zoom`); the tester uses it to
 * convert the screen-pixel `tolerance` into world/local units — i.e. a zoom-invariant
 * grab radius.
 */
export interface HitTester {
  hitTest(
    root: Node,
    worldPoint: Vec2,
    pixelSize: number,
    options?: HitTestOptions,
  ): HitResult | null
}
