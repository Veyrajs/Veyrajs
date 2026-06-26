import { describe, expect, it } from 'vitest'
import { distanceToPolyline, distanceToSegment, pointInPolygon } from '../../index'

const square = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
]

describe('geometry', () => {
  it('pointInPolygon detects inside vs outside', () => {
    expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true)
    expect(pointInPolygon({ x: 15, y: 5 }, square)).toBe(false)
    expect(pointInPolygon({ x: -1, y: 5 }, square)).toBe(false)
  })

  it('distanceToSegment projects and clamps to endpoints', () => {
    expect(distanceToSegment({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(5)
    expect(distanceToSegment({ x: -5, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(5)
    expect(distanceToSegment({ x: 5, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(0)
  })

  it('distanceToPolyline measures to the nearest edge', () => {
    expect(distanceToPolyline({ x: 5, y: 3 }, square, false)).toBeCloseTo(3, 9)
    expect(distanceToPolyline({ x: 5, y: -2 }, square, true)).toBeCloseTo(2, 9)
  })
})
