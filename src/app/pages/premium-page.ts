import { Component, signal } from '@angular/core';
import { LICENSE_REQUEST } from '../site-data';

const PREMIUM_EXAMPLES = [
  {
    id: 'worker-processing',
    label: 'Worker processing',
    title: 'Worker-powered processing',
    description:
      'Keep 100,000 or 1,000,000 rows in a dedicated module worker while the table receives bounded pages and the interface stays responsive.',
    image: 'premium/worker-processing.webp',
    alt: 'Large WTS Data Table dataset processed through a dedicated worker',
    caption: 'Worker processing · bounded table pages',
    options: ['blockSize', 'maxBlocks', 'maxCacheBytes', 'maxWindowRows'],
    code: `import { createWorkerProcessingClient } from 'wts-data-table/worker-client';\nimport { createBrowserWorkerTransport } from 'wts-data-table/worker-browser';\nimport { createWorkerTableController } from 'wts-data-table/worker-table';\n\nconst license = await verifyDataTableLicense(entitlementToken);\nconst client = createWorkerProcessingClient({\n  license,\n  createTransport: () => createBrowserWorkerTransport(\n    new URL('./worker.js', import.meta.url), { license }\n  )\n});\nawait client.loadSnapshot(snapshot);\nconst bridge = createWorkerTableController({\n  license, client, blockSize: 100, maxBlocks: 3,\n  ...tableAdapter\n});\nawait bridge.refresh();`,
  },
  {
    id: 'remote-viewport',
    label: 'Advanced row model',
    title: 'Remote data viewport',
    description:
      'Request only visible blocks from an application-owned source while retaining a bounded row window, selection state, and native table interaction.',
    image: 'premium/remote-viewport.webp',
    alt: 'Bounded WTS Data Table viewport backed by a remote dataset',
    caption: 'Remote viewport · application-owned source',
    options: ['blockSize', 'maxBlocks', 'rowHeight', 'maxWindowRows'],
    code: `import { createRemoteViewportController } from 'wts-data-table/remote-viewport';\nimport { createRemoteRowModel } from 'wts-data-table/remote';\n\nconst model = createRemoteRowModel({\n  license, source, blockSize: 50, maxBlocks: 3\n});\nconst remote = createRemoteViewportController({\n  license, model, rowHeight: 60, maxWindowRows: 1000,\n  getState: () => table.getState(),\n  subscribe: listener => table.core.subscribe(listener),\n  setRowWindow: (window, options) => table.setRowWindow(window, options),\n  getViewportRange: () => table.getViewportRange(),\n  scrollToRow: index => table.scrollToRow(index)\n});\nawait remote.refresh();`,
  },
  {
    id: 'formula-editor',
    label: 'Spreadsheet formulas',
    title: 'Formula workbook and editor',
    description:
      'Keep canonical formulas stable while the table is sorted, filtered, or reordered, with an explicit formula bar and atomic commits.',
    image: 'premium/formula-editor.webp',
    alt: 'Formula editor connected to calculated WTS Data Table cells',
    caption: 'Formula workbook · atomic editor commits',
    options: ['maxCells', 'maxDependencies', 'maxChanges', 'maxFormulaBytes'],
    code: `import { createFormulaWorkbook } from 'wts-data-table/formula-engine';\nimport { createFormulaTableBridge } from 'wts-data-table/formula-table';\nimport { createFormulaEditor } from 'wts-data-table/formula-editor';\n\nconst workbook = createFormulaWorkbook({\n  license, rowIds, columnIds\n});\nconst bridge = createFormulaTableBridge({\n  license, workbook, table\n});\nconst editor = createFormulaEditor({\n  license, container: formulaHost, bridge\n});`,
  },
  {
    id: 'indexed-search',
    label: 'Indexed search',
    title: 'Database-aware search',
    description:
      'Compose authorization scope, indexed full-text or trigram search, typed filters, stable sorting, and bounded PostgreSQL pagination.',
    image: 'premium/indexed-search.webp',
    alt: 'Indexed customer search with scoped filters and PostgreSQL query diagnostics',
    caption: 'Application search UI · indexed server adapter',
    options: ['searchMode', 'scope', 'maxLimit', 'maxOffset'],
    code: `import { createPostgresSearchAdapter } from 'wts-data-table/search';\n\nconst search = createPostgresSearchAdapter({\n  license, executor: executeAuthorizedSql, table: 'public.customers',\n  primaryKey: 'id', columns: ['id', 'name', 'region'],\n  searchMode: { type: 'full-text', vectorColumn: 'search_vector',\n    configuration: 'pg_catalog.english' },\n  scope: { column: 'tenant_id', value: authorizedTenantId },\n  maxLimit: 100\n});\nconst result = await search.search({\n  query: 'enterprise renewal', offset: 0, limit: 50, count: 'exact'\n});`,
  },
  {
    id: 'background-export',
    label: 'Background export',
    title: 'Durable export jobs',
    description:
      'Stream authorized CSV exports through bounded workers, persist progress, recover interrupted jobs, and expose owner-scoped downloads.',
    image: 'premium/background-export.webp',
    alt: 'Background export job queue showing progress and completed downloads',
    caption: 'Application job UI · durable export runtime',
    options: ['concurrency', 'maxPending', 'pageSize', 'maxRows'],
    code: `import { createExportJobManager } from 'wts-data-table/export-jobs';\n\nconst exports = createExportJobManager({\n  license,\n  columns: [{ header: 'ID', value: row => row.id },\n    { header: 'Name', value: row => row.name }],\n  limits: { concurrency: 2, maxPending: 16, pageSize: 500 },\n  loadPage: (query, cursor, limit, signal, job) =>\n    database.readAuthorizedPage({ owner: job.owner, query, cursor, limit, signal }),\n  createSink: job => storage.createCsvSink(job)\n});\nconst job = exports.submit(authenticatedOwner, authorizedQuery);\nconst completed = await exports.wait(authenticatedOwner, job.id);`,
  },
  {
    id: 'live-data',
    label: 'Live data',
    title: 'Resumable live ingestion',
    description:
      'Apply ordered real-time changes through bounded batches, detect sequence gaps, recover by replay or snapshot, and keep table updates atomic.',
    image: 'premium/live-data.webp',
    alt: 'Live operations feed showing ordered sequence processing and replay health',
    caption: 'Application stream UI · live controller',
    options: ['flushIntervalMs', 'maxReconnects', 'maxBufferedBytes', 'maxBatchBytes'],
    code: `import { createLiveDataController } from 'wts-data-table/live-data';\n\nconst live = createLiveDataController({\n  license, scopeId: authorizedScope,\n  loadSnapshot: ({ scopeId, signal }) =>\n    fetchAuthorizedSnapshot(scopeId, signal),\n  createTransport: liveTransport, sink: atomicTableSink,\n  limits: { flushIntervalMs: 50, maxReconnects: 5 }\n});\nawait live.start();\nawait live.flush();`,
  },
  {
    id: 'server-analytics',
    label: 'Server analytics',
    title: 'Server-side pivot builder',
    description:
      'Configure bounded sparse pivots, calculate authoritative totals on the server, and drill into permitted source rows without loading the full dataset.',
    image: 'premium/server-analytics.webp',
    alt: 'Server-side revenue pivot builder with dimensions measures and totals',
    caption: 'Native pivot builder · authorized data source',
    options: ['maxGridCells', 'maxDimensions', 'maxMeasures', 'maxDrillRows'],
    code: `import { createPivotController } from 'wts-data-table/pivot-controller';\nimport { createPivotBuilder } from 'wts-data-table/pivot-builder';\n\nconst controller = createPivotController({\n  license, catalog, source,\n  initialRequest: { rowDimensions: ['region'], columnDimensions: ['quarter'],\n    values: [{ id: 'revenue', columnId: 'revenue', operation: 'sum' }] },\n  limits: { maxGridCells: 8192, maxDrillRows: 100 }\n});\nconst builder = createPivotBuilder({\n  license, container: pivotHost, catalog, controller\n});\nawait controller.refresh();`,
  },
  {
    id: 'collaborative-editing',
    label: 'Collaborative editing',
    title: 'Authoritative multi-user editing',
    description:
      'Synchronize canonical cell revisions, keep drafts separate from committed state, surface advisory presence, and reconcile conflicts explicitly.',
    image: 'premium/collaborative-editing.webp',
    alt: 'Collaborative capacity table showing active editors and a selected cell',
    caption: 'Native table projection · collaboration client',
    options: ['rowIds', 'columnIds', 'maxRows', 'maxCells'],
    code: `import { DataTable } from 'wts-data-table';\nimport { createCollaborationClient } from 'wts-data-table/collaboration-client';\nimport { createCollaborationTableBridge, projectCollaborationRows }\n  from 'wts-data-table/collaboration-table';\n\nconst client = createCollaborationClient({ license, authority, source });\nawait client.start();\nconst projection = projectCollaborationRows({ license, client });\nconst table = new DataTable({ element: tableHost, data: projection.rows,\n  columns: projection.columns, getRowId: row => row.id,\n  cellSelection: true, editing: true });\nconst collaboration = createCollaborationTableBridge({ license, client, table });`,
  },
  {
    id: 'governed-editing',
    label: 'Governed editing',
    title: 'Policy-backed review workflow',
    description:
      'Submit immutable cell-change proposals, apply independent approval rules, retain an audit trail, and execute approved work with fencing tokens.',
    image: 'premium/governed-editing.webp',
    alt: 'Governed editing panel showing a pending proposal and approval actions',
    caption: 'Native governance panel · authoritative client',
    options: ['listStatus', 'listPageSize', 'auditPageSize', 'maxRenderedProposals'],
    code: `import { createGovernanceClient } from 'wts-data-table/governance-client';\nimport { createGovernancePanel } from 'wts-data-table/governance-panel';\n\nconst client = createGovernanceClient({\n  license, authority: localDocumentScope, source: governanceSource,\n  listStatus: 'pending', listPageSize: 50, auditPageSize: 100\n});\nawait client.start();\nconst panel = createGovernancePanel({\n  license, container: governanceHost, client\n});`,
  },
  {
    id: 'report-designer',
    label: 'Report designer',
    title: 'Server-driven report designer',
    description:
      'Build versioned metric, chart, and table layouts over bounded authoritative results with linked filters and explicit persistence.',
    image: 'premium/report-designer.webp',
    alt: 'Executive report designer showing metrics chart filters and a data table',
    caption: 'Native report designer · server-driven widgets',
    options: ['maxConcurrent', 'maxCacheEntries', 'maxRenderedWidgets', 'maxTablePageHistory'],
    code: `import { createReportController } from 'wts-data-table/report-controller';\nimport { createReportDesigner } from 'wts-data-table/report-designer';\n\nconst controller = createReportController({\n  license, catalog, spec, source,\n  limits: { maxConcurrent: 4, maxCacheEntries: 64 }\n});\nconst designer = createReportDesigner({\n  license, container: reportHost, catalog, controller,\n  authoring: { persistSpec: saveVersionedReport }\n});\nawait controller.refresh();`,
  },
] as const;

