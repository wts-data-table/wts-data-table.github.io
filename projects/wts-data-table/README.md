# wts-data-table

Accessible, dependency-free data tables for JavaScript and TypeScript. The
package is framework-agnostic by design:

- `DataTableCore<T>` is a DOM-free row-model and state engine.
- `DataTable<T>` renders a semantic HTML table into any DOM element.
- `<wts-data-table>` provides an optional Web Component.

Sorting, local or remote SearchPanes, typed filtering, pagination, row and cell-range
selection, nested grouping, grouped headers, aggregation, inline editing,
AutoFill, dialog/bubble/inline CRUD workflows, pluggable layouts,
unified action buttons and ColumnControl, PDF/print/XLSX export,
responsive/resizable/reorderable/pinnable columns, semantic row
virtualization, standalone sticky sections, orthogonal values, abortable
async data sources, named saved views, safe export,
loading states, custom cells, localized labels, and manual server processing
are included. A public import-scoped plug-in ecosystem supports independently
published behavior without a global registry. There are no runtime dependencies.

Nine optional internationalization packs provide exact tree-shakable imports,
locale negotiation, RTL metadata, translated modular controls, and platform
`Intl` formatters.

## Developer guides

Use these focused guides with this README:

- [Framework wrappers](https://unpkg.com/wts-data-table@1/FRAMEWORK_WRAPPERS.md) — Angular, React, and Vue
  integration contracts and lifecycle patterns.
- [Plug-in development](https://unpkg.com/wts-data-table@1/PLUGINS.md) — manifests, feature runtimes,
  dependency resolution, compatibility, and distribution.
- [Themes](https://unpkg.com/wts-data-table@1/THEMES.md) — built-in framework adapters, automatic detection,
  custom themes, and CSS integration.
- [Internationalization](https://unpkg.com/wts-data-table@1/I18N.md) — locale packs, negotiation, fallback,
  formatting, lazy loading, and RTL behavior.
- [Browser/server integration](https://unpkg.com/wts-data-table@1/SERVER_INTEGRATIONS.md) — remote data,
  request handling, cursors, uploads, and runnable examples.
- [Server packages](https://unpkg.com/wts-data-table@1/SERVER_PACKAGES.md) — protocol and server-package
  boundaries for backend applications.
- [Database adapters](https://unpkg.com/wts-data-table@1/DATABASE_ADAPTERS.md) — SQL, PostgreSQL, MySQL,
  SQLite, Knex, and Prisma adapters.
- [Bundle-size contract](https://unpkg.com/wts-data-table@1/BUNDLE_SIZE.md) — modular consumer measurements,
  budgets, and regression checks.
- [API stability](https://unpkg.com/wts-data-table@1/API_STABILITY.md) — stable public contracts and semantic
  versioning guarantees.

## Install

```bash
npm install wts-data-table
```

Load the stylesheet once when using the DOM controller or Web Component:

```ts
import 'wts-data-table/styles.css';
```

## Modular, complete, and lite renderers

`wts-data-table/base` is the truly modular renderer. Sorting, filtering, and
pagination are built in; every optional UI behavior is supplied by the exact
feature module imported by the application:

```ts
import { DataTable } from 'wts-data-table/base';
import { responsiveFeature } from 'wts-data-table/features/responsive';
import { selectionFeature } from 'wts-data-table/features/selection';
import 'wts-data-table/base.css';

const table = new DataTable<Person>({
  columns,
  data: people,
  element: '#people-table',
  features: [
    selectionFeature({ mode: 'multiple' }),
    responsiveFeature(),
  ],
  getRowId: (person) => person.id,
});
```

First-party runtime entry points are `selection`, `grouping`, `editing`,
`responsive`, `virtualization`, `search-panes`, `export`, `pivot`,
`column-control`, and `sticky` under `wts-data-table/features/*`. They carry
their own render/event/runtime hooks, so omitted behavior is absent from the
consumer bundle. Dependencies and conflicts fail early with clear errors.

Third parties can implement the same public runtime contract without patching
the renderer:

```ts
import type { DataTableBaseFeature } from 'wts-data-table/base-runtime';

const denseFeature: DataTableBaseFeature<Person> = {
  name: 'product-density',
  runtime: {
    create: ({ root }) => ({
      decorateRoot: () => root.dataset['density'] = 'product',
      destroy: () => delete root.dataset['density'],
    }),
  },
};
```

For published packages, wrap runtime features in a validated manifest and
resolve them per table:

```ts
import {
  createDataTablePluginRegistry,
  useDataTablePlugin,
} from 'wts-data-table/plugin';
import { auditPlugin } from '@acme/wts-data-table-audit';

const installation = createDataTablePluginRegistry([auditPlugin]).resolve([
  useDataTablePlugin(auditPlugin.manifest.name, { endpoint: '/api/audit' }),
]);

new DataTable({ ...options, features: installation.features });
```

See [PLUGINS.md](https://unpkg.com/wts-data-table@1/PLUGINS.md) for dependency resolution, manifests, catalogs,
CSS, discovery conventions, security, and the complete external example.

The existing `wts-data-table` entry stays backward compatible and includes
the complete renderer. `wts-data-table/complete` is an explicit alias for the
same renderer and is recommended when code wants to communicate that choice:

```ts
import { DataTable } from 'wts-data-table/complete';
import 'wts-data-table/styles.css';
```

Presets work with the modular renderer and import their runtime modules:

```ts
import { standardPreset } from 'wts-data-table/presets';

new DataTable({ ...options, features: standardPreset() });
```

`litePreset()` adds no optional modules, `standardPreset()` adds selection and
responsive behavior, and `completePreset()` adds all ten first-party runtime
modules. Presets are ordinary arrays and can be extended or replaced.

For compact read-heavy tables, the separate semantic renderer supports
sorting, global/per-column filtering, pagination, grouping, selection,
responsive overflow, and row virtualization at about 17 KB gzip:

```ts
import { DataTable } from 'wts-data-table/lite';
import { selectionFeature } from 'wts-data-table/features/selection';
import 'wts-data-table/lite.css';

new DataTable({
  columns,
  data: people,
  element: '#people-table',
  features: [selectionFeature()],
  getRowId: (person) => person.id,
});
```

The lite renderer rejects unsupported modules rather than silently ignoring
them. See [BUNDLE_SIZE.md](https://unpkg.com/wts-data-table@1/BUNDLE_SIZE.md) for reproducible consumer-bundle
measurements and budgets.

| Capability/module | Modular `/base` | Compatibility `/complete` | `/lite` |
| --- | --- | --- | --- |
| Sorting, filtering, pagination | Built in | Built in | Built in |
| Selection | Imported row runtime | Row/cell/range UI | Row selection |
| Grouping | Imported collapsible runtime | Nested controls/aggregates | Collapsible rows |
| Responsive | Imported card runtime | Details and card grid | Overflow treatment |
| Virtualization | Imported fixed/variable-row runtime | Semantic row/column viewport | Row/column viewport |
| Editing | Imported inline runtime | Inline/dialog/bubble, ranges, AutoFill | Unsupported |
| SearchPanes | Imported local facets | Local/remote cascading facets | Unsupported |
| Export | Imported copy/CSV/XLSX/PDF/print runtime | Complete export surfaces | Unsupported |
| Pivot | Imported row-dimension runtime and headless model | Complete pivot APIs | Unsupported |
| Column control/sticky | Imported runtimes | Complete implementations | Unsupported |

Measured minified consumer bundles are approximately 12.6 KB gzip for bare
`/base`, 13.6 KB with `standardPreset()`, 20.2 KB with every first-party
runtime, and 46.7 KB for the compatibility renderer.

The setup assistant can generate the exact imports:

```bash
npx wts-data-table setup --preset lite --write
npx wts-data-table setup --renderer base --preset standard --write
npx wts-data-table setup --renderer base --features selection,responsive,virtualization --write
npx wts-data-table setup --renderer base --plugins @acme/wts-data-table-audit#auditPlugin --write
npx wts-data-table setup --renderer complete --write
```

### Internationalization

```ts
import { dataTableBaseLocaleOptions } from 'wts-data-table/i18n';
import { arLocale } from 'wts-data-table/locales/ar';

new DataTable({
  ...dataTableBaseLocaleOptions(arLocale),
  element: '#people',
  columns,
  data,
});
```

Arabic applies `dir="rtl"`; all packs configure core collation and renderer
labels together. Exact entries are available for `en`, `fr`, `de`, `es`,
`ar`, `hi`, `ja`, `zh-CN`, and `pt-BR`. See [I18N.md](https://unpkg.com/wts-data-table@1/I18N.md) for locale
negotiation, lazy loading, formatters, fallback, and custom packs.

### Existing Bootstrap, Bulma, Tailwind, or other framework

Theme adapters use the framework stylesheet that the application has already
loaded. They never import or bundle another copy of Bootstrap, Bulma,
Foundation, Fomantic UI, jQuery UI, or Tailwind:

```ts
import { bootstrap5Theme } from 'wts-data-table/themes/bootstrap5';

new DataTable({
  element: '#people-table',
  columns,
  data,
  theme: bootstrap5Theme,
});
```

The WTS stylesheet remains the structural/accessibility layer and is placed in
the low-priority `wts-data-table` CSS cascade layer. Do not import Bootstrap's
stylesheet again in the table module when it is already global. See
[THEMES.md](https://unpkg.com/wts-data-table@1/THEMES.md) for Bootstrap 5, Bulma, Foundation, Fomantic UI,
jQuery UI, Tailwind, custom adapters, and Tailwind source scanning.

For the shortest setup, let the table detect CSS already active in the page:

```ts
const table = new DataTable({
  element: '#people-table',
  columns,
  data,
  theme: 'auto',
});

console.log(table.getThemeStatus());
table.setTheme('bootstrap5');
```

If no supported stylesheet is detected—or a named stylesheet is missing—the
table safely uses the default theme and emits a development diagnostic. Set
`themeDiagnostics: false` to silence console diagnostics while retaining the
status API and `wts-data-table-theme-change` event.

The Web Component supports the same names:

```html
<wts-data-table theme="auto"></wts-data-table>
```

Run the optional setup assistant for dependency detection, exact imports, and
Tailwind configuration:

```bash
npx wts-data-table setup --theme auto
npx wts-data-table setup --theme bootstrap5 --write
```

It reports missing framework dependencies and installs one only when
`--install` is explicitly supplied.

## DOM controller

```html
<div id="people-table"></div>
```

```ts
import { DataTable } from 'wts-data-table';
import 'wts-data-table/styles.css';

interface Person {
  id: string;
  name: string;
  role: string;
  joined: Date;
}

const table = new DataTable<Person>({
  element: '#people-table',
  caption: 'Team members',
  data: people,
  getRowId: (person) => person.id,
  columns: [
    {
      accessor: 'name',
      editable: true,
      header: 'Name',
      responsive: 'always',
      responsivePriority: 1,
    },
    {
      accessor: 'role',
      editable: true,
      header: 'Role',
      responsivePriority: 2,
    },
    {
      accessor: 'joined',
      aggregation: 'min',
      header: 'Joined',
      dataType: 'date',
      cell: (value) => new Intl.DateTimeFormat().format(value as Date),
    },
  ],
  initialState: {
    grouping: ['role'],
    pagination: { pageSize: 25 },
    sorting: [{ id: 'name', direction: 'asc' }],
  },
  editing: true,
  pagination: {
    mode: 'pages',
    showPageJump: true,
  },
  responsive: { breakpoint: 720, details: 'inline' },
  selectionMode: 'multiple',
  bulkActions: {
    showSelectAllFiltered: true,
    actions: [{
      id: 'archive',
      label: 'Archive',
      content: ({ document }) => createArchiveIcon(document),
      onAction: async ({ allFiltered, excludedRowIds, selectedRowIds }) => {
        await archiveRows({ allFiltered, excludedRowIds, selectedRowIds });
      },
    }],
  },
  rowReordering: true,
  rowPinning: { defaultPosition: 'top', sticky: true },
  summaryRows: {
    columns: { name: 'count', joined: 'min' },
    label: 'Total',
    scope: 'filtered',
    sticky: true,
  },
  columnFilters: {
    mode: 'collapsible',
    initiallyExpanded: false,
  },
  advancedFiltering: true,
  showColumnManager: true,
  showGrouping: true,
});

table.setGlobalFilter('engineer');
table.setData(nextPeople);
table.applyTransaction({
  add: [{ id: 'p4', name: 'Lin', role: 'Engineer' }],
  remove: ['p2'],
  update: [{ id: 'p1', data: { id: 'p1', name: 'Ada', role: 'Lead' } }],
});
table.getSelectedRows();

// Call from the owning view's cleanup hook.
table.destroy();
```

The controller only removes DOM that it created. Mounting another table into
the same element safely destroys the earlier instance.

## Headless core

Use the core when a framework should own every rendered node:

```ts
import { createDataTableCore } from 'wts-data-table/core';

const table = createDataTableCore({
  data: people,
  columns: [
    { accessor: 'name', header: 'Name' },
    { accessor: 'role', header: 'Role' },
  ],
  getRowId: (person) => person.id,
  initialState: { pagination: { pageSize: 20 } },
});

const unsubscribe = table.subscribe((state, reason) => {
  // Update a signal, ref, store, or component state.
  console.log(reason, state);
});

table.toggleSorting('name');
table.setGrouping(['role']);
const visibleRows = table.getRowModel();
```

`DataTableCore` does not read browser globals. Its entry point is safe in SSR,
workers, Node.js, and unit tests.

## Columns

```ts
interface DataTableViewColumn<T> {
  id?: string;
  header: string;
  accessor: keyof T | ((row: T, index: number) => unknown);
  aggregation?: 'count' | 'sum' | 'average' | 'min' | 'max'
    | ((context) => unknown);
  enableFiltering?: boolean;
  enableGrouping?: boolean;
  enableHiding?: boolean;
  enableReordering?: boolean;
  enableSorting?: boolean;
  dataType?: 'text' | 'number' | 'date' | 'boolean';
  filterVariant?: 'text' | 'number-range' | 'date-range'
    | 'datetime-range' | 'time-range' | 'select' | 'boolean';
  filterOptions?: readonly { label: string; value: string | number | boolean }[];
  filter?: (context) => boolean;
  sort?: (context) => number;
  align?: 'start' | 'center' | 'end';
  width?: number | string;
  headerGroup?: string | readonly string[];
  cell?: (value, row, column) =>
    string | number | boolean | Node | null | undefined;
  cellClass?: string;
  editable?: boolean | {
    type?: 'text' | 'number' | 'date' | 'datetime-local'
      | 'time' | 'select';
    min?: string | number;
    max?: string | number;
    step?: number | 'any';
    editor?: (context) => HTMLElement;
    parse?: (input, context) => unknown;
    validate?: (value, context) =>
      string | undefined | Promise<string | undefined>;
    setValue?: (row, value, context) => T;
  };
  headerClass?: string;
  meta?: Readonly<Record<string, unknown>>;
  responsive?: 'always' | 'auto' | 'never';
  responsivePriority?: number;
}
```

A property accessor supplies its own column ID. A function accessor requires
an explicit, stable `id`.

String cell values are assigned with `textContent`, not `innerHTML`. Return a
DOM `Node` from `cell` for links, badges, buttons, or other rich content.

Use `orthogonal` when a stored value needs different display, sort, filter,
and export representations:

```ts
{
  accessor: 'joined',
  header: 'Joined',
  orthogonal: ({ value }) => ({
    display: dateFormatter.format(new Date(String(value))),
    sort: new Date(String(value)).getTime(),
    filter: new Date(String(value)).toISOString().slice(0, 10),
    export: new Date(String(value)).toISOString(),
  }),
}
```

## Row grouping and aggregation

Grouping is controlled by `state.grouping`, an ordered list of column IDs.
Group rows are expanded by default; explicit choices are stored in
`state.groupExpansion`, so grouping survives saved views and URL persistence.

```ts
const table = new DataTable({
  // ...
  columns: [
    { accessor: 'department', header: 'Department' },
    { accessor: 'status', header: 'Status' },
    { accessor: 'salary', header: 'Salary', aggregation: 'average' },
  ],
  initialState: { grouping: ['department', 'status'] },
  showColumnManager: true,
  showGrouping: true,
});

table.setGrouping(['department']);
const firstGroup = table.core.getGroupedRowModel()[0];
table.setGroupExpanded(firstGroup.id, false);
```

Use `count`, `sum`, `average`, `min`, or `max`, or supply a custom aggregation
function. The header three-dot menu can group or ungroup its column. With
`showGrouping: true`, users can also drag header grips into the grouping bar,
remove grouping chips, and expand or collapse every group. Columns opt out
with `enableGrouping: false`.

`getRowModel()` remains the flat paginated leaf-row API.
`getGroupedRowModel()` returns the nested tree and `getDisplayRowModel()`
returns the flattened visible sequence of group headers and expanded leaves.

## Aggregate summary footers

`summaryRows` renders semantic aggregate rows in `<tfoot>` and uses the same
`count`, `sum`, `average`, `min`, `max`, and custom aggregation functions as
group rows:

```ts
const table = new DataTable({
  // ...
  summaryRows: {
    id: 'totals',
    scope: 'filtered',
    sticky: true,
    label: 'Team total',
    labelColumnId: 'department',
    columns: {
      employee: 'count',
      salary: {
        aggregation: 'average',
        render: ({ value }) => formatCurrency(Number(value)),
      },
    },
  },
});
```

Scopes are `filtered`, `page`, `selected`, and `custom`. Custom scopes provide
`getRows({ filteredRows, pageRows, selectedRows, state, table })`. Pass an
array to render multiple summary rows with independent scopes, labels,
classes, renderers, and sticky behavior. Labels and cell renderers accept safe
text or direct DOM/SVG nodes.

The headless equivalent is
`core.getSummaryRowModel([{ id, scope, aggregations }])`. For server-owned
aggregates, call `setSummaryValues({ totals: { salary: 1234 } })` or pass the
values as the third argument to `setData(rows, rowCount, summaryValues)`.
Server values override locally calculated cells.

## Expandable rows, tree data, and master-detail

Return child records from `getSubRows()` to enable hierarchical rows. The
headless row model adds `depth`, `parentId`, and `subRows` metadata to tree
rows while preserving the original flat-row shape when tree data is disabled.

```ts
interface TeamNode {
  id: string;
  name: string;
  owner: string;
  children?: readonly TeamNode[];
}

const table = new DataTable<TeamNode>({
  // ...
  getRowId: (row) => row.id,
  getSubRows: (row) => row.children,
  initialState: {
    rowExpansion: { engineering: true },
  },
  rowExpansion: {
    allowMultiple: true,
    expandOnRowClick: false,
    showControls: true,
    renderToggle({ document, expanded }) {
      const icon = document.createElement('span');
      icon.textContent = expanded ? '−' : '+';
      return icon;
    },
    renderDetailPanel(row) {
      const panel = document.createElement('div');
      panel.textContent = `${row.original.name} is owned by ${
        row.original.owner
      }`;
      return panel;
    },
  },
});

table.setRowExpanded('engineering', true);
table.toggleRowExpanded('engineering');
table.expandAllRows();
table.collapseAllRows();
```

Tree filtering retains the ancestor path to matching descendants. Sorting is
applied independently at each sibling level, and pagination counts root rows
so expanding a branch does not unexpectedly move it to another page.
`getRowModel()` returns the current page of root rows; `getDisplayRowModel()`
returns the visible flattened tree.

For server-loaded children, provide `loadSubRows(row, { signal, table })` and
use `getRowCanExpand()` to identify unloaded parents. The first expansion
loads and caches the children; `loadRowChildren(id, true)` explicitly reloads
them. `getRowLoadState(id)` exposes `idle`, `loading`, `loaded`, and `error`
states. Failures call `onRowLoadError` and emit
`wts-data-table-row-load-error`. Expansion is also included in async
data-source request state, persistence, saved views, and URL state. Set
`allowMultiple: false` for an accordion-style master-detail table.

Tree rows work with fixed or variable-height virtualization. Column grouping
operates on the paginated root-row model when tree data is also configured.

## Responsive columns

Responsive mode collapses lower-priority columns when the table becomes
narrow. Lower `responsivePriority` values stay visible longer. Use
`responsive: 'always'` for an identity or primary-action column,
`responsive: 'never'` to always place a value in row details, and the default
`'auto'` behavior for priority-based collapsing.

```ts
const table = new DataTable({
  // ...
  columns: [
    {
      accessor: 'name',
      header: 'Customer',
      responsive: 'always',
      responsivePriority: 1,
      width: 240,
    },
    { accessor: 'status', header: 'Status', responsivePriority: 2 },
    { accessor: 'company', header: 'Company', responsivePriority: 3 },
    { accessor: 'notes', header: 'Notes', responsive: 'never' },
  ],
  responsive: {
    breakpoint: 720,
    details: 'inline', // 'popover' or false
  },
});
```

Collapsed values remain available through accessible row-detail toggles.
Inline details automatically become popovers when row virtualization is
enabled, preserving fixed-height rows. Responsive collapsing is transient:
it does not change `state.columnVisibility`, so explicit user choices and
saved views survive viewport changes.

Use `getResponsiveHiddenColumns()` to inspect the current responsive result,
`onResponsiveChange` for a callback, or listen for
`wts-data-table-responsive-change`, whose detail contains
`{ instance, hiddenColumnIds }`.

## Card view

`wts-data-table/card-view` switches the processed page between its semantic
table and a responsive CSS card grid. Sorting, filtering, paging, visible
columns, cell renderers, and row selection stay synchronized.

```ts
import { createDataTableCardView } from 'wts-data-table/card-view';

const cards = createDataTableCardView({
  table,
  mode: 'auto',
  breakpoint: 720,
  minCardWidth: '17rem',
  renderField: ({ columnId, value }) => `${columnId}: ${value}`,
});

cards.setMode('cards');
cards.setMode('table');
cards.setMode('auto');
cards.destroy();
```

`renderCard` can replace a complete card with text or a direct DOM/SVG node.
Set `showToggle: false` when the application supplies its own view controls.

## Inline editing

Editing is opt-in. Enabling it adds ARIA grid semantics, a roving cell
tabindex, Arrow-key navigation, Shift+Arrow range selection, Enter/F2 and
double-click activation, Escape cancellation, and Tab commit-and-move.

```ts
const table = new DataTable<Product>({
  // ...
  editing: true,
  columns: [
    { accessor: 'name', editable: true, header: 'Product' },
    {
      accessor: 'price',
      dataType: 'number',
      editable: {
        validate(value) {
          return typeof value === 'number' && value >= 0
            ? undefined
            : 'Price must be zero or greater.';
        },
      },
      header: 'Price',
    },
    {
      accessor: 'status',
      editable: true,
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
      ],
      header: 'Status',
    },
  ],
  async onEditCommit({ rowId, columnId, value }) {
    // The table already displays the optimistic value.
    // Rejecting this promise restores the previous value.
    await updateProduct(rowId, { [columnId]: value });
  },
});
```

The built-in editor is inferred from `dataType` and `filterOptions`. Use
`type`, `parse`, and synchronous or asynchronous `validate` for custom
behavior. A function accessor requires an immutable `setValue` callback.
For fully custom UI, return an `HTMLElement` from `editor(context)` and call
`context.commit(value)` or `context.cancel()`.

Successful changes remain marked dirty until
`clearDirtyCells()` is called. `getDirtyCells()` returns their stable row and
column IDs. Async persistence displays a saving indicator; rejection rolls
the value back and exposes an accessible cell error.

Selected cells copy as TSV. Pasting TSV starts at the active cell, applies
typed parsing and validation, and skips read-only columns. Disable this with
`editing: { paste: false }`.

Set `autoFill: true` to show a drag handle on the active editable cell, or
use `{ mode: 'copy' | 'series', showHandle }`. `autoFillTo(target, mode)` is
also public for keyboard, menu, or application-defined workflows. Numeric
two-cell selections continue their series; other selections repeat their
source matrix through the destination range.

An editable table keeps an internal first-cell tab stop for keyboard entry,
but it does not show that cell as active or expose `aria-selected="true"` on
initial render. Active-cell presentation begins only after focus, click,
keyboard navigation, or an editing command. This keeps the visual selection
distinct from checkbox-based row selection.

Lifecycle hooks are `onBeforeEdit`, `onCellChange`, `onEditCommit`,
`onEditCancel`, and `onEditError`. Equivalent bubbling events are
`wts-data-table-before-edit` (cancelable), `wts-data-table-cell-change`,
`wts-data-table-edit-commit`, `wts-data-table-edit-cancel`, and
`wts-data-table-edit-error`.

## Filtering and sorting

Global filtering checks every column unless `enableFiltering` is false.
Column filters are combined with the global filter. Strings remain shorthand
for a case-insensitive substring match. Structured filters support `contains`,
`regex`, `equals`, `starts-with`, `ends-with`, `gt`, `gte`, `lt`, `lte`, `between`,
`in`, `empty`, and `not-empty`.

Configure global matching without changing the controlled string state:

```ts
const table = new DataTable({
  // ...
  globalFilterOptions: {
    mode: 'contains' | 'equals' | 'starts-with' | 'regex',
    caseSensitive: false,
    trim: true,
  },
});
```

Invalid regular expressions safely match no rows. Regular-expression mode is
opt-in; the default remains a trimmed, case-insensitive substring search.

```ts
table.setColumnFilter('score', {
  operator: 'between',
  value: 70,
  valueTo: 100,
});

table.setColumnFilter('team', {
  operator: 'regex',
  value: '^(Design|Product)$',
  caseSensitive: true,
});

// Header-filter strings for this column use regex automatically.
const teamColumn = {
  accessor: 'team',
  header: 'Team',
  columnFilterOptions: { mode: 'regex', caseSensitive: true },
};
```

Set `dataType` to get an appropriate range or boolean control, or choose an
explicit `filterVariant`. Custom `filter` callbacks still receive the legacy
text `query` plus the structured `filter`.

Configure the header filter row independently from column filtering:

```ts
columnFilters: {
  mode: 'hidden' | 'always' | 'collapsible',
  initiallyExpanded: false,
}
```

In `collapsible` mode, a compact funnel button in the final visible column
header expands and collapses the row without clearing active filters. The
button exposes `aria-expanded` and indicates when a filter is active.
`showColumnFilters: true` remains a backwards-compatible alias for
`columnFilters: 'always'`. Set `enableFiltering: false` on an individual
column to omit only that column's filter.

Set `advancedFiltering: true` to add removable filter chips and an accessible
visual query builder. The controlled `advancedFilter` state is a nested tree
of `and`/`or` groups and typed conditions:

```ts
table.setAdvancedFilter({
  id: 'root',
  logic: 'and',
  type: 'group',
  children: [
    {
      id: 'adult',
      type: 'condition',
      columnId: 'age',
      operator: 'gte',
      value: 18,
    },
    {
      id: 'team-or-status',
      logic: 'or',
      type: 'group',
      children: [
        {
          id: 'teams',
          type: 'condition',
          columnId: 'team',
          operator: 'in',
          value: ['Design', 'Product'],
        },
        {
          id: 'active',
          type: 'condition',
          columnId: 'status',
          operator: 'equals',
          value: 'Active',
        },
      ],
    },
  ],
});
```

Use `advancedFiltering: { showBuilder, showChips }` to configure the two
surfaces separately. `clearFilters()` clears global, column, and advanced
filters.

`getColumnFacet(columnId, limit?)` returns unique values with counts plus
minimum, maximum, and total metadata. Client facets apply global and other
column filters while excluding the faceted column's own column filter.
Advanced filters participate in client filtering, async data-source requests,
saved views, storage and URL persistence, and emit the `advanced-filter`
state-change reason.

Click a header to cycle through ascending, descending, and unsorted states.
Shift-click adds a column to multi-column sorting. The built-in comparator
supports strings with numeric collation, numbers, booleans, dates, nulls, and
stable tie-breaking. Provide `sort` for domain-specific ordering, select a
named built-in with `sortType`, or register an application comparator once:

```ts
import { registerDataTableSortType } from 'wts-data-table';

const unregister = registerDataTableSortType('priority', ({ valueA, valueB }) =>
  priority.indexOf(String(valueA)) - priority.indexOf(String(valueB)),
);

const columns = [
  { accessor: 'version', header: 'Version', sortType: 'semantic-version' },
  { accessor: 'priority', header: 'Priority', sortType: 'priority' },
];

// Optional during application teardown:
unregister();
```

Built-ins are `boolean`, `currency`, `date`, `file-size`, `formatted-number`,
`html-text`, `ip-address`, `month-year`, `natural`, `number`, `numeric-comma`,
`percentage`, `semantic-version`, and `text`. Per-table `sortTypes` can
override or add names without changing the global registry.

Columns can also configure their activation cycle and null placement:

```ts
{
  accessor: 'score',
  header: 'Score',
  sortSequence: ['desc', 'asc', false],
  sortNulls: 'last', // `auto`, `first`, or `last`
}
```

`first` and `last` keep nullish values in that position in both ascending and
descending order. `auto` retains direction-sensitive comparator behavior.

## Adaptive pagination

Numbered pagination is enabled by default and contracts large page ranges
with accessible ellipses:

```text
‹  1  …  8  9  10  …  42  ›
```

Configure every footer section and navigation control independently:

```ts
const nextIcon = document.createElementNS(
  'http://www.w3.org/2000/svg',
  'svg',
);

const table = new DataTable({
  // ...
  pagination: {
    mode: 'pages',       // or 'simple'
    boundaryCount: 1,
    siblingCount: 1,
    showFirst: true,
    showPrevious: true,
    showPageNumbers: true,
    showPageStatus: true,
    showNext: true,
    showLast: true,
    showPageJump: true,
    showPageSize: true,
    showSummary: true,
    controls: {
      next: {
        content: nextIcon, // Direct SVGElement, HTMLElement, Text, etc.
        className: 'my-next-button',
        ariaLabel: 'Continue',
        title: 'Open the next page',
      },
      previous: {
        content: ({ document }) =>
          document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      },
      page: {
        content: ({ page }) => String(page),
        className: ({ active }) => active ? 'is-current' : 'page-link',
      },
      ellipsis: {
        content: '…',
      },
    },
  },
});
```

`controls` accepts `first`, `previous`, `page`, `ellipsis`, `next`, and
`last`. Each supports `content`, `className`, `ariaLabel`, and `title` as
either a direct value or callback. Content may be text or any DOM `Node`,
including inline SVG icons. Static nodes are cloned safely; callbacks receive
`control`, `currentPage`, `pageCount`, `page`, `active`, `disabled`, and the
owning `document`.

`showFirstLast` remains a backwards-compatible pair setting. Explicit
`showFirst` and `showLast` values take precedence.

The active page uses `aria-current="page"`. Page jump supports both change and
Enter, and invalid values are clamped by the headless core. Below 40rem, the
footer automatically switches to previous/next controls with compact
“Page x of y” status. `pagination: false` hides the footer;
`pagination: { mode: 'simple' }` preserves the earlier status-only layout.

The same renderer works with client rows or `manualPagination` and
`rowCount`.

## Server-side data

The table can own interaction state while an API owns the row pipeline:

```ts
const table = new DataTable<User>({
  element: '#users',
  columns,
  data: firstPage.rows,
  rowCount: firstPage.total,
  manualFiltering: true,
  manualSorting: true,
  manualPagination: true,
  initialState: { pagination: { pageSize: 25 } },
  async onStateChange(state) {
    table.setLoading(true);
    try {
      const result = await fetchUsers({
        filter: state.globalFilter,
        columnFilters: state.columnFilters,
        page: state.pagination.pageIndex,
        pageSize: state.pagination.pageSize,
        sorting: state.sorting,
      });
      table.setData(result.rows, result.total);
    } finally {
      table.setLoading(false);
    }
  },
});
```

With `manualPagination`, `data` is treated as the current page and `rowCount`
controls the page count. With manual filtering or sorting, the corresponding
state still updates and emits, but the local rows are not processed.

### Abortable async data sources

The optional data-source controller adds debouncing, `AbortSignal`
cancellation, stale-response protection, request caching, and observable
loading/error status without coupling the table to `fetch`:

```ts
import { createDataTableDataSourceController } from 'wts-data-table/data-source';

const remote = createDataTableDataSourceController({
  table: table.core,
  debounceMs: 200,
  async dataSource({ state, signal }) {
    table.setLoading(true);
    const response = await fetch('/api/people?' + toQuery(state), { signal });
    const result = await response.json();
    return {
      rows: result.rows,
      rowCount: result.total,
      summaryValues: result.summaryValues,
    };
  },
  onStatusChange(status) {
    table.setLoading(status.phase === 'loading');
    if (status.phase === 'error') showError(status.error);
  },
});

// Framework cleanup hook
remote.destroy();
```

Use `refresh(true)` to bypass the cache and `invalidate()` after mutations.
Set the core's `manualFiltering`, `manualSorting`, and `manualPagination`
options so the server remains responsible for its row pipeline.

Every request includes `filtering.global` with the normalized `mode`,
`caseSensitive`, and `trim` configuration. Forwarding that object through the
unified server adapter lets SQL adapters mirror all modes automatically.
Prisma mirrors contains/exact/prefix and case options; because Prisma has no
portable regex predicate, regex requests fail explicitly and should use a SQL
or custom adapter.

### Unified rows and SearchPanes server adapter

Use `wts-data-table/server` when rows and remote facets should share one
authenticated transport, retry policy, cache, error contract, and telemetry:

```ts
import { createDataTableServerAdapter } from 'wts-data-table/server';

const server = createDataTableServerAdapter<Person>({
  endpoint: ({ operation }) => `/api/people/${operation}`,
  headers: async () => ({ authorization: `Bearer ${await getToken()}` }),
  retries: 2,
  retryDelayMs: (attempt) => 150 * 2 ** (attempt - 1),
  onEvent: (event) => telemetry.record(event),
});

const table = new DataTable({
  // ...
  searchPanes: { loadFacets: server.loadFacets },
});

const remote = createDataTableDataSourceController({
  table: table.core,
  dataSource: server.dataSource,
});
```

Rows, facets, and cursor operations send the complete table state. Facet
requests also include pane IDs and search queries. `serializeRequest` maps the
native payload to GraphQL or an existing API envelope; `parseResponse` maps
the response back to the standard contract. Superseded retries stop
immediately through the provided `AbortSignal`;
`invalidate('rows' | 'facets' | 'cursor')` clears targeted cache entries and
`getMetrics()` reports requests, retries, cache hits, successes, and errors.

Runnable REST/Express, GraphQL, and HMAC-signed cursor implementations are in
[`SERVER_INTEGRATIONS.md`](SERVER_INTEGRATIONS.md). Start them with
`npm run example:rest`, `npm run example:graphql`, or
`npm run example:cursor`.

### Database-backed server adapters

`@wts-data-table/server` converts the same payload into allowlisted Prisma or
SQL queries and supplies Express, GraphQL, and Fetch handlers. Injected Prisma,
Knex, PostgreSQL, MySQL, and SQLite clients
support filters, multi-sort, offset pages, remote facets, editor options, and
signed keyset cursors. SQL adapters also calculate configured summaries.

```ts
import {
  createDataTableExpressHandler,
  createDataTablePostgreSqlAdapter,
} from '@wts-data-table/server';

const database = createDataTablePostgreSqlAdapter<Person>({
  client: pgPool,
  table: 'people',
  primaryKey: 'id',
  cursorSecret: process.env.CURSOR_SECRET!,
  columns: [
    { id: 'id', field: 'id', searchable: false },
    { id: 'name', field: 'name', facet: true },
    { id: 'score', field: 'score', type: 'number' },
  ],
});

app.post('/api/data-table', createDataTableExpressHandler({
  adapter: database,
  maxPageSize: 100,
}));
```

The legacy `wts-data-table/server-db` import remains supported through 1.x.
See [`SERVER_PACKAGES.md`](SERVER_PACKAGES.md),
[`DATABASE_ADAPTERS.md`](DATABASE_ADAPTERS.md), and the runnable
[`SQLite/Express example`](examples/server/sqlite-express.mjs), which also
provides database-backed editor options and multipart uploads.

### Cursor pagination and infinite loading

Use the cursor controller when the server returns an opaque continuation
token instead of page numbers:

```ts
import {
  createDataTableCursorDataSourceController,
  observeDataTableInfiniteScroll,
} from 'wts-data-table/data-source';
import { createDataTableServerAdapter } from 'wts-data-table/server';

const server = createDataTableServerAdapter<Person, string>({
  endpoint: '/api/people/cursor',
});

const cursorData = createDataTableCursorDataSourceController({
  table: table.core,
  pageSize: 50,
  getRowId: (row) => row.id,
  dataSource: server.cursorDataSource,
});

const stopInfiniteScroll = observeDataTableInfiniteScroll(
  cursorData,
  document.querySelector('#load-more-sentinel')!,
);

// Framework cleanup
stopInfiniteScroll();
cursorData.destroy();
```

`loadMore()` appends the next page; `refresh()` restarts at the first cursor.
Changing query state automatically cancels stale work and restarts the cursor.
`getCursorState()` exposes the cursor, loaded count, total when known,
`hasMore`, and loading state. The observer helper is optional—buttons,
framework effects, and virtual scrollers can call `loadMore()` directly.

## Row and column virtualization

Virtualization is opt-in and keeps native table markup. Only visible rows plus
an overscan window are mounted; accessible row-count metadata and spacer rows
preserve the full scroll range.

```ts
const table = new DataTable({
  // ...
  showPagination: false,
  initialState: { pagination: { pageSize: 50_000 } },
  virtualization: {
    height: 560,
    rowHeight: 48,
    getRowHeight: (_row, index) => index % 2 === 0 ? 40 : 64,
    overscan: 8,
    columns: { overscan: 2 },
  },
});
```

`rowHeight` is the fixed-height default and fallback. `getRowHeight` enables
exact variable-height windows using cumulative offsets. `columns` enables a
horizontal window for wide, flat column sets; pinned columns remain mounted.
Grouped headers retain their complete column hierarchy so `colspan` semantics
stay correct.

## Row selection

Set `selectionMode` to:

- `none` — no selection UI (default)
- `single` — at most one stable row ID
- `multiple` — individual and current-page selection

Use `getRowId` whenever the input can reorder or paginate. Index-based default
IDs are intended only for static data.

### Scalable selection and bulk actions

Set `bulkActions: true` to show the built-in selection summary, select-all,
and clear controls, or pass an options object with application actions:

```ts
bulkActions: {
  showSelectAllFiltered: true,
  visibleWhen: 'selected',
  actions: [{
    id: 'archive',
    label: 'Archive',
    // Text, HTMLElement, SVGElement, Text, or a context renderer.
    content: ({ document }) => createArchiveIcon(document),
    disabled: ({ selectedCount }) => selectedCount > 10_000,
    onAction: async (selection) => archiveRows(selection),
  }],
  onError: (error, action) => reportFailure(action.id, error),
}
```

After a whole page is checked, the toolbar can offer “Select all N filtered
rows”. This changes the compact selection scope to `all-filtered`; unchecked
rows are then stored in `rowSelectionExcluded`. The action context includes
`allFiltered`, `selectedCount`, `selectedRowIds`, `excludedRowIds`, currently
loaded `selectedRows`, the immutable state, and the table instance. This
contract works for both local and server-side tables.

Use `getSelectedRowCount()`, `getRowSelectionState()`,
`selectAllFilteredRows()`, and `clearRowSelection()` from custom application
UI. Persisted selection remains disabled by default; pass
`{ includeSelection: true }` to the persistence serializer or storage helper
when restoring selection is appropriate.

## Row ordering and pinning

Set `rowReordering: true` for a leading drag handle and the accessible
`Alt+ArrowUp` / `Alt+ArrowDown` keyboard alternative. Reordering is controlled
by `state.rowOrder`; use `setRowOrder(ids)` or
`moveRow(rowId, targetRowId, 'before' | 'after')` from framework-owned UI.
Tree rows can move only among siblings. Interactive ordering is disabled while
sorting or grouping is active because those transforms intentionally determine
the visible order. Set `manualRowOrdering: true` when a server owns the result.

Set `rowPinning: true` to add a compact pin control, or pass
`{ defaultPosition, showControls, sticky, renderControl }`. Top and bottom
IDs live in `state.rowPinning`. `pinRow(id, 'top' | 'bottom' | false)` controls
them directly. Pinned rows render outside the paginated center, remain mounted
while center rows virtualize, and are excluded from the page count.

`rowReordering.renderHandle` and `rowPinning.renderControl` receive contextual
row state and may return text, an `HTMLElement`, `SVGElement`, or `Text` node.
Use `getRowCanReorder` and `getRowCanPin` to enforce application rules.

## Column layout

Set `showColumnManager: true` to add a compact three-dot action menu to every
visible column header. Each menu provides sorting, left/right pinning,
keyboard-accessible move actions, hiding, and width reset. The final header
menu also contains the table-level controls for restoring hidden columns and
resetting the complete layout.

Menus close on outside pointer press, Escape, and completed actions by
default. Use the modern `columnMenu` option to enable, disable, or customize
that behavior:

```ts
const table = new DataTable({
  // ...
  columnMenu: {
    closeOnAction: true,
    closeOnEscape: true,
    closeOnOutsideClick: true,
  },
});
```

`columnMenu: true` enables menus without `showColumnManager`;
`columnMenu: false` disables them even when the legacy option is enabled.
Escape restores focus to the menu trigger.

Drag a header grip to rearrange visible columns with mouse, pen, or touch.
Set `enableReordering: false` to lock a column at its position, or
`enableHiding: false` to keep it visible. Every header also gets a pointer and
keyboard resizer. The same capabilities are available without the DOM:

Use `minWidth` and `maxWidth` to constrain a column, or
`enableResizing: false` to lock its width. Double-click a resize handle or use
the header menu to autosize from rendered content. Application controls can
call `getColumnSize(id)`, `setColumnSize(id, width)`,
`autoSizeColumn(id)`, or `autoSizeColumns()`.

```ts
table.setColumnVisibility('internalNotes', false);
table.moveColumn('status', 0);
table.setColumnSize('name', 280);
table.pinColumn('name', 'left');
table.resetColumnLayout();
```

Layout lives in `columnVisibility`, `columnOrder`, `columnSizing`, and
`columnPinning`, so server and framework renderers share one contract.

## Saved views and URL state

Persistence is an optional, versioned entry point:

```ts
import {
  createDataTableStateStorage,
  persistDataTableState,
} from 'wts-data-table/persistence';

const saved = createDataTableStateStorage('people-table');
const table = new DataTable({
  // ...
  initialState: saved.load(),
});
const stopSaving = persistDataTableState(table.core, saved);
```

`serializeDataTableState`, `parseDataTableState`,
`dataTableStateToSearchParams`, and `dataTableStateFromSearchParams` support
custom stores and shareable views. Row selection is excluded by default;
enable it explicitly when it is safe for the application.

Named views are available through a separate repository:

```ts
import { createDataTableSavedViewStore } from 'wts-data-table/saved-views';

const views = createDataTableSavedViewStore({
  key: 'people-table:views',
  maxViews: 20,
});

const saved = views.save('Platform team', table.getState());
views.apply(saved.id, table.core);
views.rename(saved.id, 'Core platform');
views.remove(saved.id);
```

The store is versioned, validates restored state, excludes selection by
default, and accepts `localStorage`, `sessionStorage`, or a custom adapter.

## PDF, print, XLSX, CSV, JSON, and clipboard export

Export utilities default to visible columns and filtered rows:

```ts
import {
  copyDataTableToClipboard,
  downloadDataTableCsv,
  downloadDataTablePdf,
  downloadDataTableXlsx,
  exportDataTableToPdf,
  exportDataTableToJson,
  exportDataTableToXlsx,
  printDataTable,
} from 'wts-data-table/export';

downloadDataTableCsv(table.core, { fileName: 'people.csv' });
downloadDataTablePdf(table.core, {
  fileName: 'people.pdf',
  title: 'People',
});
downloadDataTableXlsx(table.core, {
  fileName: 'people.xlsx',
  sheetName: 'People',
});
await copyDataTableToClipboard(table.core, { scope: 'page' });
const json = exportDataTableToJson(table.core, { scope: 'selected' });
const workbookBytes = exportDataTableToXlsx(table.core);
const pdfBytes = exportDataTableToPdf(table.core);
printDataTable(table.core, { title: 'People', scope: 'filtered' });
```

CSV output quotes every field and protects spreadsheet formula prefixes by
default. XLSX output preserves typed number, boolean, date, and text cells;
formula-like strings remain inert. Headers are bold, frozen, and filterable by
default. All formats share visible-column selection, `page`, `filtered`, and
`selected` scopes, and `transformValue`.

PDF generation has no runtime dependency. `createDataTablePrintHtml()` exposes
the escaped, semantic, script-free print document when an application needs
to hand it to its own window or native shell.

## SearchPanes and public range selection

Set `searchPanes: true` for a collapsible faceted sidebar with live counts,
per-pane search, and cascading filters. Configure `columns`, `showCounts`,
`searchable`, `valueLimit`, and `initiallyOpen` with an options object. The Web
Component mirrors the main switches through `search-panes` and
`search-panes-open`.

Remote panes use the same UI and structured filters. `loadFacets` receives
current state, pane queries, configured column IDs, and an `AbortSignal`;
superseded requests are cancelled automatically. `preselected`,
`uniquenessThreshold`, `debounceMs`, `onLoadError`, and
`refreshSearchPanes()` cover server-provided options and cascading counts.

Cell selection is independently available with `cellSelection: true`.
`selectCell()`, `selectCellRange()`, `selectColumnRange()`,
`selectRowRange()`, `getCellSelection()`, and `clearCellSelection()` provide
a stable public API. Changes call `onCellSelectionChange` and emit
`wts-data-table-cell-selection-change`.

## Layout slots and feature plugins

Use `layout` to place built-in or custom features in `topStart`, `topEnd`,
`bottomStart`, and `bottomEnd`:

```ts
import { registerDataTableFeature } from 'wts-data-table';

const unregister = registerDataTableFeature({
  name: 'sync-status',
  render: ({ document }) => {
    const status = document.createElement('output');
    status.textContent = 'Synced';
    return status;
  },
});

const table = new DataTable({
  // ...
  layout: {
    topStart: 'toolbar',
    topEnd: 'sync-status',
    bottomEnd: 'pagination',
  },
});
```

Built-ins are `toolbar`, `searchPanes`, and `pagination`. Slot callbacks and
plugins return text or direct DOM/SVG nodes. Instance-local `plugins` override
global names, and plugin `init`/`destroy` hooks may be synchronous or
asynchronous. Await `table.ready()` before work that depends on initialization
and `table.destroyAsync()` when cleanup must complete before teardown finishes.
Lifecycle failures call `onPluginError`, emit
`wts-data-table-plugin-error`, and reject the corresponding awaited method.
Call the registration cleanup function when a global plugin is no longer needed.

## Grouped headers and temporal controls

Assign `headerGroup: 'Identity'` or a nested path such as
`headerGroup: ['Customer', 'Address']`. Adjacent matching paths become
semantic `scope="colgroup"` cells with correct `colspan`; control columns use
`rowspan`. Reordering and visibility recalculate groups from the current
column layout.

Date columns infer native date-range filters. Explicit
`datetime-range` and `time-range` variants render `datetime-local` and `time`
controls. Editors support `date`, `datetime-local`, and `time` plus native
`min`, `max`, and `step`; existing `Date` values remain `Date` instances after
editing. Date-only upper bounds include the complete selected day.

## Full CRUD workflow

The optional `wts-data-table/crud` entry keeps persistence separate from UI:

```ts
import {
  createDataTableCrudController,
  createDataTableCrudEditor,
} from 'wts-data-table/crud';

const crud = createDataTableCrudController({
  table,
  getRowId: (row) => row.id,
  adapter: {
    create: api.create,
    update: api.update,
    delete: api.delete,
  },
  validate: (row) => row.name ? undefined : 'Name is required',
});

const editor = createDataTableCrudEditor({
  controller: crud,
  table,
  target: document.body,
  getRowId: (row) => row.id,
  fields: [
    { id: 'name', label: 'Name', required: true },
    { id: 'score', label: 'Score', type: 'number', min: 0, max: 100 },
  ],
  createRow: (values) => ({ id: crypto.randomUUID(), ...values }),
});

editor.openCreate();
editor.openEdit(rowId);
editor.confirmDelete(rowId);
```

The controller provides serialized create/update/delete transactions,
sync/async validation, optimistic updates, rollback on adapter failure, and
state/error callbacks. Set the editor `display` to `dialog`, `bubble`, or
`inline`; `openEditMany(rowIds)` provides mixed-value-aware multi-row forms.
`updateMany()` is atomic, and `createDataTableRestCrudAdapter()` adds
injectable JSON requests and an optional bulk endpoint. Applications may use
the controller without an editor.

Fields also support `autocomplete`, `tags`, `file`, and `files`.
`loadOptions(context)` provides abortable database suggestions and
`upload(context)` persists selected files before the row transaction.
`createDataTableRemoteOptionsLoader()` and
`createDataTableRestFileUploader()` supply JSON-option and multipart
transports. Set `display: 'standalone'` to render a persistent form in its
target instead of a modal, bubble, or inline dialog.

## Unified buttons and ColumnControl

`buttons` accepts `copy`, `csv`, `excel`, `pdf`, `print`, and `columns`, plus
application actions. Actions support text or direct DOM/SVG content, async
execution, disabled/hidden callbacks, error events, and nested `children`.
Saved views and domain commands therefore use the same UI model:

```ts
buttons: [
  'copy',
  {
    id: 'views',
    label: 'Views',
    children: [{
      id: 'save-view',
      label: 'Save current view',
      execute: ({ state }) => savedViews.save('My view', state),
    }],
  },
]
```

Each column can provide ordered `columnControls`, mixing `sorting`, `grouping`,
`pinning`, `ordering`, `sizing`, `visibility`, `table`, and custom actions.
Omitting the option preserves the complete default three-dot header menu.

`stickyHeader` and `stickyFooter` work independently from virtualization.
Each accepts an offset, viewport height, and mode and coordinates with grouped
headers, pinned columns, and summary rows:

```ts
stickyHeader: { mode: 'window', offset: 64 },
stickyFooter: { mode: 'window', offset: 0 },
```

`container` (default) provides the inner vertical/horizontal scrolling
surface and is required for virtualization. `window` follows document scroll
and deliberately leaves the table viewport overflow visible. Header and
footer must use the same mode. The Web Component equivalent is
`sticky-mode="window"`.

Grouped, leaf, and filter header rows are measured independently, so custom
themes and mixed header heights stack without overlap. Sticky/pinned
intersections retain their layer and inline offset while both axes scroll,
including when cell editing is enabled.

## Pivot and cross-tab models

The optional DOM-free pivot entry builds an immutable model for any renderer:

```ts
import { createDataTablePivotModel } from 'wts-data-table/pivot';

const pivot = createDataTablePivotModel(table.core, {
  rowDimensions: ['region'],
  columnDimensions: ['quarter'],
  values: [
    { columnId: 'revenue', aggregation: 'sum' },
    { id: 'averageUnits', columnId: 'units', aggregation: 'average' },
  ],
});

pivot.rowGroups;   // cells and row totals
pivot.columnGroups;
pivot.grandTotals;
```

Dimensions may be column IDs or derived `{ id, getValue }` definitions.
Values support `count`, `sum`, `average`, `min`, `max`, or a custom aggregator.
Use `scope: 'filtered' | 'page' | 'selected'`, label formatting, and row or
column comparators without coupling the model to DOM markup.

## Batch editing and undo/redo

The edit-history entry applies validated changes as one immutable transaction:

```ts
import { createDataTableEditHistory } from 'wts-data-table/edit-history';

const history = createDataTableEditHistory({
  table,
  getRowId: (row) => row.id,
  maxEntries: 100,
  validate: async (change) =>
    change.columnId === 'score' && Number(change.value) > 100
      ? 'Score must be 100 or less.'
      : undefined,
});

const result = await history.apply([
  { rowId: '42', columnId: 'status', value: 'Approved' },
  { rowId: '42', columnId: 'score', value: 96 },
]);

history.undo();
history.redo();
```

No row changes are committed when any validation fails. `getState()` exposes
undo/redo availability and counts. Use `updateRow(row, changes)` when column
IDs do not directly match object properties or the row model is nested.

## Web Component

Importing the optional entry point registers `<wts-data-table>`:

```ts
import 'wts-data-table/element';
import 'wts-data-table/styles.css';

const element = document.querySelector('wts-data-table');
element.data = people;
element.columns = [
  { accessor: 'name', header: 'Name' },
  { accessor: 'role', header: 'Role' },
];
element.options = {
  getRowId: (person) => String(person.id),
  selectionMode: 'multiple',
};
```

Basic tables can be declared with JSON:

```html
<wts-data-table
  caption="People"
  data='[{"id":"1","name":"Ada"},{"id":"2","name":"Grace"}]'
  columns='[{"accessor":"id"},{"accessor":"name","aggregation":"count","editable":true}]'
  advanced-filtering
  advanced-filter-builder
  column-filters="collapsible"
  column-menu-close-on-outside-click
  editing
  edit-activation="both"
  filter-chips
  page-size="10"
  pagination-mode="pages"
  pagination-first
  pagination-previous
  pagination-page-numbers
  pagination-page-status
  pagination-next
  pagination-last
  pagination-page-jump
  responsive
  responsive-breakpoint="720"
  responsive-details="inline"
  row-expansion
  expand-on-row-click
  row-expansion-multiple="false"
  row-reordering
  row-reorder-keyboard
  row-pinning
  row-pin-position="top"
  row-pin-sticky
  selection-mode="multiple"
  summary-rows
  summary-label="Total"
  summary-scope="filtered"
  summary-sticky
  show-column-manager
  show-grouping
  tree-children-key="children"
  virtualization
  virtual-height="480"
  virtual-row-height="48"
></wts-data-table>
```

For custom cell functions, assign the `columns` property instead of JSON.
When `columns` is omitted, keys from the first object row are inferred.
JSON column objects accept `responsive` and `responsivePriority`.
They also accept `editable: true` or an editable object with a built-in
`type`, built-in `aggregation` values, and `enableGrouping`. Assign functions
such as validators, custom aggregations, and custom editors through the
`columns` property.

### Attributes

| Attribute | Default | Purpose |
| --- | --- | --- |
| `caption` | none | Visible semantic table caption |
| `data` | `[]` | JSON array of object rows |
| `columns` | inferred | JSON strings or basic column objects |
| `advanced-filtering` | false | Filter chips and advanced query builder |
| `advanced-filter-builder` | true | Visual nested condition builder |
| `column-filters` | legacy fallback | `hidden`, `always`, or `collapsible` |
| `column-filters-expanded` | false | Initially expand collapsible filters |
| `column-menu-close-on-action` | true | Close after a menu command |
| `column-menu-close-on-escape` | true | Close with Escape |
| `column-menu-close-on-outside-click` | true | Close on outside pointer press |
| `editing` | false | Inline editing and grid keyboard interaction |
| `edit-activation` | `both` | `both`, `double-click`, or `enter` |
| `edit-navigation` | true | Arrow-key cell navigation |
| `edit-paste` | true | TSV clipboard copy and paste |
| `empty-message` | localized label | Empty-state copy |
| `filter-chips` | true | Removable active-filter chips |
| `loading` | false | Shows a loading row and `aria-busy` |
| `page-size` | `10` | Initial rows per page |
| `pagination-boundary-count` | `1` | Numbered pages kept at each edge |
| `pagination-first` | pair setting | First-page control |
| `pagination-first-last` | true | First and last controls |
| `pagination-last` | pair setting | Last-page control |
| `pagination-mode` | `pages` | `pages` or `simple` presentation |
| `pagination-next` | true | Next-page control |
| `pagination-page-jump` | false | Direct page-number input |
| `pagination-page-numbers` | true | Numbered page controls |
| `pagination-page-size` | true | Rows-per-page selector |
| `pagination-page-status` | true | Compact/simple page status |
| `pagination-previous` | true | Previous-page control |
| `pagination-sibling-count` | `1` | Pages around the current page |
| `pagination-summary` | true | Visible-row and total summary |
| `responsive` | false | Priority-based adaptive columns |
| `responsive-breakpoint` | `720` | Width where automatic collapsing starts |
| `responsive-details` | `inline` | `inline`, `popover`, or `false` |
| `row-expansion` | false | Expandable rows and tree controls |
| `expand-on-row-click` | false | Toggle from a non-interactive row surface |
| `row-expansion-controls` | true | Leading per-row expand buttons |
| `row-expansion-multiple` | true | Allow more than one expanded row |
| `row-reordering` | false | Pointer and keyboard row ordering |
| `row-reorder-keyboard` | true | `Alt+Arrow` row ordering |
| `row-reorder-handle` | true | Leading row drag handles |
| `row-pinning` | false | Top/bottom row pinning |
| `row-pin-controls` | true | Leading per-row pin controls |
| `row-pin-position` | `top` | Default `top` or `bottom` pin target |
| `row-pin-sticky` | true | Keep pinned rows visible while scrolling |
| `selection-mode` | `none` | `none`, `single`, or `multiple` |
| `summary-rows` | false | Aggregate rows in semantic `<tfoot>` |
| `summary-label` | `Total` | Declarative aggregate row label |
| `summary-scope` | `filtered` | `filtered`, `page`, or `selected` rows |
| `summary-sticky` | false | Keep the aggregate footer visible |
| `show-column-filters` | false | Legacy always-visible filter row |
| `show-column-manager` | false | Visibility, order, and pin controls |
| `show-global-filter` | true | Toolbar search |
| `show-grouping` | false | Grouping drop zone and expand/collapse controls |
| `show-pagination` | true | Pagination footer |
| `tree-children-key` | none | JSON object property containing child rows |
| `virtualization` | false | Windowed semantic row rendering |
| `virtual-height` | `480` | Virtual viewport height |
| `virtual-row-height` | `48` | Estimated row height in pixels |

## State and methods

The state snapshot contains:

```ts
interface DataTableState {
  advancedFilter?: AdvancedFilterGroup;
  globalFilter: string;
  columnFilters: Readonly<Record<string, string | StructuredFilter>>;
  columnOrder: readonly string[];
  columnPinning: { left: readonly string[]; right: readonly string[] };
  columnSizing: Readonly<Record<string, number>>;
  columnVisibility: Readonly<Record<string, boolean>>;
  grouping: readonly string[];
  groupExpansion: Readonly<Record<string, boolean>>;
  sorting: readonly { id: string; direction: 'asc' | 'desc' }[];
  pagination: { pageIndex: number; pageSize: number };
  rowExpansion: Readonly<Record<string, boolean>>;
  rowOrder: readonly string[];
  rowPinning: { top: readonly string[]; bottom: readonly string[] };
  rowSelection: readonly string[];
}
```

Important controller methods:

- `getState()`, `getRows()`, `getDisplayRows()`, `getSelectedRows()`
- `getResponsiveHiddenColumns()`
- `getColumnFiltersExpanded()`, `setColumnFiltersExpanded(expanded)`
- `beginEdit(rowId, columnId)`, `commitEdit(value?)`, `cancelEdit()`
- `getDirtyCells()`, `clearDirtyCells(cells?)`
- `setData(data, rowCount?, summaryValues?)`, `setColumns(columns)`,
  `setLoading(loading)`
- `applyTransaction({ add, addIndex, update, remove })`
- `setGlobalFilter(value)`, `setColumnFilter(id, value)`
- `setAdvancedFilter(group)`, `clearFilters()`, `getColumnFacet(id, limit?)`
- `isRowExpanded(id)`, `setRowExpanded(id, expanded)`,
  `toggleRowExpanded(id)`, `loadRowChildren(id, reload?)`,
  `expandAllRows()`, `collapseAllRows()`
- `setRowOrder(ids)`, `moveRow(id, targetId, position)`
- `pinRow(id, 'top' | 'bottom' | false)`, `getRowPin(id)`
- `getSummaryRows()`, `setSummaryValues(values)`
- `setSorting(sorting)`, `setPageIndex(index)`, `setPageSize(size)`
- `setGrouping(columnIds)`, `setGroupExpanded(groupId, expanded)`
- `setColumnVisibility(id, visible)`, `pinColumn(id, side)`
- `resetColumnLayout()`
- `replaceState(savedState)`
- `ready()`, `reset()`, `render()`, `destroy()`, `destroyAsync()`

`onStateChange(state, reason)` receives interaction updates. Responsive
changes use `onResponsiveChange(hiddenColumnIds, instance)`. The host
dispatches bubbling `wts-data-table-state-change` and
`wts-data-table-responsive-change` custom events.
Editing adds the five lifecycle events described above.

## Accessibility

- Uses native `table`, `caption`, `thead`, `th`, `tbody`, `tfoot`, and form
  controls; summary labels use row-header semantics.
- Adds `role="grid"` and grid-cell semantics only for cell interaction.
- Maintains `aria-sort`, `aria-busy`, row/column counts and indices, control
  labels, page status, and an `aria-live` row summary.
- Supports `ariaLabel`, `ariaDescription`, explicit `direction`, visual RTL
  arrows, Home/End, Ctrl/Meta+Home/End, and PageUp/PageDown navigation.
- Preserves focus and text selection while a live filter causes rerendering.
- Includes visible focus, forced-colors, increased contrast, reduced motion,
  RTL-compatible logical properties, and horizontal overflow behavior.
- Does not intercept table navigation keys or row clicks from interactive
  descendants.

Automated checks are valuable, but applications should still test their custom
cell renderers and final color tokens with keyboard users and assistive
technology.

### Hardening commands

- `npm test` runs the DOM/core regression suite, including 100 repeated
  hot-reload-style mounts and observer cleanup checks.
- `npm run benchmark` measures 100k-row filtering, sorting, grouping, 10k-row
  virtualization, and repeated mount/destroy cycles against generous,
  machine-independent regression ceilings.
- `npm run test:browsers` runs the live demo contract in Chromium, Firefox,
  and WebKit. It covers compact toolbar layout, ARIA dimensions, action-menu
  dismissal, grid boundaries, and forced-colors focus behavior.

## Styling

The stylesheet exposes 87 supported `--wts-table-*` custom properties. Set
them on the controller root, the `<wts-data-table>` host, or an ancestor.
Component tokens reference the core palette by default, so changing a core
color continues to update related controls.

For class-based host-framework integration, pass a preset through `theme` or
build one with `defineDataTableTheme`. Theme presets contain JavaScript class
maps only—there are no framework stylesheet imports or runtime dependencies.

### Core tokens

| Token | Purpose |
| --- | --- |
| `--wts-table-accent` | Primary interactive color |
| `--wts-table-accent-soft` | Subtle interactive background |
| `--wts-table-accent-text` | Text displayed on accent backgrounds |
| `--wts-table-background` | Table surface |
| `--wts-table-border` | Dividers and default borders |
| `--wts-table-danger` | Destructive action color |
| `--wts-table-focus` | Card and CRUD focus color |
| `--wts-table-header` | Header and secondary surfaces |
| `--wts-table-hover` | Row and control hover surface |
| `--wts-table-row-selected` | Selected-row surface |
| `--wts-table-text` | Primary text |
| `--wts-table-muted` | Secondary text and icons |
| `--wts-table-radius` | Outer table radius |

### Component tokens

- Typography: `--wts-table-font-family`, `--wts-table-font-size`,
  `--wts-table-line-height`, `--wts-table-header-font-size`, and
  `--wts-table-header-font-weight`
- Sizing and spacing: `--wts-table-border-width`,
  `--wts-table-row-height`, `--wts-table-header-height`,
  `--wts-table-control-height`, `--wts-table-cell-padding-block`,
  `--wts-table-cell-padding-inline`, `--wts-table-header-padding-block`,
  `--wts-table-header-padding-inline`, `--wts-table-toolbar-gap`,
  `--wts-table-footer-gap`, `--wts-table-pagination-gap`, and
  `--wts-table-control-radius`
- Interaction: `--wts-table-focus-ring-color`,
  `--wts-table-focus-ring-width`, `--wts-table-active-cell-color`,
  `--wts-table-active-cell-width`, `--wts-table-editing-background`,
  `--wts-table-invalid-background`, `--wts-table-invalid-text`,
  `--wts-table-loading-opacity`, and `--wts-table-disabled-opacity`
- Controls and filters: `--wts-table-control-background`,
  `--wts-table-control-text`, `--wts-table-control-hover-background`,
  `--wts-table-control-hover-border`, `--wts-table-filter-background`,
  `--wts-table-filter-border`, `--wts-table-filter-placeholder`,
  `--wts-table-input-background`, `--wts-table-input-border`,
  `--wts-table-input-radius`, `--wts-table-button-background`,
  `--wts-table-button-border`, `--wts-table-button-radius`,
  `--wts-table-bulk-background`, `--wts-table-bulk-border`, and
  `--wts-table-bulk-gap`
- Pagination: `--wts-table-page-button-size`,
  `--wts-table-page-active-background`, and
  `--wts-table-page-active-text`
- Menus: `--wts-table-menu-background`, `--wts-table-menu-border`,
  `--wts-table-menu-radius`, `--wts-table-menu-shadow`,
  `--wts-table-menu-item-hover`, and `--wts-table-menu-width`
- Pinned columns, groups, tree rows, detail panels, and scrollbars:
  `--wts-table-pinned-background`, `--wts-table-pinned-shadow-color`,
  `--wts-table-row-controls-width`,
  `--wts-table-row-drag-handle-color`,
  `--wts-table-row-pinned-background`,
  `--wts-table-row-pinned-shadow`,
  `--wts-table-summary-background`, `--wts-table-summary-text`,
  `--wts-table-summary-font-weight`, `--wts-table-summary-border`,
  `--wts-table-summary-shadow`,
  `--wts-table-group-background`, `--wts-table-group-hover`,
  `--wts-table-group-indent`, `--wts-table-tree-indent`,
  `--wts-table-expander-size`, `--wts-table-detail-background`,
  `--wts-table-detail-padding`, `--wts-table-scrollbar-thumb`, and
  `--wts-table-scrollbar-track`
- Layering: `--wts-table-z-index-pinned`,
  `--wts-table-z-index-sticky-header`, and `--wts-table-z-index-menu`

Override only the tokens a product needs:

```css
#people-table {
  --wts-table-accent: #7c3aed;
  --wts-table-accent-soft: #ede9fe;
  --wts-table-background: #fff;
  --wts-table-border: #e5e7eb;
  --wts-table-header: #fafafa;
  --wts-table-hover: #f9fafb;
  --wts-table-row-selected: #f5f3ff;
  --wts-table-text: #18181b;
  --wts-table-muted: #71717a;
  --wts-table-radius: 1rem;
  --wts-table-row-height: 3rem;
  --wts-table-cell-padding-inline: 0.75rem;
  --wts-table-menu-radius: 0.75rem;
  --wts-table-page-active-background: #7c3aed;
  --wts-table-pinned-shadow-color: rgb(76 29 149 / 28%);
}
```

Set `data-theme="auto"` on the controller root or custom element to enable the
included dark color tokens. Derived component tokens follow the dark core
palette automatically.

The renderer also creates `--wts-pin-left`, `--wts-pin-right`,
`--wts-group-depth`, `--wts-control-inline-start`,
`--wts-summary-sticky-count`, and `--wts-summary-sticky-index` at runtime.
These are internal layout variables, not supported customization API.

## Framework lifecycle

Install an official wrapper to let the framework own lifecycle and reactive
row updates while retaining the complete `DataTable<T>` controller:

```sh
npm install wts-data-table wts-data-table-react react react-dom
npm install wts-data-table wts-data-table-vue vue
npm install wts-data-table wts-data-table-angular @angular/core @angular/common
```

- React: `WtsDataTableReact<T>` with a forwarded controller ref, controlled
  state, and native component renderers.
- Vue 3: `WtsDataTableVue` with scoped slots and `v-model:state`, plus the
  generic `useWtsDataTable<T>` composable.
- Angular 17–22: standalone `WtsDataTableAngularComponent<T>` with `ready`
  and `destroyed` outputs, `[(state)]`, and standalone `TemplateRef`
  directives.

Framework runtimes and `wts-data-table` remain peer dependencies. Import
`wts-data-table/styles.css` once in the application. Replacing `data` updates
rows in place; replacing the `options` object remounts the controller.
Cells, headers, filters, column menus, details, empty/loading states, and
footer content can be owned by the host framework. Native renderer views are
destroyed automatically when the table redraws or unmounts.

For other frameworks, create the DOM controller after the host exists and
destroy it during cleanup:

- Angular: `ngAfterViewInit` / `ngOnDestroy`
- React: `useEffect` / effect cleanup
- Vue: `onMounted` / `onUnmounted`
- Svelte: `onMount` / returned cleanup

Use `DataTableCore` when the framework should own the table DOM.

## Development

```bash
npm test
npm run build
npm run test:package
npm run check
```

## License

[MIT](./LICENSE)
