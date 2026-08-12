# Database adapters

`@wts-data-table/server` processes native rows, facets, and cursor payloads
against a database. Database and ORM clients are injected, so the package
keeps zero runtime dependencies.

```ts
import { createDataTablePostgreSqlAdapter } from '@wts-data-table/server';
```

The former `wts-data-table/server-db` entry remains as a compatibility export
through the 1.x line. New backend code should use the dedicated package so the
browser installation remains focused on rendering and client transport.

## Shared allowlist

```ts
const columns = [
  { id: 'id', field: 'id', searchable: false },
  { id: 'name', field: 'full_name', facet: true },
  { id: 'team', field: 'team', facet: true },
  { id: 'score', field: 'score', type: 'number' },
];
```

Browser column IDs never become identifiers without matching this allowlist.
Adapters support global, column, and nested advanced filters; stable
multi-sort; offset pages; remote facets; editor options; and signed,
query-bound keyset cursors. SQL adapters also calculate configured summaries.
The normalized `payload.filtering.global` metadata mirrors client contains,
exact, prefix, regular-expression, case, and trimming semantics. PostgreSQL
and MySQL 8 compile native regex predicates. SQLite regex mode requires the
host connection to register a `REGEXP` implementation.

## PostgreSQL

```ts
const adapter = createDataTablePostgreSqlAdapter<Person>({
  client: pool, // query(text, values) => Promise<{ rows }>
  columns,
  table: 'people',
  primaryKey: 'id',
  cursorSecret: process.env.CURSOR_SECRET!,
  summaries: [{ id: 'filtered', aggregations: { score: 'average' } }],
});
```

PostgreSQL uses numbered parameters and quoted identifiers.

## MySQL

```ts
const adapter = createDataTableMySqlAdapter<Person>({
  client: mysql2Pool, // execute(text, values) => Promise<[rows, fields]>
  columns,
  table: 'people',
  primaryKey: 'id',
  cursorSecret: process.env.CURSOR_SECRET!,
});
```

Generated queries target MySQL 8+ because facet totals use window aggregates.

## SQLite

```ts
const adapter = createDataTableSqliteAdapter<Person>({
  database, // prepare(text).all(...values)
  columns,
  table: 'people',
  primaryKey: 'id',
  cursorSecret: process.env.CURSOR_SECRET!,
});
```

The structural database interface works with Node's built-in SQLite driver and
compatible wrappers. Run the complete Node 22+ example with:

```sh
npm run example:sqlite
```

It exposes `/api/data-table`, `/api/editor/options`, and
`/api/editor/uploads`, initializes sample rows, signs cursors, limits request
and upload sizes, and serves uploaded files from `/uploads`.

## Knex

```ts
const adapter = createDataTableKnexAdapter<Person>({
  knex,
  dialect: 'postgresql', // mysql or sqlite are also supported
  columns,
  table: 'people',
  primaryKey: 'id',
  cursorSecret: process.env.CURSOR_SECRET!,
});
```

Knex is the injected executor while the data-table compiler preserves one
filtering and cursor contract across dialects.

## Prisma

```ts
const adapter = createDataTablePrismaAdapter<Person>({
  delegate: prisma.person,
  columns,
  primaryKey: 'id',
  cursorSecret: process.env.CURSOR_SECRET!,
});
```

The delegate needs `findMany`, `count`, and `groupBy` when facets are enabled.
Prisma cursor mode uses the configured unique primary key.
Prisma mirrors contains, exact, prefix, trimming, and case configuration.
Prisma Client has no portable regular-expression predicate, so regex payloads
fail explicitly; use a SQL adapter or application-defined server adapter for
that mode.

## Database-backed editor options

```ts
const loadOptions = createDataTableDatabaseOptionsHandler({
  adapters: { people: adapter },
});

app.post('/api/editor/options', async (request, response) => {
  response.json(await loadOptions(request.body));
});
```

Client:

```ts
const loadTeamOptions = createDataTableRemoteOptionsLoader<Person>({
  endpoint: '/api/editor/options',
  source: 'people',
});

const fields = [{
  id: 'team',
  label: 'Team',
  type: 'autocomplete',
  loadOptions: loadTeamOptions,
}];
```

## Security

- Supply a high-entropy deployment secret for cursors.
- Keyset sort columns must be non-null and end with a unique primary key.
- Apply authentication and tenant predicates before exposing an adapter.
- Keep the column allowlist narrower than the underlying model.
- Validate uploaded file contents before permanent storage; the example's
  extension preservation demonstrates transport, not malware inspection.
