import type { Node } from '../scene/node'

export type SelectionChangeListener = (selected: readonly Node[]) => void

/**
 * Tracks the set of selected nodes and notifies listeners on change. Pure state — it does
 * not render or interact; the `SelectionController` builds the UI on top of it.
 */
export class SelectionManager {
  private _nodes: Node[] = []
  private readonly listeners = new Set<SelectionChangeListener>()

  get nodes(): readonly Node[] {
    return this._nodes
  }

  get size(): number {
    return this._nodes.length
  }

  get isEmpty(): boolean {
    return this._nodes.length === 0
  }

  /** The single selected node, or `null` if zero or many are selected. */
  get single(): Node | null {
    return this._nodes.length === 1 ? (this._nodes[0] ?? null) : null
  }

  has(node: Node): boolean {
    return this._nodes.includes(node)
  }

  /** Replace the selection with exactly these nodes. */
  select(...nodes: Node[]): this {
    return this.set(nodes)
  }

  /** Replace the selection with the given list (deduplicated). */
  set(nodes: readonly Node[]): this {
    const next: Node[] = []
    for (const node of nodes) if (!next.includes(node)) next.push(node)
    if (sameSet(next, this._nodes)) return this
    this._nodes = next
    return this.emit()
  }

  /** Add nodes to the selection. */
  add(...nodes: Node[]): this {
    let changed = false
    for (const node of nodes) {
      if (!this._nodes.includes(node)) {
        this._nodes.push(node)
        changed = true
      }
    }
    return changed ? this.emit() : this
  }

  /** Remove nodes from the selection. */
  remove(...nodes: Node[]): this {
    const next = this._nodes.filter((n) => !nodes.includes(n))
    if (next.length === this._nodes.length) return this
    this._nodes = next
    return this.emit()
  }

  /** Add the node if absent, remove it if present. */
  toggle(node: Node): this {
    return this.has(node) ? this.remove(node) : this.add(node)
  }

  clear(): this {
    if (this._nodes.length === 0) return this
    this._nodes = []
    return this.emit()
  }

  /** Subscribe to selection changes. Returns an unsubscribe function. */
  onChange(listener: SelectionChangeListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(): this {
    for (const listener of [...this.listeners]) listener(this._nodes)
    return this
  }
}

function sameSet(a: readonly Node[], b: readonly Node[]): boolean {
  return a.length === b.length && a.every((n, i) => n === b[i])
}
