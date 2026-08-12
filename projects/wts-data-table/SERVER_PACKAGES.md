# Server packages

Backend code is released independently from the browser table. Every package
implements protocol version 1 and consumes the same JSON fixtures.

| Runtime | Package | Responsibility |
| --- | --- | --- |
| JavaScript client | `wts-data-table/server` | Fetch, retries, cache, cancellation, and browser data sources |
| Protocol | `@wts-data-table/protocol` | Types, runtime validation, JSON Schema, and fixtures |
| Node.js | `@wts-data-table/server` | Express, GraphQL, Fetch, SQL, Prisma, and Knex adapters |
| Python | `wts-data-table-server` | PyPI protocol parser and response validator |
| PHP | `wts/data-table-server` | Composer protocol parser and response validator |
| .NET | `Wts.DataTable.Server` | NuGet protocol parser and response validator |

## Compatibility

Clients send `protocolVersion: 1`. Server parsers accept versionless requests
as v1 during migration, reject unknown versions, normalize page bounds, remove
duplicate facet columns, validate sorting, and validate operation-specific
responses.

The language-neutral fixtures are in
`projects/wts-data-table-protocol/fixtures`. A server implementation is
compatible only when it passes all shared fixtures.

## Node.js

```ts
import {
  createDataTableExpressHandler,
  createDataTablePostgreSqlAdapter,
} from '@wts-data-table/server';

const adapter = createDataTablePostgreSqlAdapter({
  client: pool,
  columns,
  cursorSecret: process.env.CURSOR_SECRET!,
  primaryKey: 'id',
  table: 'people',
});

app.post('/api/data-table', createDataTableExpressHandler({
  adapter,
  maxPageSize: 100,
}));
```

The Node package deliberately does not depend on Express, GraphQL, Prisma,
Knex, or a database driver. Applications inject only what they already use.

## Migration

Replace new backend imports:

```diff
- import { createDataTableSqliteAdapter } from 'wts-data-table/server-db';
+ import { createDataTableSqliteAdapter } from '@wts-data-table/server';
```

Keep `createDataTableServerAdapter` imported from `wts-data-table/server` in
browser code; despite the similar name, it is the client transport.
