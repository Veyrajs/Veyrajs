import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core'
import { type Container, Group, type Node } from '@veyrajs/core'
import { AcNodeBase } from './ac-node.base'
import { NODE_CONTEXT } from './context'
import { COMMON_KEYS } from './keys'

@Component({
  selector: 'ac-group',
  standalone: true,
  template: '<ng-content></ng-content>',
  providers: [{ provide: NODE_CONTEXT, useExisting: forwardRef(() => AcGroupComponent) }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcGroupComponent extends AcNodeBase {
  protected override readonly mirrorKeys = COMMON_KEYS
  protected override createNode(): Node {
    return new Group(this.buildConfig() as never)
  }
  override get container(): Container | null {
    return (this.node as Container) ?? null
  }
}
