export type Framework = 'Core' | 'Angular' | 'React' | 'Vue';
export const FRAMEWORKS: Framework[] = ['Core', 'Angular', 'React', 'Vue'];

export const INSTALL_COMMANDS: Record<Framework, string> = {
  Core: 'npm install wts-data-table',
  Angular: 'npm install wts-data-table @wts-data-table/angular',
  React: 'npm install wts-data-table @wts-data-table/react',
  Vue: 'npm install wts-data-table @wts-data-table/vue',
};

export const FRAMEWORK_NOTES: Record<Framework, string> = {
  Core: 'Mount after the host element exists. Call table.destroy() when removing the view. In an SSR app, create the table only in the browser.',
  Angular:
    'Works with standalone Angular 17–22 applications. The wrapper updates data in place and destroys the table with the component.',
  React:
    'Works with React 18 and 19. In Next.js, use a client component. Keep options outside the component or memoize them to preserve the controller.',
  Vue: 'Works with Vue 3. The wrapper owns mounting and teardown. Keep the options reference stable; data changes update the existing table.',
};

export const STARTER_FILES: Record<Framework, string> = {
  Core: 'main.ts',
  Angular: 'project-table.component.ts',
  React: 'ProjectTable.tsx',
  Vue: 'ProjectTable.vue',
};

export const TABLE_DATA = `import type { DataTableOptions } from 'wts-data-table';

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
  { accessor: 'name', header: 'Project' },
  { accessor: 'status', header: 'Status', filterVariant: 'select' },
  { accessor: 'budget', header: 'Budget', dataType: 'number' }
];`;

export const SNIPPETS: Record<Framework, string> = {
  Core: `import { DataTable } from 'wts-data-table';
import { columns, projects, type Project } from './table-data';

const table = new DataTable<Project>({
  element: '#project-table',
  data: projects,
  columns,
  getRowId: row => row.id,
  ariaLabel: 'Project delivery',
  showGlobalFilter: true,
  selectionMode: 'multiple',
  initialState: { pagination: { pageSize: 10 } }
});

await table.ready();

// When the owning view is removed:
// table.destroy();`,
  Angular: `import { Component } from '@angular/core';
import {
  WtsDataTableAngularComponent,
  type WtsAngularDataTableOptions
} from '@wts-data-table/angular';
import { columns, projects, type Project } from './table-data';

@Component({
  selector: 'app-project-table',
  standalone: true,
  imports: [WtsDataTableAngularComponent],
  template: \`<wts-data-table-angular
    [data]="projects"
    [options]="options"
  />\`
})
export class ProjectTableComponent {
  readonly projects = projects;
  readonly options: WtsAngularDataTableOptions<Project> = {
    columns,
    getRowId: row => row.id,
    ariaLabel: 'Project delivery',
    showGlobalFilter: true,
    selectionMode: 'multiple',
    initialState: { pagination: { pageSize: 10 } }
  };
}`,
  React: `'use client';

import {
  WtsDataTableReact,
  type WtsReactDataTableOptions
} from '@wts-data-table/react';
import { columns, projects, type Project } from './table-data';

const options: WtsReactDataTableOptions<Project> = {
  columns,
  getRowId: row => row.id,
  ariaLabel: 'Project delivery',
  showGlobalFilter: true,
  selectionMode: 'multiple',
  initialState: { pagination: { pageSize: 10 } }
};

export function ProjectTable() {
  return <WtsDataTableReact data={projects} options={options} />;
}`,
  Vue: `<script setup lang="ts">
import {
  WtsDataTableVue,
  type WtsVueDataTableOptions
} from '@wts-data-table/vue';
import { columns, projects, type Project } from './table-data';

const options: WtsVueDataTableOptions<Project> = {
  columns,
  getRowId: row => row.id,
  ariaLabel: 'Project delivery',
  showGlobalFilter: true,
  selectionMode: 'multiple',
  initialState: { pagination: { pageSize: 10 } }
};
</script>

<template>
  <WtsDataTableVue :data="projects" :options="options" />
</template>`,
};
