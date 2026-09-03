import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import {
  DataTable,
  type DataTableOptions,
  type DataTableRow,
  type DataTableStateChangeReason,
  type DataTableViewColumn,
} from "wts-data-table";
import {
  createDataTableCardView,
  type DataTableCardViewController,
  type DataTableCardViewMode,
} from "wts-data-table/card-view";
import type { DemoRuntimeOptions } from "./example-config";
import type { TableDemoDefinition } from "./site-data";

type ProjectStatus = "At risk" | "Complete" | "In review" | "On track";
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

const PROJECT_SEEDS: readonly [
  string,
  string,
  string,
  ProjectStatus,
  number,
  number,
  string,
][] = [
  [
    "Atlas mobile refresh",
    "Northstar Labs",
    "Amara Reed",
    "On track",
    82,
    142000,
    "2026-09-18",
  ],
  [
    "Commerce analytics",
    "Forma Studio",
    "Noah Kim",
    "In review",
    64,
    98000,
    "2026-08-29",
  ],
  [
    "Member onboarding",
    "Fieldwork",
    "Isha Patel",
    "At risk",
    38,
    76000,
    "2026-08-21",
  ],
  [
    "Design system v2",
    "Acme Health",
    "Leo Martin",
    "On track",
    73,
    121000,
    "2026-10-04",
  ],
  [
    "Partner portal",
    "Cobalt Inc.",
    "Maya Chen",
    "Complete",
    100,
    88000,
    "2026-07-30",
  ],
  [
    "Billing migration",
    "Lumen Works",
    "Theo Evans",
    "At risk",
    29,
    167000,
    "2026-08-17",
  ],
  [
    "Research repository",
    "Northstar Labs",
    "Sofia King",
    "In review",
    56,
    69000,
    "2026-09-02",
  ],
  [
    "Operations dashboard",
    "Fieldwork",
    "Eli Brown",
    "On track",
    91,
    105000,
    "2026-08-25",
  ],
  [
    "Identity refresh",
    "Morrow & Co.",
    "Zoe Hall",
    "Complete",
    100,
    54000,
    "2026-08-01",
  ],
  [
    "Support workspace",
    "Cobalt Inc.",
    "Arjun Rao",
    "On track",
    68,
    93000,
    "2026-09-26",
  ],
  [
    "Growth experiments",
    "Forma Studio",
    "Nina Shah",
    "In review",
    47,
    62000,
    "2026-09-11",
  ],
  [
    "Clinical forms",
    "Acme Health",
    "Owen Fox",
    "At risk",
    34,
    114000,
    "2026-08-23",
  ],
  [
    "Editorial platform",
    "Morrow & Co.",
    "Sara Cole",
    "On track",
    79,
    83000,
    "2026-10-12",
  ],
  [
    "Inventory workflows",
    "Lumen Works",
    "Kai Ross",
    "In review",
    59,
    132000,
    "2026-09-06",
  ],
];

const PROJECTS: readonly Project[] = PROJECT_SEEDS.map((seed, index) => {
  const [name, client, lead, status, progress, budget, due] = seed;
  return {
    id: `p-${101 + index}`,
    name,
    client,
    lead,
    initials: lead
      .split(" ")
      .map((part) => part[0])
      .join(""),
    status,
    progress,
    budget,
    due: new Date(due),
  };
});

