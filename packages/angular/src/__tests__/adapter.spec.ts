import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { Container, Stage } from '@veyrajs/core'
import { describe, expect, it } from 'vitest'
import { AcLayerComponent } from '../layer.component'
import { AcRectComponent } from '../rect.component'
import { AcStageComponent } from '../stage.component'

@Component({
  standalone: true,
  imports: [AcStageComponent, AcLayerComponent, AcRectComponent],
  template: `
    <ac-stage [width]="200" [height]="200" (ready)="onReady($event)">
      <ac-layer>
        @if (show()) {
          <ac-rect [x]="x()" [y]="0" [width]="30" [height]="40" fill="#f00" />
        }
      </ac-layer>
    </ac-stage>
  `,
})
class HostComponent {
  // Signals so updates notify zoneless change detection.
  x = signal(10)
  show = signal(true)
  stage: Stage | null = null
  onReady(stage: Stage): void {
    this.stage = stage
  }
}

describe('Angular adapter', () => {
  it('builds a scene declaratively', () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()

    const host = fixture.componentInstance
    expect(host.stage).not.toBeNull()
    const stage = host.stage as Stage
    expect(stage.childCount).toBe(1)
    const layer = stage.children[0] as Container | undefined
    expect(layer?.type).toBe('Layer')
    expect(layer?.childCount).toBe(1)
    const rect = layer?.children[0]
    expect(rect?.type).toBe('Rect')
    expect(rect?.x).toBe(10)
  })

  it('applies prop changes and removes the node', () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()

    const host = fixture.componentInstance
    const stage = host.stage as Stage
    const layer = stage.children[0] as Container | undefined
    const rect = layer?.children[0]
    expect(rect?.x).toBe(10)

    host.x.set(55)
    fixture.detectChanges()
    expect(rect?.x).toBe(55)

    host.show.set(false)
    fixture.detectChanges()
    expect(layer?.childCount).toBe(0)
  })
})
