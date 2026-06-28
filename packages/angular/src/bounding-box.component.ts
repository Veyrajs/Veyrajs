import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { BoundingBox } from '@veyrajs/annotations'
import type { Node } from '@veyrajs/core'
import { AcAnnotationBase } from './ac-annotation.base'
import { ANNOTATION_KEYS } from './keys'

@Component({
  selector: 'ac-bounding-box',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcBoundingBoxComponent extends AcAnnotationBase {
  @Input() width?: number
  @Input() height?: number
  @Input() rotatable?: boolean
  protected override readonly mirrorKeys = [...ANNOTATION_KEYS, 'width', 'height', 'rotatable']
  protected override createNode(): Node {
    return new BoundingBox(this.buildConfig() as never)
  }
}
