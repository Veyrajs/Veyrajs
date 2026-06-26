import { describe, expect, it } from 'vitest'
import { Line, Polygon, Rect, Stage } from '../../index'
import { MockRenderer } from '../helpers/mock-renderer'

function makeStage(): Stage {
  const container = document.createElement('div')
  return new Stage({ container, width: 400, height: 400, renderer: new MockRenderer() })
}

describe('GeometricHitTester (via Stage.hitTest)', () => {
  it('returns the topmost shape (reverse z-order)', () => {
    const stage = makeStage()
    const layer = stage.createLayer()
    const bottom = new Rect({ x: 0, y: 0, width: 100, height: 100, fill: '#f00' })
    const top = new Rect({ x: 0, y: 0, width: 100, height: 100, fill: '#0f0' })
    layer.add(bottom, top)
    const hit = stage.hitTest({ x: 50, y: 50 })
    expect(hit?.node).toBe(top)
    expect(hit?.type).toBe('fill')
  })

  it('honors fill vs stroke options', () => {
    const stage = makeStage()
    const rect = new Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: '#f00',
      stroke: '#000',
      strokeWidth: 2,
    })
    stage.createLayer().add(rect)
    expect(stage.hitTest({ x: 50, y: 50 })?.type).toBe('fill')
    expect(stage.hitTest({ x: 50, y: 50 }, { fill: false })).toBeNull()
    expect(stage.hitTest({ x: 0, y: 50 }, { fill: false, tolerance: 2 })?.type).toBe('stroke')
  })

  it('returns vertex hits when requested', () => {
    const stage = makeStage()
    const rect = new Rect({ x: 0, y: 0, width: 100, height: 100, fill: '#f00' })
    stage.createLayer().add(rect)
    const hit = stage.hitTest({ x: 100, y: 100 }, { vertices: true, tolerance: 5 })
    expect(hit?.type).toBe('vertex')
    expect(hit?.vertexIndex).toBe(2) // corner (width, height)
  })

  it('returns bounds hits when fill/stroke miss but bounds is enabled', () => {
    const stage = makeStage()
    const tri = new Polygon({
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 },
      ],
      fill: '#0f0',
    })
    stage.createLayer().add(tri)
    expect(stage.hitTest({ x: 5, y: 95 })).toBeNull()
    expect(stage.hitTest({ x: 5, y: 95 }, { bounds: true })?.type).toBe('bounds')
  })

  it('uses a zoom-invariant screen-pixel tolerance', () => {
    const stage = makeStage()
    const line = new Line({
      points: [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
      ],
      stroke: '#000',
      strokeWidth: 0,
    })
    stage.createLayer().add(line)
    const p = { x: 100, y: 5 } // 5 world units below the line

    // zoom 1: 5 world units = 5 screen px → 4px tolerance misses, 6px hits
    expect(stage.hitTest(p, { tolerance: 4 })).toBeNull()
    expect(stage.hitTest(p, { tolerance: 6 })?.type).toBe('stroke')

    // zoom 0.5: 5 world units = 2.5 screen px → the same 4px tolerance now hits
    stage.camera.setZoom(0.5)
    expect(stage.hitTest(p, { tolerance: 4 })?.type).toBe('stroke')
  })

  it('respects the match predicate', () => {
    const stage = makeStage()
    const layer = stage.createLayer()
    const a = new Rect({ name: 'a', x: 0, y: 0, width: 100, height: 100, fill: '#f00' })
    const b = new Rect({ name: 'b', x: 0, y: 0, width: 100, height: 100, fill: '#0f0' })
    layer.add(a, b)
    expect(stage.hitTest({ x: 50, y: 50 })?.node).toBe(b)
    expect(stage.hitTest({ x: 50, y: 50 }, { match: (n) => n.name === 'a' })?.node).toBe(a)
  })

  it('skips non-listening nodes; getIntersection returns the node', () => {
    const stage = makeStage()
    const rect = new Rect({ x: 0, y: 0, width: 50, height: 50, fill: '#f00' })
    stage.createLayer().add(rect)
    expect(stage.getIntersection({ x: 25, y: 25 })).toBe(rect)
    expect(stage.getIntersection({ x: 100, y: 100 })).toBeNull()
    rect.listening = false
    expect(stage.getIntersection({ x: 25, y: 25 })).toBeNull()
  })
})
