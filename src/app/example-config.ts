import type { TableDemoDefinition } from "./site-data";
import type { DataTableCardViewMode } from "wts-data-table/card-view";

export const FRAMEWORKS = ["Vanilla TS", "Angular", "React", "Vue"] as const;
export type ExampleFramework = (typeof FRAMEWORKS)[number];
export const DEMO_PAGE_SIZES = [5, 8, 14] as const;
export type DemoPageSize = (typeof DEMO_PAGE_SIZES)[number];

export interface DemoRuntimeOptions {
  readonly viewMode: DataTableCardViewMode;
  readonly globalFilter: boolean;
  readonly columnFilters: boolean;
  readonly advancedFiltering: boolean;
  readonly searchPanes: boolean;
  readonly pagination: boolean;
  readonly pageSize: DemoPageSize;
  readonly selection: boolean;
  readonly cellSelection: boolean;
  readonly editing: boolean;
  readonly autoFill: boolean;
  readonly responsive: boolean;
  readonly columnManager: boolean;
  readonly columnMenu: boolean;
  readonly grouping: boolean;
  readonly rowExpansion: boolean;
  readonly rowReordering: boolean;
  readonly rowPinning: boolean;
  readonly stickyHeader: boolean;
  readonly summaryRows: boolean;
  readonly stickyFooter: boolean;
  readonly virtualization: boolean;
}

export type DemoBooleanOption = Exclude<keyof DemoRuntimeOptions, "pageSize" | "viewMode">;

export function createDemoRuntimeOptions(id: string): DemoRuntimeOptions {
  return {
    viewMode: id === "card-view" ? "cards" : "table",
    globalFilter: id === "portfolio" || id === "filtering" || id === "card-view",
    columnFilters: id === "portfolio" || id === "filtering",
    advancedFiltering: false,
    searchPanes: false,
    pagination: true,
    pageSize: id === "responsive" ? 5 : 8,
    selection: id === "portfolio" || id === "selection" || id === "card-view",
    cellSelection: id === "editing",
    editing: id === "editing",
    autoFill: false,
    responsive: true,
    columnManager: true,
    columnMenu: true,
    grouping: id === "grouping",
    rowExpansion: false,
    rowReordering: false,
    rowPinning: false,
    stickyHeader: true,
    summaryRows: id === "grouping" || id === "portfolio",
    stickyFooter: false,
    virtualization: false,
  };
}

