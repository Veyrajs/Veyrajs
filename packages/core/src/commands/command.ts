import type { Container } from '../scene/container'
import type { Node } from '../scene/node'

/** A reversible operation. `do` applies it; `undo` reverts it. */
export interface Command {
  do(): void
  undo(): void
  readonly label?: string
}

/** Transform/visual properties a {@link SetPropsCommand} can change. */
export interface NodeProps {
  x?: number
  y?: number
  scaleX?: number
  scaleY?: number
  rotation?: number
  skewX?: number
  skewY?: number
  offsetX?: number
  offsetY?: number
  opacity?: number
  visible?: boolean
}

function applyProps(node: Node, props: NodeProps): void {
  if (props.x !== undefined) node.x = props.x
  if (props.y !== undefined) node.y = props.y
  if (props.scaleX !== undefined) node.scaleX = props.scaleX
  if (props.scaleY !== undefined) node.scaleY = props.scaleY
  if (props.rotation !== undefined) node.rotation = props.rotation
  if (props.skewX !== undefined) node.skewX = props.skewX
  if (props.skewY !== undefined) node.skewY = props.skewY
  if (props.offsetX !== undefined) node.offsetX = props.offsetX
  if (props.offsetY !== undefined) node.offsetY = props.offsetY
  if (props.opacity !== undefined) node.opacity = props.opacity
  if (props.visible !== undefined) node.visible = props.visible
}

/** Set node properties; `undo` restores the captured `before` values. */
export class SetPropsCommand implements Command {
  constructor(
    private readonly node: Node,
    private readonly before: NodeProps,
    private readonly after: NodeProps,
    readonly label = 'set',
  ) {}

  do(): void {
    applyProps(this.node, this.after)
  }

  undo(): void {
    applyProps(this.node, this.before)
  }
}

/** Add a node to a container; `undo` removes it. */
export class AddNodeCommand implements Command {
  constructor(
    private readonly parent: Container,
    private readonly node: Node,
    readonly label = 'add',
  ) {}

  do(): void {
    this.parent.add(this.node)
  }

  undo(): void {
    this.node.remove()
  }
}

/** Remove a node; `undo` re-adds it to its previous parent (at the top of the z-order). */
export class RemoveNodeCommand implements Command {
  private readonly parent: Container | null

  constructor(
    private readonly node: Node,
    readonly label = 'remove',
  ) {
    this.parent = node.parent
  }

  do(): void {
    this.node.remove()
  }

  undo(): void {
    this.parent?.add(this.node)
  }
}

/** Group several commands into a single undo step. */
export class CompositeCommand implements Command {
  constructor(
    private readonly commands: readonly Command[],
    readonly label = 'batch',
  ) {}

  do(): void {
    for (const command of this.commands) command.do()
  }

  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i]?.undo()
    }
  }
}
