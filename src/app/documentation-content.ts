export const RENDERERS = [
  {
    name: 'Complete',
    import: 'wts-data-table',
    use: 'Full compatibility renderer. Use this first when feature coverage matters more than the smallest bundle.',
  },
  {
    name: 'Base',
    import: 'wts-data-table/base',
    use: 'Tree-shakable renderer where optional behavior is added through exact feature imports.',
  },
  {
    name: 'Lite',
    import: 'wts-data-table/lite',
    use: 'Compact read-heavy renderer with sorting, filtering, paging, grouping, selection, responsive overflow, and virtualization.',
  },
  {
    name: 'Core',
    import: 'wts-data-table/core',
    use: 'DOM-free row model and state engine for applications that own every rendered element.',
  },
] as const;

export const FEATURE_GROUPS = [
  {
    title: 'Find and understand data',
    description: 'Turn a large row set into a useful answer.',
    features: [
      {
        name: 'Sorting',
        api: 'initialState.sorting / setSorting()',
        use: 'Order by one or several typed columns with custom comparators when needed.',
      },
      {
        name: 'Global search',
        api: 'showGlobalFilter',
        use: 'Provide one quick search across every searchable column.',
      },
      {
        name: 'Column filters',
        api: 'columnFilters',
        use: 'Use text, select, boolean, range, date, date-time, and time filters per column.',
      },
      {
        name: 'Advanced filters',
        api: 'advancedFiltering',
        use: 'Build nested AND/OR rules for complex business queries.',
      },
      {
        name: 'SearchPanes',
        api: 'searchPanes',
        use: 'Show faceted values and cascading live counts locally or from a server.',
      },
      {
        name: 'Grouping',
        api: 'showGrouping / state.grouping',
        use: 'Build expandable nested groups from headers or a grouping drop zone.',
      },
      {
        name: 'Aggregates',
        api: 'aggregation / summaryRows',
        use: 'Calculate count, sum, average, min, max, or custom group and footer totals.',
      },
      {
        name: 'Pivot models',
        api: 'wts-data-table/pivot',
        use: 'Create DOM-free cross-tab dimensions, values, subtotals, and grand totals.',
      },
    ],
  },
  {
    title: 'Select and change data',
    description: 'Support application workflows without losing stable row identity.',
    features: [
      {
        name: 'Row selection',
        api: 'selectionMode',
        use: 'Choose none, single, or multiple selection using stable IDs.',
      },
      {
        name: 'Bulk actions',
        api: 'bulkActions',
        use: 'Act on selected rows or an all-filtered selection without loading every record.',
      },
      {
        name: 'Cell and range selection',
        api: 'cellSelection',
        use: 'Select cells, rows, columns, and rectangular ranges.',
      },
      {
        name: 'Inline editing',
        api: 'editing / onEditCommit',
        use: 'Validate and persist keyboard-accessible optimistic edits with rollback.',
      },
      {
        name: 'AutoFill and paste',
        api: 'autoFill',
        use: 'Copy or continue series across editable ranges and accept TSV input.',
      },
      {
        name: 'Batch edit history',
        api: 'wts-data-table/edit-history',
        use: 'Validate atomic multi-cell changes and provide bounded undo and redo.',
      },
      {
        name: 'CRUD editor',
        api: 'wts-data-table/crud',
        use: 'Create, edit, delete, upload, and bulk-edit through several form layouts.',
      },
      {
        name: 'Tree and detail rows',
        api: 'getSubRows / rowExpansion',
        use: 'Display nested data, lazy children, or master-detail content.',
      },
      {
        name: 'Ordering and pinning',
        api: 'rowReordering / rowPinning',
        use: 'Move rows with pointer or keyboard and keep important rows visible.',
      },
    ],
  },
  {
    title: 'Control presentation',
    description: 'Adapt the table to product layout, viewport, and export needs.',
    features: [
      {
        name: 'Column layout',
        api: 'columnMenu / showColumnManager',
        use: 'Resize, reorder, hide, auto-size, and pin columns.',
      },
      {
        name: 'Responsive details',
        api: 'responsive',
        use: 'Collapse lower-priority columns into accessible inline or popover details.',
      },
      {
        name: 'Sticky sections',
        api: 'stickyHeader / stickyFooter',
        use: 'Keep multi-row headers and summary footers in view.',
      },
      {
        name: 'Grouped and temporal columns',
        api: 'headerGroup / filterVariant',
        use: 'Build nested headers and typed date, date-time, and time controls.',
      },
      {
        name: 'Buttons',
        api: 'buttons',
        use: 'Add copy, CSV, Excel, PDF, print, columns, nested commands, and custom actions.',
      },
      {
        name: 'Custom content',
        api: 'cell / layout / plugins',
        use: 'Render safe text or DOM nodes and place features into layout slots.',
      },
      {
        name: 'Exports',
        api: 'wts-data-table/export',
        use: 'Export to clipboard, CSV, JSON, XLSX, PDF, or semantic print HTML.',
      },
      {
        name: 'Saved views',
        api: 'wts-data-table/persistence',
        use: 'Store versioned state or encode it into shareable URL parameters.',
      },
      {
        name: 'Themes and tokens',
        api: 'theme / --wts-table-*',
        use: 'Use framework adapters and 87 supported CSS custom properties.',
      },
      {
        name: 'Localization and RTL',
        api: 'wts-data-table/i18n',
        use: 'Load locale packs, negotiate fallback, format values, and apply RTL.',
      },
    ],
  },
  {
    title: 'Scale and integrate',
    description: 'Choose the data and rendering strategy for the workload.',
    features: [
      {
        name: 'Adaptive pagination',
        api: 'pagination / pageSizes',
        use: 'Use numbered pages, first/last controls, page jumps, and adaptive ranges.',
      },
      {
        name: 'Virtualization',
        api: 'virtualization',
        use: 'Mount only visible rows and columns while preserving semantic table markup.',
      },
      {
        name: 'Manual server data',
        api: 'manualFiltering / manualSorting / manualPagination',
        use: 'Keep UI state in the table while an API owns querying and row counts.',
      },
      {
        name: 'Async data source',
        api: 'wts-data-table/data-source',
        use: 'Add debouncing, cancellation, caching, stale-response protection, and status.',
      },
      {
        name: 'Unified server adapter',
        api: 'wts-data-table/server',
        use: 'Share authenticated transports, retries, cache, errors, and telemetry across rows and facets.',
      },
      {
        name: 'Database adapters',
        api: '@wts-data-table/server',
        use: 'Translate allowlisted requests into PostgreSQL, MySQL, SQLite, Knex, or Prisma queries.',
      },
      {
        name: 'Cursor and infinite loading',
        api: 'createDataTableCursorDataSourceController()',
        use: 'Append opaque cursor pages from an observer, button, or framework effect.',
      },
      {
        name: 'Remote SearchPanes',
        api: 'searchPanes.loadFacets',
        use: 'Load authenticated server facets with cancellation and cascading counts.',
      },
      {
        name: 'Transactions',
        api: 'applyTransaction()',
        use: 'Add, update, and remove identified rows without replacing all data.',
      },
      {
        name: 'Web Component',
        api: 'wts-data-table/element',
        use: 'Use the complete renderer from standards-based custom elements.',
      },
      {
        name: 'Feature plug-ins',
        api: 'wts-data-table/plugin',
        use: 'Install validated behavior with manifests, dependency resolution, and cleanup.',
      },
      {
        name: 'Accessibility',
        api: 'ariaLabel / ariaDescription',
        use: 'Use semantic tables, labelled controls, keyboard workflows, and live status.',
      },
    ],
  },
] as const;

