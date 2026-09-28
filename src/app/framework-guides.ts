import type { DeveloperGuide, DeveloperGuideSection } from './developer-guides';

// These exact strings are compiled by scripts/verify-framework-examples.mjs.
export const PROJECT_DATA = `import type { DataTableOptions } from 'wts-data-table';

export interface Project {
  id: string;
  name: string;
  status: string;
  budget: number;
}

export const projects: Project[] = [
  { id: 'p1', name: 'Website redesign', status: 'In progress', budget: 24000 },
  { id: 'p2', name: 'Customer portal', status: 'Planning', budget: 18000 },
  { id: 'p3', name: 'Analytics dashboard', status: 'Complete', budget: 32000 }
];

export const columns: DataTableOptions<Project>['columns'] = [
  { accessor: 'name', header: 'Project', editable: true },
  { accessor: 'status', header: 'Status', filterVariant: 'select' },
  {
    accessor: 'budget', header: 'Budget', dataType: 'number',
    editable: {
      type: 'number', min: 0,
      validate: value => Number.isFinite(Number(value)) && Number(value) >= 0
        ? undefined : 'Enter a non-negative budget.'
    }
  }
];`;

export const REMOTE_DATA = `import type { DataTable } from 'wts-data-table';
import {
  createDataTableDataSourceController,
  type DataTableDataSourceResult,
  type DataTableDataSourceStatus
} from 'wts-data-table/data-source';
import type { Project } from './table-data';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isProjectPage(value: unknown): value is DataTableDataSourceResult<Project> {
  return isRecord(value) && Array.isArray(value.rows)
    && typeof value.rowCount === 'number' && Number.isSafeInteger(value.rowCount)
    && value.rowCount >= value.rows.length
    && value.rows.every(row => isRecord(row)
      && typeof row.id === 'string' && typeof row.name === 'string'
      && typeof row.status === 'string' && typeof row.budget === 'number'
      && Number.isFinite(row.budget));
}

export function connectProjects(
  table: DataTable<Project>,
  onStatusChange: (status: DataTableDataSourceStatus) => void
) {
  return createDataTableDataSourceController<Project>({
    table: table.core,
    debounceMs: 200,
    onStatusChange,
    async dataSource({ state, filtering, signal }) {
      const response = await fetch('/api/projects/query', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, filtering }),
        signal
      });
      if (!response.ok) throw new Error('Project request failed: ' + response.status);
      const page: unknown = await response.json();
      if (!isProjectPage(page)) throw new Error('Invalid project response');
      return page;
    }
  });
}`;

export const LOCAL_EXAMPLES = {
  Angular: `import { Component, signal } from '@angular/core';
import {
  WtsDataTableAngularComponent,
  type WtsAngularDataTableOptions
} from '@wts-data-table/angular';
import { columns, projects, type Project } from './table-data';

@Component({
  selector: 'app-project-table',
  standalone: true,
  imports: [WtsDataTableAngularComponent],
  template: \`
    <p aria-live="polite">{{ selected() }} selected</p>
    <wts-data-table-angular [data]="rows()" [options]="options" />
  \`
})
export class ProjectTableComponent {
  readonly rows = signal<readonly Project[]>(projects);
  readonly selected = signal(0);
  readonly options: WtsAngularDataTableOptions<Project> = {
    columns,
    getRowId: row => row.id,
    ariaLabel: 'Project delivery',
    showGlobalFilter: true,
    columnFilters: 'always',
    selectionMode: 'multiple',
    editing: true,
    initialState: { pagination: { pageSize: 10 } },
    onStateChange: state => this.selected.set(state.rowSelection.length),
    // Local-only edits: keep the Angular input in sync with the controller.
    onEditCommit: ({ instance }) => this.rows.set([...instance.getData()])
  };
}`,
  React: `'use client';

import { useMemo, useState } from 'react';
import {
  WtsDataTableReact,
  type WtsReactDataTableOptions
} from '@wts-data-table/react';
import { columns, projects, type Project } from './table-data';

export function ProjectTable() {
  const [rows, setRows] = useState<readonly Project[]>(projects);
  const [selected, setSelected] = useState(0);
  const options = useMemo<WtsReactDataTableOptions<Project>>(() => ({
    columns,
    getRowId: row => row.id,
    ariaLabel: 'Project delivery',
    showGlobalFilter: true,
    columnFilters: 'always',
    selectionMode: 'multiple',
    editing: true,
    initialState: { pagination: { pageSize: 10 } },
    onStateChange: state => setSelected(state.rowSelection.length),
    // Local-only edits: keep React data in sync without replacing options.
    onEditCommit: ({ instance }) => setRows([...instance.getData()])
  }), []);

  return <>
    <p aria-live="polite">{selected} selected</p>
    <WtsDataTableReact data={rows} options={options} />
  </>;
}`,
  Vue: `<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import {
  createWtsDataTableVue,
  type WtsVueDataTableOptions
} from '@wts-data-table/vue';
import { columns, projects, type Project } from './table-data';

const ProjectGrid = createWtsDataTableVue<Project>();
const rows = shallowRef<readonly Project[]>(projects);
const selected = ref(0);
const options: WtsVueDataTableOptions<Project> = {
  columns,
  getRowId: row => row.id,
  ariaLabel: 'Project delivery',
  showGlobalFilter: true,
  columnFilters: 'always',
  selectionMode: 'multiple',
  editing: true,
  initialState: { pagination: { pageSize: 10 } },
  onStateChange: state => { selected.value = state.rowSelection.length; },
  // Local-only edits: replace the array so the wrapper observes the change.
  onEditCommit: ({ instance }) => { rows.value = [...instance.getData()]; }
};
</script>

<template>
  <p aria-live="polite">{{ selected }} selected</p>
  <ProjectGrid :data="rows" :options="options" />
</template>`
} as const;

