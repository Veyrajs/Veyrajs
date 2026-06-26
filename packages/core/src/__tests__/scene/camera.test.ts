import { describe, expect, it } from 'vitest'
import { Camera } from '../../index'

describe('Camera', () => {
  it('is identity by default', () => {
    const c = new Camera()
    expect(c.worldToScreen({ x: 10, y: 20 })).toEqual({ x: 10, y: 20 })
  })

  it('maps world to screen with zoom and pan', () => {
    const c = new Camera({ zoom: 2, x: 100, y: 50 })
    expect(c.worldToScreen({ x: 10, y: 10 })).toEqual({ x: 120, y: 70 })
  })

  it('screenToWorld inverts worldToScreen', () => {
    const c = new Camera({ zoom: 1.5, x: 30, y: -20 })
    const back = c.screenToWorld(c.worldToScreen({ x: 7, y: 9 }))
    expect(back.x).toBeCloseTo(7, 9)
    expect(back.y).toBeCloseTo(9, 9)
  })

  it('pans by a screen delta', () => {
    const c = new Camera()
    c.panBy(40, -10)
    expect(c.worldToScreen({ x: 0, y: 0 })).toEqual({ x: 40, y: -10 })
  })

  it('zooms about an anchor, keeping its world point fixed', () => {
    const c = new Camera({ x: 25, y: 15 })
    const anchor = { x: 200, y: 150 }
    const before = c.screenToWorld(anchor)
    c.zoomAt(anchor, 2)
    expect(c.zoom).toBe(2)
    const after = c.screenToWorld(anchor)
    expect(after.x).toBeCloseTo(before.x, 9)
    expect(after.y).toBeCloseTo(before.y, 9)
  })

  it('clamps zoom to the configured range', () => {
    const c = new Camera({ minZoom: 0.5, maxZoom: 4 })
    c.setZoom(100)
    expect(c.zoom).toBe(4)
    c.setZoom(0.01)
    expect(c.zoom).toBe(0.5)
  })

  it('notifies onChange on mutation', () => {
    const c = new Camera()
    let count = 0
    c.onChange = () => {
      count += 1
    }
    c.panBy(1, 0)
    c.setZoom(2)
    expect(count).toBe(2)
  })

  it('resets to identity', () => {
    const c = new Camera({ zoom: 3, x: 50, y: 50 })
    c.reset()
    expect(c.zoom).toBe(1)
    expect(c.worldToScreen({ x: 5, y: 5 })).toEqual({ x: 5, y: 5 })
  })
})
