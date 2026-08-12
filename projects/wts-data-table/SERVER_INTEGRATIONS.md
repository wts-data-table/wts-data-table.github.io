# Server integration examples

The examples in `examples/server` are runnable reference implementations for
the native REST contract, GraphQL, and opaque cursor pagination. They use the
same 120-row deterministic dataset and the package's `DataTableCore` on the
server, so filtering, structured and advanced filters, multi-sort, paging, and
SearchPanes facets behave like the browser core.

`wts-data-table/server` is the browser-side HTTP transport. Backend validation,
framework handlers, and database adapters now live in `@wts-data-table/server`,
using the shared `@wts-data-table/protocol` contract. Express and GraphQL are
development dependencies used only by these examples.

## Run the examples

From the package directory:

```sh
npm install
npm run example:rest     # http://localhost:4101/api/data-table
npm run example:graphql  # http://localhost:4102/graphql
npm run example:cursor   # http://localhost:4103/api/data-table/cursor
npm run example:sqlite   # http://localhost:4104/api/data-table
```

Use a different port with `PORT=5000 npm run example:rest`. Set a strong
`WTS_CURSOR_SECRET` before running the cursor example outside local
development.

The SQLite example is database-backed and additionally exposes
`/api/editor/options` and `/api/editor/uploads`. See
[`DATABASE_ADAPTERS.md`](DATABASE_ADAPTERS.md) for PostgreSQL, MySQL, Knex,
Prisma, and SQLite configuration.

## REST/Express

The REST server is implemented in
[`examples/server/rest-express.mjs`](examples/server/rest-express.mjs). It
accepts the adapter's native payload at `POST /api/data-table` and handles
`rows`, `facets`, and `cursor` operations.

```ts
import { createDataTableDataSourceController } from 'wts-data-table/data-source';
import { createDataTableServerAdapter } from 'wts-data-table/server';

const server = createDataTableServerAdapter<Person>({
  endpoint: 'https://api.example.com/api/data-table',
  headers: async () => ({ authorization: `Bearer ${await getToken()}` }),
});

// The same authenticated transport serves remote SearchPanes.
const table = new DataTable<Person>({
  // columns, empty initial data, manual filtering/sorting/pagination...
  searchPanes: { loadFacets: server.loadFacets },
});

const remote = createDataTableDataSourceController({
  dataSource: server.dataSource,
  table: table.core,
});
```

The example caps pages at 100 rows, validates operations and facet columns,
disables Express's identifying header, limits JSON bodies, and returns a
consistent `{ error: { code, message } }` failure shape.

## GraphQL

[`examples/server/graphql-express.mjs`](examples/server/graphql-express.mjs)
defines a real GraphQL schema and endpoint. The full framework-neutral table
state travels through a `JSON` scalar; applications with a fixed schema can
replace it with generated input and response object types.

GraphQL needs two adapter hooks: `serializeRequest` wraps the native payload in
`query` and `variables`, while `parseResponse` unwraps `data.dataTable` and
surfaces GraphQL errors.

```ts
const query = `
  query DataTable($input: JSON!) {
    dataTable(input: $input)
  }
`;

const server = createDataTableServerAdapter<Person>({
  endpoint: 'https://api.example.com/graphql',
  serializeRequest: (payload) => JSON.stringify({
    query,
    variables: { input: payload },
  }),
  parseResponse: async (response) => {
    const envelope = await response.json();
    if (envelope.errors?.length) {
      throw new Error(envelope.errors.map((error) => error.message).join('; '));
    }
    return envelope.data.dataTable;
  },
});
```

The complete reusable client configuration is in
[`examples/server/client-adapters.mjs`](examples/server/client-adapters.mjs).

## Cursor pagination and infinite loading

The adapter exposes `cursorDataSource` for
`createDataTableCursorDataSourceController`. It sends `operation: "cursor"`
with `{ after, pageSize }` and returns rows, `nextCursor`, `hasMore`, and an
optional total.

```ts
import {
  createDataTableCursorDataSourceController,
  observeDataTableInfiniteScroll,
} from 'wts-data-table/data-source';
import { createDataTableServerAdapter } from 'wts-data-table/server';

const server = createDataTableServerAdapter<Person, string>({
  endpoint: 'https://api.example.com/api/data-table/cursor',
});

const cursorData = createDataTableCursorDataSourceController({
  dataSource: server.cursorDataSource,
  getRowId: (row) => row.id,
  pageSize: 50,
  table: table.core,
});

const stop = observeDataTableInfiniteScroll(cursorData, sentinel);
// Cleanup: stop(); cursorData.destroy();
```

[`examples/server/cursor-express.mjs`](examples/server/cursor-express.mjs)
returns HMAC-signed opaque cursors. Each cursor contains an offset and a hash
of the filter/sort query. Modified cursors and cursors reused after a query
change are rejected. A database implementation should encode the last stable
sort key and unique row ID rather than an offset.

## Replacing the in-memory query engine

`examples/server/shared.mjs` intentionally centralizes the transport-neutral
contract. In a production repository layer:

1. Allowlist column IDs and translate them to known SQL or ORM fields.
2. Convert filters to parameterized predicates; never concatenate values into
   SQL, GraphQL, or search expressions.
3. Apply a deterministic unique tie-breaker to every sort.
4. Fetch `pageSize + 1` cursor rows to calculate `hasMore`.
5. Build facets from the filtered query while excluding the pane's own filter.
6. Propagate cancellation to the database client where supported.
7. Invalidate `rows`, `facets`, or the complete adapter cache after mutations.

## Verification

Run `npm run test:package`. The integration suite starts each application on an
ephemeral localhost port and verifies REST pagination/sorting/filtering/facets,
GraphQL request/response mapping, multi-page cursor loading, and stale-cursor
rejection.
