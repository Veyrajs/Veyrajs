import { describe, expect, it } from 'vitest'
import { Bounds, Matrix } from '../../math'

describe('Bounds', () => {
  it('computes the AABB of a point set', () => {
    const b = Bounds.fromPoints([
      { x: 2, y: 5 },
      { x: -1, y: 8 },
      { x: 4, y: 0 },
    ])
    expect(b).toMatchObject({ x: -1, y: 0, width: 5, height: 8 })
  })

  it('reports right/bottom edges', () => {
    const b = Bounds.fromRect(10, 20, 30, 40)
    expect(b.right).toBe(40)
    expect(b.bottom).toBe(60)
  })

  it('contains points inside (inclusive of edges)', () => {
    const b = Bounds.fromRect(0, 0, 10, 10)
    expect(b.contains({ x: 5, y: 5 })).toBe(true)
    expect(b.contains({ x: 10, y: 10 })).toBe(true)
    expect(b.contains({ x: 11, y: 5 })).toBe(false)
  })

  it('detects intersection', () => {
    const a = Bounds.fromRect(0, 0, 10, 10)
    expect(a.intersects(Bounds.fromRect(5, 5, 10, 10))).toBe(true)
    expect(a.intersects(Bounds.fromRect(20, 20, 5, 5))).toBe(false)
  })

  it('unions boxes and treats empty as the identity', () => {
    const a = Bounds.fromRect(0, 0, 10, 10)
    const b = Bounds.fromRect(20, 5, 10, 10)
    expect(a.union(b)).toMatchObject({ x: 0, y: 0, width: 30, height: 15 })
    expect(a.union(Bounds.empty())).toBe(a)
    expect(Bounds.empty().union(a)).toBe(a)
  })

  it('transforms to the AABB of rotated corners', () => {
    const b = Bounds.fromRect(0, 0, 10, 20).transform(Matrix.rotation(90))
    expect(b.x).toBeCloseTo(-20, 9)
    expect(b.y).toBeCloseTo(0, 9)
    expect(b.width).toBeCloseTo(20, 9)
    expect(b.height).toBeCloseTo(10, 9)
  })
})
