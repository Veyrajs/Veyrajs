import { describe, expect, it } from 'vitest'
import { PolygonAnnotation } from './polygon-annotation'

const TRI = [
  { x: 0, y: 0 },
  { x: 40, y: 0 },
  { x: 20, y: 40 },
]

describe('PolygonAnnotation', () => {
  it('emits a closed polygon op for its points', () => {
    const poly = new PolygonAnnotation({ points: TRI, showLabel: false })
    const ops = poly.drawOps()
    const polyOp = ops.find((o) => o.type === 'polygon')
    expect(polyOp).toMatchObject({ type: 'polygon', closed: true })
    expect(polyOp?.type === 'polygon' && polyOp.points).toHaveLength(3)
  })

  it('exposes editable vertices and copies on set', () => {
    const poly = new PolygonAnnotation({ points: TRI })
    expect(poly.getVertices()).toHaveLength(3)
    const next = [...TRI, { x: 0, y: 40 }]
    poly.points = next
    expect(poly.points).toHaveLength(4)
    // setter deep-copies, so mutating the source array doesn't leak in
    next.push({ x: 99, y: 99 })
    expect(poly.points).toHaveLength(4)
  })

  it('hit-tests interior (fill) and edge (stroke)', () => {
    const poly = new PolygonAnnotation({ points: TRI })
    expect(poly.hitTest({ x: 20, y: 10 })).toBe('fill')
    expect(poly.hitTest({ x: 20, y: -1 })).toBe('stroke')
    expect(poly.hitTest({ x: 200, y: 200 })).toBeNull()
  })
})
