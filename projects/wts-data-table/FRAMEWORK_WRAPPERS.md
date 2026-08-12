# Official framework wrappers

The wrapper packages are deliberately thin. `wts-data-table` remains the only
table implementation, while each framework owns host creation, row updates,
SSR behavior, and teardown. Framework runtimes are peer dependencies and are
never bundled.

Import the structural stylesheet once:

```ts
import 'wts-data-table/styles.css';
```

Feature modules and presets work in all wrappers without registration:

```ts
import { standardPreset } from 'wts-data-table/presets';

const options = {
  columns,
  features: standardPreset<Person>(),
  getRowId: (row: Person) => row.id,
};
```

Each official wrapper exposes both the compatibility renderer and the truly
modular base renderer. Import `styles.css` for compatibility components or
`base.css` for base components. Use focused imports from
`wts-data-table/features/*` for custom base compositions.

Third-party plug-ins require no framework adapter. Resolve them through
`wts-data-table/plugin`, then pass `installation.features` in the wrapper's
ordinary `options.features`. Plug-in runtime DOM remains owned by the core
controller lifecycle.

Locale packs also require no wrapper adapter. Spread
`dataTableLocaleOptions(pack)` into compatibility-wrapper options or
`dataTableBaseLocaleOptions(pack)` into modular-wrapper options. Reactive
locale changes follow the existing options-reference remount contract.

## React 18 and 19

```sh
npm install wts-data-table wts-data-table-react react react-dom
```

```tsx
import { useMemo, useRef } from 'react';
import { WtsDataTableReact } from 'wts-data-table-react';
import type { DataTable } from 'wts-data-table';

const table = useRef<DataTable<Person>>(null);
const options = useMemo(() => ({
  columns: [{ accessor: 'name', header: 'Name' }],
  getRowId: (row: Person) => row.id,
}), []);

<WtsDataTableReact data={people} options={options} ref={table} />;
```

For a tree-shaken base composition, use `WtsDataTableBaseReact` with the same
data/options/ref lifecycle and import `wts-data-table/base.css`:

```tsx
import { WtsDataTableBaseReact } from 'wts-data-table-react';
import { selectionFeature } from 'wts-data-table/features/selection';
import 'wts-data-table/base.css';

<WtsDataTableBaseReact
  data={people}
  options={{ columns, features: [selectionFeature()], getRowId }}
/>;
```

The forwarded ref is the full `DataTable<T>` controller. `renderers.columns`
accepts native React render functions for cells, headers, filters, and column
menus; `detail`, `empty`, `loading`, and `footer` cover table-level surfaces.
Pass `state` and `onStateChange` for a controlled state loop. Data, row count,
and summary changes update the controller in place. A new `options` or
`renderers` object recreates the controller, so memoize both.

## Vue 3

```sh
npm install wts-data-table wts-data-table-vue vue
```

```vue
<script setup lang="ts">
import { shallowRef } from 'vue';
import { WtsDataTableVue } from 'wts-data-table-vue';

const table = shallowRef();
const options = {
  columns: [{ accessor: 'name', header: 'Name' }],
  getRowId: (row: Person) => row.id,
};
</script>

<template>
  <WtsDataTableVue :data="people" :options="options" ref="table" />
</template>
```

The exposed `getController()` returns the underlying controller. Use
`createWtsDataTableVue<T>()` for a typed component constructor or the generic
`useWtsDataTable<T>()` composable when building a custom host component.
Use `v-model:state` for two-way state. Native `cell`, `header`, `filter`, and
`menu` scoped slots apply globally; append `-{columnId}` for a per-column slot.
The component also exposes `detail`, `empty`, `loading`, and `footer` slots.

Use `WtsDataTableBaseVue`, `createWtsDataTableBaseVue<T>()`, or
`useWtsDataTableBase<T>()` for the modular renderer and import
`wts-data-table/base.css`.

## Angular 17–22

```sh
npm install wts-data-table wts-data-table-angular
```

```ts
import { Component } from '@angular/core';
import { WtsDataTableAngularComponent } from 'wts-data-table-angular';

@Component({
  imports: [WtsDataTableAngularComponent],
  standalone: true,
  template: `
    <wts-data-table-angular
      [data]="people()"
      [options]="tableOptions"
      (ready)="table = $event"
    />
  `,
})
export class PeopleComponent {}
```

Use standalone `WtsDataTableAngularBaseComponent` for the modular renderer:

```ts
import { WtsDataTableAngularBaseComponent } from 'wts-data-table-angular';

@Component({
  standalone: true,
  imports: [WtsDataTableAngularBaseComponent],
  template: `<wts-data-table-angular-base [data]="people" [options]="options" />`,
})
export class PeopleBaseComponent {}
```

Load `wts-data-table/base.css` for this component. It has the same SSR-safe
data, state, row-count, summary, ready, destroyed, and state-change lifecycle
contract as the compatibility wrapper.

The standalone component exposes `controller` after view initialization and
emits `ready` and `destroyed`. Input data changes update rows in place; a new
options reference remounts. Browser detection prevents controller creation
during Angular SSR.

`[(state)]` enables two-way state and `stateChanged` includes the reason and
controller. Standalone `wtsDataTableCell`, `wtsDataTableHeader`,
`wtsDataTableFilter`, `wtsDataTableMenu`, `wtsDataTableDetail`,
`wtsDataTableEmpty`, `wtsDataTableLoading`, and `wtsDataTableFooter` template
directives render framework-owned embedded views. Column directives accept
`"*"` as a fallback template.

## Lifecycle contract

- A row-only change preserves sorting, filters, pagination, focus, and layout.
- Controlled state is applied through the core `replaceState()` contract.
- Native renderer roots/views are reclaimed after every core redraw.
- An options-reference change intentionally reconstructs configuration.
- All wrappers destroy their controller when the framework unmounts.
- SSR produces only the empty host; hydration creates the interactive table.
- Styling and themes remain configured by `wts-data-table` itself.
