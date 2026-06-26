# `src/id.ts` — Deterministic node ids

> A monotonic id generator (no randomness) so ids are stable and reproducible.

## Purpose

Every `Node` needs a unique id. This module produces them from a simple incrementing
counter rather than a random/UUID source, which keeps ids **deterministic across runs**.

## Exports

- `nextId(prefix = 'node'): string` — returns `` `${prefix}-${n}` `` with an
  ever-incrementing `n` (e.g. `node-1`, `node-2`, …).
- `resetIdCounter(): void` — resets the counter to `0`. **Test-only**: lets a test get
  predictable ids by resetting before each case.

## How it works

A module-level `let counter = 0`. `nextId` increments and interpolates it. Because the
counter lives at module scope, it is shared by everything importing this module within a
process.

## Conventions & gotchas

- **Why not `Math.random()`/`crypto.randomUUID()`?** Deterministic ids make snapshot tests
  and reproducible serialization possible, and avoid surprising diffs. If globally-unique
  ids are ever needed (e.g. multiplayer), a different id strategy can be injected at the
  `Node` level without changing call sites.
- **Caller-supplied ids win.** `Node`'s constructor uses `config.id ?? nextId()`, so a
  caller (or a deserializer) can always provide an explicit id; the counter is only the
  fallback.
- `resetIdCounter()` is exported for tests and **should not** be called in app code (it
  could cause id collisions with already-created nodes).

## Relationships

- **Used by:** [`scene/node.ts`](./scene/node.md) (the `Node` constructor).

## Future / not yet

- A pluggable id strategy (per-stage, or collision-resistant for collaboration) can be
  layered on later without touching node code.
