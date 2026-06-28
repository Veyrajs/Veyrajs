import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Cuboid } from '@veyrajs/annotations'
import type { Node, Vec2 } from '@veyrajs/core'
import { AcAnnotationBase } from './ac-annotation.base'
import { ANNOTATION_KEYS } from './keys'

@Component({
  selector: 'ac-cuboid',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcCuboidComponent extends AcAnnotationBase {
  @Input() points?: Vec2[]
  protected override readonly mirrorKeys = [...ANNOTATION_KEYS, 'points']
  protected override createNode(): Node {
    return new Cuboid(this.buildConfig() as never)
  }
}
