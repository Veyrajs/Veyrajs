import { beforeEach, describe, expect, it } from 'vitest'
import { resetIdCounter } from '../../id'
import { Group } from '../../index'
import { TestRect } from '../helpers/test-rect'

describe('scene graph', () => {
  beforeEach(() => resetIdCounter())

  it('adds and parents children', () => {
    const group = new Group()
    const rect = new TestRect()
    group.add(rect)
    expect(rect.parent).toBe(group)
    expect(group.children).toEqual([rect])
    expect(group.childCount).toBe(1)
  })

  it('re-parents on add (detaching from the previous parent)', () => {
    const a = new Group()
    const b = new Group()
    const rect = new TestRect()
    a.add(rect)
    b.add(rect)
    expect(a.children).toEqual([])
    expect(b.children).toEqual([rect])
    expect(rect.parent).toBe(b)
  })

  it('removes children', () => {
    const g = new Group()
    const r = new TestRect()
    g.add(r)
    r.remove()
    expect(g.children).toEqual([])
    expect(r.parent).toBeNull()
  })

  it('prevents cycles and self-parenting', () => {
    const a = new Group()
    const b = new Group()
    a.add(b)
    expect(() => b.add(a)).toThrow()
    expect(() => a.add(a)).toThrow()
  })

  it('reorders z-index', () => {
    const g = new Group()
    const r1 = new TestRect()
    const r2 = new TestRect()
    const r3 = new TestRect()
    g.add(r1, r2, r3)
    g.moveToTop(r1)
    expect(g.children).toEqual([r2, r3, r1])
    g.moveToBottom(r1)
    expect(g.children).toEqual([r1, r2, r3])
    g.moveUp(r1)
    expect(g.children).toEqual([r2, r1, r3])
    g.moveDown(r1)
    expect(g.children).toEqual([r1, r2, r3])
  })

  it('traverses and finds depth-first', () => {
    const root = new Group()
    const mid = new Group()
    const leaf = new TestRect({ name: 'leaf' })
    root.add(mid)
    mid.add(leaf)

    const visited: string[] = []
    root.traverse((n) => visited.push(n.type))
    expect(visited).toEqual(['Group', 'TestRect'])

    expect(root.find((n) => n.name === 'leaf')).toBe(leaf)
    expect(root.getDescendants()).toEqual([mid, leaf])
    expect(root.isAncestorOf(leaf)).toBe(true)
    expect(mid.isAncestorOf(root)).toBe(false)
  })

  it('computes the union of child local bounds', () => {
    const g = new Group()
    g.add(
      new TestRect({ width: 10, height: 10 }),
      new TestRect({ x: 20, y: 5, width: 10, height: 10 }),
    )
    expect(g.getLocalBounds()).toMatchObject({ x: 0, y: 0, width: 30, height: 15 })
  })
})
