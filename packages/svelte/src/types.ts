import type { Node as EngineNode } from '@veyrajs/core'
import type { Snippet } from 'svelte'

/** Props accepted by a leaf shape wrapper: engine props + `on*` callbacks + a bindable node. */
export type ShapeProps = Record<string, unknown> & { node?: EngineNode }

/** Container wrapper props: like a shape, plus a `children` snippet. */
export type ContainerProps = Record<string, unknown> & {
  node?: EngineNode
  children?: Snippet
}
