import { CURRENT_SCHEMA_VERSION, type SceneDocument } from './types'

export interface Migration {
  /** The document version this migration upgrades FROM. */
  from: number
  /** Transform a document of version `from` into the next version (must bump `version`). */
  migrate: (doc: SceneDocument) => SceneDocument
}

/**
 * Upgrades a scene document from its stored version up to {@link CURRENT_SCHEMA_VERSION} by
 * applying registered migrations in order. This is what lets scenes saved by an older build
 * still load — the payoff of versioning serialization from day one.
 */
export class MigrationRunner {
  private readonly migrations = new Map<number, Migration>()

  register(migration: Migration): this {
    this.migrations.set(migration.from, migration)
    return this
  }

  run(doc: SceneDocument): SceneDocument {
    let current = doc
    let guard = 0
    while (current.version < CURRENT_SCHEMA_VERSION) {
      const migration = this.migrations.get(current.version)
      if (migration === undefined) {
        throw new Error(`No migration registered from schema version ${current.version}`)
      }
      const next = migration.migrate(current)
      if (next.version <= current.version) {
        throw new Error(`Migration from version ${current.version} did not advance the version`)
      }
      current = next
      if (++guard > 1000) throw new Error('Migration did not terminate')
    }
    return current
  }
}
