import type { SceneEvent, SceneEventListener, SceneEventType } from '../events/event-types'
import { nextId } from '../id'
import { type Bounds, Matrix } from '../math'
import type { SerializedNode } from '../serialization/types'
import type { Container } from './container'

export interface NodeConfig {
  id?: string
  name?: string
  x?: number
  y?: number
  scaleX?: number
  scaleY?: number
  /** Rotation in degrees (clockwise; y-down). */
  rotation?: number
  skewX?: number
  skewY?: number
  offsetX?: number
  offsetY?: number
  opacity?: number
  visible?: boolean
  listening?: boolean
}

interface NodeListenerEntry {
  handler: SceneEventListener
  capture: boolean
  once: boolean
}

/**
 * Base class for every element in the scene graph.
 *
 * Holds the local transform (position/scale/rotation/skew/pivot), visibility, opacity,
 * and parent linkage. The world transform is computed lazily and cached with a version
 * counter, so changing one node never eagerly walks its whole subtree — descendants
 * recompute on next access only if an ancestor's world transform actually changed.
 */
export abstract class Node {
  abstract readonly type: string

  readonly id: string
  name: string | undefined

  /** Owning container. Managed by the parent — do not assign directly. */
  parent: Container | null = null

  private _x: number
  private _y: number
  private _scaleX: number
  private _scaleY: number
  private _rotation: number
  private _skewX: number
  private _skewY: number
  private _offsetX: number
  private _offsetY: number
  private _opacity: number
  private _visible: boolean
  private _listening: boolean

  private _localMatrix: Matrix | null = null
  private _worldMatrix: Matrix | null = null
  private _worldVersion = 0
  private _parentVersionSeen = -1
  private _worldDirty = true

  private _listeners: Map<SceneEventType, NodeListenerEntry[]> | null = null

  constructor(config: NodeConfig = {}) {
    this.id = config.id ?? nextId()
    this.name = config.name
    this._x = config.x ?? 0
    this._y = config.y ?? 0
    this._scaleX = config.scaleX ?? 1
    this._scaleY = config.scaleY ?? 1
    this._rotation = config.rotation ?? 0
    this._skewX = config.skewX ?? 0
    this._skewY = config.skewY ?? 0
    this._offsetX = config.offsetX ?? 0
    this._offsetY = config.offsetY ?? 0
    this._opacity = config.opacity ?? 1
    this._visible = config.visible ?? true
    this._listening = config.listening ?? true
  }

  get x(): number {
    return this._x
  }
  set x(v: number) {
    if (v !== this._x) {
      this._x = v
      this.invalidateTransform()
    }
  }

  get y(): number {
    return this._y
  }
  set y(v: number) {
    if (v !== this._y) {
      this._y = v
      this.invalidateTransform()
    }
  }

  get scaleX(): number {
    return this._scaleX
  }
  set scaleX(v: number) {
    if (v !== this._scaleX) {
      this._scaleX = v
      this.invalidateTransform()
    }
  }

  get scaleY(): number {
    return this._scaleY
  }
  set scaleY(v: number) {
    if (v !== this._scaleY) {
      this._scaleY = v
      this.invalidateTransform()
    }
  }

  get rotation(): number {
    return this._rotation
  }
  set rotation(v: number) {
    if (v !== this._rotation) {
      this._rotation = v
      this.invalidateTransform()
    }
  }

  get skewX(): number {
    return this._skewX
  }
  set skewX(v: number) {
    if (v !== this._skewX) {
      this._skewX = v
      this.invalidateTransform()
    }
  }

  get skewY(): number {
    return this._skewY
  }
  set skewY(v: number) {
    if (v !== this._skewY) {
      this._skewY = v
      this.invalidateTransform()
    }
  }

  get offsetX(): number {
    return this._offsetX
  }
  set offsetX(v: number) {
    if (v !== this._offsetX) {
      this._offsetX = v
      this.invalidateTransform()
    }
  }

  get offsetY(): number {
    return this._offsetY
  }
  set offsetY(v: number) {
    if (v !== this._offsetY) {
      this._offsetY = v
      this.invalidateTransform()
    }
  }

  get opacity(): number {
    return this._opacity
  }
  set opacity(v: number) {
    if (v !== this._opacity) {
      this._opacity = v
      this.markDirty()
    }
  }

  get visible(): boolean {
    return this._visible
  }
  set visible(v: boolean) {
    if (v !== this._visible) {
      this._visible = v
      this.markDirty()
    }
  }

  get listening(): boolean {
    return this._listening
  }
  set listening(v: boolean) {
    this._listening = v
  }

  /** Set position in one call. */
  position(x: number, y: number): this {
    this.x = x
    this.y = y
    return this
  }

  /** Translate by a delta. */
  move(dx: number, dy: number): this {
    this.x = this._x + dx
    this.y = this._y + dy
    return this
  }

