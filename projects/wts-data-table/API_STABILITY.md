# API stability

`wts-data-table` follows semantic versioning. Public exports documented in the
README and emitted declarations are compatibility contracts.

## Stable v1 contracts

- `wts-data-table` DOM controller, core exports, state, columns, actions,
  selection, editing, SearchPanes, pagination, grouping, and layout APIs.
- `wts-data-table/core`, `data-source`, `export`, `persistence`, and
  `saved-views` entry points.
- `wts-data-table/crud`, `edit-history`, and `pivot` entry points.
- `wts-data-table/element` tag name, properties, methods, and documented
  attributes.
- Documented `--wts-table-*` custom properties.
- Row transactions, lazy tree loading state, fixed/variable row windows,
  flat-column windows, and asynchronous layout plug-in lifecycle methods.

Additive fields, methods, event details, and entry points may ship in minor
versions. Existing behavior or signatures change only in a major release.
Deprecations remain available for at least one minor release and are recorded
in the changelog before removal.

## New in v1.34–v1.35

`wts-data-table/server` is stable for its rows, facets, cursor payloads,
request serialization, response parsing, retry, cache, invalidation, and
telemetry contracts. Additional transport hooks may be added without changing
the native JSON payload.

## New in v1.36

`wts-data-table/card-view` and `wts-data-table/server-db` are additive stable
entry points. Database clients remain structurally typed and injected, keeping
the published runtime dependency-free. Advanced CRUD field and transport
interfaces are stable additions to `wts-data-table/crud`.

## New in v1.37

`DataTableThemeAdapter`, `defineDataTableTheme`, `applyDataTableTheme`, the
`theme` option, and the six `wts-data-table/themes/*` presets are additive
stable contracts. Presets contain no host-framework imports or dependencies.
Semantic theme slots may be added in minor releases.

## New in v1.38

Named and automatic theme options, theme status/runtime switching APIs, the
theme-change event, detection helpers, aggregate theme registry, Web Component
theme attribute, and setup assistant are additive stable contracts. Detection
falls back to the default WTS theme and never fetches framework assets.

## New in v1.39

`globalFilterOptions`, column `sortSequence`, and column `sortNulls` are
additive stable contracts. Existing tables retain case-insensitive contains
filtering, the ascending/descending/unsorted cycle, and automatic null
placement when the new options are omitted.

## New in v1.40

The named sort-type registry, built-in sort catalog, structured-filter
`regex`/`caseSensitive` fields, normalized server filtering metadata, sticky
section `mode`, and Web Component `sticky-mode` attribute are additive stable
contracts. Container sticky behavior and existing server payloads remain
backwards compatible when these additions are omitted.

The separately versioned `@wts-data-table/react`, `@wts-data-table/vue`, and
`@wts-data-table/angular` packages treat their documented props, inputs,
outputs, composables, controller exposure, peer-dependency boundaries, and
SSR lifecycle behavior as stable v1 wrapper contracts.

## New in v1.41

Framework-neutral column `headerContent`, `filterContent`, and `menuContent`
hooks and table `renderEmptyState` / `renderLoadingState` hooks are additive
stable contracts. React renderers and controlled state, Vue scoped slots and
`v-model:state`, and Angular template directives and `[(state)]` are stable
wrapper v1.1 contracts. Existing text headers, built-in filters, menus, and
message rows remain unchanged when these hooks are omitted.

## New in v1.42

`DataTableFeature`, `validateDataTableFeatures`, `applyDataTableFeatures`, the
eight `wts-data-table/features/*` entry points, and the lite, standard, and
complete preset factories are additive stable contracts. `features` is
optional; existing direct option objects keep their previous behavior.

`wts-data-table/lite` and `wts-data-table/lite.css` are stable compact entry
points. The lite renderer intentionally supports sorting, filtering,
pagination, grouping, selection, responsive overflow, and row
virtualization. Unsupported feature modules fail early instead of degrading
silently. Published bundle budgets are regression gates, not API limits.

Official wrapper v1.2 option types pass the same feature arrays to the full
renderer. No wrapper-specific module registration is required.

## New in v1.43

`wts-data-table/base`, `wts-data-table/base.css`, and the public base runtime
host/controller/context types are additive stable contracts. A composable
feature owns executable, per-table hooks and cleanup; an omitted module owns no
behavior in the generated base consumer bundle. Runtime-less features are
rejected by the base renderer instead of being silently accepted.

`wts-data-table/complete` is a stable explicit alias of the original complete
renderer. The root `wts-data-table` entry and its direct-option behavior remain
unchanged. The new ColumnControl and sticky feature entries are additive.

Official wrapper v1.3 contracts add base-renderer components/composables while
retaining every existing complete-renderer export.

## New in v1.44

`defineDataTablePlugin`, `DataTablePluginRegistry`,
`createDataTablePluginRegistry`, `useDataTablePlugin`, manifest/catalog types,
and the plug-in API/catalog version constants are additive stable contracts.
The plug-in API is import-scoped and does not introduce global registration.

Manifest API version 1, the published JSON schema, deterministic dependency
ordering, renderer/engine validation, and explicit stylesheet metadata are
stable. Additional optional manifest fields or additional supported SemVer
syntax may be added without breaking v1 manifests.

## New in v1.45

The locale-pack v1 contract, `defineDataTableLocalePack`, locale negotiation,
renderer option helpers, formatter helpers, and the nine exact locale entry
points are additive stable APIs. Packs are immutable and complete missing
fields through the English fallback contract.

BCP 47 canonicalization, locale aliases, progressive fallback,
`Accept-Language` quality ordering, and per-table direction are stable.
Additional exact locale packs can be published without changing existing
imports or the base bundle.

## New in v1.46

`DATA_TABLE_SERVER_PROTOCOL_VERSION` and the optional `protocolVersion` payload
field are additive stable contracts. The browser adapter always emits version
1; versionless requests remain accepted by the server packages during the 1.x
migration window.

Backend runtime APIs now live in independently versioned
`@wts-data-table/protocol` and `@wts-data-table/server` packages.
`wts-data-table/server-db` remains supported throughout the 1.x line.

## v2 readiness gate

A v2 release requires:

1. No unresolved declaration or package-entry compatibility failures.
2. Passing DOM/core, package-consumer, Chromium, Firefox, WebKit, and WCAG
   automation.
3. Published benchmark results within the recorded regression ceilings.
4. A migration guide for every removed or behavior-changing API.
5. At least one deprecation cycle for avoidable breaking changes.
