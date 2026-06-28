import { type ClassRegistry, createDefaultRegistry } from '@veyrajs/core'
import type { Node, NodeFactory } from '@veyrajs/core'
import { BoundingBox } from '../nodes/bounding-box'
import { Cuboid } from '../nodes/cuboid'
import { PointAnnotation } from '../nodes/point-annotation'
import { PolygonAnnotation } from '../nodes/polygon-annotation'
import { PolylineAnnotation } from '../nodes/polyline-annotation'
import { Skeleton } from '../nodes/skeleton'

// Serialized data mirrors the constructor config (toObject is the inverse of the constructor),
// so each factory just constructs from it; the cast bridges the `unknown`-valued index type.
// `config: C` (not optional) so node types whose config is required — e.g. Skeleton needs a
// schema — are accepted alongside those with a default config.
function factoryFor<C>(Ctor: new (config: C) => Node): NodeFactory {
  return (data) => new Ctor(data as unknown as C)
}

/**
 * Register every annotation node type on a registry so scenes containing annotations round-trip
 * through `SceneSerializer`. Pass your own registry (e.g. one that already has custom types), or
 * omit it to start from the core defaults.
 *
 * ```ts
 * const serializer = new SceneSerializer({ registry: registerAnnotations() })
 * ```
 */
export function registerAnnotations(
  registry: ClassRegistry = createDefaultRegistry(),
): ClassRegistry {
  return registry
    .register('BoundingBox', factoryFor(BoundingBox))
    .register('PolygonAnnotation', factoryFor(PolygonAnnotation))
    .register('PolylineAnnotation', factoryFor(PolylineAnnotation))
    .register('PointAnnotation', factoryFor(PointAnnotation))
    .register('Skeleton', factoryFor(Skeleton))
    .register('Cuboid', factoryFor(Cuboid))
}