  /** Local-to-parent transform, composed from this node's properties (cached). */
  localMatrix(): Matrix {
    if (this._localMatrix === null) {
      this._localMatrix = Matrix.compose({
        x: this._x,
        y: this._y,
        rotation: this._rotation,
        scaleX: this._scaleX,
        scaleY: this._scaleY,
        skewX: this._skewX,
        skewY: this._skewY,
        offsetX: this._offsetX,
        offsetY: this._offsetY,
      })
    }
    return this._localMatrix
  }

  /** Local-to-world transform (lazy; cached against the parent's version counter). */
  worldMatrix(): Matrix {
    const parent = this.parent
    let parentWorld: Matrix | null = null
    let parentVersion = 0
    if (parent !== null) {
      parentWorld = parent.worldMatrix() // ensure parent is current first
      parentVersion = parent._worldVersion
    }

    if (
      !this._worldDirty &&
      this._worldMatrix !== null &&
      this._parentVersionSeen === parentVersion
    ) {
      return this._worldMatrix
    }

    const local = this.localMatrix()
    const world = parentWorld !== null ? parentWorld.multiply(local) : local
    if (this._worldMatrix === null || !this._worldMatrix.equals(world)) {
      this._worldVersion += 1
    }
    this._worldMatrix = world
    this._parentVersionSeen = parentVersion
    this._worldDirty = false
    return world
  }

  /** Geometry bounds in this node's own local space. */
  abstract getLocalBounds(): Bounds

  /** Axis-aligned bounds of this node in world space. */
  getWorldBounds(): Bounds {
    return this.getLocalBounds().transform(this.worldMatrix())
  }

  /** Serialize this node to a plain object. Subclasses extend via `serializedExtras`. */
  toObject(): SerializedNode {
    const data: SerializedNode = {
      type: this.type,
      id: this.id,
      x: this._x,
      y: this._y,
      scaleX: this._scaleX,
      scaleY: this._scaleY,
      rotation: this._rotation,
      skewX: this._skewX,
      skewY: this._skewY,
      offsetX: this._offsetX,
      offsetY: this._offsetY,
      opacity: this._opacity,
      visible: this._visible,
      listening: this._listening,
      ...this.serializedExtras(),
    }
    if (this.name !== undefined) data.name = this.name
    return data
  }

  /** Subclass hook adding type-specific serialized properties. */
  protected serializedExtras(): Record<string, unknown> {
    return {}
  }

  /** Request a redraw of the stage that owns this node (coalesced to one frame). */
  markDirty(): void {
    let root: Node = this
    while (root.parent !== null) root = root.parent
    root.onSubtreeDirty()
  }

  /** Detach this node from its parent. */
  remove(): this {
    this.parent?.removeChild(this)
    return this
  }

  destroy(): void {
    this.remove()
  }

  /** Add an event listener. Returns `this` for chaining. */
  on(
    type: SceneEventType,
    handler: SceneEventListener,
    options?: { capture?: boolean; once?: boolean },
  ): this {
    if (this._listeners === null) this._listeners = new Map()
    let entries = this._listeners.get(type)
    if (entries === undefined) {
      entries = []
      this._listeners.set(type, entries)
    }
    entries.push({ handler, capture: options?.capture ?? false, once: options?.once ?? false })
    return this
  }

  /** Add a one-shot listener that removes itself after firing once. */
  once(type: SceneEventType, handler: SceneEventListener, options?: { capture?: boolean }): this {
    return this.on(type, handler, { capture: options?.capture ?? false, once: true })
  }

  /** Remove a listener, or all listeners of a type when no handler is given. */
  off(type: SceneEventType, handler?: SceneEventListener): this {
    if (this._listeners === null) return this
    if (handler === undefined) {
      this._listeners.delete(type)
      return this
    }
    const entries = this._listeners.get(type)
    if (entries !== undefined) {
      const next = entries.filter((entry) => entry.handler !== handler)
      if (next.length > 0) this._listeners.set(type, next)
      else this._listeners.delete(type)
    }
    return this
  }

  /** Whether this node has any listener for the given type. */
  hasListeners(type: SceneEventType): boolean {
    return (this._listeners?.get(type)?.length ?? 0) > 0
  }

  /** Internal: invoke this node's listeners for the given phase (capture or bubble). */
  _emit(event: SceneEvent, capture: boolean): void {
    if (event.immediatePropagationStopped) return
    const entries = this._listeners?.get(event.type)
    if (entries === undefined || entries.length === 0) return
    for (const entry of entries.slice()) {
      if (entry.capture !== capture) continue
      entry.handler(event)
      if (entry.once) this.off(event.type, entry.handler)
      if (event.immediatePropagationStopped) return
    }
  }

  /** Internal: called by a container when this node is (re)parented. */
  _reparented(): void {
    this._worldDirty = true
    this.markDirty()
  }

  /** Hook invoked on the root when any node in the subtree becomes dirty (Stage overrides). */
  protected onSubtreeDirty(): void {}

  private invalidateTransform(): void {
    this._localMatrix = null
    this._worldDirty = true
    this.markDirty()
  }
}
