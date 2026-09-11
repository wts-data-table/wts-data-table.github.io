import { DOCUMENT } from "@angular/common";
import { Component, computed, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map } from "rxjs";
import {
  createDemoRuntimeOptions,
  createFrameworkSnippet,
  DEMO_PAGE_SIZES,
  FRAMEWORKS,
  type DemoBooleanOption,
  type DemoPageSize,
  type ExampleFramework,
} from "../example-config";
import { TABLE_DEMOS } from "../site-data";
import { TableDemo } from "../table-demo";
import type { DataTableCardViewMode } from "wts-data-table/card-view";

const OPTION_GROUPS = [
  {
    label: "Search and filtering",
    options: [
      ["globalFilter", "Global search", "showGlobalFilter"],
      ["columnFilters", "Column filters", "columnFilters"],
      ["advancedFiltering", "Advanced filter builder", "advancedFiltering"],
      ["searchPanes", "Search panes", "searchPanes"],
    ],
  },
  {
    label: "Interaction",
    options: [
      ["selection", "Row selection", "selectionMode"],
      ["cellSelection", "Cell selection", "cellSelection"],
      ["editing", "Inline editing", "editing"],
      ["autoFill", "Drag to fill", "autoFill"],
      ["rowExpansion", "Detail panels", "rowExpansion"],
      ["rowReordering", "Row reordering", "rowReordering"],
      ["rowPinning", "Row pinning", "rowPinning"],
    ],
  },
  {
    label: "Columns and layout",
    options: [
      ["responsive", "Responsive details", "responsive"],
      ["columnManager", "Column manager", "showColumnManager"],
      ["columnMenu", "Column menus", "columnMenu"],
      ["grouping", "Row grouping", "showGrouping"],
      ["summaryRows", "Summary rows", "summaryRows"],
      ["stickyHeader", "Sticky header", "stickyHeader"],
      ["stickyFooter", "Sticky summary", "stickyFooter"],
    ],
  },
  {
    label: "Paging and performance",
    options: [
      ["pagination", "Pagination", "pagination"],
      ["virtualization", "Virtual rows", "virtualization"],
    ],
  },
] as const satisfies readonly {
  readonly label: string;
  readonly options: readonly (readonly [DemoBooleanOption, string, string])[];
}[];

