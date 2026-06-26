import type { Container, Stage } from '@veyrajs/core'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { ACLayer, ACRect, ACStage } from '../index'

async function flush(): Promise<void> {
  await nextTick()
  await nextTick()
}

function asStage(value: Stage | null): Stage {
  if (value === null) throw new Error('stage not ready')
  return value
}

function firstLayer(stage: Stage): Container | undefined {
  return stage.children[0] as Container | undefined
}

describe('Vue adapter', () => {
  it('builds a scene declaratively', async () => {
    let captured: Stage | null = null
    mount(
      defineComponent({
        setup() {
          return () =>
            h(
              ACStage,
              {
                width: 200,
                height: 200,
                onReady: (s: Stage) => {
                  captured = s
                },
              },
              () =>
                h(ACLayer, () => h(ACRect, { x: 10, y: 20, width: 30, height: 40, fill: '#f00' })),
            )
        },
      }),
      { attachTo: document.body },
    )
    await flush()

    const stage = asStage(captured)
    expect(stage.childCount).toBe(1)
    const layer = firstLayer(stage)
    expect(layer?.type).toBe('Layer')
    expect(layer?.childCount).toBe(1)
    const rect = layer?.children[0]
    expect(rect?.type).toBe('Rect')
    expect(rect?.x).toBe(10)
    expect(rect?.y).toBe(20)
  })

  it('applies prop changes to the node', async () => {
    let captured: Stage | null = null
    const x = ref(10)
    mount(
      defineComponent({
        setup() {
          return () =>
            h(
              ACStage,
              {
                width: 200,
                height: 200,
                onReady: (s: Stage) => {
                  captured = s
                },
              },
              () =>
                h(ACLayer, () =>
                  h(ACRect, { x: x.value, y: 0, width: 30, height: 40, fill: '#f00' }),
                ),
            )
        },
      }),
      { attachTo: document.body },
    )
    await flush()

    const rect = firstLayer(asStage(captured))?.children[0]
    expect(rect?.x).toBe(10)
    x.value = 55
    await flush()
    expect(rect?.x).toBe(55)
  })

  it('removes the node on unmount', async () => {
    let captured: Stage | null = null
    const show = ref(true)
    mount(
      defineComponent({
        setup() {
          return () =>
            h(
              ACStage,
              {
                width: 200,
                height: 200,
                onReady: (s: Stage) => {
                  captured = s
                },
              },
              () => h(ACLayer, () => (show.value ? h(ACRect, { width: 10, height: 10 }) : null)),
            )
        },
      }),
      { attachTo: document.body },
    )
    await flush()

    const layer = firstLayer(asStage(captured))
    expect(layer?.childCount).toBe(1)
    show.value = false
    await flush()
    expect(layer?.childCount).toBe(0)
  })
})
