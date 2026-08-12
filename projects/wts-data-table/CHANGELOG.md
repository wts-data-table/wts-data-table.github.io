# Changelog

## 1.0.0

First stable release of `wts-data-table`.

### Core and rendering

- Dependency-free, framework-agnostic TypeScript data-table engine with ESM,
  CommonJS, declaration, SSR-safe, and Web Component entry points.
- Sorting, filtering, pagination, selection, editing, grouped headers, tree
  data, master-detail rows, aggregation, saved views, and responsive layouts.
- Modular base, lite, complete, feature, preset, theme, and plug-in entry
  points designed for tree shaking.

### Data and performance

- Fixed and variable-height row virtualization, wide-column virtualization,
  infinite loading, cursor pagination, and abortable asynchronous data sources.
- Atomic add/update/remove row transactions and cached, reloadable lazy tree
  children with explicit loading and error state.
- Awaitable asynchronous layout plug-in initialization and cleanup with
  callback and DOM-event error reporting.
- Server adapters for REST, Fetch, Express, GraphQL, SQL, PostgreSQL, MySQL,
  SQLite, Knex, and Prisma integrations.
- Versioned protocol contracts and shared conformance fixtures for backend
  implementations.

### Export, localization, and theming

- CSV, XLSX, PDF, print, and clipboard workflows.
- Locale packs for English, French, German, Spanish, Arabic, Hindi, Japanese,
  Simplified Chinese, and Brazilian Portuguese, including RTL support.
- Semantic CSS tokens and adapters for Bootstrap, Bulma, Fomantic UI,
  Foundation, jQuery UI, and Tailwind CSS.

### Quality

- Keyboard navigation, forced-colors support, semantic table markup, and
  automated WCAG A/AA browser checks.
- Clean-package ESM/CommonJS installation tests, public declaration checks,
  package-size budgets, and stable-release metadata validation.
