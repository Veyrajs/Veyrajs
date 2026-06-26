import { GeometricHitTester, type Vec2 } from '@veyrajs/core'
import { bench, describe } from 'vitest'
import { blackhole } from '../blackhole'
import { buildFlatLayer } from '../scene-factory'

const tester = new GeometricHitTester()
const layer = buildFlatLayer({ count: 1000, width: 1920, height: 1080, seed: 7 })
const center: Vec2 = { x: 960, y: 540 }
const miss: Vec2 = { x: -5000, y: -5000 }

// `pixelSize` = world units per screen pixel (1 / camera.zoom); it makes `tolerance`
// zoom-invariant. A full miss forces the worst-case broad-phase walk over every shape.
describe('GeometricHitTester (1000 shapes)', () => {
  bench('point near center, 5px tolerance, zoom 1', () => {
    const r = tester.hitTest(layer, center, 1, { tolerance: 5 })
    blackhole.n += r === null ? 0 : 1
  })
  bench('full miss (worst-case full traversal)', () => {
    const r = tester.hitTest(layer, miss, 1, { tolerance: 5 })
    blackhole.n += r === null ? 0 : 1
  })
  bench('zoomed out 10× (pixelSize 10, 8px tolerance)', () => {
    const r = tester.hitTest(layer, center, 10, { tolerance: 8 })
    blackhole.n += r === null ? 0 : 1
  })
})
