import type { Node } from '../scene/node'
import type { SceneEvent } from './event-types'

/**
 * Dispatch a {@link SceneEvent} along a node path using DOM-style phases.
 *
 * `path` is ordered target-first: `[target, parent, …, root]`. The walk is:
 * 1. **capture** — root → target's parent (capture-phase listeners),
 * 2. **target** — the target (capture then bubble listeners),
 * 3. **bubble** — target's parent → root (bubble-phase listeners), only if `bubbles`.
 *
 * `stopPropagation()` halts the walk after the current node; `stopImmediatePropagation()`
 * additionally skips remaining listeners on the current node.
 */
export function dispatchEvent(event: SceneEvent, path: readonly Node[]): void {
  const target = path[0]
  if (target === undefined) return

  event.eventPhase = 'capture'
  for (let i = path.length - 1; i >= 1; i--) {
    const node = path[i]
    if (node === undefined) continue
    event.currentTarget = node
    node._emit(event, true)
    if (event.propagationStopped) return
  }

  event.eventPhase = 'target'
  event.currentTarget = target
  target._emit(event, true)
  target._emit(event, false)
  if (event.propagationStopped || !event.bubbles) return

  event.eventPhase = 'bubble'
  for (let i = 1; i < path.length; i++) {
    const node = path[i]
    if (node === undefined) continue
    event.currentTarget = node
    node._emit(event, false)
    if (event.propagationStopped) return
  }
}