@Component({
  selector: "app-table-demo",
  template: `
    <div class="view-controls" role="group" aria-label="View mode">
      <span>View</span>
      @for (view of viewModes; track view.mode) {
        <button type="button"
          [attr.aria-pressed]="runtimeOptions().viewMode === view.mode"
          (click)="viewModeChange.emit(view.mode)">{{ view.label }}</button>
      }
    </div>
    <p class="view-help">Cards share the same search, page, and row selection. Use Table for column controls and inline editing. Auto switches at a container width of 720px.</p>
    <div class="demo-readout" aria-live="polite">
      <span
        ><b>{{ selectedCount() }}</b> selected</span
      ><span
        >Latest event: <b>{{ lastAction() }}</b></span
      >
      <button type="button" (click)="reset()">Reset view</button>
    </div>
    <div class="demo-table-shell"><div #tableHost></div></div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .view-controls { display: flex; align-items: center; flex-wrap: wrap; gap: .4rem; }
      .view-controls span { margin-right: .4rem; font-size: .8rem; font-weight: 650; }
      .view-controls button { padding: .55rem .9rem; border: 1px solid var(--line-dark); border-radius: 7px; background: white; color: var(--ink); cursor: pointer; }
      .view-controls button[aria-pressed="true"] { background: var(--blue); border-color: var(--blue); color: white; }
      .view-controls button:focus-visible { outline: 2px solid var(--blue); outline-offset: 3px; }
      .view-help { margin: .6rem 0 1rem; color: var(--muted); font-size: .75rem; line-height: 1.6; }
      .demo-readout {
        display: flex;
        min-height: 48px;
        align-items: center;
        gap: 1.2rem;
        padding: 0.65rem 0.9rem;
        border: 1px solid var(--line);
        border-bottom: 0;
        border-radius: 12px 12px 0 0;
        background: #f5f7fa;
        color: var(--muted);
        font-size: 0.72rem;
      }
      .demo-readout b {
        color: var(--ink);
      }
      .demo-readout button {
        margin-left: auto;
        padding: 0.45rem 0.7rem;
        border: 1px solid var(--line-dark);
        border-radius: 7px;
        background: white;
        color: var(--ink);
        cursor: pointer;
      }
      .demo-table-shell {
        min-height: 480px;
        padding: 14px;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 0 0 12px 12px;
        background: white;
        box-shadow: 0 28px 70px rgba(24, 35, 52, 0.09);
      }
      @media (max-width: 640px) {
        .demo-readout {
          flex-wrap: wrap;
          gap: 0.6rem 1rem;
        }
        .demo-table-shell {
          min-height: 420px;
          padding: 6px;
        }
      }
    `,
  ],
})
export class TableDemo {
  readonly demo = input.required<TableDemoDefinition>();
  readonly runtimeOptions = input.required<DemoRuntimeOptions>();
  readonly viewModeChange = output<DataTableCardViewMode>();
  protected readonly viewModes = [
    { mode: 'table', label: 'Table' },
    { mode: 'cards', label: 'Cards' },
    { mode: 'auto', label: 'Auto' },
  ] as const;
  private readonly host =
    viewChild.required<ElementRef<HTMLElement>>("tableHost");
  private readonly destroyRef = inject(DestroyRef);
  private readonly mounted = signal(false);
  private table?: DataTable<Project>;
  private cards?: DataTableCardViewController<Project>;
  private mountedConfiguration?: string;
  protected readonly selectedCount = signal(0);
  protected readonly lastAction = signal("Table ready");

  constructor() {
    afterNextRender(() => this.mounted.set(true));
    effect(() => {
      const demo = this.demo();
      const runtime = this.runtimeOptions();
      if (this.mounted()) this.mount(demo.id, runtime);
    });
    this.destroyRef.onDestroy(() => {
      this.cards?.destroy();
      this.table?.destroy();
    });
  }

  protected reset(): void {
    this.table?.reset();
    this.lastAction.set("View reset");
  }

  private mount(mode: string, runtime: DemoRuntimeOptions): void {
    const { viewMode, ...tableOptions } = runtime;
    const configuration = JSON.stringify({ mode, ...tableOptions });
    if (this.cards && this.mountedConfiguration === configuration) {
      if (this.cards.getMode() !== viewMode) this.cards.setMode(viewMode);
      return;
    }
    this.cards?.destroy();
    this.table?.destroy();
    this.host().nativeElement.replaceChildren();
    this.selectedCount.set(0);
    this.lastAction.set("Table ready");

    const options: DataTableOptions<Project> = {
      element: this.host().nativeElement,
      caption: `${this.demo().title} demo`,
      ariaDescription: this.demo().description,
      data: PROJECTS,
      columns: this.columns(runtime.editing),
      getRowId: ({ id }) => id,
      columnMenu: runtime.columnMenu,
      showColumnManager: runtime.columnManager,
      pagination: runtime.pagination
        ? { mode: "pages", showFirst: true, showLast: true, showPageJump: true }
        : false,
      pageSizes: [5, 8, 14],
      initialState: {
        pagination: { pageSize: runtime.pageSize },
        sorting: runtime.rowReordering ? [] : [{ id: "due", direction: "asc" }],
        ...(runtime.grouping ? { grouping: ["status"] } : {}),
      },
      showGlobalFilter: runtime.globalFilter,
      columnFilters: runtime.columnFilters
        ? { mode: mode === "portfolio" ? "collapsible" : "always" }
        : false,
      advancedFiltering: runtime.advancedFiltering
        ? { showBuilder: true, showChips: true }
        : false,
      searchPanes: runtime.searchPanes
        ? {
            columns: ["client", "status"],
            initiallyOpen: true,
            showCounts: true,
          }
        : false,
      selectionMode: runtime.selection ? "multiple" : "none",
      bulkActions: runtime.selection,
      cellSelection: runtime.cellSelection,
      editing: runtime.editing,
      autoFill: runtime.autoFill && runtime.editing && runtime.cellSelection,
      showGrouping: runtime.grouping,
      responsive: runtime.responsive
        ? { breakpoint: mode === "responsive" ? 1050 : 760, details: "inline" }
        : false,
      rowExpansion: runtime.rowExpansion
        ? {
            allowMultiple: true,
            expandOnRowClick: false,
            renderDetailPanel: (row) => this.detailPanel(row),
          }
        : false,
      getRowCanExpand: runtime.rowExpansion ? () => true : undefined,
      rowReordering: runtime.rowReordering,
      rowPinning: runtime.rowPinning,
      stickyHeader: runtime.stickyHeader,
      virtualization: runtime.virtualization
        ? { height: 420, rowHeight: 54, overscan: 4 }
        : false,
      summaryRows: runtime.summaryRows
        ? {
            label: "Portfolio total",
            labelColumnId: "name",
            columns: { budget: "sum" },
            scope: "filtered",
          }
        : false,
      stickyFooter: runtime.stickyFooter && runtime.summaryRows,
      onStateChange: (state, reason) => {
        this.selectedCount.set(state.rowSelection.length);
        this.lastAction.set(this.describeReason(reason));
      },
    };

    this.table = new DataTable<Project>(options);
    this.cards = createDataTableCardView({
      table: this.table,
      mode: viewMode,
      breakpoint: 720,
      minCardWidth: '17rem',
      selection: runtime.selection,
      showToggle: false,
    });
    this.mountedConfiguration = configuration;
  }

