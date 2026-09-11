export interface DeveloperGuideSection {
  readonly title: string;
  readonly body: string;
  readonly points?: readonly string[];
}

export interface DeveloperGuide {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly intro: string;
  readonly sections: readonly DeveloperGuideSection[];
  readonly codeTitle: string;
  readonly code: string;
}

export const DEVELOPER_GUIDES: readonly DeveloperGuide[] = [
  {
    slug: 'framework-wrappers',
    title: 'Framework wrappers',
    summary: 'Angular, React, and Vue lifecycle, state, and native rendering.',
    intro: 'Official wrappers keep the framework in charge of mounting and teardown while the same WTS controller owns table behavior.',
    sections: [
      { title: 'Choose the native wrapper', body: 'Install the wrapper beside wts-data-table. Framework runtimes stay peer dependencies, so React, Vue, and Angular are never bundled into the core package.', points: ['Angular 17–22: standalone component, ready/destroyed outputs, two-way state, and template directives.', 'React 18/19: forwarded controller ref, controlled state, and native render functions.', 'Vue 3: v-model state, scoped slots, a typed factory, and a composable.'] },
      { title: 'Reactive update contract', body: 'Replacing data updates rows in place and preserves view state. Replacing the options object intentionally reconstructs configuration. Memoize options in React and keep a stable reference in Angular and Vue unless remounting is intended.' },
      { title: 'Native content and cleanup', body: 'Cells, headers, filters, menus, details, empty/loading states, and footers can use framework-owned views. Wrappers reclaim those views on redraw and destroy the controller on unmount.' },
    ],
    codeTitle: 'Angular wrapper',
    code: `@Component({
  imports: [WtsDataTableAngularComponent],
  template: \`<wts-data-table-angular
    [data]="people()"
    [options]="options"
    [(state)]="state"
    (ready)="table = $event"
  />\`
})
export class PeopleTable {}`,
  },
  {
    slug: 'plugins',
    title: 'Plug-in development',
    summary: 'Consume, author, validate, and distribute feature plug-ins.',
    intro: 'Plug-ins add independently published behavior through a public, instance-scoped runtime contract without patching the renderer or relying on a global registry.',
    sections: [
      { title: 'Consume a plug-in', body: 'Create a registry from trusted packages, resolve requested features, and pass the resulting feature array into ordinary table options.' },
      { title: 'Author a runtime', body: 'A feature runtime can decorate roots, render layout content, react to table events, and release resources through its destroy hook.', points: ['Declare package and WTS compatibility in the manifest.', 'Validate dependencies and conflicts before creating the table.', 'Ship CSS and framework-neutral behavior from the plug-in package.'] },
      { title: 'Security boundary', body: 'Only register packages your application trusts. A manifest proves compatibility and dependency shape; it is not a sandbox for untrusted JavaScript.' },
    ],
    codeTitle: 'Resolve a plug-in per table',
    code: `const installation = createDataTablePluginRegistry([
  auditPlugin
]).resolve([
  useDataTablePlugin(auditPlugin.manifest.name, { endpoint: '/api/audit' })
]);

new DataTable({ ...options, features: installation.features });`,
  },
  {
    slug: 'themes',
    title: 'Themes and customization',
    summary: 'Theme adapters, automatic detection, and CSS custom properties.',
    intro: 'Theme adapters map WTS structure to an existing design system without loading framework CSS or adding runtime dependencies.',
    sections: [
      { title: 'Automatic and named themes', body: 'Use theme: auto to detect supported framework CSS already present, or select bootstrap5, bulma, foundation, fomantic, jquery-ui, or tailwind explicitly.' },
      { title: 'Product design tokens', body: 'The stylesheet exposes 87 supported --wts-table-* custom properties for color, type, spacing, controls, menus, pinned areas, groups, details, scrollbars, and layering.' },
      { title: 'Custom adapters', body: 'Use defineDataTableTheme when class mapping is more appropriate than token overrides. Keep application CSS responsible for the actual framework styles.' },
    ],
    codeTitle: 'Override only product tokens',
    code: `#people-table {
  --wts-table-accent: #7c3aed;
  --wts-table-background: #fff;
  --wts-table-border: #e5e7eb;
  --wts-table-row-height: 3rem;
  --wts-table-cell-padding-inline: .75rem;
  --wts-table-radius: 1rem;
}`,
  },
  {
    slug: 'internationalization',
    title: 'Internationalization',
    summary: 'Locale packs, negotiation, formatting, lazy loading, and RTL.',
    intro: 'Exact locale imports keep translated labels and core comparison behavior tree-shakable while platform Intl handles values.',
    sections: [
      { title: 'Official locale packs', body: 'Exact imports are available for English, French, German, Spanish, Arabic, Hindi, Japanese, Simplified Chinese, and Brazilian Portuguese.' },
      { title: 'Negotiation and fallback', body: 'Choose a locale from user preferences, declare a fallback, and lazy-load only the selected pack. Arabic includes RTL metadata and direction.' },
      { title: 'Application terminology', body: 'Extend a locale pack with product-specific labels while retaining built-in plurals, dates, numbers, lists, and relative-time formatters.' },
    ],
    codeTitle: 'Apply a locale to one table',
    code: `import { dataTableLocaleOptions } from 'wts-data-table/i18n';
import { arLocale } from 'wts-data-table/locales/ar';

new DataTable({
  ...options,
  ...dataTableLocaleOptions(arLocale)
});`,
  },
  {
    slug: 'server-integration',
    title: 'Browser/server integration',
    summary: 'Remote rows, request cancellation, cursors, facets, and uploads.',
    intro: 'Let the table own interaction state while an authenticated API owns filtering, sorting, pagination, summaries, and mutations.',
    sections: [
      { title: 'Manual processing', body: 'Enable manualFiltering, manualSorting, and manualPagination. Send state changes to the API, then call setData(rows, total, summaries).' },
      { title: 'Managed data source', body: 'The data-source controller adds debounce, AbortSignal cancellation, cache control, stale-response protection, loading status, and refresh/invalidate methods.' },
      { title: 'Cursors and facets', body: 'Use opaque cursor controllers for infinite loading and loadFacets for remote SearchPanes. Superseded requests are cancelled automatically.', points: ['Authenticate every request and authorize tenant/query scope on the server.', 'Treat cursor values as opaque and sign them when exposed to clients.', 'Destroy observers and data-source controllers with the owning view.'] },
    ],
    codeTitle: 'Connect table state to an API',
    code: `const remote = createDataTableDataSourceController({
  table: table.core,
  debounceMs: 200,
  async dataSource({ state, signal }) {
    const response = await fetch('/api/people?' + toQuery(state), { signal });
    return response.json(); // { rows, rowCount, summaryValues }
  }
});`,
  },
  {
    slug: 'server-packages',
    title: 'Server packages',
    summary: 'Protocol boundaries and backend application integration.',
    intro: 'The browser package defines transport contracts; @wts-data-table/server supplies backend handlers and adapters without coupling the UI to a database.',
    sections: [
      { title: 'Shared protocol', body: 'Rows, facets, cursor pages, editor options, and uploads use structured request/response contracts. serializeRequest and parseResponse adapt existing APIs or GraphQL envelopes.' },
      { title: 'Supported server surfaces', body: 'Use Express, Fetch, or GraphQL handlers and inject your own database client. Set maximum page sizes, timeouts, and allowlists at the server boundary.' },
      { title: 'Security responsibilities', body: 'Authentication, authorization, tenant isolation, field allowlists, rate limits, and mutation validation always remain server responsibilities.' },
    ],
    codeTitle: 'Express handler',
    code: `app.post('/api/data-table', createDataTableExpressHandler({
  adapter: database,
  maxPageSize: 100,
  authorize: ({ principal }) => principal.can('people:read')
}));`,
  },
  {
    slug: 'database-adapters',
    title: 'Database adapters',
    summary: 'PostgreSQL, MySQL, SQLite, Knex, and Prisma adapters.',
    intro: 'Database adapters translate the same typed table request into allowlisted queries and normalize rows, totals, summaries, facets, and cursor results.',
    sections: [
      { title: 'Declare an allowlist', body: 'Map public column IDs to database fields and explicitly enable search, filtering, sorting, facets, and aggregation. Never accept table or field identifiers from a request.' },
      { title: 'Choose an adapter', body: 'Use native PostgreSQL, MySQL, or SQLite adapters for SQL control; Knex for query-builder portability; or Prisma for an injected model.' },
      { title: 'Keyset cursors and editing', body: 'Provide a primary key and secret for signed keyset cursors. Editor-option loaders and multipart upload handlers reuse the same authorization boundary.' },
    ],
    codeTitle: 'PostgreSQL adapter',
    code: `const database = createDataTablePostgreSqlAdapter({
  client: pgPool,
  table: 'people',
  primaryKey: 'id',
  cursorSecret: process.env.CURSOR_SECRET,
  columns: [
    { id: 'name', field: 'name', facet: true },
    { id: 'score', field: 'score', type: 'number' }
  ]
});`,
  },
  {
    slug: 'advanced-features',
    title: 'Licensed advanced features',
    summary: 'Entitlements, feature imports, origins, and security boundaries.',
    intro: 'Advanced code ships inside wts-data-table under normal feature names. There is no separate Pro package and no premium import namespace.',
    sections: [
      { title: 'Verify before construction', body: 'verifyDataTableLicense accepts a signed entitlement token. Invalid signatures, expiry, origin mismatch, or a missing feature claim fail before the advanced controller is created.' },
      { title: 'Available entitlements', body: 'Card view, advanced row model, indexed search, background export, worker processing, live data, server analytics, formulas, collaboration, governance, and report design can be licensed independently.' },
      { title: 'Card-view migration', body: 'From version 1.1.0, createDataTableCardView and DataTableCardViewController require a verified card-view entitlement. Pass license and origin: window.location.origin. The controller also validates the real host document origin; a copied demo key cannot unlock another site. Standard tables need no key, and published 1.0.x behavior is unchanged.' },
      { title: 'Keep authorization separate', body: 'The entitlement controls access to package APIs. It never replaces user authentication, server authorization, tenant checks, or mutation validation.' },
    ],
    codeTitle: 'Verify and use a licensed feature',
    code: `const license = await verifyDataTableLicense(entitlementToken);

const rows = createRemoteRowModel({
  license,
  origin: window.location.origin,
  ...remoteOptions
});`,
  },
  {
    slug: 'bundle-size',
    title: 'Bundle-size strategy',
    summary: 'Renderer selection, presets, focused imports, and budgets.',
    intro: 'Choose a renderer and feature composition deliberately instead of shipping the complete compatibility surface to every page.',
    sections: [
      { title: 'Measured choices', body: 'Bare Base is approximately 12.6 KB gzip, Base with standardPreset about 13.6 KB, Base with all first-party modules about 20.2 KB, and Complete about 46.7 KB.' },
      { title: 'Compose exact features', body: 'Import Base plus only the selection, grouping, editing, responsive, virtualization, search-panes, export, pivot, column-control, and sticky modules the product uses.' },
      { title: 'Enforce a budget', body: 'Measure the real consumer bundle in CI. Keep CSS and JavaScript budgets separate and fail on regressions rather than relying on source-file size.' },
    ],
    codeTitle: 'Generate an exact setup',
    code: `npx wts-data-table setup \
  --renderer base \
  --features selection,responsive,virtualization \
  --write`,
  },
  {
    slug: 'api-stability',
    title: 'API stability',
    summary: 'Stable contracts, semantic versioning, and upgrade expectations.',
    intro: 'The v1 public surface follows semantic versioning across the core, controller, renderer, documented subpaths, Web Component, and official wrappers.',
    sections: [
      { title: 'Stable public contracts', body: 'Documented types, state fields, methods, callbacks, events, attributes, CSS properties, package exports, and wrapper inputs/outputs are compatibility commitments.' },
      { title: 'Safe evolution', body: 'Minor releases may add optional fields, methods, modules, or features. Breaking removals and incompatible behavior require a major release and migration notes.' },
      { title: 'Consumer checks', body: 'Pin versions where release control matters, run TypeScript and browser tests during upgrades, and avoid private DOM classes or internal runtime variables.' },
    ],
    codeTitle: 'Keep public imports explicit',
    code: `import { DataTable } from 'wts-data-table';
import { createDataTableStateStorage } from 'wts-data-table/persistence';
import { selectionFeature } from 'wts-data-table/features/selection';

// Avoid undocumented deep paths and private DOM internals.`,
  },
];

export function getDeveloperGuide(slug: string | null): DeveloperGuide {
  return DEVELOPER_GUIDES.find((guide) => guide.slug === slug) ?? DEVELOPER_GUIDES[0];
}