export const ADVANCED_FEATURES = [
  {
    name: 'Card view',
    entitlement: 'card-view',
    import: 'wts-data-table/card-view',
    use: 'Responsive cards with synchronized search, pagination, and selection. Requires an active subscription with the card-view feature.',
  },
  {
    name: 'Advanced row model',
    entitlement: 'advanced-row-model',
    import: 'wts-data-table/remote · wts-data-table/remote-viewport',
    use: 'Bounded external windows and server-owned row spaces.',
  },
  {
    name: 'Indexed search',
    entitlement: 'indexed-search',
    import: 'wts-data-table/search · wts-data-table/search-filters',
    use: 'Indexed and database-aware filtering for large collections.',
  },
  {
    name: 'Background export',
    entitlement: 'background-export',
    import: 'wts-data-table/export-jobs · wts-data-table/durable-export',
    use: 'Durable asynchronous exports that outlive a browser request.',
  },
  {
    name: 'Worker processing',
    entitlement: 'worker-processing',
    import: 'wts-data-table/worker-engine · wts-data-table/worker-table',
    use: 'Move data processing off the UI thread.',
  },
  {
    name: 'Live data',
    entitlement: 'live-data',
    import: 'wts-data-table/live-data · wts-data-table/live-transports',
    use: 'Apply ordered real-time changes from WebSocket or custom transports.',
  },
  {
    name: 'Server analytics',
    entitlement: 'server-analytics',
    import: 'wts-data-table/pivot-controller · wts-data-table/pivot-builder',
    use: 'Build server-backed pivot and analytical queries.',
  },
  {
    name: 'Spreadsheet formulas',
    entitlement: 'spreadsheet-formulas',
    import: 'wts-data-table/formula-engine · wts-data-table/formula-editor',
    use: 'Parse, calculate, edit, and project workbook formulas.',
  },
  {
    name: 'Collaborative editing',
    entitlement: 'collaborative-editing',
    import: 'wts-data-table/collaboration-client · wts-data-table/collaboration-table',
    use: 'Synchronize concurrent editing through application transports.',
  },
  {
    name: 'Governed editing',
    entitlement: 'governed-editing',
    import: 'wts-data-table/governance-client · wts-data-table/governance-panel',
    use: 'Apply review, policy, audit, and controlled-change workflows.',
  },
  {
    name: 'Report designer',
    entitlement: 'report-designer',
    import: 'wts-data-table/report-controller · wts-data-table/report-designer',
    use: 'Build reusable report definitions and report interfaces.',
  },
] as const;

