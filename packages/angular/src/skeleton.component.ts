import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Skeleton, type SkeletonSchema } from '@veyrajs/annotations'
import type { Node, Vec2 } from '@veyrajs/core'
import { AcAnnotationBase } from './ac-annotation.base'
import { ANNOTATION_KEYS } from './keys'

@Component({
  selector: 'ac-skeleton',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcSkeletonComponent extends AcAnnotationBase {
  @Input() schema?: SkeletonSchema
  @Input() points?: Vec2[]
  @Input() jointRadius?: number
  protected override readonly mirrorKeys = [...ANNOTATION_KEYS, 'schema', 'points', 'jointRadius']
  protected override createNode(): Node {
    return new Skeleton(this.buildConfig() as never)
  }
}
