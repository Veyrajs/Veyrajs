// Shared visual language for the live engine demos.
//
// Each demo <canvas> is transparent — the Stage is created WITHOUT a `background`,
// so the CSS surface behind it (`--vy-demo-surface`) shows through and flips with the
// Starlight light/dark theme. That removes the old hardcoded `#0b1220`, which rendered
// as a dark box floating on the light page.
//
// The saturated shape colors below are chosen to read on BOTH the light "paper" and the
// dark surface, so they need no per-theme handling. Text and neutral backdrop shapes do —
// those resolve through `roles()` and refresh on theme toggle via `onThemeChange()`.
//
// Note: only `palette` / `stroke` / `cycle` are safe to use during SSR (the framework
// islands are server-rendered). `roles()` and `onThemeChange()` touch `document`, so call
// them only from browser-only `.astro` <script> blocks.

// Curated, calm palette — a cool blue/cyan family plus one warm accent. Replaces the
// previous six-color Tailwind-default set (cyan/magenta/purple/emerald/amber/pink).
export const palette = {
  blue: '#2563eb',
  cyan: '#0ea5e9',
  indigo: '#6366f1',
  teal: '#0d9488',
  amber: '#f59e0b',
  slate: '#64748b',
} as const

// Slightly darker strokes that pair with the matching fills.
export const stroke = {
  blue: '#1d4ed8',
  cyan: '#0284c7',
  teal: '#0f766e',
} as const

// Color cycle for "add a shape" demos — harmonious order, cool-first with one warm.
export const cycle: readonly string[] = [
  palette.blue,
  palette.cyan,
  palette.indigo,
  palette.teal,
  palette.amber,
]

// Theme-dependent colors for canvas text and neutral backdrop shapes, which (unlike the
// saturated fills) need different values on the light paper vs the dark surface.
export interface DemoRoles {
  ink: string
  muted: string
  panelFill: string
  panelStroke: string
}

export function roles(): DemoRoles {
  const light = document.documentElement.dataset.theme === 'light'
  return light
    ? { ink: '#0f172a', muted: '#64748b', panelFill: '#eef2f7', panelStroke: '#cbd5e1' }
    : { ink: '#e2e8f0', muted: '#94a3b8', panelFill: '#1e293b', panelStroke: '#334155' }
}

// Run `cb` whenever the user toggles the Starlight theme (it flips `data-theme` on <html>).
// Returns an unsubscribe function.
export function onThemeChange(cb: () => void): () => void {
  const root = document.documentElement
  const observer = new MutationObserver((records) => {
    if (records.some((r) => r.attributeName === 'data-theme')) cb()
  })
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}
