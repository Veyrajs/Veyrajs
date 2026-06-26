import type { Container, History, SelectionManager, Stage } from '@annotacanvas/core'
import { type InjectionKey, type Ref, inject } from 'vue'

/** Reactive context passed from a stage/container down to its child components. */
export interface NodeContext {
  stage: Ref<Stage | null>
  /** The container child nodes attach to (the stage for layers; a layer/group otherwise). */
  parent: Ref<Container | null>
  selection: Ref<SelectionManager | null>
  history: Ref<History | null>
}

export const NodeContextKey: InjectionKey<NodeContext> = Symbol('annotacanvas:node-context')

export function useNodeContext(): NodeContext {
  const context = inject(NodeContextKey)
  if (context === undefined) {
    throw new Error('AnnotaCanvas components must be used inside <ACStage>')
  }
  return context
}
