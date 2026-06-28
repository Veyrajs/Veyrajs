import { Circle, Rect } from '@veyrajs/core'
import { createStage, disposeStage, palette, stroke, toolbar } from './_kit'

// Each slider drives one transform property of the rect, so you can see how rotation,
// scale, and the offset (pivot) compose. The amber dot marks the node's (x, y): the local
// point (offsetX, offsetY) maps there, so rotation and scale pivot around it.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const rect = new Rect({
    x: 380,
    y: 150,
    width: 160,
    height: 100,
    fill: palette.blue,
    stroke: stroke.blue,
    strokeWidth: 2,
  })
  const pivot = new Circle({ x: 380, y: 150, radius: 4, fill: palette.amber })
  layer.add(rect, pivot)

  const bar = toolbar(host)
  bar.classList.add('veyrajs-demo__controls')
  const specs = [
    ['rotation', -180, 180, 1, 0],
    ['scaleX', 0.3, 2.5, 0.05, 1],
    ['scaleY', 0.3, 2.5, 0.05, 1],
    ['offsetX', 0, 160, 1, 0],
    ['offsetY', 0, 100, 1, 0],
  ] as const

  for (const [key, min, max, step, value] of specs) {
    const lab = document.createElement('label')
    lab.append(`${key} `)
    const input = document.createElement('input')
    input.type = 'range'
    input.min = String(min)
    input.max = String(max)
    input.step = String(step)
    input.value = String(value)
    input.addEventListener('input', () => {
      rect[key] = Number(input.value)
    })
    lab.append(input)
    bar.append(lab)
  }

  return () => disposeStage(stage)
}
