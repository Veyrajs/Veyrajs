import type { Vec2 } from '../math'
import type { Node } from '../scene/node'
import type { Stage } from '../scene/stage'
import { dispatchEvent } from './dispatch'
import { SceneEvent, type SceneEventType } from './event-types'

const DRAG_THRESHOLD = 3 // screen pixels before a press becomes a drag
const DBLCLICK_MS = 300

interface PressState {
  pointerId: number
  target: Node
  startScreen: Vec2
  dragging: boolean
}

/**
 * Binds native Pointer/Wheel events on the stage container, normalizes them to
 * screen/world points, hit-tests for a target, and dispatches synthetic
 * {@link SceneEvent}s — including the derived click / dblclick / drag* / pointerenter /
 * pointerleave events — through the capture/target/bubble phases.
 */
export class EventManager {
  private readonly stage: Stage
  private readonly container: HTMLElement
  private press: PressState | null = null
  private hover: Node | null = null
  private lastClick: { time: number; target: Node } | null = null
  private bound = false

  constructor(stage: Stage) {
    this.stage = stage
    this.container = stage.container
    this.bind()
  }

  bind(): void {
    if (this.bound) return
    this.container.addEventListener('pointerdown', this.onPointerDown)
    this.container.addEventListener('pointermove', this.onPointerMove)
    this.container.addEventListener('pointerup', this.onPointerUp)
    this.container.addEventListener('pointercancel', this.onPointerUp)
    this.container.addEventListener('pointerleave', this.onPointerLeave)
    this.container.addEventListener('wheel', this.onWheel, { passive: false })
    this.bound = true
  }

  destroy(): void {
    if (!this.bound) return
    this.container.removeEventListener('pointerdown', this.onPointerDown)
    this.container.removeEventListener('pointermove', this.onPointerMove)
    this.container.removeEventListener('pointerup', this.onPointerUp)
    this.container.removeEventListener('pointercancel', this.onPointerUp)
    this.container.removeEventListener('pointerleave', this.onPointerLeave)
    this.container.removeEventListener('wheel', this.onWheel)
    this.press = null
    this.hover = null
    this.bound = false
  }

  private screenOf(e: MouseEvent): Vec2 {
    const rect = this.container.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  private pathTo(target: Node): Node[] {
    const path: Node[] = []
    let n: Node | null = target
    while (n !== null) {
      path.push(n)
      n = n.parent
    }
    return path
  }

  private emit(
    type: SceneEventType,
    native: PointerEvent | WheelEvent,
    screen: Vec2,
    world: Vec2,
    fixedTarget?: Node,
  ): SceneEvent {
    const target = fixedTarget ?? this.stage.getIntersection(world) ?? this.stage
    const event = new SceneEvent({
      type,
      target,
      screenPoint: screen,
      worldPoint: world,
      nativeEvent: native,
      pointerId: 'pointerId' in native ? native.pointerId : -1,
      button: native.button,
      buttons: native.buttons,
      deltaX: 'deltaY' in native ? native.deltaX : 0,
      deltaY: 'deltaY' in native ? native.deltaY : 0,
    })
    dispatchEvent(event, this.pathTo(target))
    return event
  }

  private emitHover(
    type: 'pointerenter' | 'pointerleave',
    native: PointerEvent,
    screen: Vec2,
    world: Vec2,
    node: Node,
  ): void {
    const event = new SceneEvent({
      type,
      target: node,
      screenPoint: screen,
      worldPoint: world,
      nativeEvent: native,
      bubbles: false,
      pointerId: native.pointerId,
      button: native.button,
      buttons: native.buttons,
    })
    // enter/leave do not bubble, but the capture phase still traverses ancestors,
    // so ancestor capture-listeners (e.g. tooling) can observe descendant hover.
    dispatchEvent(event, this.pathTo(node))
  }

  private updateHover(native: PointerEvent, screen: Vec2, world: Vec2): void {
    const hit = this.stage.getIntersection(world)
    if (hit === this.hover) return
    if (this.hover !== null) this.emitHover('pointerleave', native, screen, world, this.hover)
    if (hit !== null) this.emitHover('pointerenter', native, screen, world, hit)
    this.hover = hit
  }

  private onPointerDown = (e: PointerEvent): void => {
    const screen = this.screenOf(e)
    const world = this.stage.screenToWorld(screen)
    const event = this.emit('pointerdown', e, screen, world)
    this.press = {
      pointerId: e.pointerId,
      target: event.target,
      startScreen: screen,
      dragging: false,
    }
    try {
      this.container.setPointerCapture(e.pointerId)
    } catch {
      // pointer capture not supported in this environment
    }
  }

  private onPointerMove = (e: PointerEvent): void => {
    const screen = this.screenOf(e)
    const world = this.stage.screenToWorld(screen)
    this.updateHover(e, screen, world)
    this.emit('pointermove', e, screen, world)

    const press = this.press
    if (press !== null && press.pointerId === e.pointerId) {
      const dist = Math.hypot(screen.x - press.startScreen.x, screen.y - press.startScreen.y)
      if (!press.dragging && dist > DRAG_THRESHOLD) {
        press.dragging = true
        this.emit('dragstart', e, screen, world, press.target)
      }
      if (press.dragging) {
        this.emit('dragmove', e, screen, world, press.target)
      }
    }
  }

  private onPointerUp = (e: PointerEvent): void => {
    const screen = this.screenOf(e)
    const world = this.stage.screenToWorld(screen)
    const event = this.emit('pointerup', e, screen, world)

    const press = this.press
    if (press !== null && press.pointerId === e.pointerId) {
      if (press.dragging) {
        this.emit('dragend', e, screen, world, press.target)
      } else if (event.target === press.target) {
        this.emit('click', e, screen, world, press.target)
        const time = e.timeStamp
        if (
          this.lastClick !== null &&
          this.lastClick.target === press.target &&
          time - this.lastClick.time <= DBLCLICK_MS
        ) {
          this.emit('dblclick', e, screen, world, press.target)
          this.lastClick = null
        } else {
          this.lastClick = { time, target: press.target }
        }
      }
      try {
        this.container.releasePointerCapture(e.pointerId)
      } catch {
        // ignore
      }
      this.press = null
    }
  }

  private onPointerLeave = (e: PointerEvent): void => {
    if (this.hover !== null) {
      const screen = this.screenOf(e)
      const world = this.stage.screenToWorld(screen)
      this.emitHover('pointerleave', e, screen, world, this.hover)
      this.hover = null
    }
  }

  private onWheel = (e: WheelEvent): void => {
    const screen = this.screenOf(e)
    const world = this.stage.screenToWorld(screen)
    this.emit('wheel', e, screen, world)
  }
}
