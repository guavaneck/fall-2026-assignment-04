---
name: kysely-migration-generator
description: Translate a Mermaid ERD from docs/architecture into a type-safe Kysely migration when asked to generate database tables or migrations from a diagram.
---

# Kysely Migration Generator

Read the requested `.mmd` ERD in `docs/architecture/`. Prefer Mermaid source over an SVG; when only an SVG exists, recover its embedded diagram text or ask for the source if it cannot be recovered reliably.

## Translation rules

- Map entity names to plural snake_case table names and attributes to snake_case columns.
- Inspect existing migrations before generating anything. Do not recreate tables already present.
- Map integer primary keys to `serial` columns with `.primaryKey()`. Preserve UUID primary keys as `uuid` with an appropriate database default when the diagram specifies UUIDs.
- Make required attributes `.notNull()` and optional attributes nullable. Preserve explicit unique constraints.
- Map each `FK` to `.references('<table>.<column>').onDelete('cascade')`. Create referenced tables before dependent tables.
- Interpret `||--o{` as one-to-many. Put the foreign key on the many side.
- Interpret `||--o|` as optional one-to-one. Put a nullable foreign key with a unique constraint on the optional side.
- Use Kysely schema-builder calls and `sql` only for database expressions such as `NOW()`.

Write the migration to `src/db/migrations/<timestamp>_<migration_name>.ts`, choosing a sortable timestamp or the repository's existing numeric sequence convention. Export both functions with these signatures:

```typescript
export async function up(db: Kysely<any>): Promise<void>
export async function down(db: Kysely<any>): Promise<void>
```

The `up` function creates tables in dependency order. The `down` function drops only tables created by this migration, in exact reverse dependency order. Run the project build after generation and correct all TypeScript errors before reporting completion.
