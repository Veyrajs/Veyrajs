import { Container } from './container'
import type { NodeConfig } from './node'

/** A transformable container with no geometry of its own. */
export class Group extends Container {
  readonly type = 'Group'

  constructor(config: NodeConfig = {}) {
    super(config)
  }
}
