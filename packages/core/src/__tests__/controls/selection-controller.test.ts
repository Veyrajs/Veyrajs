import { describe, expect, it } from 'vitest'
import { History, Rect, SelectionController, Stage } from '../../index'

function dispatchPointer(container: HTMLElement, type: string, x: number, y: number): void {
  const init: PointerEventInit = {
    clientX: x,
    clientY: y,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
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

function makeStage(): { stage: Stage; container: HTMLElement } {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return { stage: new Stage({ container, width: 300, height: 300 }), container }
}

describe('SelectionController (integration)', () => {
  it('selects a shape on pointerdown and renders a box with handles', () => {
    const { stage, container } = makeStage()
    const rect = new Rect({ x: 50, y: 50, width: 100, height: 80, fill: '#f00' })
    stage.createLayer().add(rect)
    const controller = new SelectionController(stage)

    dispatchPointer(container, 'pointerdown', 100, 90)
    dispatchPointer(container, 'pointerup', 100, 90)

    expect(controller.selection.single).toBe(rect)
    const ops = controller.drawOps()
    expect(ops.some((o) => o.type === 'polygon')).toBe(true)
    expect(ops.filter((o) => o.type === 'rect').length).toBeGreaterThanOrEqual(8)
    controller.destroy()
  })

  it('clears selection when clicking empty space', () => {
    const { stage, container } = makeStage()
    const rect = new Rect({ x: 50, y: 50, width: 40, height: 40, fill: '#f00' })
    stage.createLayer().add(rect)
    const controller = new SelectionController(stage)
    controller.selection.select(rect)

    dispatchPointer(container, 'pointerdown', 250, 250)
    dispatchPointer(container, 'pointerup', 250, 250)

    expect(controller.selection.isEmpty).toBe(true)
    controller.destroy()
  })

  it('moves the selected shape on drag', () => {
    const { stage, container } = makeStage()
    const rect = new Rect({ x: 50, y: 50, width: 60, height: 60, fill: '#f00' })
    stage.createLayer().add(rect)
    const controller = new SelectionController(stage)

    dispatchPointer(container, 'pointerdown', 70, 70)
    dispatchPointer(container, 'pointermove', 120, 110)
    dispatchPointer(container, 'pointerup', 120, 110)

    expect(rect.x).toBeCloseTo(100, 3)
    expect(rect.y).toBeCloseTo(90, 3)
    controller.destroy()
  })

  it('records a move as an undoable command when given a history', () => {
    const { stage, container } = makeStage()
    const rect = new Rect({ x: 50, y: 50, width: 60, height: 60, fill: '#f00' })
    stage.createLayer().add(rect)
    const history = new History()
    const controller = new SelectionController(stage, { history })

    dispatchPointer(container, 'pointerdown', 70, 70)
    dispatchPointer(container, 'pointermove', 120, 110)
    dispatchPointer(container, 'pointerup', 120, 110)
    expect(rect.x).toBeCloseTo(100, 3)
    expect(history.canUndo).toBe(true)

    history.undo()
    expect(rect.x).toBeCloseTo(50, 3)
    history.redo()
    expect(rect.x).toBeCloseTo(100, 3)
    controller.destroy()
  })
})