export function createFrameworkSnippet(
  framework: ExampleFramework,
  demo: TableDemoDefinition,
  runtime: DemoRuntimeOptions,
): string {
  const options = optionLines(demo.id, runtime)
    .map((line) => `    ${line}`)
    .join("\n");
  if (runtime.viewMode === 'table' && demo.id !== 'card-view') {
    // The standard table does not import a licensed controller or need a key.
    if (framework === 'Angular') return `import { Component } from '@angular/core';
import { WtsDataTableAngularComponent } from '@wts-data-table/angular';
import type { DataTableOptions } from 'wts-data-table';
import 'wts-data-table/styles.css';

@Component({
  standalone: true,
  imports: [WtsDataTableAngularComponent],
  template: \`<wts-data-table-angular [data]="projects" [options]="options" />\`,
})
export class ProjectTableComponent {
  readonly projects = projects;
  readonly options: Omit<DataTableOptions<Project>, 'element' | 'data'> = {
${options}
  };
}`;
    if (framework === 'React') return `import { useMemo } from 'react';
import { WtsDataTableReact } from '@wts-data-table/react';
import type { DataTableOptions } from 'wts-data-table';
import 'wts-data-table/styles.css';

export function ProjectTable() {
  const options = useMemo<Omit<DataTableOptions<Project>, 'element' | 'data'>>(() => ({
${options}
  }), []);
  return <WtsDataTableReact data={projects} options={options} />;
}`;
    if (framework === 'Vue') return `<script setup lang="ts">
import { WtsDataTableVue } from '@wts-data-table/vue';
import type { DataTableOptions } from 'wts-data-table';
import 'wts-data-table/styles.css';

const options: Omit<DataTableOptions<Project>, 'element' | 'data'> = {
${options}
};
</script>

<template>
  <WtsDataTableVue :data="projects" :options="options" />
</template>`;
    return `import { DataTable } from 'wts-data-table';
import 'wts-data-table/styles.css';

const table = new DataTable<Project>({
  element: '#project-table',
  data: projects,
${options}
});
await table.ready();
// On page or component teardown:
function destroy() { table.destroy(); }`;
  }

  const cardImport = `import { createDataTableCardView, type DataTableCardViewController } from 'wts-data-table/card-view';\nimport { connectDataTableLicense, type DataTableLicenseSession } from 'wts-data-table/license';\n\n// Replace with your deployment key registered for this origin and card-view.\nconst deploymentKey = 'YOUR_DEPLOYMENT_KEY';`;
  const cardOptions = `license, origin: window.location.origin,\n      table, mode: '${runtime.viewMode}', breakpoint: 720, minCardWidth: '17rem',\n      selection: ${runtime.selection}, showToggle: false`;
  const selectorNote = `// Wire your Table / Cards / Auto buttons to cards.setMode(mode).\n// This changes the layout without resetting table state.\n// On expiry, disable card controls. After renewal: await license.refresh(),\n// then recreate disposed cards. Save drafts in application-owned state.`;

  if (framework === "Angular") {
    return `import { Component } from '@angular/core';
import { WtsDataTableAngularComponent } from '@wts-data-table/angular';
import type { DataTable, DataTableOptions } from 'wts-data-table';
${cardImport}
import 'wts-data-table/styles.css';

@Component({
  standalone: true,
  imports: [WtsDataTableAngularComponent],
  template: \`<div role="group" aria-label="View mode">
    <button (click)="setView('table')">Table</button>
    <button (click)="setView('cards')">Cards</button>
    <button (click)="setView('auto')">Auto</button>
  </div>
  <wts-data-table-angular
    [data]="projects"
    [options]="options"
    (ready)="onReady($event)"
    (destroyed)="destroyCards()"
  />\`,
})
export class ProjectTableComponent {
  readonly projects = projects;
  readonly options: Omit<DataTableOptions<Project>, 'element' | 'data'> = {
${options}
  };

  private cards?: DataTableCardViewController<Project>;
  private session?: DataTableLicenseSession;
  private revision = 0;
  async onReady(table: DataTable<Project>) {
    this.destroyCards();
    const revision = this.revision;
    try {
      const license = await connectDataTableLicense({ licenseKey: deploymentKey });
      if (revision !== this.revision) { license.destroy(); return; }
      this.session = license;
      license.subscribe(status => {
        if (!status.features.includes('card-view')) { this.cards?.destroy(); this.cards = undefined; }
      }); // The table was replaced or destroyed.
      this.cards = createDataTableCardView({
        ${cardOptions}
      });
    } catch {
      console.error('Card view requires a valid license for this origin.');
    }
  }
  setView(mode: 'table' | 'cards' | 'auto') {
    this.cards?.setMode(mode);
  }
  destroyCards() {
    this.revision++;
    this.cards?.destroy();
    this.cards = undefined;
    this.session?.destroy();
    this.session = undefined;
  }
}`;
  }

  if (framework === "React") {
    return `import { useCallback, useMemo, useRef } from 'react';
import { WtsDataTableReact } from '@wts-data-table/react';
import type { DataTable, DataTableOptions } from 'wts-data-table';
${cardImport}
import 'wts-data-table/styles.css';

export function ProjectTable() {
  const cards = useRef<DataTableCardViewController<Project> | null>(null);
  const session = useRef<DataTableLicenseSession | null>(null);
  const revision = useRef(0);
  const options = useMemo<Omit<DataTableOptions<Project>, 'element' | 'data'>>(() => ({
${options}
  }), []);

  const destroyCards = useCallback(() => {
    revision.current++;
    cards.current?.destroy();
    cards.current = null;
    session.current?.destroy();
    session.current = null;
  }, []);
  const onReady = useCallback(async (table: DataTable<Project>) => {
    destroyCards();
    const current = revision.current;
    try {
      const license = await connectDataTableLicense({ licenseKey: deploymentKey });
      if (current !== revision.current) { license.destroy(); return; }
      session.current = license;
      license.subscribe(status => {
        if (!status.features.includes('card-view')) { cards.current?.destroy(); cards.current = null; }
      });
      cards.current = createDataTableCardView({
        ${cardOptions}
      });
    } catch {
      console.error('Card view requires a valid license for this origin.');
    }
  }, [destroyCards]);

  return <>
    <div role="group" aria-label="View mode">
      {(['table', 'cards', 'auto'] as const).map(mode =>
        <button key={mode} onClick={() => cards.current?.setMode(mode)}>{mode}</button>
      )}
    </div>
    <WtsDataTableReact data={projects} options={options}
      onReady={onReady} onDestroy={destroyCards} />
  </>;
}`;
  }

  if (framework === "Vue") {
    return `<script setup lang="ts">
import { WtsDataTableVue } from '@wts-data-table/vue';
import type { DataTable, DataTableOptions } from 'wts-data-table';
${cardImport}
import 'wts-data-table/styles.css';

const options: Omit<DataTableOptions<Project>, 'element' | 'data'> = {
${options}
};
let cards: DataTableCardViewController<Project> | undefined;
let session: DataTableLicenseSession | undefined;
let revision = 0;
function destroyCards() {
  revision++;
  cards?.destroy();
  cards = undefined;
  session?.destroy();
  session = undefined;
}
async function onReady(table: DataTable<Project>) {
  destroyCards();
  const current = revision;
  try {
    const license = await connectDataTableLicense({ licenseKey: deploymentKey });
    if (current !== revision) { license.destroy(); return; }
    session = license;
    license.subscribe(status => {
      if (!status.features.includes('card-view')) { cards?.destroy(); cards = undefined; }
    });
    cards = createDataTableCardView({
      ${cardOptions}
    });
  } catch {
    console.error('Card view requires a valid license for this origin.');
  }
}
const viewModes = ['table', 'cards', 'auto'] as const;
function setView(mode: 'table' | 'cards' | 'auto') {
  cards?.setMode(mode);
}
</script>

<template>
  <div role="group" aria-label="View mode">
    <button v-for="mode in viewModes" :key="mode" @click="setView(mode)">{{ mode }}</button>
  </div>
  <WtsDataTableVue :data="projects" :options="options"
    @ready="onReady" @destroy="destroyCards" />
</template>`;
  }

  return `import { DataTable } from 'wts-data-table';
${cardImport}
import 'wts-data-table/styles.css';

const table = new DataTable<Project>({
  element: '#project-table',
  data: projects,
${options}
});

await table.ready();
// If verification fails, the standard table remains available.
const license = await connectDataTableLicense({ licenseKey: deploymentKey });
const cards = createDataTableCardView({
  ${cardOptions}
});

${selectorNote}

// Call when the page or component is removed.
function destroy() {
  cards.destroy();
  license.destroy();
  table.destroy();
}`;
}

