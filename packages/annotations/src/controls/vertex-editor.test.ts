import { Stage } from '@veyrajs/core'
import { describe, expect, it } from 'vitest'
import { PolygonAnnotation } from '../nodes/polygon-annotation'
import { VertexEditor } from './vertex-editor'

function makeStage(): Stage {
  return new Stage({ container: document.createElement('div'), width: 200, height: 200 })
}

describe('VertexEditor', () => {
  it('draws nothing without a target, then a handle per vertex', () => {
    const stage = makeStage()
    const layer = stage.createLayer()
    const poly = new PolygonAnnotation({
      points: [
        { x: 10, y: 10 },
        { x: 50, y: 10 },
        { x: 30, y: 50 },
      ],
    })
    layer.add(poly)

    const editor = new VertexEditor(stage)
    expect(editor.drawOps()).toHaveLength(0)

    editor.setTarget(poly)
    const ops = editor.drawOps()
    expect(ops).toHaveLength(3)
    expect(ops.every((o) => o.type === 'rect')).toBe(true)

    editor.destroy()
    expect(editor.drawOps()).toHaveLength(0)
  })
})
