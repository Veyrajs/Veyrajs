import { Group } from '../scene/group'
import { Layer } from '../scene/layer'
import type { Node } from '../scene/node'
import { Circle, Ellipse, Image, Line, Polygon, Rect, Text } from '../scene/shapes'
import type { SerializedNode } from './types'

export type NodeFactory = (data: SerializedNode) => Node

/**
 * Maps a serialized `type` string to a factory that constructs the node from its config
 * (children are added separately by the serializer). Plugins register custom node types here.
 */
export class ClassRegistry {
  private readonly factories = new Map<string, NodeFactory>()

  register(type: string, factory: NodeFactory): this {
    this.factories.set(type, factory)
    return this
  }

  has(type: string): boolean {
    return this.factories.has(type)
  }

  create(data: SerializedNode): Node {
    const factory = this.factories.get(data.type)
    if (factory === undefined) throw new Error(`Unknown node type: "${data.type}"`)
    return factory(data)
  }
}

// Serialized data is structurally the constructor config (toObject mirrors the constructor),
// so each factory just constructs from it; the cast bridges the `unknown`-valued index type.
function factoryFor<C>(Ctor: new (config?: C) => Node): NodeFactory {
  return (data) => new Ctor(data as unknown as C)
}

/** A registry with every built-in node type registered. */
export function createDefaultRegistry(): ClassRegistry {
  return new ClassRegistry()
    .register('Group', factoryFor(Group))
    .register('Layer', factoryFor(Layer))
    .register('Rect', factoryFor(Rect))
    .register('Circle', factoryFor(Circle))
    .register('Ellipse', factoryFor(Ellipse))
    .register('Line', factoryFor(Line))
    .register('Polygon', factoryFor(Polygon))
    .register('Image', factoryFor(Image))
    .register('Text', factoryFor(Text))
}
