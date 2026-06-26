# @annotacanvas/benchmarks

Performance benchmarks for `@annotacanvas/core`. Two flavors:

| Flavor | Command | What it measures |
| --- | --- | --- |
| **Micro** (tinybench via `vitest bench`) | `pnpm bench` | CPU hotpaths in isolation — matrix math, the world-matrix cascade, hit-testing, bounds unions, and the `Stage.render()` graph walk (via a non-rasterizing renderer). Deterministic; CI-capable. |
| **FPS harness** (manual Vite page) | `pnpm dev` | End-to-end frame-time / FPS on a real `<canvas>` with **1 background image + N vector shapes** — the README "scale target". Step the shape count (100 → 10k) and switch scenarios; read the live overlay. |

> The `bench` script is intentionally **not** wired into `test`, so CI stays fast and
> deterministic. Headless/automated FPS capture (Playwright) is a planned follow-up.

## Micro-benchmarks

```bash
pnpm --filter @annotacanvas/benchmarks bench
```

Suites live in `src/micro/*.bench.ts`. Each targets a ranked hotpath. Benches that touch the
world-matrix cache **re-dirty nodes every iteration** so they measure real recompute work,
not cache hits (the `worldMatrix()` cache otherwise makes a repeat read nearly free — which
is itself measured by the paired "cache hit" bench).

## FPS harness

```bash
pnpm --filter @annotacanvas/benchmarks dev
```

Open the printed URL. Scenarios: static redraw, translate-all, rotate-all, zoom+pan (camera),
and hit-test-moving-point. The overlay shows FPS, ms/frame, shape count, and the active
scenario. Watch where 60fps breaks as the shape count climbs.

## Notes

- Vanilla TS (no Vue); consumes the engine's source directly via a Vite/tsconfig alias to
  `../../packages/core/src/index.ts`, so changes to core are reflected with no rebuild.
- Reproducible scenes use a seeded PRNG (`scene-factory.ts`), never `Math.random`.
