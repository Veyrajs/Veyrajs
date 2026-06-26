<script lang="ts">
import {
  History,
  SelectionController,
  type SelectionManager,
  Stage,
} from '@veyrajs/core'
import { type Snippet, onMount } from 'svelte'
import { setNodeContext } from './context.js'

interface Props {
  width?: number
  height?: number
  background?: string | null
  pixelRatio?: number
  selectable?: boolean
  /** Bindable: the engine stage, available after mount. The escape hatch. */
  stage?: Stage | null
  selection?: SelectionManager | null
  history?: History | null
  onready?: (stage: Stage) => void
  children?: Snippet
}

let {
  width = 0,
  height = 0,
  background = null,
  pixelRatio,
  selectable = false,
  stage = $bindable(null),
  selection = $bindable(null),
  history = $bindable(null),
  onready,
  children,
}: Props = $props()

let host: HTMLDivElement

// Bindable props are reactive, so they double as the context's reactive source: assigning
// `stage` in onMount re-runs every child's attach effect.
setNodeContext({
  get stage() {
    return stage ?? null
  },
  get parent() {
    return stage ?? null
  },
  get selection() {
    return selection ?? null
  },
  get history() {
    return history ?? null
  },
})

onMount(() => {
  const instance = new Stage({ container: host, width, height, background, pixelRatio })
  let controller: SelectionController | null = null
  if (selectable) {
    history = new History()
    controller = new SelectionController(instance, { history })
    selection = controller.selection
  }
  stage = instance
  onready?.(instance)
  return () => {
    controller?.destroy()
    instance.destroy()
  }
})

// Keep the canvas sized.
$effect(() => {
  stage?.setSize(width, height)
})
</script>

<div class="ac-stage" bind:this={host}>
  {@render children?.()}
</div>
