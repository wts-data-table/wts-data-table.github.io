import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEVELOPER_GUIDES } from '../developer-guides';

type Framework = 'Angular' | 'Core' | 'React' | 'Vue';

const INSTALL_COMMANDS: Record<Framework, string> = {
  Core: 'npm install wts-data-table',
  Angular: 'npm install wts-data-table @wts-data-table/angular',
  React: 'npm install wts-data-table @wts-data-table/react react react-dom',
  Vue: 'npm install wts-data-table @wts-data-table/vue vue',
};

const FRAMEWORK_NOTES: Record<Framework, string> = {
  Core: 'Create the controller after its host exists and destroy it when the owning view unmounts.',
  Angular: 'Data updates rows in place. A new options object remounts the controller; ready exposes its instance.',
  React: 'Memoize options and renderers. The forwarded ref exposes the controller for imperative actions.',
  Vue: 'Use v-model:state for controlled state and getController() for imperative actions.',
};

const SNIPPETS: Record<Framework, string> = {
  Core: `import { DataTable } from 'wts-data-table';
import 'wts-data-table/styles.css';

const table = new DataTable<Project>({
  element: '#project-table',
  data: projects,
  columns,
  getRowId: (row) => row.id,
  pagination: { mode: 'pages', showPageJump: true },
  responsive: { breakpoint: 720, details: 'inline' }
});

await table.ready();
// Cleanup: table.destroy();`,
  Angular: `import { Component } from '@angular/core';
import { WtsDataTableAngularComponent } from '@wts-data-table/angular';
import 'wts-data-table/styles.css';

@Component({
  standalone: true,
  imports: [WtsDataTableAngularComponent],
  template: \`<wts-data-table-angular
    [data]="projects"
    [options]="options"
    (ready)="table = $event"
  />\`
})
export class ProjectTableComponent {
  readonly projects = projects;
  readonly options = {
    columns,
    getRowId: (row: Project) => row.id,
    responsive: { breakpoint: 720, details: 'inline' }
  };
}`,
  React: `import { useMemo, useRef } from 'react';
import { WtsDataTableReact } from '@wts-data-table/react';
import type { DataTable } from 'wts-data-table';
import 'wts-data-table/styles.css';

export function ProjectTable() {
  const table = useRef<DataTable<Project>>(null);
  const options = useMemo(() => ({
    columns,
    getRowId: (row: Project) => row.id,
    responsive: { breakpoint: 720, details: 'inline' }
  }), []);

  return <WtsDataTableReact ref={table} data={projects} options={options} />;
}`,
  Vue: `<script setup lang="ts">
import { shallowRef } from 'vue';
import { WtsDataTableVue } from '@wts-data-table/vue';
import 'wts-data-table/styles.css';

const table = shallowRef();
const options = {
  columns,
  getRowId: (row: Project) => row.id,
  responsive: { breakpoint: 720, details: 'inline' }
};
</script>

<template>
  <WtsDataTableVue ref="table" :data="projects" :options="options" />
</template>`,
};

const RENDERERS = [
  { name: 'Complete', import: 'wts-data-table', use: 'Full compatibility renderer. Use this first when feature coverage matters more than the smallest bundle.' },
  { name: 'Base', import: 'wts-data-table/base', use: 'Tree-shakable renderer where optional behavior is added through exact feature imports.' },
  { name: 'Lite', import: 'wts-data-table/lite', use: 'Compact read-heavy renderer with sorting, filtering, paging, grouping, selection, responsive overflow, and virtualization.' },
  { name: 'Core', import: 'wts-data-table/core', use: 'DOM-free row model and state engine for applications that own every rendered element.' },
] as const;

