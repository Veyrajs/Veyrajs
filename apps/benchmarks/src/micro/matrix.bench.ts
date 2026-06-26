import { Matrix, type Vec2 } from '@veyrajs/core'
import { bench, describe } from 'vitest'
import { blackhole } from '../blackhole'

// The 2×3 affine matrix is the primitive under every transform, bounds, and hit-test op.
const a = Matrix.compose({ x: 12, y: 34, rotation: 30, scaleX: 1.5, scaleY: 0.8 })
const b = Matrix.compose({ x: -5, y: 7, rotation: -12, skewX: 0.2 })
const p: Vec2 = { x: 3, y: 4 }

describe('Matrix', () => {
  bench('multiply', () => {
    blackhole.n += a.multiply(b).a
  })
  bench('compose (T·R·skew·S·pivot)', () => {
    blackhole.n += Matrix.compose({
      x: 1,
      y: 2,
      rotation: 45,
      scaleX: 2,
      scaleY: 2,
      skewX: 0.1,
      offsetX: 5,
      offsetY: 5,
    }).e
  })
  bench('invert', () => {
    blackhole.n += a.invert().a
  })
  bench('applyToPoint', () => {
    blackhole.n += a.applyToPoint(p).x
  })
})
