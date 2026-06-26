import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core'
import { type Container, Layer, type Node } from '@veyrajs/core'
import { AcNodeBase } from './ac-node.base'
import { NODE_CONTEXT } from './context'
import { COMMON_KEYS } from './keys'

@Component({
  selector: 'ac-layer',
  standalone: true,
  template: '<ng-content></ng-content>',
  providers: [{ provide: NODE_CONTEXT, useExisting: forwardRef(() => AcLayerComponent) }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcLayerComponent extends AcNodeBase {
  protected override readonly mirrorKeys = COMMON_KEYS
  protected override createNode(): Node {
    return new Layer(this.buildConfig() as never)
  }
  override get container(): Container | null {
    return (this.node as Container) ?? null
  }
}
