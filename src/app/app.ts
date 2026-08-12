import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  DataTable,
  type DataTableStateChangeReason,
  type DataTableViewColumn,
} from 'wts-data-table';

type ProjectStatus = 'At risk' | 'Complete' | 'In review' | 'On track';

interface Project {
  id: string;
  name: string;
  client: string;
  lead: string;
  initials: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  due: Date;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private table?: DataTable<Project>;

  protected readonly activeFilter = signal<ProjectStatus | 'All'>('All');
  protected readonly lastAction = signal('Table ready');
  protected readonly selectedCount = signal(0);

  protected readonly projects: readonly Project[] = [
    {
      id: 'p-101',
      name: 'Atlas mobile refresh',
      client: 'Northstar Labs',
      lead: 'Amara Reed',
      initials: 'AR',
      status: 'On track',
      progress: 82,
      budget: 142000,
      due: new Date('2026-09-18'),
    },
    {
      id: 'p-102',
      name: 'Commerce analytics',
      client: 'Forma Studio',
      lead: 'Noah Kim',
      initials: 'NK',
      status: 'In review',
      progress: 64,
      budget: 98000,
      due: new Date('2026-08-29'),
    },
    {
      id: 'p-103',
      name: 'Member onboarding',
      client: 'Fieldwork',
      lead: 'Isha Patel',
      initials: 'IP',
      status: 'At risk',
      progress: 38,
      budget: 76000,
      due: new Date('2026-08-21'),
    },
    {
      id: 'p-104',
      name: 'Design system v2',
      client: 'Acme Health',
      lead: 'Leo Martin',
      initials: 'LM',
      status: 'On track',
      progress: 73,
      budget: 121000,
      due: new Date('2026-10-04'),
    },
    {
      id: 'p-105',
      name: 'Partner portal',
      client: 'Cobalt Inc.',
      lead: 'Maya Chen',
      initials: 'MC',
      status: 'Complete',
      progress: 100,
      budget: 88000,
      due: new Date('2026-07-30'),
    },
    {
      id: 'p-106',
      name: 'Billing migration',
      client: 'Lumen Works',
      lead: 'Theo Evans',
      initials: 'TE',
      status: 'At risk',
      progress: 29,
      budget: 167000,
      due: new Date('2026-08-17'),
    },
    {
      id: 'p-107',
      name: 'Research repository',
      client: 'Northstar Labs',
      lead: 'Sofia King',
      initials: 'SK',
      status: 'In review',
      progress: 56,
      budget: 69000,
      due: new Date('2026-09-02'),
    },
    {
      id: 'p-108',
      name: 'Operations dashboard',
      client: 'Fieldwork',
      lead: 'Eli Brown',
      initials: 'EB',
      status: 'On track',
      progress: 91,
      budget: 105000,
      due: new Date('2026-08-25'),
    },
    {
      id: 'p-109',
      name: 'Identity refresh',
      client: 'Morrow & Co.',
      lead: 'Zoe Hall',
      initials: 'ZH',
      status: 'Complete',
      progress: 100,
      budget: 54000,
      due: new Date('2026-08-01'),
    },
    {
      id: 'p-110',
      name: 'Support workspace',
      client: 'Cobalt Inc.',
      lead: 'Arjun Rao',
      initials: 'AR',
      status: 'On track',
      progress: 68,
      budget: 93000,
      due: new Date('2026-09-26'),
    },
    {
      id: 'p-111',
      name: 'Growth experiments',
      client: 'Forma Studio',
      lead: 'Nina Shah',
      initials: 'NS',
      status: 'In review',
      progress: 47,
      budget: 62000,
      due: new Date('2026-09-11'),
    },
    {
      id: 'p-112',
      name: 'Clinical forms',
      client: 'Acme Health',
      lead: 'Owen Fox',
      initials: 'OF',
      status: 'At risk',
      progress: 34,
      budget: 114000,
      due: new Date('2026-08-23'),
    },
    {
      id: 'p-113',
      name: 'Editorial platform',
      client: 'Morrow & Co.',
      lead: 'Sara Cole',
      initials: 'SC',
      status: 'On track',
      progress: 79,
      budget: 83000,
      due: new Date('2026-10-12'),
    },
    {
      id: 'p-114',
      name: 'Inventory workflows',
      client: 'Lumen Works',
      lead: 'Kai Ross',
      initials: 'KR',
      status: 'In review',
      progress: 59,
      budget: 132000,
      due: new Date('2026-09-06'),
    },
  ];

  protected readonly filters: readonly (ProjectStatus | 'All')[] = [
    'All',
    'On track',
    'In review',
    'At risk',
    'Complete',
  ];

