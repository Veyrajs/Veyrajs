# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

Add a changeset describing a change with:

```bash
pnpm changeset
```

While the library packages are `private`, changesets is wired up but effectively a
no-op for publishing. When packages become publishable, flip `private` to `false`,
choose a license, and Changesets will version and release them.
