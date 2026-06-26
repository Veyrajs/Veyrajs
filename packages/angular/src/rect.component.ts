import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { type Node, Rect } from '@annotacanvas/core'
import { AcShapeBase } from './ac-shape.base'
import { SHAPE_KEYS } from './keys'

@Component({
  selector: 'ac-rect',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcRectComponent extends AcShapeBase {
  @Input() width?: number
  @Input() height?: number
  protected override readonly mirrorKeys = [...SHAPE_KEYS, 'width', 'height']
  protected override createNode(): Node {
    return new Rect(this.buildConfig() as never)
  }
}
