import { Circle, Group, Layer, Polygon, Rect, Shape, type Vec2 } from '@annotacanvas/core'

/** Deterministic PRNG (mulberry32) — reproducible scenes without `Math.random`. */
export function makeRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A regular n-gon of radius `r` centered on the local origin. */
export function regularPolygon(n: number, r: number): Vec2[] {
  const pts: Vec2[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
  }
  return pts
}

export interface FlatSceneOptions {
  count: number
  width?: number
  height?: number
  seed?: number
  /** Make every Nth shape a polygon (heavier hit-test/bounds). 0 disables. Default 7. */
  polygonEvery?: number
  /** Vertices per polygon. Default 12. */
  polygonVertices?: number
}

/** A single `Layer` populated with `count` vector shapes spread over `width`×`height`. */
export function buildFlatLayer(opts: FlatSceneOptions): Layer {
  const {
    count,
    width = 1920,
    height = 1080,
    seed = 1,
    polygonEvery = 7,
    polygonVertices = 12,
  } = opts
  const rng = makeRng(seed)
  const layer = new Layer()
  for (let i = 0; i < count; i++) {
    const x = rng() * width
    const y = rng() * height
    if (polygonEvery > 0 && i % polygonEvery === 0) {
      layer.add(
        new Polygon({
          x,
          y,
          points: regularPolygon(polygonVertices, 6 + rng() * 18),
          fill: '#3b82f6',
          stroke: '#0b1220',
          strokeWidth: 1,
        }),
      )
    } else if (i % 2 === 0) {
      layer.add(
        new Rect({
          x,
          y,
          width: 8 + rng() * 38,
          height: 8 + rng() * 38,
          fill: '#22d3ee',
          stroke: '#0b1220',
          strokeWidth: 1,
        }),
      )
    } else {
      layer.add(
        new Circle({
          x,
          y,
          radius: 4 + rng() * 18,
          fill: '#f472b6',
          stroke: '#0b1220',
          strokeWidth: 1,
        }),
      )
    }
  }
  return layer
}

/** Every `Shape` descendant of a container, in depth-first order. */
export function shapesOf(container: Layer | Group): Shape[] {
  const out: Shape[] = []
  container.traverse((node) => {
    if (node instanceof Shape) out.push(node)
  })
  return out
}

/** A balanced tree of nested `Group`s with `branching ** depth` `Rect` leaves. */
export function buildNestedGroup(
  depth: number,
  branching: number,
): { root: Group; leaves: Shape[] } {
  const leaves: Shape[] = []
  const build = (level: number, parent: Group): void => {
    if (level === 0) {
      const leaf = new Rect({ x: 1, y: 1, width: 10, height: 10, fill: '#888' })
      parent.add(leaf)
      leaves.push(leaf)
      return
    }
    for (let i = 0; i < branching; i++) {
      const g = new Group({ x: 1 + i * 0.5, y: 1, rotation: 2 })
      parent.add(g)
      build(level - 1, g)
    }
  }
  const root = new Group()
  build(depth, root)
  return { root, leaves }
}
