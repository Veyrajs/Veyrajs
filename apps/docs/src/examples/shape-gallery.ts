import { Circle, Ellipse, Image, Line, Polygon, Rect, Text } from '@veyrajs/core'
import { createStage, disposeStage, onThemeChange, palette, roles, stroke } from './_kit'

// A tiny gradient bitmap so the Image shape has a real source to draw.
function makeSwatch(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const g = c.getContext('2d')
  if (g) {
    const grad = g.createLinearGradient(0, 0, 128, 128)
    grad.addColorStop(0, palette.cyan)
    grad.addColorStop(1, palette.indigo)
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    g.fillStyle = 'rgba(255,255,255,0.9)'
    g.font = '600 20px system-ui, sans-serif'
    g.fillText('IMG', 42, 72)
  }
  return c
}

// Draws every built-in shape on one layer. Labels follow the light/dark theme.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()

  // Track text nodes so their color can follow the theme.
  const labels: Text[] = []
  const label = (x: number, y: number, text: string): Text => {
    const node = new Text({ x, y, text, fontSize: 12, fill: roles().muted })
    labels.push(node)
    return node
  }
  const sample = new Text({ x: 240, y: 200, text: 'Text shape', fontSize: 26, fill: roles().ink })

  layer.add(
    new Rect({
      x: 40,
      y: 40,
      width: 96,
      height: 64,
      fill: palette.blue,
      stroke: stroke.blue,
      strokeWidth: 2,
    }),
    label(40, 116, 'Rect · top-left origin'),

    new Circle({ x: 250, y: 76, radius: 36, fill: palette.cyan }),
    label(206, 130, 'Circle · center origin'),

    new Ellipse({ x: 400, y: 76, radiusX: 52, radiusY: 32, fill: palette.indigo }),
    label(352, 130, 'Ellipse'),

    new Line({
      x: 540,
      y: 40,
      points: [
        { x: 0, y: 64 },
        { x: 48, y: 0 },
        { x: 96, y: 70 },
        { x: 150, y: 8 },
      ],
      stroke: palette.amber,
      strokeWidth: 3,
    }),
    label(540, 124, 'Line · open polyline'),

    new Polygon({
      x: 110,
      y: 232,
      points: [
        { x: 0, y: -42 },
        { x: 40, y: 30 },
        { x: -40, y: 30 },
      ],
      fill: palette.teal,
      stroke: stroke.teal,
      strokeWidth: 2,
    }),
    label(58, 276, 'Polygon · closed + filled'),

    sample,
    label(240, 240, 'Text · single line'),

    new Image({ x: 470, y: 188, width: 72, height: 72, image: makeSwatch() }),
    label(470, 270, 'Image · any bitmap source'),
  )

  const off = onThemeChange(() => {
    const r = roles()
    sample.fill = r.ink
    for (const node of labels) node.fill = r.muted
  })
  return () => {
    off()
    disposeStage(stage)
  }
}
