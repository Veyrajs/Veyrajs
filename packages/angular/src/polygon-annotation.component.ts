import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { PolygonAnnotation } from '@veyrajs/annotations'
import type { Node, Vec2 } from '@veyrajs/core'
import { AcAnnotationBase } from './ac-annotation.base'
import { ANNOTATION_KEYS } from './keys'

@Component({
  selector: 'ac-polygon-annotation',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcPolygonAnnotationComponent extends AcAnnotationBase {
  @Input() points?: Vec2[]
  protected override readonly mirrorKeys = [...ANNOTATION_KEYS, 'points']
  protected override createNode(): Node {
    return new PolygonAnnotation(this.buildConfig() as never)
  }
}
