import type { Camera, History, SelectionManager, Stage } from '@veyrajs/core'
import { useNodeContext } from './context'

/** The stage instance (null until `<ACStage>` has mounted). Used inside `<ACStage>`. */
export function useStage(): Stage | null {
  return useNodeContext().stage
}

/** The stage camera (null until mounted). */
export function useCamera(): Camera | null {
  return useNodeContext().stage?.camera ?? null
}

/** The selection manager, when `<ACStage selectable>`. */
export function useSelection(): SelectionManager | null {
  return useNodeContext().selection
}

/** The undo/redo history, when `<ACStage selectable>`. */
export function useHistory(): History | null {
  return useNodeContext().history
}
