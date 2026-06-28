import { describe, expect, it } from 'vitest'
import { PointAnnotation } from './point-annotation'

describe('PointAnnotation', () => {
  it('draws a ring marker at the origin', () => {
    const pt = new PointAnnotation({ radius: 6, showLabel: false })
    const op = pt.drawOps().find((o) => o.type === 'ellipse')
    expect(op).toMatchObject({ type: 'ellipse', x: 0, y: 0, radiusX: 6, radiusY: 6 })
  })

  it('hit-tests within the marker radius', () => {
    const pt = new PointAnnotation({ radius: 6 })
    expect(pt.hitTest({ x: 3, y: 0 })).toBe('fill')
    expect(pt.hitTest({ x: 40, y: 40 })).toBeNull()
  })

  it('bounds enclose the marker', () => {
    const b = new PointAnnotation({ radius: 6 }).getLocalBounds()
    expect([b.x, b.y, b.width, b.height]).toEqual([-6, -6, 12, 12])
  })
})