const FEATURE_GROUPS = [
  {
    title: 'Find and understand data',
    description: 'Turn a large row set into a useful answer.',
    features: [
      { name: 'Sorting', api: 'initialState.sorting / setSorting()', use: 'Order by one or several typed columns with custom comparators when needed.' },
      { name: 'Global search', api: 'showGlobalFilter', use: 'Provide one quick search across every searchable column.' },
      { name: 'Column filters', api: 'columnFilters', use: 'Use text, select, boolean, range, date, date-time, and time filters per column.' },
      { name: 'Advanced filters', api: 'advancedFiltering', use: 'Build nested AND/OR rules for complex business queries.' },
      { name: 'SearchPanes', api: 'searchPanes', use: 'Show faceted values and cascading live counts locally or from a server.' },
      { name: 'Grouping', api: 'showGrouping / state.grouping', use: 'Build expandable nested groups from headers or a grouping drop zone.' },
      { name: 'Aggregates', api: 'aggregation / summaryRows', use: 'Calculate count, sum, average, min, max, or custom group and footer totals.' },
      { name: 'Pivot models', api: 'wts-data-table/pivot', use: 'Create DOM-free cross-tab dimensions, values, subtotals, and grand totals.' },
    ],
  },
  {
    title: 'Select and change data',
    description: 'Support application workflows without losing stable row identity.',
    features: [
      { name: 'Row selection', api: 'selectionMode', use: 'Choose none, single, or multiple selection using stable IDs.' },
      { name: 'Bulk actions', api: 'bulkActions', use: 'Act on selected rows or an all-filtered selection without loading every record.' },
      { name: 'Cell and range selection', api: 'cellSelection', use: 'Select cells, rows, columns, and rectangular ranges.' },
      { name: 'Inline editing', api: 'editing / onEditCommit', use: 'Validate and persist keyboard-accessible optimistic edits with rollback.' },
      { name: 'AutoFill and paste', api: 'autoFill', use: 'Copy or continue series across editable ranges and accept TSV input.' },
      { name: 'Batch edit history', api: 'wts-data-table/edit-history', use: 'Validate atomic multi-cell changes and provide bounded undo and redo.' },
      { name: 'CRUD editor', api: 'wts-data-table/crud', use: 'Create, edit, delete, upload, and bulk-edit through several form layouts.' },
      { name: 'Tree and detail rows', api: 'getSubRows / rowExpansion', use: 'Display nested data, lazy children, or master-detail content.' },
      { name: 'Ordering and pinning', api: 'rowReordering / rowPinning', use: 'Move rows with pointer or keyboard and keep important rows visible.' },
    ],
  },
  {
    title: 'Control presentation',
    description: 'Adapt the table to product layout, viewport, and export needs.',
    features: [
      { name: 'Column layout', api: 'columnMenu / showColumnManager', use: 'Resize, reorder, hide, auto-size, and pin columns.' },
      { name: 'Responsive details', api: 'responsive', use: 'Collapse lower-priority columns into accessible inline or popover details.' },
      { name: 'Card view', api: 'wts-data-table/card-view', use: 'Switch the processed page into a synchronized responsive card grid.' },
      { name: 'Sticky sections', api: 'stickyHeader / stickyFooter', use: 'Keep multi-row headers and summary footers in view.' },
      { name: 'Grouped and temporal columns', api: 'headerGroup / filterVariant', use: 'Build nested headers and typed date, date-time, and time controls.' },
      { name: 'Buttons', api: 'buttons', use: 'Add copy, CSV, Excel, PDF, print, columns, nested commands, and custom actions.' },
      { name: 'Custom content', api: 'cell / layout / plugins', use: 'Render safe text or DOM nodes and place features into layout slots.' },
      { name: 'Exports', api: 'wts-data-table/export', use: 'Export to clipboard, CSV, JSON, XLSX, PDF, or semantic print HTML.' },
      { name: 'Saved views', api: 'wts-data-table/persistence', use: 'Store versioned state or encode it into shareable URL parameters.' },
      { name: 'Themes and tokens', api: 'theme / --wts-table-*', use: 'Use framework adapters and 87 supported CSS custom properties.' },
      { name: 'Localization and RTL', api: 'wts-data-table/i18n', use: 'Load locale packs, negotiate fallback, format values, and apply RTL.' },
    ],
  },
  {
    title: 'Scale and integrate',
    description: 'Choose the data and rendering strategy for the workload.',
    features: [
      { name: 'Adaptive pagination', api: 'pagination / pageSizes', use: 'Use numbered pages, first/last controls, page jumps, and adaptive ranges.' },
      { name: 'Virtualization', api: 'virtualization', use: 'Mount only visible rows and columns while preserving semantic table markup.' },
      { name: 'Manual server data', api: 'manualFiltering / manualSorting / manualPagination', use: 'Keep UI state in the table while an API owns querying and row counts.' },
      { name: 'Async data source', api: 'wts-data-table/data-source', use: 'Add debouncing, cancellation, caching, stale-response protection, and status.' },
      { name: 'Unified server adapter', api: 'wts-data-table/server', use: 'Share authenticated transports, retries, cache, errors, and telemetry across rows and facets.' },
      { name: 'Database adapters', api: '@wts-data-table/server', use: 'Translate allowlisted requests into PostgreSQL, MySQL, SQLite, Knex, or Prisma queries.' },
      { name: 'Cursor and infinite loading', api: 'createDataTableCursorDataSourceController()', use: 'Append opaque cursor pages from an observer, button, or framework effect.' },
      { name: 'Remote SearchPanes', api: 'searchPanes.loadFacets', use: 'Load authenticated server facets with cancellation and cascading counts.' },
      { name: 'Transactions', api: 'applyTransaction()', use: 'Add, update, and remove identified rows without replacing all data.' },
      { name: 'Web Component', api: 'wts-data-table/element', use: 'Use the complete renderer from standards-based custom elements.' },
      { name: 'Feature plug-ins', api: 'wts-data-table/plugin', use: 'Install validated behavior with manifests, dependency resolution, and cleanup.' },
      { name: 'Accessibility', api: 'ariaLabel / ariaDescription', use: 'Use semantic tables, labelled controls, keyboard workflows, and live status.' },
    ],
  },
] as const;