export const REMOTE_EXAMPLES = {
  Angular: `import { Component, signal, type OnDestroy } from '@angular/core';
import type { DataTable } from 'wts-data-table';
import {
  WtsDataTableAngularComponent,
  type WtsAngularDataTableOptions
} from '@wts-data-table/angular';
import { columns, type Project } from './table-data';
import { connectProjects } from './remote-data';

@Component({
  selector: 'app-remote-project-table',
  standalone: true,
  imports: [WtsDataTableAngularComponent],
  template: \`
    <p role="status">{{ status() }}</p>
    <button type="button" (click)="refresh()">Refresh / retry</button>
    <wts-data-table-angular [data]="initialRows" [options]="options"
      (ready)="connect($event)" (destroyed)="disconnect()" />
  \`
})
export class RemoteProjectTableComponent implements OnDestroy {
  readonly initialRows: readonly Project[] = [];
  readonly status = signal('idle');
  private remote?: ReturnType<typeof connectProjects>;
  readonly options: WtsAngularDataTableOptions<Project> = {
    columns, getRowId: row => row.id, ariaLabel: 'Remote projects',
    showGlobalFilter: true, columnFilters: 'always', editing: false,
    manualFiltering: true, manualSorting: true, manualPagination: true,
    initialState: { pagination: { pageSize: 25 } }
  };
  connect(table: DataTable<Project>): void {
    this.disconnect();
    this.remote = connectProjects(table, ({ phase }) => this.status.set(phase));
  }
  refresh(): void { void this.remote?.refresh(true); }
  disconnect(): void { this.remote?.destroy(); this.remote = undefined; }
  ngOnDestroy(): void { this.disconnect(); }
}`,
  React: `'use client';

import { useCallback, useRef, useState } from 'react';
import type { DataTable } from 'wts-data-table';
import { WtsDataTableReact, type WtsReactDataTableOptions } from '@wts-data-table/react';
import { columns, type Project } from './table-data';
import { connectProjects } from './remote-data';

const initialRows: readonly Project[] = [];
const options: WtsReactDataTableOptions<Project> = {
  columns, getRowId: row => row.id, ariaLabel: 'Remote projects',
  showGlobalFilter: true, columnFilters: 'always', editing: false,
  manualFiltering: true, manualSorting: true, manualPagination: true,
  initialState: { pagination: { pageSize: 25 } }
};

export function RemoteProjectTable() {
  const [status, setStatus] = useState('idle');
  const remote = useRef<ReturnType<typeof connectProjects> | undefined>(undefined);
  const disconnect = useCallback(() => {
    remote.current?.destroy();
    remote.current = undefined;
  }, []);
  const connect = useCallback((table: DataTable<Project>) => {
    disconnect();
    remote.current = connectProjects(table, ({ phase }) => setStatus(phase));
  }, [disconnect]);

  return <>
    <p role="status">{status}</p>
    <button type="button" onClick={() => { void remote.current?.refresh(true); }}>
      Refresh / retry
    </button>
    <WtsDataTableReact data={initialRows} options={options}
      onReady={connect} onDestroy={disconnect} />
  </>;
}`,
  Vue: `<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { useWtsDataTable, type WtsVueDataTableOptions } from '@wts-data-table/vue';
import { columns, type Project } from './table-data';
import { connectProjects } from './remote-data';

const host = ref<HTMLElement | null>(null);
const status = ref('idle');
let remote: ReturnType<typeof connectProjects> | undefined;
const options: WtsVueDataTableOptions<Project> = {
  columns, getRowId: row => row.id, ariaLabel: 'Remote projects',
  showGlobalFilter: true, columnFilters: 'always', editing: false,
  manualFiltering: true, manualSorting: true, manualPagination: true,
  initialState: { pagination: { pageSize: 25 } }
};
function disconnect() { remote?.destroy(); remote = undefined; }
function refresh() { void remote?.refresh(true); }

useWtsDataTable<Project>({
  host, data: [], options,
  onReady(table) {
    disconnect();
    remote = connectProjects(table, ({ phase }) => { status.value = phase; });
  },
  onDestroy: disconnect
});
onBeforeUnmount(disconnect);
</script>

<template>
  <p role="status">{{ status }}</p>
  <button type="button" @click="refresh">Refresh / retry</button>
  <div ref="host"></div>
</template>`
} as const;

