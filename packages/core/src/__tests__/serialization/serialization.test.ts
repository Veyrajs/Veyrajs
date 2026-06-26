import { describe, expect, it } from 'vitest'
import {
  Circle,
  Group,
  MigrationRunner,
  Rect,
  type SceneDocument,
  SceneSerializer,
  Stage,
  Text,
} from '../../index'
import { MockRenderer } from '../helpers/mock-renderer'

function makeStage(): Stage {
  const container = document.createElement('div')
  return new Stage({ container, width: 200, height: 200, renderer: new MockRenderer() })
}

describe('serialization', () => {
  it('round-trips a scene through JSON', () => {
    const stage = makeStage()
    const layer = stage.createLayer()
    const group = new Group({ x: 10, y: 20 })
    group.add(
      new Rect({ x: 5, y: 5, width: 40, height: 30, fill: '#f00', stroke: '#000', strokeWidth: 2 }),
      new Circle({ x: 50, radius: 12, fill: '#0f0' }),
    )
    layer.add(group, new Text({ text: 'hi', fontSize: 18, x: 1, y: 2 }))

    const serializer = new SceneSerializer()
    const before = serializer.toDocument(stage)
    const json = serializer.stringify(stage)

    const stage2 = makeStage()
    serializer.parse(stage2, json)
    expect(serializer.toDocument(stage2)).toEqual(before)
  })

  it('preserves ids, types, and properties', () => {
    const stage = makeStage()
    stage.createLayer().add(new Rect({ id: 'r1', x: 7, y: 8, width: 20, height: 10, fill: '#abc' }))
    const doc = new SceneSerializer().toDocument(stage)
    const serializedRect = doc.nodes[0]?.children?.[0]
    expect(serializedRect).toMatchObject({
      type: 'Rect',
      id: 'r1',
      x: 7,
      y: 8,
      width: 20,
      height: 10,
      fill: '#abc',
    })
  })

  it('throws on an unknown node type', () => {
    const stage = makeStage()
    const serializer = new SceneSerializer()
    expect(() =>
      serializer.load(stage, { version: 1, nodes: [{ type: 'Nope', id: 'x' }] }),
    ).toThrow()
  })

  it('runs migrations on older documents', () => {
    const stage = makeStage()
    const migrations = new MigrationRunner().register({
      from: 0,
      migrate: (doc) => ({ ...doc, version: 1 }),
    })
    const serializer = new SceneSerializer({ migrations })
    const old: SceneDocument = {
      version: 0,
      nodes: [
        { type: 'Layer', id: 'l0', children: [{ type: 'Rect', id: 'r0', width: 10, height: 10 }] },
      ],
    }
    serializer.load(stage, old)
    expect(stage.childCount).toBe(1)
    expect(stage.children[0]?.type).toBe('Layer')
  })
})
