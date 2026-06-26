import type { Vec2 } from './vec2'

/**
 * Even-odd point-in-polygon test (ray casting).
 *
 * Returns true if `point` is inside the polygon described by `polygon` (treated as
 * closed). Used by filled shapes' `containsPoint`.
 */
export function pointInPolygon(point: Vec2, polygon: readonly Vec2[]): boolean {
  let inside = false
  const n = polygon.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const pi = polygon[i]
    const pj = polygon[j]
    if (pi === undefined || pj === undefined) continue
    const intersects =
      pi.y > point.y !== pj.y > point.y &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x
    if (intersects) inside = !inside
  }
  return inside
}

/** Shortest distance from `p` to the segment `a–b`. */
export function distanceToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

/** Shortest distance from `p` to a polyline (optionally closed). */
export function distanceToPolyline(p: Vec2, points: readonly Vec2[], closed = false): number {
  if (points.length === 0) return Number.POSITIVE_INFINITY
  const first = points[0]
  if (points.length === 1 && first !== undefined) return Math.hypot(p.x - first.x, p.y - first.y)

  let min = Number.POSITIVE_INFINITY
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    if (a === undefined || b === undefined) continue
    min = Math.min(min, distanceToSegment(p, a, b))
  }
  if (closed) {
    const last = points[points.length - 1]
    if (last !== undefined && first !== undefined) {
      min = Math.min(min, distanceToSegment(p, last, first))
    }
  }
  return min
}