const sharedData: DeveloperGuideSection = {
  title: 'Define typed rows and editable columns',
  body: 'Create table-data.ts beside your component. Stable project IDs preserve selection when rows change. Name and budget are editable; status supplies a select filter. The examples below use these three local rows and need no API key.',
  codeTitle: 'table-data.ts', code: PROJECT_DATA,
};
const interaction: DeveloperGuideSection = {
  title: 'Filter, select, and edit',
  body: 'The complete component below enables global search, per-column filters, multiple row selection, and cell editing. Double-click a name or budget cell, or focus it and press Enter. Enter commits; Escape cancels. Negative budgets fail validation. These examples save edits in local application state only; a reload restores the sample data.',
  points: [
    'showGlobalFilter and columnFilters control the search UI. Use controller.setGlobalFilter() or setColumnFilter() for your own controls.',
    'selectionMode enables checkboxes. onStateChange receives rowSelection IDs; the selected count here describes explicit selection in this local dataset, not an all-filtered server selection.',
    'For durable edits, await your authenticated API in onEditCommit before updating framework data. Reject or throw on failure so the table rolls back. Handle onEditError to display a useful message; validate and authorize again on the server.',
  ],
};
const remoteTransport: DeveloperGuideSection = {
  title: 'Connect server-side data',
  body: 'This is an optional integration recipe, not a hosted API. Create remote-data.ts and implement POST /api/projects/query on your backend. The request contains { state, filtering }; return { rows, rowCount }, where rowCount is the total after filtering, not the current page length. state.pagination.pageIndex is zero-based. The transport validates the response and forwards AbortSignal for cancellation.',
  points: [
    'Process filtering, sorting, and pagination on the server when all three manual flags are true. The driver debounces queries, cancels superseded requests, caches results, and ignores stale responses.',
    'The following remote component is read-only. The data-source driver owns loaded rows; do not replace its stable empty input with the local sample array during rerenders.',
    'Require authentication and authorization, allowlist column IDs and operators, cap page size, and apply your application’s CSRF protection. Never interpolate untrusted field names into SQL.',
    'Loading and error phases appear in the status label. Refresh / retry forces a new request. Destroy the driver on unmount to abort requests and release subscriptions.',
  ],
  codeTitle: 'remote-data.ts', code: REMOTE_DATA,
};

