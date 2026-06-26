# `src/scene/node.ts` — Scene-graph base class

> Owns the local transform, hierarchy linkage, and the lazy, version-counted world-matrix
> cache. The most important class to understand after `Matrix`.

## Purpose

`Node` is the abstract base of every element in the scene graph. It holds:

- the **local transform** (`x, y, scaleX, scaleY, rotation, skewX, skewY, offsetX, offsetY`),
- **visual state** (`opacity`, `visible`, `listening`),
- **hierarchy** (`parent`, `id`, `name`),
- and the **transform caches** (`localMatrix()`, `worldMatrix()`).

It deliberately knows **nothing about rendering** — there is no `draw()` here. Drawable
leaves are [`Shape`](./shape.md); containers are [`Container`](./container.md).

## Exports

- `interface NodeConfig` — optional constructor props (transform + visual + `id`/`name`).
- `abstract class Node` with:
  - typed accessors for each transform/visual property,
  - `position(x, y)`, `move(dx, dy)`,
  - `localMatrix()`, `worldMatrix()`,
  - `abstract getLocalBounds()`, `getWorldBounds()`,
  - `markDirty()`, `remove()`, `destroy()`,
  - `toObject()` + the overridable `serializedExtras()` hook (serialization),
  - **events:** `on(type, handler, options?)`, `once(...)`, `off(type, handler?)`, `hasListeners(type)`,
  - internal `_reparented()`, `_emit(event, capture)`, and the overridable hook `onSubtreeDirty()`.

## How it works

### Typed accessors (not an `attrs` bag)

Each property is a real getter/setter (`get x()` / `set x(v)`), so types and editor
autocomplete work — a deliberate departure from Konva's stringly-typed `attrs` object.
A transform setter only invalidates if the value actually changed.

### Local matrix (cached)

`localMatrix()` composes the transform via `Matrix.compose(...)` and caches it. The cache
is cleared whenever a transform property changes (`invalidateTransform()`).

### World matrix (lazy + version-counted) — the key idea

`worldMatrix()` = `parentWorld.multiply(localMatrix())`, but computed **lazily** and cached
against a **version counter**:

- Each node has a `_worldVersion` that increments only when its world matrix actually
  changes.
- A child remembers the parent version it last computed against (`_parentVersionSeen`).
- On `worldMatrix()`, the node first makes the parent current, reads the parent's version,
  and returns its cache if `!dirty && cache exists && parentVersion unchanged`.

The payoff: **changing one node never eagerly walks its subtree.** A descendant only
recomputes when *its own* transform changed or an *ancestor's* world matrix actually moved.
This avoids Konva's eager whole-subtree invalidation. (Tested: mutating a sibling does not
recompute another node; reparenting does.)

### Dirty propagation

A visual or transform change calls `markDirty()`, which walks up to the root and calls
`onSubtreeDirty()`. The base hook is a no-op; the [`Stage`](./stage.md) overrides it to
schedule a coalesced render. So a property change anywhere ends as exactly one queued
frame.

### Events

`Node` is also the listener store. `on`/`once`/`off` register handlers (with an optional
`{ capture }` phase), `hasListeners` queries them, and the internal `_emit(event, capture)`
invokes the matching listeners for a phase (applying `stopImmediatePropagation`). The phase
*ordering across nodes* lives in [`dispatchEvent`](../events/dispatch.md); see the
[event system](../events/README.md).

## Conventions & gotchas

- **`parent` is managed by the container.** It's a public field for ergonomics, but you
  attach/detach via `container.add(...)` / `node.remove()`, not by assigning `parent`
  yourself.
- **`_reparented()` is internal** (underscore): the container calls it to invalidate the
  node's world matrix on (re)parenting. Don't call it from app code.
- **`listening`** is plumbed for the future event system (Phase 5); it does not affect
  rendering.
- **`markDirty()` walks to the root** each call — O(depth). Fine for the target scale;
  a cached root pointer is a possible later optimization.

## Relationships

- **Uses:** [`Matrix`](../math/matrix.md), [`Bounds`](../math/bounds.md), [`nextId`](../id.md).
- **Extended by:** [`Container`](./container.md) and [`Shape`](./shape.md) (and through them
  everything else).

## Example

```ts
const group = new Group({ x: 100 })
const child = new TestRect({ x: 10 })
group.add(child)
child.worldMatrix().applyToPoint({ x: 0, y: 0 }) // { x: 110, y: 0 }
group.x = 200
child.worldMatrix().applyToPoint({ x: 0, y: 0 }) // { x: 210, y: 0 } (recomputed lazily)
```
