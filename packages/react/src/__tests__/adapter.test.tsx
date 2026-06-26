import type { Container, Stage } from '@veyrajs/core'
import { type ReactElement, act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { ACLayer, ACRect, ACStage } from '../index'

const env = globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }
env.IS_REACT_ACT_ENVIRONMENT = true

function mount(element: ReactElement): { unmount: () => void } {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(element)
  })
  return {
    unmount: () =>
      act(() => {
        root.unmount()
      }),
  }
}

describe('React adapter', () => {
  it('builds a scene declaratively', () => {
    let stage: Stage | null = null
    mount(
      <ACStage
        width={200}
        height={200}
        onReady={(s) => {
          stage = s
        }}
      >
        <ACLayer>
          <ACRect x={10} y={20} width={30} height={40} fill="#f00" />
        </ACLayer>
      </ACStage>,
    )

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

  it('applies prop changes and removes the node on unmount', () => {
    let stage: Stage | null = null
    let setX: (x: number) => void = () => undefined
    let setShow: (v: boolean) => void = () => undefined

    function App(): ReactElement {
      const [x, sx] = useState(10)
      const [show, ss] = useState(true)
      setX = sx
      setShow = ss
      return (
        <ACStage
          width={200}
          height={200}
          onReady={(s) => {
            stage = s
          }}
        >
          <ACLayer>{show ? <ACRect x={x} y={0} width={30} height={40} /> : null}</ACLayer>
        </ACStage>
      )
    }
    mount(<App />)

    const layer = (stage as unknown as Stage).children[0] as Container | undefined
    const rect = layer?.children[0]
    expect(rect?.x).toBe(10)

    act(() => setX(55))
    expect(rect?.x).toBe(55)

    act(() => setShow(false))
    expect(layer?.childCount).toBe(0)
  })
})
