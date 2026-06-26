import type { Camera, History, SelectionManager, Stage } from '@annotacanvas/core'
import { type ComputedRef, type Ref, computed } from 'vue'
import { useNodeContext } from './context'

/** The stage instance (null until `<ACStage>` has mounted). */
export function useStage(): Ref<Stage | null> {
  return useNodeContext().stage
}

/** The stage camera, reactively (null until mounted). */
export function useCamera(): ComputedRef<Camera | null> {
  const { stage } = useNodeContext()
  return computed(() => stage.value?.camera ?? null)
}

/** The selection manager, when `<ACStage selectable>`. */
export function useSelection(): Ref<SelectionManager | null> {
  return useNodeContext().selection
}

/** The undo/redo history, when `<ACStage selectable>`. */
export function useHistory(): Ref<History | null> {
  return useNodeContext().history
}
