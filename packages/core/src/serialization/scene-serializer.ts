import { Container } from '../scene/container'
import { Layer } from '../scene/layer'
import type { Node } from '../scene/node'
import type { Stage } from '../scene/stage'
import { type ClassRegistry, createDefaultRegistry } from './class-registry'
import { MigrationRunner } from './migration-runner'
import { CURRENT_SCHEMA_VERSION, type SceneDocument, type SerializedNode } from './types'

export interface SceneSerializerOptions {
  registry?: ClassRegistry
  migrations?: MigrationRunner
}

/**
 * Versioned JSON serialization for the scene graph (a stage's layers and their subtrees).
 * Round-trips through plain objects; deserialization rebuilds nodes via the
 * {@link ClassRegistry} and runs {@link MigrationRunner} on older documents.
 */
export class SceneSerializer {
  private readonly registry: ClassRegistry
  private readonly migrations: MigrationRunner

  constructor(options: SceneSerializerOptions = {}) {
    this.registry = options.registry ?? createDefaultRegistry()
    this.migrations = options.migrations ?? new MigrationRunner()
  }

  /** Serialize a stage's layers into a versioned document. */
  toDocument(stage: Stage): SceneDocument {
    return {
      version: CURRENT_SCHEMA_VERSION,
      nodes: stage.children.map((child) => child.toObject()),
    }
  }

  /** Serialize a stage to a JSON string. */
  stringify(stage: Stage, space?: number): string {
    return JSON.stringify(this.toDocument(stage), null, space)
  }

  /** Reconstruct a node (and its descendants) from serialized data. */
  fromObject(data: SerializedNode): Node {
    const node = this.registry.create(data)
    if (data.children !== undefined && node instanceof Container) {
      for (const childData of data.children) node.add(this.fromObject(childData))
    }
    return node
  }

  /** Load a document into a stage, replacing its current content. */
  load(stage: Stage, document: SceneDocument): void {
    const migrated = this.migrations.run(document)
    stage.removeChildren()
    for (const nodeData of migrated.nodes) {
      const node = this.fromObject(nodeData)
      if (node instanceof Layer) {
        stage.add(node)
      } else {
        stage.createLayer().add(node)
      }
    }
    stage.requestRender()
  }

  /** Load a stage from a JSON string. */
  parse(stage: Stage, json: string): void {
    this.load(stage, JSON.parse(json) as SceneDocument)
  }
}
