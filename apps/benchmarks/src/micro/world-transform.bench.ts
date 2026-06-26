import { bench, describe } from 'vitest'
import { blackhole } from '../blackhole'
import { buildNestedGroup } from '../scene-factory'

// The lazy, version-counted world-matrix cache is the engine's signature optimization. These
// two benches contrast the cost of a full re-cascade vs. a warm cache-hit re-read.
function suite(depth: number, branching: number, label: string): void {
  const fresh = buildNestedGroup(depth, branching)
  let tick = 0
  bench(`recompute all leaves after a root change — ${label}`, () => {
    tick += 1
    fresh.root.x = tick // changing value invalidates the whole subtree's world cache
    let s = 0
    for (const leaf of fresh.leaves) s += leaf.worldMatrix().e
    blackhole.n += s
  })

  const warm = buildNestedGroup(depth, branching)
  for (const leaf of warm.leaves) leaf.worldMatrix() // warm the cache once
  bench(`re-read all leaves (cache hit, no changes) — ${label}`, () => {
    let s = 0
    for (const leaf of warm.leaves) s += leaf.worldMatrix().e
    blackhole.n += s
  })
}

describe('worldMatrix() cascade', () => {
  suite(5, 4, '1024 leaves, depth 5')
})