const ADVANCED_FEATURES = [
  { name: 'Advanced row model', entitlement: 'advanced-row-model', import: 'wts-data-table/remote · wts-data-table/remote-viewport', use: 'Bounded external windows and server-owned row spaces.' },
  { name: 'Indexed search', entitlement: 'indexed-search', import: 'wts-data-table/search · wts-data-table/search-filters', use: 'Indexed and database-aware filtering for large collections.' },
  { name: 'Background export', entitlement: 'background-export', import: 'wts-data-table/export-jobs · wts-data-table/durable-export', use: 'Durable asynchronous exports that outlive a browser request.' },
  { name: 'Worker processing', entitlement: 'worker-processing', import: 'wts-data-table/worker-engine · wts-data-table/worker-table', use: 'Move data processing off the UI thread.' },
  { name: 'Live data', entitlement: 'live-data', import: 'wts-data-table/live-data · wts-data-table/live-transports', use: 'Apply ordered real-time changes from WebSocket or custom transports.' },
  { name: 'Server analytics', entitlement: 'server-analytics', import: 'wts-data-table/pivot-controller · wts-data-table/pivot-builder', use: 'Build server-backed pivot and analytical queries.' },
  { name: 'Spreadsheet formulas', entitlement: 'spreadsheet-formulas', import: 'wts-data-table/formula-engine · wts-data-table/formula-editor', use: 'Parse, calculate, edit, and project workbook formulas.' },
  { name: 'Collaborative editing', entitlement: 'collaborative-editing', import: 'wts-data-table/collaboration-client · wts-data-table/collaboration-table', use: 'Synchronize concurrent editing through application transports.' },
  { name: 'Governed editing', entitlement: 'governed-editing', import: 'wts-data-table/governance-client · wts-data-table/governance-panel', use: 'Apply review, policy, audit, and controlled-change workflows.' },
  { name: 'Report designer', entitlement: 'report-designer', import: 'wts-data-table/report-controller · wts-data-table/report-designer', use: 'Build reusable report definitions and report interfaces.' },
] as const;

