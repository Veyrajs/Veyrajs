import { Stage } from '@veyrajs/core'
import { bench, describe } from 'vitest'
import { blackhole } from '../blackhole'
import { CountingRenderer } from '../counting-renderer'
import { buildFlatLayer } from '../scene-factory'

// Measures `Stage.render()`'s CPU cost — traversal + view·world matrix multiply + drawOps
// allocation — with a non-rasterizing renderer, so canvas/GPU time is excluded.
function makeStage(count: number): { stage: Stage; renderer: CountingRenderer } {
  const container = document.createElement('div')
  const renderer = new CountingRenderer()
  const stage = new Stage({ container, width: 1920, height: 1080, renderer })
  stage.add(buildFlatLayer({ count, seed: 3 }))
  stage.render()
  return { stage, renderer }
}

describe('Stage.render() — CPU graph walk (no rasterization)', () => {
  for (const count of [100, 1000, 5000]) {
    const { stage, renderer } = makeStage(count)
    bench(`${count} shapes — static (cached world transforms)`, () => {
      stage.render()
      blackhole.n += renderer.nodeCount
    })
  }
  for (const count of [100, 1000, 5000]) {
    const { stage, renderer } = makeStage(count)
    let tick = 0
    bench(`${count} shapes — all dirty each frame (worst case)`, () => {
      const layer = stage.children[0]
      if (layer !== undefined) {
        tick += 1
        layer.x = tick // invalidate every descendant's world cache
      }
      stage.render()
      blackhole.n += renderer.nodeCount
    })
  }
})
