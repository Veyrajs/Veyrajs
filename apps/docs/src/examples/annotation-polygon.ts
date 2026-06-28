import { DrawPolygonTool, PolygonAnnotation, VertexEditor } from '@veyrajs/annotations'
import { button, createStage, disposeStage, toolbar } from './_kit'

// Two overlays cooperate here: DrawPolygonTool (drops a vertex per click, listens on `click`) and
// VertexEditor (a draggable handle per vertex, listens on capture-phase pointer events). Because
// they use different event channels and the editor early-returns without a target, both can stay
// mounted — drawing and reshaping never fight over the pointer.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()

  // VertexEditor handle colors are configurable — match them to the polygon's stroke here.
  const editor = new VertexEditor(stage, { handleColor: '#16a34a' })

  const tool = new DrawPolygonTool(stage, layer, {
    defaults: { stroke: '#16a34a', fill: 'rgba(22, 163, 74, 0.14)', label: 'Region' },
    onCreate: (node) => {
      // Hand the finished polygon straight to the editor so its vertices are immediately draggable.
      tool.disable()
      editor.setTarget(node as PolygonAnnotation)
      setPhase('edit')
    },
  })

  function setPhase(phase: 'draw' | 'edit'): void {
    if (phase === 'draw') {
      editor.setTarget(null)
      tool.enable()
    }
    drawBtn.classList.toggle('is-active', phase === 'draw')
    hint.textContent =
      phase === 'draw'
        ? 'Click to drop points · click the first point to close'
        : 'Drag the square handles to reshape'
  }

  // Seed a polygon already in edit mode so the handles are visible on load.
  const seed = new PolygonAnnotation({
    points: [
      { x: 96, y: 70 },
      { x: 250, y: 96 },
      { x: 224, y: 214 },
      { x: 110, y: 200 },
    ],
    stroke: '#16a34a',
    fill: 'rgba(22, 163, 74, 0.14)',
    label: 'Region',
  })
  layer.add(seed)
  editor.setTarget(seed)

  const bar = toolbar(host)
  const drawBtn = button('New polygon', () => setPhase('draw'))
  const finishBtn = button('Finish', () => tool.finish())
  bar.append(drawBtn, finishBtn)
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  bar.append(hint)

  setPhase('edit')

  return () => {
    editor.destroy()
    tool.disable()
    disposeStage(stage)
  }
}