@Component({
  imports: [RouterLink, TableDemo],
  template: `
    <section class="page-hero wrap">
      <span class="kicker">Interactive gallery</span>
      <h1>See every behavior<br /><em>in context.</em></h1>
      <p>
        Focused, runnable examples with live options and framework-specific
        implementation code.
      </p>
    </section>
    <div class="examples-layout wrap">
      <aside aria-label="Example navigation">
        <span>Examples</span>
        @for (item of demos; track item.id) {
          <a
            [routerLink]="['/examples', item.id]"
            [class.active]="item.id === selected().id"
            ><i></i><b>{{ item.title }}</b></a
          >
        }
      </aside>
      <section class="example-content">
        <span class="kicker">{{ selected().eyebrow }}</span>
        <h2>{{ selected().title }}</h2>
        <p class="lead">{{ selected().description }}</p>
        <div class="chips">
          @for (item of selected().highlights; track item) {
            <span>{{ item }}</span>
          }
        </div>
        <section class="configurator" aria-labelledby="runtime-options-title">
          <div class="configurator-heading">
            <div>
              <span class="kicker">Live configuration</span>
              <h3 id="runtime-options-title">Change the options</h3>
              <p>
                These controls update the running table and the
                framework code below. Data-source contracts, callbacks, custom
                renderers, and lower-level APIs remain in the
                <a routerLink="/docs" fragment="reference">full reference</a>.
              </p>
            </div>
            <button
              type="button"
              class="reset-options"
              (click)="resetOptions()"
            >
              Reset options
            </button>
          </div>
          <div class="option-groups">
            @for (group of optionGroups; track group.label) {
              <fieldset>
                <legend>{{ group.label }}</legend>
                <div class="option-grid">
                  @for (option of group.options; track option[0]) {
                    <label>
                      <input
                        type="checkbox"
                        [checked]="runtimeOptions()[option[0]]"
                        (change)="setBooleanOption(option[0], $event)"
                      />
                      <span
                        ><b>{{ option[1] }}</b
                        ><small>{{ option[2] }}</small></span
                      >
                    </label>
                  }
                  @if (group.label === "Paging and performance") {
                    <label class="page-size">
                      <span
                        ><b>Rows per page</b
                        ><small>initialState.pagination.pageSize</small></span
                      >
                      <select
                        aria-label="Rows per page"
                        [value]="runtimeOptions().pageSize"
                        (change)="setPageSize($event)"
                      >
                        @for (size of pageSizes; track size) {
                          <option [value]="size" [selected]="size === runtimeOptions().pageSize">{{ size }}</option>
                        }
                      </select>
                    </label>
                  }
                </div>
              </fieldset>
            }
          </div>
        </section>
        <app-table-demo
          [demo]="selected()"
          [runtimeOptions]="runtimeOptions()"
          (viewModeChange)="setViewMode($event)"
        />
        <section class="code-section" aria-labelledby="framework-code-title">
          <div class="code-heading">
            <div>
              <span class="kicker">Framework examples</span>
              <h3 id="framework-code-title">Use this configuration</h3>
            </div>
            <div
              class="framework-tabs"
              role="tablist"
              aria-label="Framework code examples"
            >
              @for (item of frameworks; track item) {
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="activeFramework() === item"
                  [class.active]="activeFramework() === item"
                  (click)="activeFramework.set(item)"
                >
                  {{ item }}
                </button>
              }
            </div>
          </div>
          <p>Table-only examples need no key. Card and Auto layouts require your own signed
            <code>card-view</code> entitlement for your deployment origin.
            <a routerLink="/docs/guides/advanced-features">License setup →</a></p>
          <div class="code-block" role="tabpanel">
            <div>
              <span>{{ activeFramework() }}</span
              ><button type="button" (click)="copyCode()">
                {{ copied ? "Copied" : "Copy code" }}
              </button>
            </div>
            <pre><code>{{ frameworkCode() }}</code></pre>
          </div>
        </section>
      </section>
    </div>
  `,
  styles: [
    `
      .examples-layout {
        display: grid;
        grid-template-columns: 240px minmax(0, 1fr);
        gap: 4rem;
        align-items: start;
      }
      .examples-layout aside {
        min-width: 0;
        position: sticky;
        top: 105px;
        display: grid;
        border-top: 1px solid var(--line);
      }
      aside > span {
        padding: 1rem 0.2rem;
        color: var(--muted);
        font: 0.68rem var(--mono);
        text-transform: uppercase;
      }
      aside a {
        display: grid;
        grid-template-columns: 12px 1fr;
        gap: 0.65rem;
        align-items: center;
        padding: 0.85rem 0.2rem;
        border-top: 1px solid var(--line);
        color: var(--muted);
        font-size: 0.78rem;
        text-decoration: none;
      }
      aside a i {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #cad1db;
      }
      aside a.active,
      aside a:hover {
        color: var(--ink);
      }
      aside a.active i {
        background: var(--blue);
        box-shadow: 0 0 0 4px var(--blue-soft);
      }
      .example-content h2 {
        margin: 0.7rem 0;
        font-size: clamp(2.5rem, 5vw, 4.8rem);
        letter-spacing: -0.065em;
      }
      .example-content {
        min-width: 0;
      }
      .lead {
        max-width: 770px;
        margin: 0 0 1.4rem;
        color: var(--muted);
        font-size: 1rem;
        line-height: 1.7;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin-bottom: 2rem;
      }
      .chips span {
        padding: 0.45rem 0.7rem;
        border-radius: 99px;
        background: var(--blue-soft);
        color: #31579c;
        font-size: 0.7rem;
      }
      .configurator {
        margin-bottom: 1rem;
        padding: 1.25rem;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: white;
      }
      .configurator-heading,
      .code-heading {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
      }
      .configurator h3,
      .code-section h3 {
        margin: 0.35rem 0 0;
        font-size: 1.35rem;
        letter-spacing: -0.025em;
      }
      .configurator p {
        margin: 0.35rem 0 0;
        color: var(--muted);
        font-size: 0.76rem;
      }
      .reset-options {
        padding: 0.5rem 0.7rem;
        border: 1px solid var(--line);
        border-radius: 7px;
        background: #f8fafc;
        color: var(--ink);
        font-size: 0.72rem;
        cursor: pointer;
      }
      .option-groups {
        display: grid;
        gap: 1rem;
        margin-top: 1.1rem;
      }
      .option-groups fieldset {
        min-width: 0;
        margin: 0;
        padding: 0;
        border: 0;
      }
      .option-groups legend {
        padding: 0;
        color: var(--muted);
        font: 0.66rem var(--mono);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .option-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.6rem;
        margin-top: 0.55rem;
      }
      .option-grid label {
        display: flex;
        min-height: 58px;
        align-items: center;
        gap: 0.65rem;
        padding: 0.65rem 0.7rem;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fbfcfe;
        cursor: pointer;
      }
      .option-grid label:has(input:checked) {
        border-color: #aac3fb;
        background: #f1f5ff;
      }
      .option-grid input {
        width: 1rem;
        height: 1rem;
        margin: 0;
        accent-color: var(--blue);
      }
      .option-grid span {
        display: grid;
        min-width: 0;
        gap: 0.18rem;
      }
      .option-grid b {
        font-size: 0.72rem;
      }
      .option-grid small {
        overflow: hidden;
        color: var(--muted);
        font: 0.58rem var(--mono);
        text-overflow: ellipsis;
      }
      .option-grid .page-size {
        justify-content: space-between;
        cursor: default;
      }
      .page-size select {
        width: 58px;
        padding: 0.4rem;
        border: 1px solid var(--line-dark);
        border-radius: 6px;
        background: white;
        color: var(--ink);
        font-size: 0.72rem;
      }
      .code-section {
        margin-top: 3rem;
      }
      .framework-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }
      .framework-tabs button {
        padding: 0.55rem 0.75rem;
        border: 1px solid var(--line);
        border-radius: 7px;
        background: white;
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 650;
        cursor: pointer;
      }
      .framework-tabs button.active {
        border-color: var(--blue);
        background: var(--blue);
        color: white;
      }
      .code-block {
        margin-top: 1rem;
        overflow: hidden;
        border-radius: 12px;
        background: #121a28;
        color: #d7e0ee;
      }
      .code-block > div {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #2e394a;
        color: #8ea0b8;
        font: 0.7rem var(--mono);
      }
      .code-block button {
        border: 0;
        background: transparent;
        color: var(--lime);
        cursor: pointer;
      }
      .code-block pre {
        min-height: 360px;
        max-height: 620px;
        margin: 0;
        padding: 1.5rem;
        overflow: auto;
        font: 0.78rem/1.7 var(--mono);
      }
      @media (max-width: 1100px) {
        .option-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 850px) {
        .examples-layout {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        .examples-layout aside {
          position: static;
          display: flex;
          overflow: auto;
          padding-bottom: 0.4rem;
          border-top: 0;
        }
        .examples-layout aside > span {
          display: none;
        }
        aside a {
          min-width: max-content;
          padding: 0.65rem 0.8rem;
          border: 1px solid var(--line);
          border-radius: 99px;
        }
        aside a + a {
          margin-left: 0.4rem;
        }
      }
      @media (max-width: 600px) {
        .option-grid {
          grid-template-columns: 1fr;
        }
        .configurator-heading,
        .code-heading {
          align-items: flex-start;
          flex-direction: column;
        }
        .framework-tabs {
          width: 100%;
        }
        .framework-tabs button {
          flex: 1;
        }
        .code-block pre {
          min-height: 300px;
          padding: 1rem;
          font-size: 0.7rem;
        }
      }
    `,
  ],
})
export class ExamplesPage {
  protected readonly demos = TABLE_DEMOS;
  protected readonly optionGroups = OPTION_GROUPS;
  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get("id"))),
    { initialValue: "portfolio" },
  );
  protected readonly selected = computed(
    () => TABLE_DEMOS.find(({ id }) => id === this.id()) ?? TABLE_DEMOS[0],
  );
  protected readonly frameworks = FRAMEWORKS;
  protected readonly pageSizes = DEMO_PAGE_SIZES;
  protected readonly activeFramework = signal<ExampleFramework>("Vanilla TS");
  protected readonly runtimeOptions = signal(
    createDemoRuntimeOptions("portfolio"),
  );
  protected readonly frameworkCode = computed(() =>
    createFrameworkSnippet(
      this.activeFramework(),
      this.selected(),
      this.runtimeOptions(),
    ),
  );
  protected copied = false;
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const demo = this.selected();
      this.runtimeOptions.set(createDemoRuntimeOptions(demo.id));
      const title = `${demo.title} Example | WTS Data Table`;
      const url = `https://wts-data-table.github.io/examples/${demo.id}/`;
      this.title.setTitle(title);
      this.meta.updateTag({ name: "description", content: demo.description });
      this.meta.updateTag({ property: "og:title", content: title });
      this.meta.updateTag({
        property: "og:description",
        content: demo.description,
      });
      this.meta.updateTag({ property: "og:url", content: url });
      const canonical = this.document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      );
      if (canonical) canonical.href = url;
    });
  }

  protected setBooleanOption(option: DemoBooleanOption, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.runtimeOptions.update((current) => {
      const next = { ...current, [option]: checked };
      if (option === "autoFill" && checked) {
        next.editing = true;
        next.cellSelection = true;
      }
      if ((option === "editing" || option === "cellSelection") && !checked) {
        next.autoFill = false;
      }
      if (option === "stickyFooter" && checked) next.summaryRows = true;
      if (option === "summaryRows" && !checked) next.stickyFooter = false;
      return next;
    });
  }

  protected setPageSize(event: Event): void {
    const pageSize = Number(
      (event.target as HTMLSelectElement).value,
    ) as DemoPageSize;
    this.runtimeOptions.update((current) => ({ ...current, pageSize }));
  }

  protected setViewMode(viewMode: DataTableCardViewMode): void {
    this.runtimeOptions.update((current) => ({ ...current, viewMode }));
  }

  protected resetOptions(): void {
    this.runtimeOptions.set(createDemoRuntimeOptions(this.selected().id));
  }
  protected async copyCode(): Promise<void> {
    await navigator.clipboard.writeText(this.frameworkCode());
    this.copied = true;
    window.setTimeout(() => (this.copied = false), 1400);
  }
}
