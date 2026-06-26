import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Ellipse, type Node } from '@veyrajs/core'
import { AcShapeBase } from './ac-shape.base'
import { SHAPE_KEYS } from './keys'

@Component({
  selector: 'ac-ellipse',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcEllipseComponent extends AcShapeBase {
  @Input() radiusX?: number
  @Input() radiusY?: number
  protected override readonly mirrorKeys = [...SHAPE_KEYS, 'radiusX', 'radiusY']
  protected override createNode(): Node {
    return new Ellipse(this.buildConfig() as never)
  }
}
