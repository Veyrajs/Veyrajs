import { describe, expect, it } from 'vitest'
import { Group } from '../../index'
import { TestRect } from '../helpers/test-rect'

describe('node transforms', () => {
  it('builds the local matrix from properties', () => {
    const r = new TestRect({ x: 10, y: 20, scaleX: 2, scaleY: 2 })
    expect(r.localMatrix().applyToPoint({ x: 1, y: 1 })).toEqual({ x: 12, y: 22 })
  })

  it('cascades the world transform through ancestors', () => {
    const g = new Group({ x: 100 })
    const r = new TestRect({ x: 10 })
    g.add(r)
    expect(r.worldMatrix().applyToPoint({ x: 0, y: 0 })).toEqual({ x: 110, y: 0 })
  })

  it('caches the world matrix until an ancestor changes', () => {
    const g = new Group({ x: 100 })
    const r = new TestRect({ x: 10 })
    g.add(r)
    const m1 = r.worldMatrix()
    expect(r.worldMatrix()).toBe(m1) // cached instance

    g.x = 200
    const m3 = r.worldMatrix()
    expect(m3).not.toBe(m1)
    expect(m3.applyToPoint({ x: 0, y: 0 })).toEqual({ x: 210, y: 0 })
  })

  it('does not recompute a node when an unrelated sibling changes', () => {
    const g = new Group()
    const a = new TestRect({ x: 10 })
    const b = new TestRect({ x: 50 })
    g.add(a, b)
    const aWorld = a.worldMatrix()
    b.x = 999 // mutate sibling only
    expect(a.worldMatrix()).toBe(aWorld) // no eager global invalidation
  })

  it('invalidates the world transform on reparent', () => {
    const g1 = new Group({ x: 100 })
    const g2 = new Group({ x: 200 })
    const r = new TestRect({ x: 10 })
    g1.add(r)
    expect(r.worldMatrix().applyToPoint({ x: 0, y: 0 }).x).toBe(110)
    g2.add(r)
    expect(r.worldMatrix().applyToPoint({ x: 0, y: 0 }).x).toBe(210)
  })

  it('computes world bounds through the transform', () => {
    const g = new Group({ x: 100, y: 50 })
    const r = new TestRect({ x: 10, y: 10, width: 20, height: 30 })
    g.add(r)
    expect(r.getWorldBounds()).toMatchObject({ x: 110, y: 60, width: 20, height: 30 })
  })
})
