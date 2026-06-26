import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { type Node, Polygon } from '@veyrajs/core'
import { AcShapeBase } from './ac-shape.base'
import { SHAPE_KEYS } from './keys'

@Component({
  selector: 'ac-polygon',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcPolygonComponent extends AcShapeBase {
  @Input() points?: number[]
  protected override readonly mirrorKeys = [...SHAPE_KEYS, 'points']
  protected override createNode(): Node {
    return new Polygon(this.buildConfig() as never)
  }
}