  private readonly columns: readonly DataTableViewColumn<Project>[] = [
    {
      accessor: 'name',
      header: 'Project',
      responsive: 'always',
      responsivePriority: 1,
      width: 230,
      cell: (value, row) => this.projectCell(String(value), row.original.client),
    },
    {
      accessor: 'lead',
      header: 'Project lead',
      responsivePriority: 2,
      width: 170,
      cell: (value, row) => this.leadCell(String(value), row.original.initials),
    },
    {
      accessor: 'status',
      header: 'Status',
      filterVariant: 'select',
      filterOptions: ['On track', 'In review', 'At risk', 'Complete'].map((value) => ({
        label: value,
        value,
      })),
      responsivePriority: 3,
      cell: (value) => this.statusCell(value as ProjectStatus),
    },
    {
      accessor: 'progress',
      header: 'Progress',
      dataType: 'number',
      align: 'start',
      responsivePriority: 4,
      cell: (value) => this.progressCell(Number(value)),
    },
    {
      accessor: 'budget',
      header: 'Budget',
      dataType: 'number',
      align: 'end',
      aggregation: 'sum',
      responsivePriority: 6,
      cell: (value) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(Number(value)),
    },
    {
      accessor: 'due',
      header: 'Due date',
      dataType: 'date',
      align: 'end',
      responsivePriority: 5,
      cell: (value) =>
        new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(value as Date),
    },
  ];

  constructor() {
    afterNextRender(() => {
      this.table = new DataTable<Project>({
        element: '#project-table',
        caption: 'Active delivery portfolio',
        ariaDescription: 'Sortable and filterable project delivery data.',
        data: this.projects,
        columns: this.columns,
        getRowId: (project) => project.id,
        showGlobalFilter: true,
        columnFilters: { mode: 'collapsible', initiallyExpanded: false },
        columnMenu: true,
        showColumnManager: true,
        selectionMode: 'multiple',
        bulkActions: true,
        responsive: { breakpoint: 760, details: 'inline' },
        pagination: {
          mode: 'pages',
          showFirst: true,
          showLast: true,
          showPageJump: true,
        },
        pageSizes: [6, 10, 14],
        initialState: {
          pagination: { pageSize: 6 },
          sorting: [{ id: 'due', direction: 'asc' }],
        },
        summaryRows: {
          label: 'Portfolio total',
          labelColumnId: 'name',
          columns: { budget: 'sum' },
          scope: 'filtered',
        },
        onStateChange: (state, reason) => {
          this.selectedCount.set(state.rowSelection.length);
          this.lastAction.set(this.describeReason(reason));
        },
      });

      this.destroyRef.onDestroy(() => this.table?.destroy());
    });
  }

  protected filterByStatus(filter: ProjectStatus | 'All'): void {
    this.activeFilter.set(filter);
    this.table?.setColumnFilter('status', filter === 'All' ? undefined : filter);
  }

  protected resetTable(): void {
    this.activeFilter.set('All');
    this.table?.reset();
    this.lastAction.set('View reset');
  }

  private describeReason(reason: DataTableStateChangeReason): string {
    return reason
      .split('-')
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(' ');
  }

  private projectCell(name: string, client: string): HTMLElement {
    const wrapper = document.createElement('span');
    wrapper.className = 'project-cell';
    const icon = document.createElement('i');
    icon.textContent = name.charAt(0);
    const copy = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = name;
    const small = document.createElement('small');
    small.textContent = client;
    copy.append(strong, small);
    wrapper.append(icon, copy);
    return wrapper;
  }

  private leadCell(name: string, initials: string): HTMLElement {
    const wrapper = document.createElement('span');
    wrapper.className = 'lead-cell';
    const avatar = document.createElement('i');
    avatar.textContent = initials;
    const label = document.createElement('span');
    label.textContent = name;
    wrapper.append(avatar, label);
    return wrapper;
  }

  private statusCell(status: ProjectStatus): HTMLElement {
    const badge = document.createElement('span');
    badge.className = `status-badge status-${status.toLowerCase().replaceAll(' ', '-')}`;
    badge.textContent = status;
    return badge;
  }

  private progressCell(progress: number): HTMLElement {
    const wrapper = document.createElement('span');
    wrapper.className = 'progress-cell';
    const track = document.createElement('i');
    const value = document.createElement('b');
    value.style.width = `${progress}%`;
    track.append(value);
    const label = document.createElement('span');
    label.textContent = `${progress}%`;
    wrapper.append(track, label);
    return wrapper;
  }
}
