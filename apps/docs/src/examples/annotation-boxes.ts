import {
  type AnnotationConfig,
  BoundingBox,
  DrawBoxTool,
  type DrawBoxToolOptions,
  LabelSchema,
} from '@veyrajs/annotations'
import { History, SelectionController } from '@veyrajs/core'
import { button, createStage, disposeStage, toolbar } from './_kit'

// A LabelSchema is your set of annotation classes — each an id, a display name, and a color.
// New boxes inherit the active class's color; this is the visual-customization entry point.
const schema = new LabelSchema([
  { id: 'vehicle', name: 'Vehicle', color: '#2563eb' },
  { id: 'person', name: 'Person', color: '#16a34a' },
  { id: 'sign', name: 'Sign', color: '#f59e0b' },
])

// Resolve a class id into a BoundingBox config: stroke + translucent fill (the class color with an
// `22` alpha suffix) + a colored label chip.
function defaultsFor(id: string): AnnotationConfig {
  const color = schema.get(id)?.color ?? '#2563eb'
  return { stroke: color, fill: `${color}22`, label: schema.get(id)?.name ?? '', labelColor: color }
}

export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const history = new History()
  let controller: SelectionController | null = null

  // The tool reads `options.defaults` fresh on every pointerdown, so swapping classes is just a
  // reassignment of the live options object — the next box drawn picks up the new style.
  const options: DrawBoxToolOptions = {
    defaults: defaultsFor('vehicle'),
    onCreate: () => setMode('select'),
  }
  const tool = new DrawBoxTool(stage, layer, options)

  // Draw and Select share the canvas and the same pointer events, so only one is live at a time:
  // Select mode spins up the core SelectionController (move/resize/rotate, undoable via History);
  // Draw mode tears it down so the box tool owns the pointer.
  function setMode(mode: 'draw' | 'select'): void {
    if (mode === 'draw') {
      controller?.destroy()
      controller = null
      tool.enable()
    } else {
      tool.disable()
      controller ??= new SelectionController(stage, { history })
    }
    drawBtn.classList.toggle('is-active', mode === 'draw')
    selectBtn.classList.toggle('is-active', mode === 'select')
  }

  // Seed two boxes so Select mode has something to grab right away.
  layer.add(
    new BoundingBox({ x: 70, y: 60, width: 150, height: 96, ...defaultsFor('vehicle') }),
    new BoundingBox({ x: 300, y: 120, width: 96, height: 150, ...defaultsFor('person') }),
  )

  const bar = toolbar(host)
  const drawBtn = button('Draw', () => setMode('draw'))
  const selectBtn = button('Select', () => setMode('select'))
  const sep = document.createElement('span')
  sep.className = 'veyrajs-demo__sep'
  bar.append(drawBtn, selectBtn, sep)

  // Class picker — each class in its own color; the active one gets the accent ring.
  const classButtons = schema.classes.map((cls) => {
    const el = button(cls.name, () => {
      options.defaults = defaultsFor(cls.id)
      for (const other of classButtons) other.classList.toggle('is-active', other === el)
    })
    el.style.color = cls.color
    bar.append(el)
    return el
  })
  classButtons[0]?.classList.add('is-active')

  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Draw to add a box · Select to move/resize · pick a class to restyle'
  bar.append(hint)

  setMode('draw')

  return () => {
    tool.disable()
    controller?.destroy()
    disposeStage(stage)
  }
}