export const FRAMEWORK_GUIDES: readonly DeveloperGuide[] = [
  {
    slug: 'angular', framework: 'Angular', title: 'Angular data table guide',
    summary: 'Build an Angular data table with standalone components, signals, filters, row selection, editable cells, and server-side pagination.',
    intro: 'Use the official Angular wrapper in an existing Angular 17–22 application. This guide builds a typed, editable project table with signals, then shows how to replace local data with a cancellable server query.',
    codeTitle: 'project-table.component.ts', code: LOCAL_EXAMPLES.Angular,
    codeIntro: 'Complete local component. Add table-data.ts from the typed-rows section, import the global stylesheet, then import ProjectTableComponent in a parent and render <app-project-table />. No backend is needed for this example.',
    sections: [
      { title: 'Install in an Angular application', body: 'Run this in an existing Angular application. The wrapper is standalone: no NgModule registration or global provider is required. This guide is checked with wts-data-table 1.1.1 and @wts-data-table/angular 1.0.0.', codeTitle: 'Terminal', language: 'npm', code: 'npm install wts-data-table@1.1.1 @wts-data-table/angular@1.0.0' },
      { title: 'Load styles globally', body: 'Add this once in src/styles.scss or src/styles.css. Do not put the library stylesheet inside an encapsulated component style. A parent component must import ProjectTableComponent and include <app-project-table /> in its template.', codeTitle: 'src/styles.scss', language: 'CSS', code: "@import 'wts-data-table/styles.css';" },
      sharedData, interaction, remoteTransport,
      { title: 'Mount the remote Angular table', body: 'Use this instead of the local component when your backend is ready. The ready output supplies the controller. The driver is released both before reconnecting and when the owning component is destroyed. Import RemoteProjectTableComponent in a parent and render <app-remote-project-table />.', codeTitle: 'remote-project-table.component.ts', code: REMOTE_EXAMPLES.Angular },
      { title: 'Angular lifecycle and controlled state', body: 'A new data array updates the existing controller. A new options object remounts it, so keep options as a stable readonly field and use controller methods for interaction updates. The wrapper creates DOM only in the browser and owns table destruction.', points: ['Use (ready) to access the typed controller, (stateChange) for state snapshots, and (stateChanged) when you need the reason and controller. [(state)] is supported for application-controlled state.', 'Use signals for callback-driven application UI, including zoneless Angular. When supplying custom cell UI, import WtsDataTableCellTemplateDirective and use an ng-template wtsDataTableCell="columnId".', 'Keep API subscriptions and extra data-source drivers under your component’s teardown; the wrapper cannot dispose application-owned services.'] },
      { title: 'Troubleshoot Angular integration', body: 'Start with the local component before adding your API.', points: ['Unknown element: import WtsDataTableAngularComponent into the standalone component that uses it.', 'Unstyled table: load the CSS globally, not only in component-scoped styles.', 'Selection resets: check stable getRowId values and avoid constructing options in a template getter.', 'No remote rows: inspect the HTTP status and response shape; supply the filtered total rowCount and ensure your server honors the manual query flags.'] },
    ],
  },
  {
    slug: 'react', framework: 'React', title: 'React data table guide',
    summary: 'Build a React 18/19 data table with hooks, stable options, selection, inline editing, and server-side pagination. Includes Next.js guidance.',
    intro: 'Use the official React wrapper without giving up React-owned state. Build an editable project table with memoized options, then connect a server query with cleanup that also works during Strict Mode remounts.',
    codeTitle: 'ProjectTable.tsx', code: LOCAL_EXAMPLES.React, language: 'TSX',
    codeIntro: 'Complete local component. Add table-data.ts from the typed-rows section, import the stylesheet in your application entry, then render <ProjectTable />. The use client directive is needed for Next.js App Router and is harmless in a client-only build.',
    sections: [
      { title: 'Install in a React application', body: 'Use an existing React 18 or 19 TypeScript application. React and React DOM remain peer dependencies; they are not bundled into the wrapper. This guide is checked with wts-data-table 1.1.1 and @wts-data-table/react 1.0.0.', codeTitle: 'Terminal', language: 'npm', code: 'npm install wts-data-table@1.1.1 @wts-data-table/react@1.0.0' },
      { title: 'Load styles and mount the component', body: 'Import the CSS once in your application entry (for example src/main.tsx). In Next.js App Router, import it from app/layout.tsx and render ProjectTable from a page. Keep the use client directive on components that use hooks and the wrapper; do not access window at module scope.', codeTitle: 'Application entry or root layout', language: 'TSX', code: "import 'wts-data-table/styles.css';" },
      sharedData, interaction, remoteTransport,
      { title: 'Mount the remote React table', body: 'Render RemoteProjectTable instead of the local component once your endpoint is implemented. Module-level options and initialRows stay stable. onReady connects the driver and onDestroy releases it during unmount or the development Strict Mode setup/cleanup cycle.', codeTitle: 'RemoteProjectTable.tsx', language: 'TSX', code: REMOTE_EXAMPLES.React },
      { title: 'React lifecycle and controlled state', body: 'Keep options and renderers referentially stable with useMemo or module-level constants. A fresh options object reconstructs the controller; changing only data calls setData on the existing table. Avoid using a changing table key as an update mechanism.', points: ['Use a stable useRef<DataTable<Project> | null>(null) when you need the forwarded controller. The wrapper clears it on unmount.', 'For controlled state, pass state={state} and onStateChange={setState}, starting with useState<DataTableState>(). Do not keep replacing state with an old saved snapshot.', 'Never call hooks at module scope. Keep callback dependencies accurate; use functional state updates or refs when a memoized callback needs current application data.', 'React-owned renderers can return JSX for cells, filters, headers, and menus. Memoize the renderers object too, and let the wrapper release its renderer roots.'] },
      { title: 'Troubleshoot React and Next.js', body: 'Separate a wrapper lifecycle issue from an API or application-state issue.', points: ['Table remounts on every render: move inline options and renderers into useMemo or stable module constants.', 'Invalid hook call: check that hooks are inside a component and that the application has one compatible React runtime.', 'Next.js hooks/server-component error: put use client at the top of the table component, not inside a function.', 'Duplicate requests in development: Strict Mode intentionally exercises cleanup. Keep onDestroy cleanup and AbortSignal forwarding; do not disable Strict Mode to hide leaked subscriptions.', 'Edits disappear after an unrelated render: persist committed data in React state, as the local example does. Server edits must also be saved to your backend.'] },
    ],
  },
  {
    slug: 'vue', framework: 'Vue', title: 'Vue 3 data table guide',
    summary: 'Build a Vue 3 data table with typed components, shallowRef, filters, row selection, editable cells, and cancellable server-side data.',
    intro: 'Use the Vue 3.4+ Composition API with a typed table component. Keep the row type shared between props and options, preserve controller identity during updates, and use the composable when you need direct ownership of the host element.',
    codeTitle: 'ProjectTable.vue', code: LOCAL_EXAMPLES.Vue, language: 'Vue',
    codeIntro: 'Complete local single-file component. Add table-data.ts from the typed-rows section, load the global stylesheet, and import ProjectTable.vue into a parent template. createWtsDataTableVue<Project>() keeps rows and options typed together.',
    sections: [
      { title: 'Install in a Vue 3 application', body: 'Use an existing Vue 3.4+ TypeScript application, such as a Vite Vue project. This guide is checked with wts-data-table 1.1.1 and @wts-data-table/vue 1.0.0. No global Vue plug-in registration is needed.', codeTitle: 'Terminal', language: 'npm', code: 'npm install wts-data-table@1.1.1 @wts-data-table/vue@1.0.0' },
      { title: 'Load styles in the app entry', body: 'Import the stylesheet once in src/main.ts. In Nuxt, add it to the css configuration and keep browser-specific table integration in a client component or ClientOnly boundary. Do not hide the library styles behind a scoped style block.', codeTitle: 'src/main.ts', code: "import 'wts-data-table/styles.css';" },
      sharedData, interaction, remoteTransport,
      { title: 'Use the composable for remote data', body: 'This complete remote component uses useWtsDataTable<Project>() with an element ref. The composable mounts after the DOM exists and destroys the table on unmount; the additional driver is cleaned up explicitly. Use it instead of ProjectTable.vue once the endpoint is ready.', codeTitle: 'RemoteProjectTable.vue', language: 'Vue', code: REMOTE_EXAMPLES.Vue },
      { title: 'Vue lifecycle, slots, and state', body: 'Keep options as a stable object created once in setup. Store rows in shallowRef and replace rows.value with a new array after edits or network updates. Deep mutation alone does not change the data reference observed by the wrapper.', points: ['createWtsDataTableVue<Project>() is the typed component factory; useWtsDataTable<Project>() is the typed composable for a custom host.', 'Use v-model:state on the component when the application owns the state snapshot. Use the onStateChange option or composable callback for derived UI such as the selected count.', 'The ready-to-use component accepts scoped slots such as #cell-name, #header-name, #empty, and #loading. The composable gives you the controller rather than the component’s slot bridge.', 'Avoid wrapping the controller in a deeply reactive object. Keep it in the shallow reference returned by the composable or access the component’s getController().'] },
      { title: 'Troubleshoot Vue integration', body: 'Check reference identity before changing table configuration.', points: ['Rows do not update: assign a new rows.value array instead of pushing into a shallowRef array.', 'Type mismatch with unknown rows: use createWtsDataTableVue<Project>() so the component and options share the same generic type.', 'The table resets during an unrelated update: do not build an options object inline in the template or a computed value that changes unnecessarily.', 'Nuxt hydration problems: keep browser-only integration inside a client boundary and do not read document or window at module scope.', 'Remote table stays empty: check the status, response validation, filtered rowCount, and server query implementation before changing the component.'] },
    ],
  },
];
