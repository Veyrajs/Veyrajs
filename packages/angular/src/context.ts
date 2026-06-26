import { InjectionToken } from '@angular/core'
import type { Container, History, SelectionManager, Stage } from '@veyrajs/core'

/**
 * The context shared down the component tree via Angular's hierarchical DI. Each container
 * provides itself under this token; a child reads its parent's `container` to attach.
 */
export interface NodeContext {
  readonly stage: Stage | null
  /** The container a child attaches to (the stage for layers; a layer/group otherwise). */
  readonly container: Container | null
  readonly selection: SelectionManager | null
  readonly history: History | null
}

export const NODE_CONTEXT = new InjectionToken<NodeContext>('veyrajs.NODE_CONTEXT')
