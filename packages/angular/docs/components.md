# The shape & container components

> Nine thin subclasses of the base directives, plus the shared `keys.ts`.

## Purpose

Each public component is a small `@Component` that extends a base directive, declares its
geometry `@Input()`s, and supplies `createNode()` + `mirrorKeys`. All behaviour is inherited;
the same arrangement as the other adapters' `components` file.

## The components

| Component | Selector | Node class | Base | Extra inputs |
| --- | --- | --- | --- | --- |
| `AcLayerComponent` | `ac-layer` | `Layer` | `AcNodeBase` (container) | — |
| `AcGroupComponent` | `ac-group` | `Group` | `AcNodeBase` (container) | — |
| `AcRectComponent` | `ac-rect` | `Rect` | `AcShapeBase` | `width`, `height` |
| `AcCircleComponent` | `ac-circle` | `Circle` | `AcShapeBase` | `radius` |
| `AcEllipseComponent` | `ac-ellipse` | `Ellipse` | `AcShapeBase` | `radiusX`, `radiusY` |
| `AcLineComponent` | `ac-line` | `Line` | `AcShapeBase` | `points`, `closed` |
| `AcPolygonComponent` | `ac-polygon` | `Polygon` | `AcShapeBase` | `points` |
| `AcTextComponent` | `ac-text` | `Text` | `AcShapeBase` | `text`, `fontSize`, `fontFamily`, `textAlign`, `textBaseline` |
| `AcImageComponent` | `ac-image` | `Image` | `AcShapeBase` | `image`, `width`, `height` |

All are **standalone** components, so you import the ones you use directly (no NgModule).
`Image` is imported as `ImageNode` to avoid the DOM `Image` global.

## The shape of a component

```ts
@Component({
  selector: 'ac-rect',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcRectComponent extends AcShapeBase {
  @Input() width?: number
  @Input() height?: number
  protected override readonly mirrorKeys = [...SHAPE_KEYS, 'width', 'height']
  protected override createNode(): Node {
    return new Rect(this.buildConfig() as never)
  }
}
```

Containers use `template: '<ng-content></ng-content>'` (to project children) and add the
`NODE_CONTEXT` provider; shapes use an empty template (they're leaves) and override `container`
is left at the base default (`null`).

## `keys.ts`

`COMMON_KEYS` (transform/identity) and `SHAPE_KEYS` (common + style). Each component appends its
own geometry keys to form its `mirrorKeys`, which the base uses for both construction and the
`ngOnChanges` mirror.

## Conventions & gotchas

- **`OnPush`** everywhere: the node is mutated imperatively, so the components don't need
  Angular's default dirty-checking — inputs change references, which marks them.
- **Adding a shape is one small file** once the node type exists in core — the same low cost as
  the other adapters, and the reason annotation primitives slot in as plugins.

## Relationships

- **Uses:** the engine node classes; the base directives ([node.md](./node.md)); `keys.ts`;
  `context.ts` (containers).
- **Used by:** apps; re-exported from `src/public-api.ts`.
