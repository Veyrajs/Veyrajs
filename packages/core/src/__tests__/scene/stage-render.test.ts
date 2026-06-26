import { describe, expect, it } from 'vitest'
import { type Layer, Stage } from '../../index'
import { MockRenderer } from '../helpers/mock-renderer'
import { TestRect } from '../helpers/test-rect'

function makeStage(renderer: MockRenderer): Stage {
  const container = document.createElement('div')
  return new Stage({ container, width: 200, height: 100, pixelRatio: 2, renderer })
}

describe('stage render lifecycle', () => {
  it('renders once on construction and sizes the renderer', () => {
    const r = new MockRenderer()
    const stage = makeStage(r)
    expect(r.size).toEqual({ width: 200, height: 100, pixelRatio: 2 })
    expect(r.beginCount).toBe(1)
    expect(r.endCount).toBe(1)
    expect(r.calls).toEqual([])
    stage.destroy()
    expect(r.destroyed).toBe(true)
  })

  it('draws shapes in depth-first z-order', () => {
    const r = new MockRenderer()
    const stage = makeStage(r)
    const layer = stage.createLayer()
    const a = new TestRect({ width: 10, height: 10 })
    const b = new TestRect({ width: 10, height: 10 })
    layer.add(a, b)
    stage.render()
    expect(r.rendered).toEqual([a, b])
  })

  it('skips invisible and fully transparent nodes', () => {
    const r = new MockRenderer()
    const stage = makeStage(r)
    const layer = stage.createLayer()
    const visibleRect = new TestRect({ width: 10, height: 10 })
    const hidden = new TestRect({ visible: false, width: 10, height: 10 })
    const transparent = new TestRect({ opacity: 0, width: 10, height: 10 })
    layer.add(visibleRect, hidden, transparent)
    stage.render()
    expect(r.rendered).toEqual([visibleRect])
  })

  it('passes the world matrix to the renderer', () => {
    const r = new MockRenderer()
    const stage = makeStage(r)
    const layer = stage.createLayer()
    layer.add(new TestRect({ x: 30, y: 40, width: 10, height: 10 }))
    stage.render()
    expect(r.calls).toHaveLength(1)
    expect(r.calls[0]?.world.applyToPoint({ x: 0, y: 0 })).toEqual({ x: 30, y: 40 })
  })

  it('enforces Layer-only stage children', () => {
    const stage = makeStage(new MockRenderer())
    expect(() => stage.add(new TestRect() as unknown as Layer)).toThrow(TypeError)
  })

  it('updates size via setSize', () => {
    const r = new MockRenderer()
    const stage = makeStage(r)
    stage.setSize(400, 300)
    expect(r.size).toEqual({ width: 400, height: 300, pixelRatio: 2 })
    expect(stage.width).toBe(400)
  })

  it('applies the camera view to rendered matrices', () => {
    const r = new MockRenderer()
    const stage = makeStage(r)
    stage.camera.setZoom(2)
    stage.camera.panTo(100, 50)
    const layer = stage.createLayer()
    layer.add(new TestRect({ x: 10, y: 10, width: 5, height: 5 }))
    stage.render()
    // screen = view · world; rect world origin is (10,10); view maps 2·world + (100,50)
    expect(r.calls[0]?.world.applyToPoint({ x: 0, y: 0 })).toEqual({ x: 120, y: 70 })
  })
})
