// Descriptive topic phrases, not search-volume or ranking claims.
// Google ignores meta keywords; titles, descriptions, and visible copy must remain useful on their own.
const PAGE_KEYWORDS: Readonly<Record<string, readonly string[]>> = {
  '/': [
    'JavaScript data grid', 'TypeScript data table', 'Angular data table',
    'React data table', 'Vue data table', 'accessible data grid',
    'responsive data table', 'sortable table', 'data table filtering',
    'virtualized data grid', 'server-side pagination',
  ],
  '/features': ['data grid features', 'table sorting and filtering', 'inline cell editing', 'row grouping', 'virtual scrolling', 'CSV export'],
  '/docs': ['data table documentation', 'Angular data table tutorial', 'React data table setup', 'Vue data table integration', 'TypeScript table API'],
  '/premium': ['large dataset data grid', 'responsive card view', 'Web Worker table processing', 'server-side analytics', 'spreadsheet formulas', 'collaborative data grid'],
  '/pricing': ['data grid pricing', 'data table licensing', 'MIT Standard data table', 'Premium data grid subscription', 'monthly data grid subscription', 'yearly data grid subscription'],
  '/examples/portfolio': ['JavaScript data table example', 'project portfolio table', 'table sorting and filtering', 'table pagination', 'row selection'],
  '/examples/card-view': ['data table card view', 'responsive card grid', 'table to cards layout', 'card view example'],
  '/examples/selection': ['data table row selection', 'multiple row selection', 'bulk table actions', 'checkbox data table'],
  '/examples/filtering': ['data table filtering', 'column filters', 'global table search', 'filterable JavaScript table'],
  '/examples/grouping': ['data grid row grouping', 'table aggregation', 'grouped row totals', 'JavaScript grouping example'],
  '/examples/responsive': ['responsive data table', 'mobile data grid', 'expandable row details', 'responsive table columns'],
  '/examples/editing': ['editable data grid', 'inline cell editing', 'data table validation', 'JavaScript editable table'],
  '/docs/guides/framework-wrappers': ['Angular data table component', 'React data table component', 'Vue data table component', 'framework table integration'],
  '/docs/guides/angular': ['Angular data table', 'Angular standalone table component', 'Angular editable data grid', 'Angular server-side pagination', 'Angular signals table'],
  '/docs/guides/react': ['React data table', 'React 19 data grid', 'React editable table', 'Next.js data table', 'React server-side pagination'],
  '/docs/guides/vue': ['Vue 3 data table', 'Vue Composition API table', 'Vue editable data grid', 'Vue server-side pagination', 'Vue typed table component'],
  '/docs/guides/plugins': ['data table plugins', 'custom data grid features', 'TypeScript plugin development'],
  '/docs/guides/themes': ['data table themes', 'data grid CSS variables', 'Bootstrap data table', 'Tailwind data table'],
  '/docs/guides/internationalization': ['data table localization', 'RTL data grid', 'multilingual data table', 'table locale packs'],
  '/docs/guides/server-integration': ['server-side data table', 'server-side pagination', 'remote table filtering', 'cursor pagination', 'data grid API integration'],
  '/docs/guides/server-packages': ['data table server integration', 'Express data table API', 'GraphQL data grid', 'server-side table handlers'],
  '/docs/guides/database-adapters': ['PostgreSQL data table', 'MySQL data table', 'Prisma data grid adapter', 'Knex data grid adapter', 'SQL pagination'],
  '/docs/guides/advanced-features': ['Premium data grid setup', 'data table subscription', 'card view license', 'data grid license renewal'],
  '/docs/guides/bundle-size': ['lightweight data grid', 'tree-shakable data table', 'data table bundle size', 'modular TypeScript data grid'],
  '/docs/guides/api-stability': ['TypeScript data table API', 'data grid compatibility', 'data table versioning'],
};

export function keywordsForPage(url: string): readonly string[] {
  const path = url.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
  const keywords = PAGE_KEYWORDS[path];
  return keywords ? ['WTS Data Table', ...keywords] : [];
}
