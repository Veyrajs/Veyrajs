import { describe, expect, it } from 'vitest'
import { type Node, SceneEvent, dispatchEvent } from '../../index'
import { TestRect } from '../helpers/test-rect'

function clickEvent(target: Node): SceneEvent {
  return new SceneEvent({
    type: 'click',
    target,
    screenPoint: { x: 0, y: 0 },
    worldPoint: { x: 0, y: 0 },
    nativeEvent: null,
  })
}

describe('node listeners', () => {
  it('on adds and off removes a listener', () => {
    const n = new TestRect()
    let count = 0
    const handler = () => {
      count += 1
    }
    n.on('click', handler)
    dispatchEvent(clickEvent(n), [n])
    expect(count).toBe(1)

    n.off('click', handler)
    dispatchEvent(clickEvent(n), [n])
    expect(count).toBe(1)
  })

  it('once fires only a single time', () => {
    const n = new TestRect()
    let count = 0
    n.once('click', () => {
      count += 1
    })
    dispatchEvent(clickEvent(n), [n])
    dispatchEvent(clickEvent(n), [n])
    expect(count).toBe(1)
  })

  it('off without a handler removes all listeners of a type', () => {
    const n = new TestRect()
    let count = 0
    n.on('click', () => {
      count += 1
    })
    n.on('click', () => {
      count += 1
    })
    n.off('click')
    dispatchEvent(clickEvent(n), [n])
    expect(count).toBe(0)
  })

  it('hasListeners reflects registration', () => {
    const n = new TestRect()
    expect(n.hasListeners('click')).toBe(false)
    n.on('click', () => {})
    expect(n.hasListeners('click')).toBe(true)
  })
})