@Component({
  template: `
    <section class="page-hero wrap">
      <span class="kicker">Licensed advanced capabilities</span>
      <h1>Every shipped feature.<br /><em>Demonstrated.</em></h1>
      <p>
        Explore all 10 licensed capability groups. Each section identifies runtime controls, shows
        the product-facing result, and provides the package API used to build it.
      </p>
      <div class="coverage">
        <strong>10 / 10</strong><span>licensed capability groups documented below</span>
      </div>
    </section>
    <nav class="premium-index wrap" aria-label="Advanced capability examples">
      @for (item of examples; track item.id; let index = $index) {
        <a [href]="'#' + item.id"
          ><span>{{ index + 1 }}</span
          >{{ item.label }}</a
        >
      }
    </nav>
    <section class="premium-list wrap">
      @for (item of examples; track item.id; let index = $index) {
        <article [id]="item.id">
          <div class="premium-copy">
            <span class="kicker">{{ index + 1 }} / 10 · {{ item.label }}</span>
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
            <div class="runtime-options">
              <strong>Runtime options</strong>
              <div>
                @for (option of item.options; track option) {
                  <code>{{ option }}</code>
                }
              </div>
            </div>
            <div class="code-block">
              <div>
                <span>TypeScript · framework-neutral API</span
                ><button type="button" (click)="copy(item.code, item.id)">
                  {{ copied() === item.id ? 'Copied' : 'Copy code' }}
                </button>
              </div>
              <pre><code>{{ item.code }}</code></pre>
            </div>
          </div>
          <figure>
            <img [src]="item.image" [alt]="item.alt" width="1280" height="540" loading="lazy" />
            <figcaption>{{ item.caption }}</figcaption>
          </figure>
        </article>
      }
    </section>
    <section class="premium-boundary wrap">
      <strong>One package, explicit entitlement</strong>
      <p>
        All 10 capabilities are included in <code>wts-data-table</code> 1.0.2 and later under
        feature-named imports. Advanced factories require a verified signed entitlement. The
        controllers are framework-neutral, so Angular, React, Vue, and JavaScript applications use
        the same feature APIs and connect them to their own component lifecycle.
      </p>
      <div class="license-actions">
        <a class="button button--primary" [href]="licenseRequest"> Email for a license key → </a>
        <a class="button" href="/pricing">Review licensing →</a>
      </div>
    </section>
  `,
  styles: [
    `
      .coverage {
        display: flex;
        align-items: baseline;
        gap: 0.7rem;
        margin-top: 1.5rem;
      }
      .coverage strong {
        color: var(--blue);
        font-size: 1.65rem;
      }
      .coverage span {
        color: var(--muted);
      }
      .premium-index {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.65rem;
        margin-bottom: 6rem;
      }
      .premium-index a {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        min-height: 52px;
        padding: 0.65rem 0.75rem;
        border: 1px solid var(--line);
        border-radius: 9px;
        background: #fff;
        color: var(--ink);
        font-size: 0.78rem;
        text-decoration: none;
      }
      .premium-index a:hover {
        border-color: var(--blue);
        color: var(--blue);
      }
      .premium-index span {
        display: grid;
        width: 24px;
        height: 24px;
        flex: 0 0 24px;
        border-radius: 50%;
        background: #edf3ff;
        color: var(--blue);
        font: 600 0.66rem var(--mono);
        place-items: center;
      }
      .premium-list {
        display: grid;
        gap: 7rem;
      }
      .premium-list article {
        display: grid;
        grid-template-columns: minmax(320px, 0.72fr) minmax(0, 1.28fr);
        min-width: 0;
        gap: 4rem;
        align-items: center;
        scroll-margin-top: 6rem;
      }
      .premium-list article:nth-child(even) {
        grid-template-columns: minmax(0, 1.28fr) minmax(320px, 0.72fr);
      }
      .premium-list article:nth-child(even) .premium-copy {
        order: 2;
      }
      .premium-list h2 {
        margin: 0.7rem 0 1rem;
        font-size: clamp(2.2rem, 4vw, 4rem);
        letter-spacing: -0.06em;
      }
      .premium-copy > p {
        color: var(--muted);
        line-height: 1.75;
      }
      .premium-copy,
      .premium-list figure {
        min-width: 0;
      }
      .premium-list figure {
        margin: 0;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: white;
        box-shadow: 0 28px 70px rgba(24, 35, 52, 0.13);
      }
      .premium-list img {
        display: block;
        width: 100%;
        height: auto;
      }
      .premium-list figcaption {
        padding: 0.7rem 1rem;
        background: white;
        color: var(--muted);
        font: 0.65rem var(--mono);
        text-transform: uppercase;
      }
      .runtime-options {
        margin-top: 1.2rem;
      }
      .runtime-options > strong {
        display: block;
        margin-bottom: 0.55rem;
        color: var(--muted);
        font: 0.68rem var(--mono);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .runtime-options > div {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }
      .runtime-options code {
        padding: 0.28rem 0.45rem;
        border: 1px solid #d6e0ef;
        border-radius: 5px;
        background: #f5f8fc;
        color: #24446f;
        font-size: 0.68rem;
      }
      .code-block {
        max-width: 100%;
        margin-top: 1.5rem;
        overflow: hidden;
        border-radius: 10px;
        background: #121a28;
        color: #d7e0ee;
      }
      .code-block > div {
        display: flex;
        justify-content: space-between;
        padding: 0.7rem 0.9rem;
        border-bottom: 1px solid #2e394a;
        color: #8ea0b8;
        font: 0.65rem var(--mono);
      }
      .code-block button {
        border: 0;
        background: transparent;
        color: var(--lime);
        cursor: pointer;
      }
      .code-block pre {
        max-height: 300px;
        margin: 0;
        padding: 1rem;
        overflow: auto;
        font: 0.7rem/1.65 var(--mono);
      }
      .premium-boundary {
        margin-top: 5rem;
        padding: 1.2rem;
        border: 1px solid #e6d19f;
        border-radius: 10px;
        background: #fff8e6;
      }
      .premium-boundary p {
        margin: 0.45rem 0 0;
        color: var(--muted);
        line-height: 1.65;
      }
      .license-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        margin-top: 1rem;
      }
      @media (max-width: 900px) {
        .premium-list article,
        .premium-list article:nth-child(even) {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        .premium-list article:nth-child(even) .premium-copy {
          order: 0;
        }
      }
      @media (max-width: 1050px) {
        .premium-index {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 580px) {
        .premium-index {
          grid-template-columns: 1fr;
        }
        .coverage {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `,
  ],
})
export class PremiumPage {
  protected readonly examples = PREMIUM_EXAMPLES;
  protected readonly licenseRequest = LICENSE_REQUEST;
  protected readonly copied = signal('');
  protected async copy(code: string, id: string) {
    await navigator.clipboard.writeText(code);
    this.copied.set(id);
    window.setTimeout(() => this.copied.set(''), 1400);
  }
}
