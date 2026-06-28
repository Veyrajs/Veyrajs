import type { Node } from '@veyrajs/core'
import type { AnnotationConfig } from '../nodes/annotation-node'

/** A pointer-driven authoring tool. `enable()` starts listening; `disable()` stops and cleans up. */
export interface Tool {
  enable(): void
  disable(): void
}

/** Options shared by the draw tools. */
export interface DrawToolOptions {
  /** Style + label merged into every new annotation's config (stroke/fill/label/…). */
  defaults?: AnnotationConfig
  /** Called with each finished annotation (already added to the layer). */
  onCreate?: (node: Node) => void
}
