import { DrawSkeletonTool, FACE_5, type Skeleton, VertexEditor } from '@veyrajs/annotations'
import { button, createStage, disposeStage, readout, toolbar } from './_kit'

// A Skeleton is keypoints (vertices) joined by bones (edges from a SkeletonSchema). FACE_5 is a
// shipped preset; pass any `{ keypoints, edges }` to define your own. DrawSkeletonTool walks the
// schema's keypoints in order — click once per named point — then the VertexEditor takes over so
// you can nudge them.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const editor = new VertexEditor(stage, { handleColor: '#a855f7' })

  let mode: 'place' | 'edit' = 'place'
  const tool = new DrawSkeletonTool(stage, layer, FACE_5, {
    defaults: { stroke: '#a855f7', label: 'Face' },
    onCreate: (node) => {
      mode = 'edit'
      tool.disable()
      editor.setTarget(node as Skeleton)
      updatePrompt()
    },
  })

  const bar = toolbar(host)
  const newBtn = button('New face', () => {
    mode = 'place'
    editor.setTarget(null)
    tool.enable()
    updatePrompt()
  })
  bar.append(newBtn)
  const prompt = readout(bar, '')

  function updatePrompt(): void {
    if (mode === 'edit') {
      prompt.textContent = 'Drag the keypoints to adjust'
    } else {
      prompt.textContent = tool.nextKeypoint
        ? `Place: ${tool.nextKeypoint}  ·  ${tool.remaining} left`
        : ''
    }
  }

  // Enable the tool first so its placement handler runs before ours; then refresh the prompt after
  // each click to show the next keypoint to place.
  tool.enable()
  stage.on('click', updatePrompt)
  updatePrompt()

  return () => {
    stage.off('click', updatePrompt)
    editor.destroy()
    tool.disable()
    disposeStage(stage)
  }
}
