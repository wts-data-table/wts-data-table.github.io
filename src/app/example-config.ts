import type { TableDemoDefinition } from "./site-data";

export const FRAMEWORKS = ["Vanilla TS", "Angular", "React", "Vue"] as const;
export type ExampleFramework = (typeof FRAMEWORKS)[number];
export const DEMO_PAGE_SIZES = [5, 8, 14] as const;
export type DemoPageSize = (typeof DEMO_PAGE_SIZES)[number];

export interface DemoRuntimeOptions {
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

export type DemoBooleanOption = Exclude<keyof DemoRuntimeOptions, "pageSize">;

export function createDemoRuntimeOptions(id: string): DemoRuntimeOptions {
  return {
    globalFilter: id === "portfolio" || id === "filtering",
    columnFilters: id === "portfolio" || id === "filtering",
    advancedFiltering: false,
    searchPanes: false,
    pagination: true,
    pageSize: id === "responsive" ? 5 : 8,
    selection: id === "portfolio" || id === "selection",
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

  if (framework === "Angular") {
    return `import { Component } from '@angular/core';
import { WtsDataTableAngularComponent } from '@wts-data-table/angular';
import 'wts-data-table/styles.css';

@Component({
  standalone: true,
  imports: [WtsDataTableAngularComponent],
  template: \`<wts-data-table-angular
    [data]="projects"
    [options]="options"
  />\`,
})
export class ProjectTableComponent {
  readonly projects = projects;
  readonly options = {
${options}
  };
}`;
  }

  if (framework === "React") {
    return `import { useMemo } from 'react';
import { WtsDataTableReact } from '@wts-data-table/react';
import 'wts-data-table/styles.css';

export function ProjectTable() {
  const options = useMemo(() => ({
${options}
  }), []);

  return <WtsDataTableReact data={projects} options={options} />;
}`;
  }

  if (framework === "Vue") {
    return `<script setup lang="ts">
import { WtsDataTableVue } from '@wts-data-table/vue';
import 'wts-data-table/styles.css';

const options = {
${options}
};
</script>

<template>
  <WtsDataTableVue :data="projects" :options="options" />
</template>`;
  }

  return `import { DataTable } from 'wts-data-table';
import 'wts-data-table/styles.css';

const table = new DataTable<Project>({
  element: '#project-table',
  data: projects,
${options}
});

await table.ready();`;
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
