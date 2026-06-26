import type { Vec2 } from '../math'
import type { Node } from '../scene/node'

export type SceneEventType =
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'pointerenter'
  | 'pointerleave'
  | 'click'
  | 'dblclick'
  | 'wheel'
  | 'dragstart'
  | 'dragmove'
  | 'dragend'

export type SceneEventPhase = 'capture' | 'target' | 'bubble'

export type SceneEventListener = (event: SceneEvent) => void

export interface SceneEventInit {
  type: SceneEventType
  target: Node
  screenPoint: Vec2
  worldPoint: Vec2
  nativeEvent: PointerEvent | WheelEvent | null
  /** Whether the event bubbles to ancestors. Default true (enter/leave pass false). */
  bubbles?: boolean
  pointerId?: number
  button?: number
  buttons?: number
  deltaX?: number
  deltaY?: number
}

/**
 * The synthetic event delivered to scene-graph listeners. Carries the pointer position in
 * both screen and world space, the originating native event, modifier keys, and the
 * DOM-style propagation controls.
 */
export class SceneEvent {
  readonly type: SceneEventType
  /** The node the interaction resolved to (constant during propagation). */
  readonly target: Node
  /** The node currently handling the event (updated as it propagates). */
  currentTarget: Node
  eventPhase: SceneEventPhase = 'target'

  readonly screenPoint: Vec2
  readonly worldPoint: Vec2
  readonly nativeEvent: PointerEvent | WheelEvent | null
  readonly bubbles: boolean

  readonly pointerId: number
  readonly button: number
  readonly buttons: number
  readonly deltaX: number
  readonly deltaY: number

  readonly altKey: boolean
  readonly ctrlKey: boolean
  readonly shiftKey: boolean
  readonly metaKey: boolean

  propagationStopped = false
  immediatePropagationStopped = false
  defaultPrevented = false

  constructor(init: SceneEventInit) {
    this.type = init.type
    this.target = init.target
    this.currentTarget = init.target
    this.screenPoint = init.screenPoint
    this.worldPoint = init.worldPoint
    this.nativeEvent = init.nativeEvent
    this.bubbles = init.bubbles ?? true
    this.pointerId = init.pointerId ?? -1
    this.button = init.button ?? -1
    this.buttons = init.buttons ?? 0
    this.deltaX = init.deltaX ?? 0
    this.deltaY = init.deltaY ?? 0

    const ne = init.nativeEvent
    this.altKey = ne?.altKey ?? false
    this.ctrlKey = ne?.ctrlKey ?? false
    this.shiftKey = ne?.shiftKey ?? false
    this.metaKey = ne?.metaKey ?? false
  }

  /** Stop propagation to other nodes (remaining listeners on this node still run). */
  stopPropagation(): void {
    this.propagationStopped = true
  }

  /** Stop propagation and skip any remaining listeners, including on this node. */
  stopImmediatePropagation(): void {
    this.propagationStopped = true
    this.immediatePropagationStopped = true
  }

  /** Mark the default action as prevented and forward to the native event. */
  preventDefault(): void {
    this.defaultPrevented = true
    this.nativeEvent?.preventDefault()
  }

  /** The pointer position in a node's local space (defaults to `currentTarget`). */
  getLocalPoint(node: Node = this.currentTarget): Vec2 {
    return node.worldMatrix().invert().applyToPoint(this.worldPoint)
  }
}
