import { Group, Rect, type SceneEvent, Text } from '@veyrajs/core'
import { button, createStage, disposeStage, onThemeChange, palette, roles, toolbar } from './_kit'

// One click handler is bound to layer/group/inner/outer in both capture and bubble phases.
// Clicking the inner square shows the full DOM-style path: capture flows down (▼) to the
// target (◉), then bubbles back up (▲).
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer({ name: 'layer' })

  const group = new Group({ name: 'group', x: 250, y: 20 })
  const r0 = roles()
  const outer = new Rect({
    name: 'outer',
    x: 0,
    y: 0,
    width: 260,
    height: 150,
    fill: r0.panelFill,
    stroke: r0.panelStroke,
    strokeWidth: 1,
  })
  const inner = new Rect({
    name: 'inner',
    x: 80,
    y: 45,
    width: 100,
    height: 60,
    fill: palette.blue,
  })
  group.add(outer, inner)
  const caption = new Text({
    x: 16,
    y: 14,
    text: 'layer ▸ group ▸ inner',
    fontSize: 13,
    fill: r0.muted,
  })
  layer.add(group, caption)
  const off = onThemeChange(() => {
    const r = roles()
    outer.fill = r.panelFill
    outer.stroke = r.panelStroke
    caption.fill = r.muted
  })

  // A scrollable log panel below the stage.
  const log = document.createElement('div')
  log.className = 'veyrajs-demo__log'
  host.parentElement?.append(log)

  const bar = toolbar(host)
  bar.append(
    button('Clear log', () => {
      log.textContent = ''
    }),
  )
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Click the blue square — capture flows down (▼), bubble flows up (▲)'
  bar.append(hint)

  const cls: Record<string, string> = {
    capture: 'is-capture',
    target: 'is-target',
    bubble: 'is-bubble',
  }
  const arrow: Record<string, string> = { capture: '▼', target: '◉', bubble: '▲' }
  const append = (name: string, phase: string): void => {
    const line = document.createElement('div')
    line.innerHTML = `<span class="${cls[phase] ?? ''}">${arrow[phase] ?? '·'} <b>${name}</b> — ${phase}</span>`
    log.append(line)
    log.scrollTop = log.scrollHeight
  }
  const onClick = (e: SceneEvent): void => append(e.currentTarget.name ?? '?', e.eventPhase)

  stage.on(
    'click',
    () => {
      const line = document.createElement('div')
      line.innerHTML = '<span class="is-muted">— click —</span>'
      log.append(line)
    },
    { capture: true },
  )
  layer.on('click', onClick, { capture: true })
  layer.on('click', onClick)
  group.on('click', onClick, { capture: true })
  group.on('click', onClick)
  outer.on('click', onClick)
  inner.on('click', onClick)

  inner.on('pointerenter', () => {
    inner.fill = '#60a5fa'
  })
  inner.on('pointerleave', () => {
    inner.fill = palette.blue
  })

  return () => {
    off()
    disposeStage(stage)
  }
}
