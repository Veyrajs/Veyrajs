# `src/scene/container.ts` — Branch node

> Any node that holds children: add/remove, z-order, traversal, and a derived bounds union.

## Purpose

`Container` is the abstract branch of the scene graph. It extends [`Node`](./node.md) with
child management and tree operations. Concrete containers are [`Group`](./group.md),
[`Layer`](./layer.md), and [`Stage`](./stage.md).

## Exports

- `abstract class Container extends Node`:
  - **Children:** `children` (readonly view), `childCount`, `add(...nodes)`,
    `removeChild(node)`, `removeChildren()`, `getChildIndex(node)`.
  - **Z-order:** `moveToTop`, `moveToBottom`, `moveUp`, `moveDown`.
  - **Traversal:** `find(predicate)`, `traverse(visitor)`, `getDescendants()`,
    `isAncestorOf(node)`.
  - **Bounds:** overrides `getLocalBounds()` to union child bounds.

## How it works

### Add / re-parent

`add(...)` first detaches each node from any previous parent (`node.remove()`), sets
`node.parent = this`, pushes it, and calls `node._reparented()` to invalidate its world
matrix. It guards against two cycles:

- adding a node to itself, and
- adding an **ancestor** as a child (`node.isAncestorOf(this)`).

Both throw rather than corrupt the tree.

### Z-order

Child array order **is** paint order (earlier = drawn first = visually behind).
`moveToTop`/`moveToBottom` splice-and-reinsert; `moveUp`/`moveDown` swap with a neighbor.
Reordering marks the tree dirty (it's a visual change) but touches no transforms.

### Bounds union

`getLocalBounds()` folds each child's local bounds — transformed into *this* container's
space by the child's local matrix — into a union, using `Bounds.empty()` as the identity.
So a group's bounds is the tight box around its children.

## Conventions & gotchas

- **`children` is a readonly view.** Mutate through the methods, not the array, so dirty
  flags and parent links stay consistent.
- **Depth-first everywhere.** `find`, `traverse`, and `getDescendants` are all DFS in child
  order, matching paint order.
- **Cycle protection is enforced at `add`.** You cannot build an invalid tree through the
  public API.

## Relationships

- **Extends:** [`Node`](./node.md). **Uses:** [`Bounds`](../math/bounds.md).
- **Extended by:** [`Group`](./group.md), [`Layer`](./layer.md), [`Stage`](./stage.md).

## Example

```ts
const g = new Group()
g.add(a, b, c)
g.moveToTop(a)      // a now paints last (front)
g.traverse((n) => console.log(n.type))
g.getLocalBounds()  // tight box around a, b, c
```
