import type { Container, History, SelectionManager, Stage } from '@annotacanvas/core'
import { getContext, setContext } from 'svelte'

const KEY = Symbol('annotacanvas:context')

/**
 * The context carried down the component tree. The fields are exposed as getters by the
 * provider so that reading them inside a child's `$effect` tracks the reactive source — this
 * is what powers the attach cascade (see Node.svelte / Stage.svelte).
 */
export interface NodeContext {
  readonly stage: Stage | null
  /** The container a child attaches to (the stage for layers; a layer/group otherwise). */
  readonly parent: Container | null
  readonly selection: SelectionManager | null
  readonly history: History | null
}

const EMPTY: NodeContext = { stage: null, parent: null, selection: null, history: null }

export function setNodeContext(context: NodeContext): void {
  setContext(KEY, context)
}

/** Read the surrounding context. Must be called during component init (Svelte rule). */
export function getNodeContext(): NodeContext {
  return getContext<NodeContext>(KEY) ?? EMPTY
}
