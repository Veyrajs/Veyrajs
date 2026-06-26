import {
  Directive,
  EventEmitter,
  Input,
  type OnChanges,
  type OnDestroy,
  type OnInit,
  Output,
  inject,
} from '@angular/core'
import type {
  Container,
  History,
  Node,
  SceneEvent,
  SceneEventType,
  SelectionManager,
  Stage,
} from '@veyrajs/core'
import { NODE_CONTEXT, type NodeContext } from './context'

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

/**
 * Shared base for every node component. Declares the common transform inputs + the engine
 * event outputs, and drives the node lifecycle: create + attach on `ngOnInit`, mirror on
 * `ngOnChanges`, remove on `ngOnDestroy`. Subclasses supply the node class and prop keys.
 *
 * The cascade is pure Angular: `ngOnInit` runs top-down, so by the time a child initializes,
 * its parent's node already exists — read from the injected (skip-self) parent context.
 */
@Directive()
export abstract class AcNodeBase implements OnInit, OnChanges, OnDestroy, NodeContext {
  @Input() id?: string
  @Input() name?: string
  @Input() x?: number
  @Input() y?: number
  @Input() scaleX?: number
  @Input() scaleY?: number
  @Input() rotation?: number
  @Input() skewX?: number
  @Input() skewY?: number
  @Input() offsetX?: number
  @Input() offsetY?: number
  @Input() opacity?: number
  @Input() visible?: boolean
  @Input() listening?: boolean

  @Output() pointerdown = new EventEmitter<SceneEvent>()
  @Output() pointermove = new EventEmitter<SceneEvent>()
  @Output() pointerup = new EventEmitter<SceneEvent>()
  @Output() pointerenter = new EventEmitter<SceneEvent>()
  @Output() pointerleave = new EventEmitter<SceneEvent>()
  @Output() click = new EventEmitter<SceneEvent>()
  @Output() dblclick = new EventEmitter<SceneEvent>()
  @Output() wheel = new EventEmitter<SceneEvent>()
  @Output() dragstart = new EventEmitter<SceneEvent>()
  @Output() dragmove = new EventEmitter<SceneEvent>()
  @Output() dragend = new EventEmitter<SceneEvent>()

  /** Parent context. `skipSelf` so a container resolves its ancestor, not its own provider. */
  protected readonly parentContext = inject<NodeContext>(NODE_CONTEXT, {
    skipSelf: true,
    optional: true,
  })

  /** The created engine node (available after `ngOnInit`). The escape hatch. */
  node?: Node

  protected abstract createNode(): Node
  protected abstract readonly mirrorKeys: readonly string[]

  // NodeContext: a shape is never a parent; a container overrides `container`.
  get stage(): Stage | null {
    return this.parentContext?.stage ?? null
  }
  get container(): Container | null {
    return null
  }
  get selection(): SelectionManager | null {
    return this.parentContext?.selection ?? null
  }
  get history(): History | null {
    return this.parentContext?.history ?? null
  }

  ngOnInit(): void {
    const node = this.createNode()
    this.node = node
    const parent = this.parentContext?.container ?? null
    if (parent) parent.add(node)
    const emitters = this as unknown as Record<string, EventEmitter<SceneEvent> | undefined>
    for (const type of EVENTS) {
      const emitter = emitters[type]
      if (emitter) node.on(type, (event) => emitter.emit(event))
    }
  }

  ngOnChanges(): void {
    const node = this.node
    if (!node) return
    const target = node as unknown as Record<string, unknown>
    const source = this as unknown as Record<string, unknown>
    for (const key of this.mirrorKeys) {
      if (key === 'id') continue
      const value = source[key]
      if (value !== undefined) target[key] = value
    }
  }

  ngOnDestroy(): void {
    this.node?.remove()
  }

  /** Build the constructor config from the current input values (undefined filtered out). */
  protected buildConfig(): Record<string, unknown> {
    const source = this as unknown as Record<string, unknown>
    const config: Record<string, unknown> = {}
    for (const key of this.mirrorKeys) {
      const value = source[key]
      if (value !== undefined) config[key] = value
    }
    return config
  }
}
