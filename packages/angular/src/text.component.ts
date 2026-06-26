import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { type Node, Text } from '@veyrajs/core'
import { AcShapeBase } from './ac-shape.base'
import { SHAPE_KEYS } from './keys'

@Component({
  selector: 'ac-text',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcTextComponent extends AcShapeBase {
  @Input() text?: string
  @Input() fontSize?: number
  @Input() fontFamily?: string
  @Input() textAlign?: string
  @Input() textBaseline?: string
  protected override readonly mirrorKeys = [
    ...SHAPE_KEYS,
    'text',
    'fontSize',
    'fontFamily',
    'textAlign',
    'textBaseline',
  ]
  protected override createNode(): Node {
    return new Text(this.buildConfig() as never)
  }
}
