import { describe, expect, it } from 'vitest'
import { Stage, VERSION } from '../index'

describe('@annotacanvas/core', () => {
  it('exposes a version string', () => {
    expect(typeof VERSION).toBe('string')
  })

  it('mounts a canvas into the container and tears it down', () => {
    const container = document.createElement('div')
    const stage = new Stage({ container, width: 120, height: 80 })
    const canvas = stage.canvas

    expect(canvas).toBeInstanceOf(HTMLCanvasElement)
    expect(canvas?.parentElement).toBe(container)
    expect(stage.width).toBe(120)
    expect(stage.height).toBe(80)

    stage.destroy()
    expect(canvas?.parentElement).toBeNull()
  })
})
