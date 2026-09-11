# Changelog

## 1.1.0 - 2026-09-11

### Fixed

- Column menus escape the table scroll area, stay aligned with their trigger,
  fit the viewport, and clean up on close, rerender, and destruction (#1).
- Range filters shrink or stack within their column instead of overlapping (#2).
- Select filters show a dropdown indicator, including RTL and forced-colors
  handling (#3).
- Framework and portal metadata now link directly to the canonical issue tracker.

### Card-view migration required

- Card view now requires a verified `card-view` entitlement in both its factory
  and controller constructor. Existing import paths and the MIT license remain
  unchanged. Standard table features do not require a key.
- Added exact browser-origin enforcement and expiry cleanup for card view, plus
  public verifier `wts-data-table-production-02` for newly issued signed keys.
- Existing 1.0.x releases are unaffected. This release intentionally introduces
  the card-view licensing requirement in 1.1.0; it is not backwards compatible
  for existing card-view callers. Obtain an entitlement and pass `license` and
  `origin` before upgrading, or pin an existing 1.0.x release. Standard tables
  need no key, and the package remains MIT licensed.

## 1.0.2 - 2026-09-02

### Added

- Added licensed advanced capabilities to the existing `wts-data-table`
  package through feature-named subpaths such as `wts-data-table/remote`,
  `wts-data-table/formula-engine`, and `wts-data-table/report-designer`.
- Added signed entitlement verification for advanced execution while retaining
  the package's existing MIT license and rejecting plain or forged API keys.
- Added advanced feature, integration, validation, and LLM-oriented
  documentation to the packed npm artifact.
- Added maintainer-only Ed25519 key-generation and strict license-signing
  commands with protected private storage and an editable claims template.

### Fixed

- Removed the obsolete separate-Pro-package and `/premium` import model from
  public documentation, package exports, and release planning artifacts.
- Isolated browser tests from unrelated development servers and added a real
  package fixture for cross-browser UI and accessibility checks.
- Kept compact row controls on one line without reserving a second expansion
  column, removing the control-area stripe and spacing regression.
- Prevented virtual-scroll feedback renders for unchanged/restored offsets.
- Kept the viewport, header and footer mounted during fixed-height vertical
  scrolling, reusing row partitions instead of processing the entire dataset.
- Invalidated the scroll layout for data/state changes, including silent core
  updates; retained the full-render path for variable heights and horizontal
  window changes. Pending frame/timeout work is cancelled on render or destroy.
- Added deterministic scrolling, invalidation and cleanup regressions and a
  measured before/after browser report in the development benchmark guide.

## 1.0.1

### Fixed

- Corrected sticky utility-column layering, grouped-header dividers, body-row
  backgrounds, and summary-footer alignment.
- Replaced ambiguous row-pin and expansion glyphs with consistent SVG icons
  and fixed compact control spacing, clipping, and focus presentation.
- Added packed-document link verification and strengthened the prepublish gate
  with release identity, bundle-size, and browser checks.
- Corrected framework-wrapper compatibility with the stable `1.x` core.
- Updated package-size documentation and the live demo to match measured
  release artifacts.

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