function optionLines(id: string, runtime: DemoRuntimeOptions): string[] {
  const lines = [
    "columns,",
    "getRowId: (row: Project) => row.id,",
    `showGlobalFilter: ${runtime.globalFilter},`,
    `columnFilters: ${runtime.columnFilters ? `{ mode: '${id === "portfolio" ? "collapsible" : "always"}' }` : "false"},`,
    `showColumnManager: ${runtime.columnManager},`,
    `columnMenu: ${runtime.columnMenu},`,
    `advancedFiltering: ${runtime.advancedFiltering ? "{ showBuilder: true, showChips: true }" : "false"},`,
    `searchPanes: ${runtime.searchPanes ? "{ columns: ['client', 'status'], initiallyOpen: true, showCounts: true }" : "false"},`,
    `pagination: ${runtime.pagination ? `{ mode: 'pages', showFirst: true, showLast: true, showPageJump: true }` : "false"},`,
    `pageSizes: [${DEMO_PAGE_SIZES.join(", ")}],`,
  ];

  const initialState = [
    `pagination: { pageSize: ${runtime.pageSize} }`,
    runtime.rowReordering
      ? "sorting: []"
      : "sorting: [{ id: 'due', direction: 'asc' }]",
  ];
  if (runtime.grouping) initialState.push("grouping: ['status']");
  lines.push(`initialState: { ${initialState.join(", ")} },`);
  lines.push(`selectionMode: '${runtime.selection ? "multiple" : "none"}',`);
  lines.push(`bulkActions: ${runtime.selection},`);
  lines.push(`cellSelection: ${runtime.cellSelection},`);
  lines.push(`editing: ${runtime.editing},`);
  lines.push(
    `autoFill: ${runtime.autoFill && runtime.editing && runtime.cellSelection},`,
  );
  lines.push(
    `responsive: ${runtime.responsive ? `{ breakpoint: ${id === "responsive" ? 1050 : 760}, details: 'inline' }` : "false"},`,
  );

  lines.push(`showGrouping: ${runtime.grouping},`);
  lines.push(
    `rowExpansion: ${runtime.rowExpansion ? "{ allowMultiple: true, expandOnRowClick: false, renderDetailPanel: row => `${row.original.name} delivery details` }" : "false"},`,
  );
  if (runtime.rowExpansion) lines.push("getRowCanExpand: () => true,");
  lines.push(`rowReordering: ${runtime.rowReordering},`);
  lines.push(`rowPinning: ${runtime.rowPinning},`);
  lines.push(`stickyHeader: ${runtime.stickyHeader},`);
  lines.push(
    `virtualization: ${runtime.virtualization ? "{ height: 420, rowHeight: 54, overscan: 4 }" : "false"},`,
  );
  if (runtime.summaryRows) {
    lines.push(
      "summaryRows: { label: 'Portfolio total', labelColumnId: 'name', columns: { budget: 'sum' }, scope: 'filtered' },",
    );
  } else {
    lines.push("summaryRows: false,");
  }
  lines.push(`stickyFooter: ${runtime.stickyFooter && runtime.summaryRows},`);
  return lines;
}
