import { SceneSerializer } from '@veyrajs/core'
import { describe, expect, it } from 'vitest'
import { registerAnnotations } from '../serialization/register'
import type { SkeletonSchema } from '../skeletons/schema'
import { Skeleton } from './skeleton'

const SCHEMA: SkeletonSchema = {
  keypoints: ['a', 'b', 'c'],
  edges: [
    [0, 1],
    [1, 2],
  ],
}
const POINTS = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
]

describe('Skeleton', () => {
  it('draws a bone per edge and a marker per keypoint', () => {
    const skel = new Skeleton({ schema: SCHEMA, points: POINTS, showLabel: false })
    const ops = skel.drawOps()
    expect(ops.filter((o) => o.type === 'polygon')).toHaveLength(2)
    expect(ops.filter((o) => o.type === 'ellipse')).toHaveLength(3)
  })

  it('exposes keypoints as editable vertices', () => {
    expect(new Skeleton({ schema: SCHEMA, points: POINTS }).getVertices()).toHaveLength(3)
  })

  it('hit-tests keypoints (fill) and bones (stroke)', () => {
    const skel = new Skeleton({ schema: SCHEMA, points: POINTS })
    expect(skel.hitTest({ x: 0, y: 0 })).toBe('fill')
    expect(skel.hitTest({ x: 5, y: 0 })).toBe('stroke')
    expect(skel.hitTest({ x: 100, y: 100 })).toBeNull()
  })

  it('round-trips with its schema through the serializer', () => {
    const skel = new Skeleton({ schema: SCHEMA, points: POINTS, label: 'pose' })
    const serializer = new SceneSerializer({ registry: registerAnnotations() })
    const restored = serializer.fromObject(skel.toObject())
    expect(restored).toBeInstanceOf(Skeleton)
    const r = restored as Skeleton
    expect(r.schema.keypoints).toEqual(['a', 'b', 'c'])
    expect(r.points).toHaveLength(3)
    expect(r.label).toBe('pose')
  })
})
