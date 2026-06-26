import { Bounds } from '../math'
import { Node } from './node'

/**
 * A node that holds children. Provides add/remove, z-order reordering, traversal, and a
 * derived local-bounds union. Concrete containers: `Group`, `Layer`, `Stage`.
 */
export abstract class Container extends Node {
  private readonly _children: Node[] = []

  get children(): readonly Node[] {
    return this._children
  }

  get childCount(): number {
    return this._children.length
  }

  /** Append one or more nodes (re-parenting them from any previous container). */
  add(...nodes: Node[]): this {
    for (const node of nodes) {
      if (node === this) throw new Error('A node cannot be added to itself')
      if (node instanceof Container && node.isAncestorOf(this)) {
        throw new Error('Cannot add an ancestor as a child (would create a cycle)')
      }
      node.remove()
      node.parent = this
      this._children.push(node)
      node._reparented()
    }
    this.markDirty()
    return this
  }

  removeChild(node: Node): this {
    const idx = this._children.indexOf(node)
    if (idx >= 0) {
      this._children.splice(idx, 1)
      node.parent = null
      node._reparented()
      this.markDirty()
    }
    return this
  }

  removeChildren(): this {
    for (const node of [...this._children]) node.remove()
    return this
  }

  getChildIndex(node: Node): number {
    return this._children.indexOf(node)
  }

  moveToTop(node: Node): this {
    const i = this._children.indexOf(node)
    if (i >= 0 && i < this._children.length - 1) {
      this._children.splice(i, 1)
      this._children.push(node)
      this.markDirty()
    }
    return this
  }

  moveToBottom(node: Node): this {
    const i = this._children.indexOf(node)
    if (i > 0) {
      this._children.splice(i, 1)
      this._children.unshift(node)
      this.markDirty()
    }
    return this
  }

  moveUp(node: Node): this {
    const i = this._children.indexOf(node)
    if (i < 0 || i >= this._children.length - 1) return this
    return this.swap(i, i + 1)
  }

  moveDown(node: Node): this {
    const i = this._children.indexOf(node)
    if (i <= 0) return this
    return this.swap(i, i - 1)
  }

  /** Depth-first search; returns the first matching descendant or null. */
  find(predicate: (node: Node) => boolean): Node | null {
    for (const child of this._children) {
      if (predicate(child)) return child
      if (child instanceof Container) {
        const found = child.find(predicate)
        if (found !== null) return found
      }
    }
    return null
  }

  /** Visit every descendant in depth-first order. */
  traverse(visitor: (node: Node) => void): void {
    for (const child of this._children) {
      visitor(child)
      if (child instanceof Container) child.traverse(visitor)
    }
  }

  getDescendants(): Node[] {
    const out: Node[] = []
    this.traverse((node) => out.push(node))
    return out
  }

  isAncestorOf(node: Node): boolean {
    let p = node.parent
    while (p !== null) {
      if (p === this) return true
      p = p.parent
    }
    return false
  }

  override getLocalBounds(): Bounds {
    let bounds = Bounds.empty()
    for (const child of this._children) {
      bounds = bounds.union(child.getLocalBounds().transform(child.localMatrix()))
    }
    return bounds
  }

  private swap(i: number, j: number): this {
    const a = this._children[i]
    const b = this._children[j]
    if (a === undefined || b === undefined) return this
    this._children[i] = b
    this._children[j] = a
    this.markDirty()
    return this
  }
}