export const BASE_RENDERER_EXAMPLE = `import { DataTable } from 'wts-data-table/base';
import { selectionFeature } from 'wts-data-table/features/selection';
import { responsiveFeature } from 'wts-data-table/features/responsive';
import 'wts-data-table/base.css';

new DataTable({
  ...options,
  features: [selectionFeature(), responsiveFeature()]
});`;

export const STARTER_CONFIG = `const table = new DataTable<Project>({
  element: '#project-table',
  ariaLabel: 'Project delivery',
  data: projects,
  getRowId: (row) => row.id,
  columns: [
    { accessor: 'name', header: 'Project', responsive: 'always' },
    { accessor: 'status', header: 'Status', filterVariant: 'select' },
    { accessor: 'budget', header: 'Budget', dataType: 'number', aggregation: 'sum' }
  ],
  initialState: {
    pagination: { pageSize: 25 },
    sorting: [{ id: 'name', direction: 'asc' }]
  },
  showGlobalFilter: true,
  columnFilters: { mode: 'collapsible' },
  columnMenu: true,
  selectionMode: 'multiple',
  bulkActions: true,
  responsive: { breakpoint: 720, details: 'inline' },
  pagination: { mode: 'pages', showPageJump: true },
  summaryRows: { label: 'Total', columns: { budget: 'sum' }, scope: 'filtered' },
  onStateChange: (state, reason) => console.log(reason, state)
});`;

export const STATE_EXAMPLE = `const state = table.getState();
const selected = table.getSelectedRows();

table.setGlobalFilter('platform');
table.setSorting([{ id: 'budget', direction: 'desc' }]);
table.setPageSize(50);
table.setData(nextProjects, totalRowCount);
table.applyTransaction({
  add: [newProject],
  update: [{ id: changed.id, data: changed }],
  remove: [deletedId]
});

await table.ready();
await table.destroyAsync();`;

export const LICENSE_EXAMPLE = `import { connectDataTableLicense } from 'wts-data-table/license';
import { createRemoteRowModel } from 'wts-data-table/remote';

const license = await connectDataTableLicense({ licenseKey: deploymentKey });
const rows = createRemoteRowModel({
  license,
  origin: window.location.origin,
  ...options
});`;
