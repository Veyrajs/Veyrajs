# `src/version.ts` — Version constant

> The package's version string, exported for runtime/debugging use.

## Purpose

Exposes the current `@annotacanvas/core` version as a value that consumer code can read at
runtime (e.g. to log which engine build is running, or to gate behaviour on a version).

## Exports

- `VERSION: string` — currently `'0.0.0'`.

## How it works

A plain exported string constant. It is **kept in sync with `package.json` at release
time** (manually for now; a release script will automate this once the package is
published).

## Conventions & gotchas

- This is a *runtime* value. It is separate from the serialization **schema version**
  that Phase 8 introduces for saved scenes — do not conflate the two. The package version
  tracks the code; the schema version tracks the on-disk JSON format.

## Relationships

- **Used by:** re-exported from [`index.ts`](./index.md). No internal module depends on it.

## Future / not yet

- A release step (Changesets) will write the real version here automatically.
