/** Current scene-document schema version. Bump when the on-disk format changes. */
export const CURRENT_SCHEMA_VERSION = 1

/** A serialized node: its type, id, type-specific props, and (for containers) children. */
export interface SerializedNode {
  type: string
  id: string
  children?: SerializedNode[]
  [key: string]: unknown
}

/** A serialized scene document (the top-level layers plus a schema version). */
export interface SceneDocument {
  version: number
  nodes: SerializedNode[]
}
