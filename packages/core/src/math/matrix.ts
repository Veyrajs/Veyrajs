import type { Vec2 } from './vec2'

/** Components of a 2×3 affine matrix used to build/compose transforms. */
export interface MatrixComponents {
  /** Translation x. */
  x?: number
  /** Translation y. */
  y?: number
  /** Rotation in degrees (clockwise; y-down convention). */
  rotation?: number
  scaleX?: number
  scaleY?: number
  /** Shear factor along x (not an angle). */
  skewX?: number
  /** Shear factor along y (not an angle). */
  skewY?: number
  /** Local origin x, subtracted before rotation/scale (pivot). */
  offsetX?: number
  /** Local origin y. */
  offsetY?: number
}

const DEG_TO_RAD = Math.PI / 180

/**
 * Immutable 2×3 affine transform, stored Canvas-native as `[a, b, c, d, e, f]`:
 *
 * ```
 * | a c e |        x' = a·x + c·y + e
 * | b d f |        y' = b·x + d·y + f
 * | 0 0 1 |
 * ```
 *
 * Composition convention: `A.multiply(B)` returns the product `A · B`, i.e. "apply `B`
 * first, then `A`". This makes `worldMatrix = parentWorld.multiply(localMatrix)` read
 * correctly — local space first, then up through ancestors.
 *
 * All methods return a new `Matrix`; instances are never mutated.
 */
export class Matrix {
  readonly a: number
  readonly b: number
  readonly c: number
  readonly d: number
  readonly e: number
  readonly f: number

  constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.e = e
    this.f = f
  }

  static identity(): Matrix {
    return IDENTITY
  }

  static translation(x: number, y: number): Matrix {
    return new Matrix(1, 0, 0, 1, x, y)
  }

  static scaling(sx: number, sy: number): Matrix {
    return new Matrix(sx, 0, 0, sy, 0, 0)
  }

  /** Rotation by `degrees` (clockwise in the y-down screen convention). */
  static rotation(degrees: number): Matrix {
    const r = degrees * DEG_TO_RAD
    const cos = Math.cos(r)
    const sin = Math.sin(r)
    return new Matrix(cos, sin, -sin, cos, 0, 0)
  }

  /** Shear by the given factors (not angles). */
  static skewing(skewX: number, skewY: number): Matrix {
    return new Matrix(1, skewY, skewX, 1, 0, 0)
  }

  static fromArray(m: readonly [number, number, number, number, number, number]): Matrix {
    return new Matrix(m[0], m[1], m[2], m[3], m[4], m[5])
  }

  /**
   * Compose a local transform from components, applied in the order:
   * `T(x,y) · R(rotation) · Skew · S(scaleX,scaleY) · T(-offset)`.
   */
  static compose(c: MatrixComponents): Matrix {
    const {
      x = 0,
      y = 0,
      rotation = 0,
      scaleX = 1,
      scaleY = 1,
      skewX = 0,
      skewY = 0,
      offsetX = 0,
      offsetY = 0,
    } = c

    let m = Matrix.translation(x, y)
    if (rotation !== 0) m = m.multiply(Matrix.rotation(rotation))
    if (skewX !== 0 || skewY !== 0) m = m.multiply(Matrix.skewing(skewX, skewY))
    if (scaleX !== 1 || scaleY !== 1) m = m.multiply(Matrix.scaling(scaleX, scaleY))
    if (offsetX !== 0 || offsetY !== 0) m = m.multiply(Matrix.translation(-offsetX, -offsetY))
    return m
  }

  /** Matrix product `this · other` — applies `other` first, then `this`. */
  multiply(o: Matrix): Matrix {
    return new Matrix(
      this.a * o.a + this.c * o.b,
      this.b * o.a + this.d * o.b,
      this.a * o.c + this.c * o.d,
      this.b * o.c + this.d * o.d,
      this.a * o.e + this.c * o.f + this.e,
      this.b * o.e + this.d * o.f + this.f,
    )
  }

  translate(x: number, y: number): Matrix {
    return this.multiply(Matrix.translation(x, y))
  }

  scale(sx: number, sy: number): Matrix {
    return this.multiply(Matrix.scaling(sx, sy))
  }

  rotate(degrees: number): Matrix {
    return this.multiply(Matrix.rotation(degrees))
  }

  /** Determinant of the linear (2×2) part. */
  determinant(): number {
    return this.a * this.d - this.b * this.c
  }

  /** Inverse transform. Throws if the matrix is singular (non-invertible). */
  invert(): Matrix {
    const det = this.determinant()
    if (det === 0) throw new Error('Matrix is not invertible (determinant is 0)')
    const inv = 1 / det
    return new Matrix(
      this.d * inv,
      -this.b * inv,
      -this.c * inv,
      this.a * inv,
      (this.c * this.f - this.d * this.e) * inv,
      (this.b * this.e - this.a * this.f) * inv,
    )
  }

  /** Apply this transform to a point. */
  applyToPoint(p: Vec2): Vec2 {
    return {
      x: this.a * p.x + this.c * p.y + this.e,
      y: this.b * p.x + this.d * p.y + this.f,
    }
  }

  equals(o: Matrix, epsilon = 0): boolean {
    return (
      Math.abs(this.a - o.a) <= epsilon &&
      Math.abs(this.b - o.b) <= epsilon &&
      Math.abs(this.c - o.c) <= epsilon &&
      Math.abs(this.d - o.d) <= epsilon &&
      Math.abs(this.e - o.e) <= epsilon &&
      Math.abs(this.f - o.f) <= epsilon
    )
  }

  toArray(): [number, number, number, number, number, number] {
    return [this.a, this.b, this.c, this.d, this.e, this.f]
  }
}

const IDENTITY = new Matrix(1, 0, 0, 1, 0, 0)
