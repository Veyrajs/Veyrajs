import { render } from '@testing-library/svelte'
import type { Container, Stage } from '@veyrajs/core'
import { flushSync } from 'svelte'
import { describe, expect, it } from 'vitest'
import Fixture from './Fixture.svelte'

describe('Svelte adapter', () => {
  it('builds a scene declaratively', () => {
    let stage: Stage | null = null
    render(Fixture, {
      props: {
        x: 10,
        show: true,
        onstage: (s: Stage) => {
          stage = s
        },
      },
    })
    flushSync()

    expect(stage).not.toBeNull()
    const s = stage as unknown as Stage
    expect(s.childCount).toBe(1)
    const layer = s.children[0] as Container | undefined
    expect(layer?.type).toBe('Layer')
    expect(layer?.childCount).toBe(1)
    const rect = layer?.children[0]
    expect(rect?.type).toBe('Rect')
    expect(rect?.x).toBe(10)
  })

  it('applies prop changes and removes the node on unmount', async () => {
    let stage: Stage | null = null
    const { rerender } = render(Fixture, {
      props: {
        x: 10,
        show: true,
        onstage: (s: Stage) => {
          stage = s
        },
      },
    })
    flushSync()

    const layer = (stage as unknown as Stage).children[0] as Container | undefined
    const rect = layer?.children[0]
    expect(rect?.x).toBe(10)

    await rerender({ x: 55, show: true })
    flushSync()
    expect(rect?.x).toBe(55)

    await rerender({ x: 55, show: false })
    flushSync()
    expect(layer?.childCount).toBe(0)
  })
})
