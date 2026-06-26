import { describe, expect, it } from 'vitest'
import { Matrix } from '../../math'

const EPS = 1e-9

describe('Matrix', () => {
  it('identity leaves points unchanged', () => {
    const p = Matrix.identity().applyToPoint({ x: 7, y: -3 })
    expect(p).toEqual({ x: 7, y: -3 })
  })

  it('translation moves points', () => {
    const p = Matrix.translation(10, -5).applyToPoint({ x: 1, y: 1 })
    expect(p).toEqual({ x: 11, y: -4 })
  })

  it('scaling scales points', () => {
    const p = Matrix.scaling(2, 3).applyToPoint({ x: 4, y: 5 })
    expect(p).toEqual({ x: 8, y: 15 })
  })

  it('rotation is clockwise in y-down space (90° maps +x to +y)', () => {
    const p = Matrix.rotation(90).applyToPoint({ x: 1, y: 0 })
    expect(p.x).toBeCloseTo(0, 12)
    expect(p.y).toBeCloseTo(1, 12)
  })

  it('multiply applies the right operand first (A·B = apply B, then A)', () => {
    // Scale by 2, then translate by (10, 0).
    const m = Matrix.translation(10, 0).multiply(Matrix.scaling(2, 2))
    expect(m.applyToPoint({ x: 1, y: 1 })).toEqual({ x: 12, y: 2 })
  })

  it('invert undoes a composed transform', () => {
    const m = Matrix.compose({ x: 30, y: -12, rotation: 37, scaleX: 1.5, scaleY: 0.8 })
    const round = m.multiply(m.invert())
    expect(round.equals(Matrix.identity(), 1e-9)).toBe(true)
  })

  it('inverse maps a transformed point back to the original', () => {
    const m = Matrix.compose({ x: 5, y: 9, rotation: 20, scaleX: 2, scaleY: 2 })
    const p = { x: 3, y: -4 }
    const back = m.invert().applyToPoint(m.applyToPoint(p))
    expect(back.x).toBeCloseTo(p.x, 9)
    expect(back.y).toBeCloseTo(p.y, 9)
  })

  it('throws when inverting a singular matrix', () => {
    expect(() => Matrix.scaling(0, 1).invert()).toThrow()
  })

  it('compose applies scale before translate', () => {
    const m = Matrix.compose({ x: 10, y: 0, scaleX: 2, scaleY: 2 })
    expect(m.applyToPoint({ x: 1, y: 1 })).toEqual({ x: 12, y: 2 })
  })

  it('compose offset acts as a pivot (origin maps to translation point)', () => {
    const m = Matrix.compose({ x: 0, y: 0, offsetX: 5, offsetY: 5 })
    expect(m.applyToPoint({ x: 5, y: 5 })).toEqual({ x: 0, y: 0 })
  })

  it('round-trips through array form', () => {
    const m = Matrix.compose({ x: 1, y: 2, rotation: 45, scaleX: 3, skewX: 0.2 })
    expect(Matrix.fromArray(m.toArray()).equals(m, EPS)).toBe(true)
  })
})
