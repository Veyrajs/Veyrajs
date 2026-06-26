import { Image, Stage } from '@annotacanvas/core'
import { buildFlatLayer, shapesOf } from '../scene-factory'
import { SCENARIOS, type Scenario } from './scenarios'

// A manual FPS harness: build "1 background image + N vector shapes" (the README scale
// target), run a scenario each frame, and show a live FPS / ms-per-frame readout. Use the
// toolbar to step the shape count (100 → 10k) and switch scenarios; read the numbers off the
// page. This is the headline "does it hold 60fps?" benchmark — eyeballed, not automated.

const COUNTS = [100, 500, 1000, 5000, 10000]
const WIDTH = Math.max(640, Math.min(1600, window.innerWidth - 32))
const HEIGHT = Math.max(360, Math.min(900, window.innerHeight - 132))

const app = document.querySelector<HTMLDivElement>('#app')
if (app === null) throw new Error('#app element is missing')
const root = app

root.innerHTML = `
<style>
  :root { color-scheme: dark; }
  body { margin: 0; font: 13px/1.4 ui-sans-serif, system-ui, sans-serif; background: #0b1220; color: #e2e8f0; }
  .bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding: 10px 14px; border-bottom: 1px solid #1e293b; }
  .bar strong { color: #38bdf8; }
  .lbl { color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px; }
  .group { display: inline-flex; gap: 4px; }
  button { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; border-radius: 6px; padding: 4px 9px; cursor: pointer; font: inherit; }
  button:hover { border-color: #475569; }
  button.active { background: #2563eb; color: #fff; border-color: #2563eb; }
  .readout { margin-left: auto; font-variant-numeric: tabular-nums; }
  .readout b { color: #4ade80; font-size: 15px; }
  .host { padding: 16px; }
  .host canvas { border: 1px solid #1e293b; border-radius: 8px; }
</style>
<header class="bar">
  <strong>AnnotaCanvas · FPS</strong>
  <span class="lbl">shapes</span><span class="group" id="counts"></span>
  <span class="lbl">scenario</span><span class="group" id="scenarios"></span>
  <span class="readout" id="readout"></span>
</header>
<main class="host" id="host"></main>
`

function need<T extends Element>(sel: string): T {
  const el = root.querySelector<T>(sel)
  if (el === null) throw new Error(`missing element: ${sel}`)
  return el
}

const host = need<HTMLDivElement>('#host')
const countsBar = need<HTMLSpanElement>('#counts')
const scenariosBar = need<HTMLSpanElement>('#scenarios')
const readout = need<HTMLSpanElement>('#readout')

const firstScenario = SCENARIOS[0]
if (firstScenario === undefined) throw new Error('no scenarios defined')

/** A gradient + grid drawn to an offscreen canvas, used as the background `Image` source. */
function makeBackground(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (ctx !== null) {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#0b1220')
    g.addColorStop(1, '#1e293b')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(148,163,184,0.12)'
    for (let x = 0; x <= w; x += 64) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y <= h; y += 64) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
  }
  return c
}

const background = makeBackground(WIDTH, HEIGHT)

let stage: Stage | null = null
let shapes: ReturnType<typeof shapesOf> = []
let count = 1000
let scenario: Scenario = firstScenario

function rebuild(): void {
  stage?.destroy()
  stage = new Stage({ container: host, width: WIDTH, height: HEIGHT, background: '#0b1220' })
  const bg = stage.createLayer()
  bg.add(new Image({ image: background, width: WIDTH, height: HEIGHT }))
  const flat = buildFlatLayer({ count, width: WIDTH, height: HEIGHT, seed: 11 })
  shapes = shapesOf(flat)
  stage.add(flat)
  stage.render()
}

let last = performance.now()
let frames = 0
let acc = 0
let fps = 0
let ms = 0

function paint(): void {
  readout.innerHTML = `<b>${fps.toFixed(0)}</b> fps · ${ms.toFixed(1)} ms · ${count.toLocaleString()} shapes · ${scenario.label}`
}

function loop(now: number): void {
  const dt = now - last
  last = now
  acc += dt
  frames += 1
  if (acc >= 500) {
    fps = (frames * 1000) / acc
    ms = acc / frames
    acc = 0
    frames = 0
    paint()
  }
  if (stage !== null) {
    scenario.update({ stage, shapes, width: WIDTH, height: HEIGHT }, now)
  }
  requestAnimationFrame(loop)
}

function syncActive(): void {
  for (const b of countsBar.querySelectorAll('button')) {
    b.classList.toggle('active', b.dataset.count === String(count))
  }
  for (const b of scenariosBar.querySelectorAll('button')) {
    b.classList.toggle('active', b.dataset.id === scenario.id)
  }
}

for (const c of COUNTS) {
  const btn = document.createElement('button')
  btn.textContent = c.toLocaleString()
  btn.dataset.count = String(c)
  btn.addEventListener('click', () => {
    count = c
    rebuild()
    syncActive()
  })
  countsBar.appendChild(btn)
}

for (const sc of SCENARIOS) {
  const btn = document.createElement('button')
  btn.textContent = sc.label
  btn.dataset.id = sc.id
  btn.addEventListener('click', () => {
    scenario = sc
    syncActive()
  })
  scenariosBar.appendChild(btn)
}

rebuild()
syncActive()
paint()
requestAnimationFrame(loop)
