import { describe, expect, it } from 'vitest'
import { computeResize, computeRotation, pointerAngle } from '../../index'
import { TestRect } from '../helpers/test-rect'

describe('transform math', () => {
  it('resize: drags the handle to the pointer with the anchor fixed (no rotation)', () => {
    const node = new TestRect({ width: 100, height: 100 })
    const handleLocal = { x: 100, y: 100 } // br
    const anchorLocal = { x: 0, y: 0 } // tl
    const anchorParent = node.localMatrix().applyToPoint(anchorLocal)
    const result = computeResize(
      { node, handleLocal, anchorLocal, anchorParent },
      { x: 200, y: 200 },
    )
    expect(result).toEqual({ x: 0, y: 0, scaleX: 2, scaleY: 2 })
  })

  it('resize: keeps the anchor fixed and moves the handle to the pointer (rotated)', () => {
    const node = new TestRect({ width: 100, height: 100, rotation: 30, x: 20, y: 40 })
    const handleLocal = { x: 100, y: 100 }
    const anchorLocal = { x: 0, y: 0 }
    const anchorParent = node.localMatrix().applyToPoint(anchorLocal)
    const pointer = { x: 150, y: 90 }

    const result = computeResize({ node, handleLocal, anchorLocal, anchorParent }, pointer)
    node.x = result.x
    node.y = result.y
    node.scaleX = result.scaleX
    node.scaleY = result.scaleY

    const anchorWorld = node.worldMatrix().applyToPoint(anchorLocal)
    expect(anchorWorld.x).toBeCloseTo(anchorParent.x, 6)
    expect(anchorWorld.y).toBeCloseTo(anchorParent.y, 6)

    const handleWorld = node.worldMatrix().applyToPoint(handleLocal)
    expect(handleWorld.x).toBeCloseTo(pointer.x, 6)
    expect(handleWorld.y).toBeCloseTo(pointer.y, 6)
  })

  it('resize: edge handle scales only one axis', () => {
    const node = new TestRect({ width: 100, height: 100 })
    // mt handle: (50,0), anchor mb: (50,100) → only Y changes
    const result = computeResize(
      {
        node,
        handleLocal: { x: 50, y: 0 },
        anchorLocal: { x: 50, y: 100 },
        anchorParent: { x: 50, y: 100 },
      },
      { x: 50, y: -100 },
    )
    expect(result.scaleX).toBe(1)
    expect(result.scaleY).toBe(2)
  })

  it('rotate: keeps the center fixed and applies the angle delta', () => {
    const node = new TestRect({ width: 100, height: 100 })
    const centerLocal = { x: 50, y: 50 }
    const centerParent = node.localMatrix().applyToPoint(centerLocal)
    const startAngle = pointerAngle(node, centerParent, { x: 150, y: 50 }) // angle 0 (to the right)

    const result = computeRotation(
      { node, centerLocal, centerParent, startAngle, startRotation: 0 },
      { x: 50, y: 150 }, // below center → +90° clockwise (y-down)
    )
    node.rotation = result.rotation
    node.x = result.x
    node.y = result.y

    expect(result.rotation).toBeCloseTo(90, 4)
    const centerWorld = node.worldMatrix().applyToPoint(centerLocal)
    expect(centerWorld.x).toBeCloseTo(centerParent.x, 6)
    expect(centerWorld.y).toBeCloseTo(centerParent.y, 6)
  })
})
