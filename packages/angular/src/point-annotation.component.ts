import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { PointAnnotation } from '@veyrajs/annotations'
import type { Node } from '@veyrajs/core'
import { AcAnnotationBase } from './ac-annotation.base'
import { ANNOTATION_KEYS } from './keys'

@Component({
  selector: 'ac-point-annotation',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcPointAnnotationComponent extends AcAnnotationBase {
  @Input() radius?: number
  protected override readonly mirrorKeys = [...ANNOTATION_KEYS, 'radius']
  protected override createNode(): Node {
    return new PointAnnotation(this.buildConfig() as never)
  }
}
