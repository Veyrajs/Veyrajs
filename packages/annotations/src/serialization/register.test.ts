import { SceneSerializer } from '@veyrajs/core'
import { describe, expect, it } from 'vitest'
import { BoundingBox } from '../nodes/bounding-box'
import { registerAnnotations } from './register'

describe('registerAnnotations', () => {
  it('round-trips a BoundingBox through the serializer', () => {
    const box = new BoundingBox({
      x: 5,
      y: 6,
      width: 40,
      height: 30,
      label: 'car',
      stroke: '#ff0000',
    })
    const serializer = new SceneSerializer({ registry: registerAnnotations() })

    const restored = serializer.fromObject(box.toObject())

    expect(restored).toBeInstanceOf(BoundingBox)
    const r = restored as BoundingBox
    expect(r.x).toBe(5)
    expect(r.y).toBe(6)
    expect(r.width).toBe(40)
    expect(r.height).toBe(30)
    expect(r.label).toBe('car')
    expect(r.stroke).toBe('#ff0000')
  })
})
