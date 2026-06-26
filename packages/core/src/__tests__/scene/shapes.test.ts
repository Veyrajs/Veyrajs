import { describe, expect, it } from 'vitest'
import { Circle, Ellipse, Image, Line, Polygon, Rect, Text } from '../../index'

describe('concrete shapes', () => {
  it('Rect: top-left bounds, rect op, AABB hit', () => {
    const r = new Rect({ width: 40, height: 20, fill: '#f00' })
    expect(r.getLocalBounds()).toMatchObject({ x: 0, y: 0, width: 40, height: 20 })
    expect(r.drawOps()[0]).toMatchObject({ type: 'rect', width: 40, height: 20, fill: '#f00' })
    expect(r.containsPoint({ x: 10, y: 10 })).toBe(true)
    expect(r.containsPoint({ x: 50, y: 10 })).toBe(false)
  })

  it('Circle: centered bounds and radial hit', () => {
    const c = new Circle({ radius: 10 })
    expect(c.getLocalBounds()).toMatchObject({ x: -10, y: -10, width: 20, height: 20 })
    expect(c.drawOps()[0]).toMatchObject({ type: 'ellipse', radiusX: 10, radiusY: 10 })
    expect(c.containsPoint({ x: 6, y: 6 })).toBe(true)
    expect(c.containsPoint({ x: 8, y: 8 })).toBe(false)
  })

  it('Ellipse: normalized radial hit', () => {
    const e = new Ellipse({ radiusX: 20, radiusY: 10 })
    expect(e.getLocalBounds()).toMatchObject({ x: -20, y: -10, width: 40, height: 20 })
    expect(e.containsPoint({ x: 0, y: 9 })).toBe(true)
    expect(e.containsPoint({ x: 0, y: 11 })).toBe(false)
    expect(e.containsPoint({ x: 19, y: 0 })).toBe(true)
  })

  it('Line: open polyline op and near-stroke hit', () => {
    const l = new Line({
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      strokeWidth: 4,
    })
    expect(l.getLocalBounds()).toMatchObject({ x: 0, y: 0, width: 100, height: 0 })
    expect(l.drawOps()[0]).toMatchObject({ type: 'polygon', closed: false })
    expect(l.containsPoint({ x: 50, y: 1 })).toBe(true)
    expect(l.containsPoint({ x: 50, y: 5 })).toBe(false)
  })

  it('Polygon: closed op and fill hit', () => {
    const p = new Polygon({
      points: [
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 10, y: 20 },
      ],
      fill: '#0f0',
    })
    expect(p.getLocalBounds()).toMatchObject({ x: 0, y: 0, width: 20, height: 20 })
    expect(p.drawOps()[0]).toMatchObject({ type: 'polygon', closed: true })
    expect(p.containsPoint({ x: 10, y: 5 })).toBe(true)
    expect(p.containsPoint({ x: 0, y: 19 })).toBe(false)
  })

  it('Image: no op without a source', () => {
    const img = new Image({ width: 30, height: 20 })
    expect(img.drawOps()).toEqual([])
    expect(img.getLocalBounds()).toMatchObject({ x: 0, y: 0, width: 30, height: 20 })
    expect(img.containsPoint({ x: 5, y: 5 })).toBe(true)
  })

  it('Text: defaults to black fill, emits a text op', () => {
    const t = new Text({ text: 'hi', fontSize: 20 })
    expect(t.fill).toBe('#000')
    expect(t.drawOps()[0]).toMatchObject({
      type: 'text',
      text: 'hi',
      font: '20px sans-serif',
      textBaseline: 'top',
    })
    expect(t.getLocalBounds().width).toBeGreaterThan(0)
  })
})
