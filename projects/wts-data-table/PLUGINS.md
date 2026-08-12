# Plug-in ecosystem

`wts-data-table/plugin` is an import-scoped plug-in registry for the modular
renderer. It does not use a global singleton, execute code discovered from the
network, or inject stylesheets. Applications explicitly import trusted plug-in
packages and decide which installation belongs to each table.

This package-level system is distinct from the older `DataTableOptions.plugins`
layout-slot callbacks. Ecosystem plug-ins can return one or more executable
feature modules and therefore participate in the whole renderer lifecycle.
Layout-slot callbacks support synchronous or asynchronous `init` and `destroy`
hooks. Use `ready()` and `destroyAsync()` when application sequencing depends
on those hooks; failures are available through `onPluginError` and the
`wts-data-table-plugin-error` event.

## Consume a plug-in

```ts
import { DataTable } from 'wts-data-table/base';
import {
  createDataTablePluginRegistry,
  useDataTablePlugin,
} from 'wts-data-table/plugin';
import { auditPlugin } from '@acme/wts-data-table-audit';
import '@acme/wts-data-table-audit/styles.css';
import 'wts-data-table/base.css';

const installation = createDataTablePluginRegistry([auditPlugin]).resolve([
  useDataTablePlugin(auditPlugin.manifest.name, { endpoint: '/api/audit' }),
]);

new DataTable({
  columns,
  data,
  element: '#orders',
  features: installation.features,
});
```

Dependencies registered with the same registry are installed transitively in
topological order. Resolution is per call, so two tables can install different
plug-ins or options without sharing mutable state.

## Author a plug-in

```ts
import { defineDataTablePlugin } from 'wts-data-table/plugin';

export const auditPlugin = defineDataTablePlugin({
  manifest: {
    apiVersion: 1,
    name: '@acme/wts-data-table-audit',
    version: '1.0.0',
    engines: { wtsDataTable: '^1.0.0' },
    renderers: ['base'],
    styles: ['@acme/wts-data-table-audit/styles.css'],
    keywords: ['wts-data-table-plugin', 'audit'],
  },
  validateOptions: (value) => parseAuditOptions(value),
  createFeatures: ({ options }) => [
    {
      name: 'audit-events',
      runtime: {
        create: (host) => ({
          handleEvent: (event) => sendAuditEvent(event, host, options),
        }),
      },
    },
  ],
});
```

The returned features use the public `wts-data-table/base-runtime` hooks.
Plug-ins may also provide a `configure` hook on their features for the
compatibility renderer and declare `renderers: ['base', 'complete']`.

## Manifest and compatibility

The v1 manifest supports:

- `name`, `version`, `apiVersion`, author, license, homepage, and keywords;
- `engines.wtsDataTable` compatibility;
- versioned transitive `dependencies` and symmetric conflict detection;
- supported `renderers`;
- explicit stylesheet export metadata.

Version matching supports exact versions, `x`/`*` wildcards, caret, tilde,
`>`, `>=`, `<`, `<=`, whitespace AND, and `||`. The published schema is
available as `wts-data-table/plugin-manifest.schema.json`.

`registry.catalog()` and `createDataTablePluginCatalog()` produce stable,
alphabetically ordered JSON metadata for documentation sites and internal
registries. Catalogs contain metadata only; they never act as code loaders.

## Discovery convention

Published ecosystem packages should:

1. include `wts-data-table-plugin` in `package.json` keywords;
2. export one or more definitions created by `defineDataTablePlugin()`;
3. export CSS through an explicit package subpath when needed;
4. publish a manifest compatible with the JSON schema;
5. keep framework dependencies optional and use peer dependencies when needed.

The complete external example is in
`examples/plugins/row-highlight`. The setup assistant can generate imports:

```sh
npx wts-data-table setup \
  --renderer base \
  --plugins @acme/wts-data-table-audit#auditPlugin \
  --write
```

Multiple plug-ins are comma-separated. `#dataTablePlugin` is optional when the
package uses that conventional export name.

## Security and lifecycle

- Import and review plug-in packages exactly like application dependencies.
- A catalog entry is not trusted executable code.
- The registry validates API versions, engine ranges, dependency versions,
  renderer support, duplicate features, conflicts, and cycles before a table
  is created.
- Runtime resources belong to feature controllers and must be reclaimed by
  their `destroy()` hook.
- Styles are never loaded automatically; `installation.styles` is informational.
