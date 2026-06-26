# AnnotaCanvas

A framework-agnostic, TypeScript-first **2D canvas engine** — scene graph, renderer
abstraction, camera, events, hit-testing, transforms, selection/controls, versioned
serialization, command/undo, and a plugin system. Designed to later host annotation
workflows as optional plugins, without baking annotation logic into the core.

> **Status:** Phase 1 (monorepo scaffold). The architecture plan lives outside the repo
> in the approved planning document. This is the foundation, not the finished engine.

## Packages

| Package | Status | Description |
| --- | --- | --- |
| `@annotacanvas/core` | scaffold | The engine. Zero runtime dependencies. The product. |
| `@annotacanvas/vue` | placeholder | Vue 3 adapter (built in a later phase). |
| `@annotacanvas/tools` | placeholder | Reusable interaction tools (pan/select/transform/marquee). |
| `@annotacanvas/annotations` | placeholder | **Future only.** Annotation node types + controls. Intentionally empty. |
| `@annotacanvas/demo` (`apps/`) | scaffold | Vite + Vue demo proving the engine. Private. |
| `@annotacanvas/docs` (`apps/`) | placeholder | Docs site (VitePress), deferred to V1. |
| `@annotacanvas/benchmarks` (`apps/`) | placeholder | Performance harness, deferred to V1. |

## Conventions (locked in Phase 0)

- **Core model:** mutable OOP scene graph (`Stage → Layer → Group/Node → Shape`).
- **MVP renderer:** Canvas 2D behind a `Renderer` interface (WebGL/WebGPU reserved).
- **Coordinates:** top-left origin, **y-down**, rotation in **degrees clockwise**.
- **Scale target:** one large image + hundreds of vector shapes at 60fps.
- **History:** every mutation is a reversible, serializable command (undo/redo day 1).
- **License:** `UNLICENSED` / private while internal; OSS license chosen at publish.
- **Tooling:** pnpm workspaces + catalogs, **tsup** builds, **Biome** lint/format,
  **Vitest** + **Playwright** tests, **Changesets** releases.

> Shared TypeScript config currently lives at the repo root (`tsconfig.base.json`);
> a dedicated `tooling/` workspace can be extracted once there is more shared config to
> justify it.

## Getting started

```bash
pnpm install
pnpm dev          # run the demo app (Vite)
pnpm build        # build all packages
pnpm test         # run all unit tests
pnpm typecheck    # typecheck all packages
pnpm check        # Biome lint + format check
```

## Requirements

- Node.js >= 20 (repo developed on 22)
- pnpm 10 (via Corepack: `corepack enable`)
