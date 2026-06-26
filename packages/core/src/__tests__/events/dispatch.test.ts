import { describe, expect, it } from 'vitest'
import { Group, type Node, SceneEvent, type SceneEventType, dispatchEvent } from '../../index'
import { TestRect } from '../helpers/test-rect'

function makeEvent(type: SceneEventType, target: Node, bubbles = true): SceneEvent {
  return new SceneEvent({
    type,
    target,
    screenPoint: { x: 0, y: 0 },
    worldPoint: { x: 0, y: 0 },
    nativeEvent: null,
    bubbles,
  })
}

function pathOf(node: Node): Node[] {
  const path: Node[] = []
  let n: Node | null = node
  while (n !== null) {
    path.push(n)
    n = n.parent
  }
  return path
}

describe('event dispatch', () => {
  it('runs capture → target → bubble in order', () => {
    const root = new Group()
    const mid = new Group()
    const leaf = new TestRect()
    root.add(mid)
    mid.add(leaf)

    const log: string[] = []
    root.on('click', () => log.push('root-capture'), { capture: true })
    mid.on('click', () => log.push('mid-capture'), { capture: true })
    leaf.on('click', () => log.push('leaf-target'))
    mid.on('click', () => log.push('mid-bubble'))
    root.on('click', () => log.push('root-bubble'))

    dispatchEvent(makeEvent('click', leaf), pathOf(leaf))
    expect(log).toEqual(['root-capture', 'mid-capture', 'leaf-target', 'mid-bubble', 'root-bubble'])
  })

  it('stopPropagation halts after the current node', () => {
    const root = new Group()
    const leaf = new TestRect()
    root.add(leaf)

    const log: string[] = []
    leaf.on('click', (e) => {
      log.push('leaf')
      e.stopPropagation()
    })
    root.on('click', () => log.push('root'))

    dispatchEvent(makeEvent('click', leaf), pathOf(leaf))
    expect(log).toEqual(['leaf'])
  })

  it('non-bubbling events do not reach ancestors', () => {
    const root = new Group()
    const leaf = new TestRect()
    root.add(leaf)

    const log: string[] = []
    leaf.on('pointerenter', () => log.push('leaf'))
    root.on('pointerenter', () => log.push('root'))

    dispatchEvent(makeEvent('pointerenter', leaf, false), pathOf(leaf))
    expect(log).toEqual(['leaf'])
  })

  it('updates currentTarget and resolves the local point', () => {
    const g = new Group({ x: 100 })
    const leaf = new TestRect({ x: 10, width: 5, height: 5 })
    g.add(leaf)

    let seenTarget: Node | null = null
    let seenLocalX = Number.NaN
    leaf.on('click', (e) => {
      seenTarget = e.currentTarget
      seenLocalX = e.getLocalPoint().x
    })

    const event = new SceneEvent({
      type: 'click',
      target: leaf,
      screenPoint: { x: 0, y: 0 },
      worldPoint: { x: 115, y: 0 },
      nativeEvent: null,
    })
    dispatchEvent(event, pathOf(leaf))

    expect(seenTarget).toBe(leaf)
    // leaf world origin = g(100) · leaf(10) = 110; local of world x=115 is 5
    expect(seenLocalX).toBeCloseTo(5, 9)
  })
})
