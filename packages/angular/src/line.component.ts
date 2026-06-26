import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Line, type Node } from '@veyrajs/core'
import { AcShapeBase } from './ac-shape.base'
import { SHAPE_KEYS } from './keys'

@Component({
  selector: 'ac-line',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcLineComponent extends AcShapeBase {
  @Input() points?: number[]
  @Input() closed?: boolean
  protected override readonly mirrorKeys = [...SHAPE_KEYS, 'points', 'closed']
  protected override createNode(): Node {
    return new Line(this.buildConfig() as never)
  }
}
