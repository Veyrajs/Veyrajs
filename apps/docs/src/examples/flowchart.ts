import { Group, Line, type Node, Rect, Text } from '@veyrajs/core'
import { createStage, cycle, disposeStage, palette, toolbar } from './_kit'

// A draggable flowchart: each node is a Group (rect + label); connectors are Lines between node
// centers. Dragging a node re-routes every connector touching it — the edges follow the nodes.
const NODE_W = 124
const NODE_H = 56

export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()

  const makeNode = (name: string, x: number, y: number, fill: string): Group => {
    const g = new Group({ name, x, y })
    g.add(
      new Rect({ width: NODE_W, height: NODE_H, fill, stroke: '#0f172a', strokeWidth: 1 }),
      new Text({ x: 12, y: 20, text: name, fontSize: 14, fill: '#0f172a' }),
    )
    return g
  }
  const nodes = [
    makeNode('Start', 50, 40, cycle[0]),
    makeNode('Process', 280, 130, cycle[1]),
    makeNode('Decision', 520, 40, cycle[2]),
    makeNode('Done', 520, 210, cycle[3]),
  ]
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [1, 3],
  ]
  const center = (g: Group): { x: number; y: number } => ({
    x: g.x + NODE_W / 2,
    y: g.y + NODE_H / 2,
  })
  // Connectors go on first so they render beneath the nodes.
  const lines = edges.map(
    ([a, b]) =>
      new Line({
        points: [center(nodes[a]), center(nodes[b])],
        stroke: palette.slate,
        strokeWidth: 2,
      }),
  )
  for (const l of lines) layer.add(l)
  for (const n of nodes) layer.add(n)

  const reroute = (): void => {
    edges.forEach(([a, b], i) => {
      lines[i].points = [center(nodes[a]), center(nodes[b])]
    })
  }

  let dragging: Group | null = null
  let dx = 0
  let dy = 0
  stage.on('pointerdown', (e) => {
    // Walk up from the hit shape to its node Group.
    let n: Node | null = e.target
    while (n && !nodes.includes(n as Group)) n = n.parent
    if (n) {
      dragging = n as Group
      dx = e.worldPoint.x - dragging.x
      dy = e.worldPoint.y - dragging.y
      host.style.cursor = 'grabbing'
    }
  })
  stage.on('pointermove', (e) => {
    if (dragging) {
      dragging.x = e.worldPoint.x - dx
      dragging.y = e.worldPoint.y - dy
      reroute()
    }
  })
  stage.on('pointerup', () => {
    dragging = null
    host.style.cursor = ''
  })

  const bar = toolbar(host)
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Drag the nodes — connectors follow'
  bar.append(hint)

  return () => disposeStage(stage)
}
