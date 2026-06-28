import { describe, expect, it } from 'vitest'
import { BoundingBox } from './bounding-box'

describe('BoundingBox', () => {
  it('emits one rect draw op for its geometry', () => {
    const box = new BoundingBox({ width: 40, height: 30, showLabel: false })
    const ops = box.drawOps()
    expect(ops).toHaveLength(1)
    expect(ops.find((o) => o.type === 'rect')).toMatchObject({
      type: 'rect',
      x: 0,
      y: 0,
      width: 40,
      height: 30,
    })
  })

  it('adds a label chip (background + text) when labeled', () => {
    const box = new BoundingBox({ width: 40, height: 30, label: 'car' })
    const ops = box.drawOps()
    expect(ops).toHaveLength(3)
    expect(ops.some((o) => o.type === 'text' && o.text === 'car')).toBe(true)
  })

  it('reports its bounds and four corner vertices', () => {
    const box = new BoundingBox({ width: 40, height: 30 })
    const b = box.getLocalBounds()
    expect([b.x, b.y, b.width, b.height]).toEqual([0, 0, 40, 30])
    expect(box.getVertices()).toEqual([
      { x: 0, y: 0 },
      { x: 40, y: 0 },
      { x: 40, y: 30 },
      { x: 0, y: 30 },
    ])
  })

  it('hit-tests fill, stroke, and misses', () => {
    const box = new BoundingBox({ width: 40, height: 30 })
    expect(box.hitTest({ x: 20, y: 15 })).toBe('fill')
    expect(box.hitTest({ x: -1, y: 15 })).toBe('stroke')
    expect(box.hitTest({ x: 200, y: 200 })).toBeNull()
  })

  it('applies a default stroke that config overrides', () => {
    expect(new BoundingBox().stroke).toBe('#2563eb')
    expect(new BoundingBox({ stroke: '#f00' }).stroke).toBe('#f00')
  })
})
