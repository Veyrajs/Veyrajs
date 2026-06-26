import { describe, expect, it } from 'vitest'
import { CompositeCommand, History, SetPropsCommand } from '../../index'
import { TestRect } from '../helpers/test-rect'

describe('commands & history', () => {
  it('SetPropsCommand applies and reverts', () => {
    const node = new TestRect({ x: 0, y: 0 })
    const command = new SetPropsCommand(node, { x: 0, y: 0 }, { x: 50, y: 60 })
    command.do()
    expect(node.x).toBe(50)
    expect(node.y).toBe(60)
    command.undo()
    expect(node.x).toBe(0)
    expect(node.y).toBe(0)
  })

  it('History run / undo / redo', () => {
    const node = new TestRect()
    const history = new History()
    history.run(new SetPropsCommand(node, { x: 0 }, { x: 10 }))
    expect(node.x).toBe(10)
    expect(history.canUndo).toBe(true)
    expect(history.canRedo).toBe(false)

    history.undo()
    expect(node.x).toBe(0)
    expect(history.canRedo).toBe(true)

    history.redo()
    expect(node.x).toBe(10)
  })

  it('a new command clears the redo stack', () => {
    const node = new TestRect()
    const history = new History()
    history.run(new SetPropsCommand(node, { x: 0 }, { x: 10 }))
    history.undo()
    expect(history.canRedo).toBe(true)
    history.run(new SetPropsCommand(node, { x: 0 }, { x: 20 }))
    expect(history.canRedo).toBe(false)
  })

  it('CompositeCommand undoes in reverse order', () => {
    const a = new TestRect()
    const b = new TestRect()
    const command = new CompositeCommand([
      new SetPropsCommand(a, { x: 0 }, { x: 1 }),
      new SetPropsCommand(b, { x: 0 }, { x: 2 }),
    ])
    command.do()
    expect([a.x, b.x]).toEqual([1, 2])
    command.undo()
    expect([a.x, b.x]).toEqual([0, 0])
  })

  it('onChange fires on stack changes', () => {
    const history = new History()
    let count = 0
    const off = history.onChange(() => {
      count += 1
    })
    history.run(new SetPropsCommand(new TestRect(), {}, { x: 1 }))
    history.undo()
    expect(count).toBe(2)
    off()
  })
})
