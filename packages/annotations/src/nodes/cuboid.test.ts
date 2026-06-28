import { describe, expect, it } from 'vitest'
import { Cuboid } from './cuboid'

const FRONT = [
  { x: 0, y: 0 },
  { x: 20, y: 0 },
  { x: 20, y: 20 },
  { x: 0, y: 20 },
]
const POINTS = [...FRONT, ...FRONT.map((p) => ({ x: p.x + 8, y: p.y - 8 }))]

describe('Cuboid', () => {
  it('draws front + back faces and four connectors (6 polygon ops)', () => {
    const cub = new Cuboid({ points: POINTS, showLabel: false })
    expect(cub.drawOps().filter((o) => o.type === 'polygon')).toHaveLength(6)
  })

  it('has eight editable vertices', () => {
    expect(new Cuboid({ points: POINTS }).getVertices()).toHaveLength(8)
  })

  it('hit-tests the front face interior', () => {
    const cub = new Cuboid({ points: POINTS })
    expect(cub.hitTest({ x: 10, y: 10 })).toBe('fill')
    expect(cub.hitTest({ x: 200, y: 200 })).toBeNull()
  })
})
