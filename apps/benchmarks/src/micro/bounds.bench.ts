import { Bounds, Matrix, type Vec2 } from '@annotacanvas/core'
import { bench, describe } from 'vitest'
import { blackhole } from '../blackhole'
import { buildNestedGroup, regularPolygon } from '../scene-factory'

const b1 = Bounds.fromRect(0, 0, 100, 50)
const b2 = Bounds.fromRect(60, 20, 80, 90)
const m = Matrix.compose({ x: 10, y: 5, rotation: 25, scaleX: 1.4, scaleY: 0.7 })
const poly: Vec2[] = regularPolygon(200, 120)

// A deep tree exercises the recursive local-bounds union (render bounds / hit broad-phase).
const { root } = buildNestedGroup(5, 4) // ~1024 leaves

describe('Bounds', () => {
  bench('union', () => {
    blackhole.n += b1.union(b2).width
  })
  bench('transform (AABB of a rotated box)', () => {
    blackhole.n += b1.transform(m).width
  })
  bench('fromPoints (200 vertices)', () => {
    blackhole.n += Bounds.fromPoints(poly).width
  })
  bench('Container.getLocalBounds (~1024 leaves, depth 5)', () => {
    blackhole.n += root.getLocalBounds().width
  })
})
