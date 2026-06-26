import { describe, expect, it } from 'vitest'
import { SelectionManager } from '../../index'
import { TestRect } from '../helpers/test-rect'

describe('SelectionManager', () => {
  it('selects, reports single, and clears', () => {
    const sm = new SelectionManager()
    const a = new TestRect()
    expect(sm.isEmpty).toBe(true)
    sm.select(a)
    expect(sm.has(a)).toBe(true)
    expect(sm.single).toBe(a)
    sm.clear()
    expect(sm.isEmpty).toBe(true)
    expect(sm.single).toBeNull()
  })

  it('add / remove / toggle', () => {
    const sm = new SelectionManager()
    const a = new TestRect()
    const b = new TestRect()
    sm.add(a, b)
    expect(sm.size).toBe(2)
    expect(sm.single).toBeNull()
    sm.remove(a)
    expect(sm.nodes).toEqual([b])
    sm.toggle(a)
    expect(sm.has(a)).toBe(true)
    sm.toggle(a)
    expect(sm.has(a)).toBe(false)
  })

  it('set deduplicates', () => {
    const sm = new SelectionManager()
    const a = new TestRect()
    sm.set([a, a])
    expect(sm.nodes).toEqual([a])
  })

  it('notifies on change but not on a no-op, and unsubscribes', () => {
    const sm = new SelectionManager()
    const a = new TestRect()
    let count = 0
    const off = sm.onChange(() => {
      count += 1
    })
    sm.select(a)
    expect(count).toBe(1)
    sm.select(a) // same set → no emit
    expect(count).toBe(1)
    off()
    sm.clear()
    expect(count).toBe(1)
  })
})