const BASE_RENDERER_EXAMPLE = `import { DataTable } from 'wts-data-table/base';
import { selectionFeature } from 'wts-data-table/features/selection';
import { responsiveFeature } from 'wts-data-table/features/responsive';
import 'wts-data-table/base.css';

new DataTable({
  ...options,
  features: [selectionFeature(), responsiveFeature()]
});`;

const STARTER_CONFIG = `const table = new DataTable<Project>({
  element: '#projects',
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
  onStateChange: (state, reason) => saveView(state, reason)
});`;

const STATE_EXAMPLE = `const state = table.getState();
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

const LICENSE_EXAMPLE = `import { verifyDataTableLicense } from 'wts-data-table';
import { createRemoteRowModel } from 'wts-data-table/remote';

const license = await verifyDataTableLicense(entitlementToken);
const rows = createRemoteRowModel({
  license,
  origin: window.location.origin,
  ...options
});`;

@Component({
  imports: [RouterLink],
  template: `
    <section class="page-hero wrap"><span class="kicker">Documentation</span><h1>From install to<br><em>production table.</em></h1><p>Choose the right renderer, integrate your framework, configure every major capability, and connect application state safely.</p></section>
    <section class="docs-layout wrap">
      <aside aria-label="Documentation sections"><a routerLink="/docs" fragment="install">Install</a><a routerLink="/docs" fragment="integrate">Frameworks</a><a routerLink="/docs" fragment="renderers">Renderers</a><a routerLink="/docs" fragment="features">Feature guide</a><a routerLink="/docs" fragment="configure">Configure</a><a routerLink="/docs" fragment="lifecycle">State & lifecycle</a><a routerLink="/docs" fragment="advanced">Licensed features</a><a routerLink="/docs" fragment="reference">Developer guides</a></aside>
      <div class="docs-content">
        <section id="install"><span class="step">01</span><h2>Install the package</h2><p>The main package contains the typed core, complete DOM renderer, modular entry points, styles, export tools, persistence, server clients, and licensed advanced feature code.</p><pre><code>npm install wts-data-table</code></pre><div class="callout"><strong>Load styles once</strong><span>Import <code>wts-data-table/styles.css</code> for Complete, or the matching <code>base.css</code> or <code>lite.css</code> stylesheet.</span></div></section>
        <section id="integrate"><span class="step">02</span><h2>Integrate your framework</h2><p>The wrappers own host creation, reactive data updates, SSR safety, and teardown. They expose the same table options and controller rather than implementing another table engine.</p><div class="tabs" role="tablist" aria-label="Framework integration">@for(item of frameworks;track item){<button type="button" role="tab" [attr.aria-selected]="framework()===item" [class.active]="framework()===item" (click)="framework.set(item)">{{ item }}</button>}</div><div class="install-line"><code>{{ installs[framework()] }}</code></div><pre class="code"><code>{{ snippets[framework()] }}</code></pre><p class="framework-note"><strong>Lifecycle:</strong> {{ frameworkNotes[framework()] }}</p></section>
        <section id="renderers"><span class="step">03</span><h2>Choose a renderer</h2><p>Start with Complete. Move to Base when bundle composition matters, Lite for compact read-heavy grids, or Core when your framework must own all DOM.</p><div class="renderer-grid">@for(item of renderers;track item.name){<article><div><strong>{{ item.name }}</strong><code>{{ item.import }}</code></div><p>{{ item.use }}</p></article>}</div><pre><code>{{ baseRendererExample }}</code></pre></section>
        <section id="features"><span class="step">04</span><h2>Feature guide</h2><p>These are the standard capabilities available to the controller and wrappers. Each item names the option, method, or package entry point to start with.</p>@for(group of featureGroups;track group.title){<div class="feature-group"><div class="group-heading"><h3>{{ group.title }}</h3><p>{{ group.description }}</p></div><div class="feature-grid">@for(feature of group.features;track feature.name){<article><div><strong>{{ feature.name }}</strong><code>{{ feature.api }}</code></div><p>{{ feature.use }}</p></article>}</div></div>}</section>
        <section id="configure"><span class="step">05</span><h2>Build a production configuration</h2><p>Use stable row IDs, typed columns, an accessible name, and only the interaction features your product needs. Wrapper components receive the same object without <code>element</code> or <code>data</code>.</p><pre><code>{{ starterConfig }}</code></pre><div class="callout"><strong>Large data</strong><span>Use <code>virtualization</code> to reduce mounted DOM. Use manual processing or the data-source controller when the complete result should not live in browser memory.</span></div></section>
        <section id="lifecycle"><span class="step">06</span><h2>Own state and lifecycle</h2><p><code>getState()</code> returns sorting, filters, paging, grouping, expansion, selection, and column layout. Mutator methods update one concern without reconstructing the table.</p><pre><code>{{ stateExample }}</code></pre><div class="method-list"><code>setColumnFilter()</code><code>setGrouping()</code><code>setRowExpanded()</code><code>pinRow()</code><code>setColumnVisibility()</code><code>replaceState()</code><code>reset()</code><code>render()</code></div><div class="callout"><strong>Framework wrappers</strong><span>Data changes update rows in place. Replacing options intentionally remounts configuration. Angular, React, and Vue wrappers clean up on unmount.</span></div></section>
        <section id="advanced"><span class="step">07</span><h2>Licensed advanced features</h2><p>Advanced capabilities ship inside the same <code>wts-data-table</code> package under feature-named imports. There is no separate Pro package or <code>/premium</code> namespace. A signed entitlement unlocks purchased capabilities.</p><div class="advanced-grid">@for(feature of advancedFeatures;track feature.entitlement){<article><span>{{ feature.entitlement }}</span><strong>{{ feature.name }}</strong><code>{{ feature.import }}</code><p>{{ feature.use }}</p></article>}</div><pre><code>{{ licenseExample }}</code></pre></section>
        <section id="reference"><span class="step">08</span><h2>Developer guides</h2><p>Continue with site-native guides for complete workflows, edge cases, security boundaries, server protocols, and production decisions.</p><div class="resource-grid">@for(guide of developerGuides;track guide.slug){<a [routerLink]="['/docs/guides',guide.slug]"><strong>{{ guide.title }}</strong><span>{{ guide.summary }} →</span></a>}</div></section>
      </div>
    </section>
  `,
  styles: [`
    .docs-layout{display:grid;grid-template-columns:210px minmax(0,980px);gap:5rem;align-items:start}.docs-layout aside{position:sticky;top:105px;display:grid;max-height:calc(100vh - 130px);overflow:auto;border-top:1px solid var(--line)}.docs-layout aside a{padding:.72rem 0;border-bottom:1px solid var(--line);color:var(--muted);font-size:.76rem;text-decoration:none}.docs-layout aside a:hover{color:var(--blue)}.docs-content>section{padding:0 0 6rem;scroll-margin-top:110px}.step{color:var(--blue);font:.68rem var(--mono)}h2{margin:.6rem 0 1rem;font-size:clamp(2rem,4vw,3.5rem);letter-spacing:-.055em}.docs-content p{color:var(--muted);line-height:1.75}.docs-content pre{margin:1.5rem 0;padding:1.2rem;overflow:auto;border-radius:10px;background:#121a28;color:#dce5f1;font:.75rem/1.7 var(--mono)}.tabs{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:1.5rem}.tabs button{padding:.6rem .85rem;border:1px solid var(--line);border-radius:7px;background:white;color:var(--muted);cursor:pointer}.tabs button.active{border-color:var(--blue);background:var(--blue);color:white}.install-line{margin-top:.55rem;padding:.75rem 1rem;overflow:auto;border:1px solid var(--line);border-radius:8px;background:white;color:var(--ink);font:.72rem var(--mono)}.code{margin-top:.55rem!important}.framework-note{margin-top:-.6rem!important;padding:.8rem 1rem;border:1px solid var(--line);border-radius:8px;background:white;font-size:.78rem}.callout{display:grid;gap:.4rem;margin-top:1.5rem;padding:1.2rem;border-left:3px solid var(--blue);background:var(--blue-soft)}.callout span{color:var(--muted);line-height:1.6}.renderer-grid,.feature-grid,.advanced-grid,.resource-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem;margin-top:1.5rem}.renderer-grid article,.feature-grid article{padding:1rem;border:1px solid var(--line);border-radius:9px;background:white}.renderer-grid article>div,.feature-grid article>div{display:grid;gap:.5rem}.renderer-grid code,.feature-grid code{width:max-content;max-width:100%;overflow:hidden;color:var(--blue);font:.64rem var(--mono);text-overflow:ellipsis}.renderer-grid p,.feature-grid p{margin:.8rem 0 0;font-size:.76rem;line-height:1.55}.feature-group{margin-top:3rem}.group-heading{display:flex;align-items:end;justify-content:space-between;gap:2rem;padding-bottom:.8rem;border-bottom:1px solid var(--line)}.group-heading h3{margin:0;font-size:1.25rem}.group-heading p{margin:0;font-size:.75rem}.method-list{display:flex;flex-wrap:wrap;gap:.45rem}.method-list code{padding:.45rem .6rem;border:1px solid var(--line);border-radius:6px;background:white;color:var(--blue);font-size:.68rem}.advanced-grid article{display:grid;gap:.45rem;padding:1rem;border:1px solid var(--line);border-radius:9px;background:#182237;color:white}.advanced-grid article span{color:var(--lime);font:.6rem var(--mono)}.advanced-grid article code{color:#aebbd0;font:.61rem var(--mono)}.advanced-grid article p{margin:.4rem 0 0;color:#b7c1d0;font-size:.74rem;line-height:1.55}.resource-grid a{display:grid;gap:2rem;min-height:130px;padding:1rem;border:1px solid var(--line);border-radius:9px;background:white;color:var(--ink);text-decoration:none}.resource-grid a:hover{border-color:#aac3fb;transform:translateY(-1px)}.resource-grid span{color:var(--muted);font-size:.72rem}
    @media(max-width:900px){.docs-layout{grid-template-columns:180px minmax(0,1fr);gap:2.5rem}}
    @media(max-width:750px){.docs-layout{grid-template-columns:1fr;gap:3rem}.docs-layout aside{position:sticky;z-index:3;top:72px;display:flex;max-height:none;padding:.45rem 0;overflow:auto;border:0;background:var(--paper)}.docs-layout aside a{min-width:max-content;padding:.6rem .75rem;border:1px solid var(--line);background:white}.docs-layout aside a+ a{margin-left:.35rem}.docs-content>section{scroll-margin-top:145px}.renderer-grid,.feature-grid,.advanced-grid,.resource-grid{grid-template-columns:1fr}.group-heading{align-items:start;flex-direction:column;gap:.25rem}}
  `],
})
export class DocsPage {
  protected readonly frameworks = Object.keys(SNIPPETS) as Framework[];
  protected readonly snippets = SNIPPETS;
  protected readonly installs = INSTALL_COMMANDS;
  protected readonly frameworkNotes = FRAMEWORK_NOTES;
  protected readonly framework = signal<Framework>('Angular');
  protected readonly renderers = RENDERERS;
  protected readonly featureGroups = FEATURE_GROUPS;
  protected readonly advancedFeatures = ADVANCED_FEATURES;
  protected readonly baseRendererExample = BASE_RENDERER_EXAMPLE;
  protected readonly starterConfig = STARTER_CONFIG;
  protected readonly stateExample = STATE_EXAMPLE;
  protected readonly licenseExample = LICENSE_EXAMPLE;
  protected readonly developerGuides = DEVELOPER_GUIDES;
}
