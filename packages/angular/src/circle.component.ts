import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Circle, type Node } from '@annotacanvas/core'
import { AcShapeBase } from './ac-shape.base'
import { SHAPE_KEYS } from './keys'

@Component({
  selector: 'ac-circle',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcCircleComponent extends AcShapeBase {
  @Input() radius?: number
  protected override readonly mirrorKeys = [...SHAPE_KEYS, 'radius']
  protected override createNode(): Node {
    return new Circle(this.buildConfig() as never)
  }
}
