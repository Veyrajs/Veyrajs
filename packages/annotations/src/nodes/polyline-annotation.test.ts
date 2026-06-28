import { describe, expect, it } from 'vitest'
import { PolylineAnnotation } from './polyline-annotation'

const PTS = [
  { x: 0, y: 0 },
  { x: 40, y: 0 },
  { x: 40, y: 40 },
]

describe('PolylineAnnotation', () => {
  it('emits an open polygon op (closed: false)', () => {
    const line = new PolylineAnnotation({ points: PTS, showLabel: false })
    const op = line.drawOps().find((o) => o.type === 'polygon')
    expect(op).toMatchObject({ type: 'polygon', closed: false })
  })

  it('hit-tests along the line only (no fill)', () => {
    const line = new PolylineAnnotation({ points: PTS })
    expect(line.hitTest({ x: 20, y: 0 })).toBe('stroke')
    // a point "inside" the L-shape is NOT a hit — a polyline has no interior
    expect(line.hitTest({ x: 10, y: 20 })).toBeNull()
  })

  it('exposes editable vertices', () => {
    const line = new PolylineAnnotation({ points: PTS })
    expect(line.getVertices()).toHaveLength(3)
  })
})
