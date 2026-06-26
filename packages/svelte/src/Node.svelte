<script lang="ts">
import {
  Container,
  type Node,
  type SceneEvent,
  type SceneEventType,
} from '@veyrajs/core'
import { type Snippet, onMount, untrack } from 'svelte'
import { getNodeContext, setNodeContext } from './context.js'

const EVENTS: SceneEventType[] = [
  'pointerdown',
  'pointermove',
  'pointerup',
  'pointerenter',
  'pointerleave',
  'click',
  'dblclick',
  'wheel',
  'dragstart',
  'dragmove',
  'dragend',
]

/** Engine event `click` → callback prop `onclick` (Svelte's lowercase convention). */
function handlerName(type: string): string {
  return `on${type}`
}

function buildConfig(source: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const config: Record<string, unknown> = {}
  for (const key of keys) {
    if (source[key] !== undefined) config[key] = source[key]
  }
  return config
}

interface Props {
  nodeClass: new (config?: never) => Node
  keys: string[]
  props: Record<string, unknown>
  isContainer?: boolean
  node?: Node
  children?: Snippet
}

let {
  nodeClass,
  keys,
  props,
  isContainer = false,
  node = $bindable(),
  children,
}: Props = $props()

const context = getNodeContext()
// Create the node once from the initial props. `untrack` says "read the current values, don't
// re-create when they change" — the prop mirror (below) handles subsequent updates.
const instance = untrack(() => new nodeClass(buildConfig(props, keys) as never))
node = instance
const target = instance as unknown as Record<string, unknown>

// A container provides *itself* as the parent for its children (the next level of the cascade).
if (untrack(() => isContainer)) {
  setNodeContext({
    get stage() {
      return context.stage
    },
    get parent() {
      return instance as Container
    },
    get selection() {
      return context.selection
    },
    get history() {
      return context.history
    },
  })
}

// Attach to the parent once it becomes available. Reading `context.parent` (a getter over the
// provider's reactive state) tracks it, so this re-runs the moment the stage mounts.
$effect(() => {
  const parent = context.parent
  if (parent !== null && instance.parent !== parent) parent.add(instance)
})

// Mirror prop changes onto the node. The engine's guarded setters make re-applying loop-safe.
$effect(() => {
  for (const key of keys) {
    if (key === 'id') continue
    const value = props[key]
    if (value !== undefined) target[key] = value
  }
})

// Re-emit engine events as `on*` callbacks. The handler reads `props` lazily, so Svelte's
// reactive props always hand it the latest callback — no re-subscription needed.
$effect(() => {
  const handlers = EVENTS.map((type) => {
    const handler = (event: SceneEvent): void => {
      const callback = props[handlerName(type)]
      if (typeof callback === 'function') (callback as (e: SceneEvent) => void)(event)
    }
    instance.on(type, handler)
    return [type, handler] as const
  })
  return () => {
    for (const [type, handler] of handlers) instance.off(type, handler)
  }
})

onMount(() => {
  return () => instance.remove()
})
</script>

{#if isContainer}{@render children?.()}{/if}
