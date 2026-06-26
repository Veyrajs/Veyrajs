import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  type OnChanges,
  type OnDestroy,
  type OnInit,
  Output,
  type SimpleChanges,
  forwardRef,
  inject,
} from '@angular/core'
import {
  type Container,
  History,
  SelectionController,
  type SelectionManager,
  Stage,
} from '@annotacanvas/core'
import { NODE_CONTEXT, type NodeContext } from './context'

/**
 * Root component. Creates the engine `Stage` (into its own host element) on `ngOnInit` — which
 * runs before any child's `ngOnInit`, so descendants find a ready stage in the context. Provides
 * itself as the `NODE_CONTEXT` for the tree below.
 */
@Component({
  selector: 'ac-stage',
  standalone: true,
  template: '<ng-content></ng-content>',
  providers: [{ provide: NODE_CONTEXT, useExisting: forwardRef(() => AcStageComponent) }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcStageComponent implements OnInit, OnChanges, OnDestroy, NodeContext {
  @Input() width = 0
  @Input() height = 0
  @Input() background: string | null = null
  @Input() pixelRatio?: number
  @Input() selectable = false
  @Output() ready = new EventEmitter<Stage>()

  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>
  private internalStage: Stage | null = null
  private internalSelection: SelectionManager | null = null
  private internalHistory: History | null = null
  private controller: SelectionController | null = null

  get stage(): Stage | null {
    return this.internalStage
  }
  get container(): Container | null {
    return this.internalStage
  }
  get selection(): SelectionManager | null {
    return this.internalSelection
  }
  get history(): History | null {
    return this.internalHistory
  }

  ngOnInit(): void {
    const stage = new Stage({
      container: this.host.nativeElement,
      width: this.width,
      height: this.height,
      background: this.background,
      pixelRatio: this.pixelRatio,
    })
    if (this.selectable) {
      this.internalHistory = new History()
      this.controller = new SelectionController(stage, { history: this.internalHistory })
      this.internalSelection = this.controller.selection
    }
    this.internalStage = stage
    this.ready.emit(stage)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.internalStage && ('width' in changes || 'height' in changes)) {
      this.internalStage.setSize(this.width, this.height)
    }
  }

  ngOnDestroy(): void {
    this.controller?.destroy()
    this.internalStage?.destroy()
  }
}
