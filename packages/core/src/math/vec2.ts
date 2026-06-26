/** A 2D point/vector in any coordinate space. Plain data so it serializes trivially. */
export interface Vec2 {
  x: number
  y: number
}

/** Pure helpers over {@link Vec2}. All return new objects; inputs are never mutated. */
export const Vec2 = {
  of(x: number, y: number): Vec2 {
    return { x, y }
  },

  clone(v: Vec2): Vec2 {
    return { x: v.x, y: v.y }
  },

  add(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y }
  },

  sub(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y }
  },

  scale(v: Vec2, s: number): Vec2 {
    return { x: v.x * s, y: v.y * s }
  },

  dot(a: Vec2, b: Vec2): number {
    return a.x * b.x + a.y * b.y
  },

  length(v: Vec2): number {
    return Math.hypot(v.x, v.y)
  },

  distance(a: Vec2, b: Vec2): number {
    return Math.hypot(a.x - b.x, a.y - b.y)
  },

  equals(a: Vec2, b: Vec2, epsilon = 0): boolean {
    return Math.abs(a.x - b.x) <= epsilon && Math.abs(a.y - b.y) <= epsilon
  },
} as const
