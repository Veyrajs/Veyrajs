import type { Container, History, SelectionManager, Stage } from '@veyrajs/core'
import { createContext, useContext } from 'react'

/** Context passed from a stage/container down to its child components. */
export interface NodeContextValue {
  stage: Stage | null
  /** The container child nodes attach to (the stage for layers; a layer/group otherwise). */
  parent: Container | null
  selection: SelectionManager | null
  history: History | null
}

export const NodeContext = createContext<NodeContextValue>({
  stage: null,
  parent: null,
  selection: null,
  history: null,
})

export function useNodeContext(): NodeContextValue {
  return useContext(NodeContext)
}
