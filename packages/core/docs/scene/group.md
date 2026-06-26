# `src/scene/group.ts` — Generic grouping container

> A transformable container with no geometry of its own.

## Purpose

`Group` is the everyday grouping primitive. Use it to move, scale, or rotate a set of nodes
together: transform the group and its children follow, because each child's world matrix is
composed with the group's.

## Exports

- `class Group extends Container` — `type = 'Group'`; constructor takes an optional
  `NodeConfig`.

## How it works

`Group` adds nothing beyond [`Container`](./container.md) except a concrete `type`. It has a
transform (inherited from [`Node`](./node.md)) and children (from `Container`), and its
bounds are the union of its children's bounds.

## Conventions & gotchas

- **Group vs. Layer.** A `Group` is for *logical* grouping anywhere in the tree. A
  [`Layer`](./layer.md) is a top-level render partition directly under the `Stage`. Don't
  reach for layers when you just need to group/transform a few nodes — use a `Group`.

## Relationships

- **Extends:** [`Container`](./container.md).
- **Lives under:** a `Layer` (or another `Group`).

## Example

```ts
const g = new Group({ x: 50, rotation: 15 })
g.add(rect, label)   // both move/rotate with the group
```
