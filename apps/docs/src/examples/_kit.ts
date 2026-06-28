// Shared chrome for the example modules under `src/examples/`.
//
// Each example is a single `.ts` file whose source is shown verbatim in the "Code"
// tab AND run live in the "Demo" tab (see `components/LiveDemo.astro`). This kit holds
// the boring, repeated presentation bits — a themed Stage, a toolbar, a button — so the
// engine usage in each example stays the visible point of the demo.

import { Stage } from '@veyrajs/core'

// Re-export the docs theme so example modules import everything from one place.
export { palette, stroke, cycle, roles, onThemeChange } from '../components/_demo-theme'

const observers = new WeakMap<Stage, ResizeObserver>()

// Create a Stage that fills `host` (the `.veyrajs-demo__stage` area) and stays sized to
// it via a ResizeObserver. The canvas has no background, so the theme-aware CSS surface
// behind it shows through and flips with light/dark.
export function createStage(host: HTMLElement): Stage {
  const stage = new Stage({
    container: host,
    width: host.clientWidth || 600,
    height: host.clientHeight || 360,
  })
  const ro = new ResizeObserver(() => {
    const w = host.clientWidth
    const h = host.clientHeight
    if (w > 0 && h > 0) stage.setSize(w, h)
  })
  ro.observe(host)
  observers.set(stage, ro)
  return stage
}

// Tear down a Stage created via `createStage` (also disconnects its ResizeObserver).
export function disposeStage(stage: Stage): void {
  observers.get(stage)?.disconnect()
  observers.delete(stage)
  stage.destroy()
}

// Insert a toolbar row directly above the stage (matching the `.veyrajs-demo` layout)
// and return it so the caller can append controls.
export function toolbar(host: HTMLElement): HTMLDivElement {
  const bar = document.createElement('div')
  bar.className = 'veyrajs-demo__toolbar'
  host.parentElement?.insertBefore(bar, host)
  return bar
}

// A toolbar button wired to `onClick`; returned so callers can toggle `disabled`, etc.
export function button(label: string, onClick: () => void): HTMLButtonElement {
  const el = document.createElement('button')
  el.type = 'button'
  el.textContent = label
  el.addEventListener('click', onClick)
  return el
}

// A right-aligned monospace readout (zoom %, coordinates, counts). Returns the element.
export function readout(bar: HTMLElement, initial = ''): HTMLSpanElement {
  const el = document.createElement('span')
  el.className = 'veyrajs-demo__readout'
  el.textContent = initial
  bar.append(el)
  return el
}
