import { Container } from './container'
import type { NodeConfig } from './node'

/**
 * A logical render partition under the `Stage`. In the MVP all layers render to the
 * stage's single canvas; isolating a layer onto its own (lazily allocated) canvas for
 * caching is a later optimization. Layers are *not* a general grouping primitive — use
 * `Group` for that.
 */
export class Layer extends Container {
  readonly type = 'Layer'

  constructor(config: NodeConfig = {}) {
    super(config)
  }
}