  private columns(editable: boolean): readonly DataTableViewColumn<Project>[] {
    return [
      {
        accessor: "name",
        header: "Project",
        headerGroup: "Delivery",
        responsive: "always",
        responsivePriority: 1,
        width: 230,
        editable,
        cell: (value, row) =>
          this.projectCell(String(value), row.original.client),
      },
      {
        accessor: "lead",
        header: "Project lead",
        headerGroup: "Delivery",
        responsivePriority: 2,
        width: 170,
        cell: (value, row) =>
          this.leadCell(String(value), row.original.initials),
      },
      {
        accessor: "status",
        header: "Status",
        headerGroup: "Health",
        filterVariant: "select",
        filterOptions: ["On track", "In review", "At risk", "Complete"].map(
          (value) => ({ label: value, value }),
        ),
        responsivePriority: 3,
        cell: (value) => this.statusCell(value as ProjectStatus),
      },
      {
        accessor: "progress",
        header: "Progress",
        headerGroup: "Health",
        dataType: "number",
        align: "start",
        responsivePriority: 4,
        editable,
        cell: (value) => this.progressCell(Number(value)),
      },
      {
        accessor: "budget",
        header: "Budget",
        headerGroup: "Planning",
        dataType: "number",
        align: "end",
        aggregation: "sum",
        responsivePriority: 6,
        editable,
        cell: (value) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(Number(value)),
      },
      {
        accessor: "due",
        header: "Due date",
        headerGroup: "Planning",
        dataType: "date",
        align: "end",
        responsivePriority: 5,
        cell: (value) =>
          new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
          }).format(value as Date),
      },
    ];
  }

  private detailPanel(row: DataTableRow<Project>): HTMLElement {
    const detail = document.createElement("section");
    detail.className = "project-detail";
    const title = document.createElement("strong");
    title.textContent = `${row.original.name} delivery details`;
    const copy = document.createElement("span");
    copy.textContent = `${row.original.client} · ${row.original.lead} · ${row.original.progress}% complete`;
    detail.append(title, copy);
    return detail;
  }

  private describeReason(reason: DataTableStateChangeReason): string {
    return reason
      .split("-")
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(" ");
  }
  private projectCell(name: string, client: string): HTMLElement {
    const wrapper = document.createElement("span");
    wrapper.className = "project-cell";
    const icon = document.createElement("i");
    icon.textContent = name[0];
    const copy = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = name;
    const small = document.createElement("small");
    small.textContent = client;
    copy.append(strong, small);
    wrapper.append(icon, copy);
    return wrapper;
  }
  private leadCell(name: string, initials: string): HTMLElement {
    const wrapper = document.createElement("span");
    wrapper.className = "lead-cell";
    const avatar = document.createElement("i");
    avatar.textContent = initials;
    const label = document.createElement("span");
    label.textContent = name;
    wrapper.append(avatar, label);
    return wrapper;
  }
  private statusCell(status: ProjectStatus): HTMLElement {
    const badge = document.createElement("span");
    badge.className = `status-badge status-${status.toLowerCase().replaceAll(" ", "-")}`;
    badge.textContent = status;
    return badge;
  }
  private progressCell(progress: number): HTMLElement {
    const wrapper = document.createElement("span");
    wrapper.className = "progress-cell";
    const track = document.createElement("i");
    const value = document.createElement("b");
    value.style.width = `${progress}%`;
    track.append(value);
    const label = document.createElement("span");
    label.textContent = `${progress}%`;
    wrapper.append(track, label);
    return wrapper;
  }
}
