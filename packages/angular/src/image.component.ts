import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Image as ImageNode, type Node } from '@veyrajs/core'
import { AcShapeBase } from './ac-shape.base'
import { SHAPE_KEYS } from './keys'

@Component({
  selector: 'ac-image',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcImageComponent extends AcShapeBase {
  @Input() image?: CanvasImageSource
  @Input() width?: number
  @Input() height?: number
  protected override readonly mirrorKeys = [...SHAPE_KEYS, 'image', 'width', 'height']
  protected override createNode(): Node {
    return new ImageNode(this.buildConfig() as never)
  }
}
