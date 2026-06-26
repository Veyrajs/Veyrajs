import { describe, expect, it } from 'vitest'
import { Rect, Stage } from '../../index'

function makeStage(): { stage: Stage; container: HTMLElement } {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const stage = new Stage({ container, width: 300, height: 200 })
  return { stage, container }
}

function dispatchPointer(container: HTMLElement, type: string, x: number, y: number): void {
  const init: PointerEventInit = {
    clientX: x,
    clientY: y,
    button: 0,
    buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
    bubbles: true,
    cancelable: true,
  }
  let event: Event
  try {
    event = new PointerEvent(type, { pointerId: 1, ...init })
  } catch {
    event = new MouseEvent(type, init)
  }
  container.dispatchEvent(event)
}

describe('EventManager (integration)', () => {
  it('fires click on the shape under the pointer', () => {
    const { stage, container } = makeStage()
    const rect = new Rect({ x: 20, y: 20, width: 60, height: 40, fill: '#f00' })
    stage.createLayer().add(rect)

    let clicks = 0
    rect.on('click', () => {
      clicks += 1
    })

    dispatchPointer(container, 'pointerdown', 40, 35)
    dispatchPointer(container, 'pointerup', 40, 35)
    expect(clicks).toBe(1)
    stage.destroy()
  })

  it('fires drag events once the pointer moves past the threshold', () => {
    const { stage, container } = makeStage()
    const rect = new Rect({ x: 0, y: 0, width: 100, height: 100, fill: '#0f0' })
    stage.createLayer().add(rect)

    const seen: string[] = []
    rect.on('dragstart', () => seen.push('start'))
    rect.on('dragmove', () => seen.push('move'))
    rect.on('dragend', () => seen.push('end'))

    dispatchPointer(container, 'pointerdown', 10, 10)
    dispatchPointer(container, 'pointermove', 30, 30)
    dispatchPointer(container, 'pointerup', 30, 30)
    expect(seen).toEqual(['start', 'move', 'end'])
    stage.destroy()
  })

  it('fires pointerenter/leave as the hovered shape changes', () => {
    const { stage, container } = makeStage()
    const rect = new Rect({ x: 0, y: 0, width: 50, height: 50, fill: '#00f' })
    stage.createLayer().add(rect)

    const seen: string[] = []
    rect.on('pointerenter', () => seen.push('enter'))
    rect.on('pointerleave', () => seen.push('leave'))

    dispatchPointer(container, 'pointermove', 25, 25)
    dispatchPointer(container, 'pointermove', 120, 120)
    expect(seen).toEqual(['enter', 'leave'])
    stage.destroy()
  })
})
