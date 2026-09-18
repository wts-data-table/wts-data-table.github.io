import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { createDemoRuntimeOptions } from '../example-config';
import { TABLE_DEMOS } from '../site-data';
import { TableDemo } from '../table-demo';
import { DocCode } from '../doc-code';

@Component({
  imports: [RouterLink, TableDemo, DocCode],
  templateUrl: './overview-page.html',
  styleUrl: './overview-page.scss',
})
export class OverviewPage {
  protected readonly featured = TABLE_DEMOS[0];
  protected readonly featuredOptions = createDemoRuntimeOptions('portfolio');
  protected readonly frameworks = [
    { id: 'core', label: 'JavaScript / TypeScript' },
    { id: 'angular', label: 'Angular' },
    { id: 'react', label: 'React' },
    { id: 'vue', label: 'Vue' },
  ];
  protected readonly quickstartCode = [
    "import { DataTable } from 'wts-data-table';",
    "import 'wts-data-table/styles.css';",
    '',
    'const table = new DataTable({',
    "  element: '#projects',",
    '  data: projects,',
    '  columns: [',
    "    { accessor: 'name', header: 'Project' },",
    "    { accessor: 'status', header: 'Status' },",
    "    { accessor: 'owner', header: 'Owner' },",
    '  ],',
    '  getRowId: row => row.id,',
    '});',
  ].join('\n');
  protected readonly copied = signal(false);
  protected async copyInstall(): Promise<void> { await navigator.clipboard.writeText('npm install wts-data-table'); this.copied.set(true); window.setTimeout(() => this.copied.set(false), 1400); }
}
