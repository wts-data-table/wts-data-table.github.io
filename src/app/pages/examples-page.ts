import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { createDemoRuntimeOptions, createFrameworkSnippet, DEMO_PAGE_SIZES, FRAMEWORKS, type DemoBooleanOption, type DemoPageSize, type ExampleFramework } from '../example-config';
import { TABLE_DEMOS } from '../site-data';
import { TableDemo } from '../table-demo';

@Component({
  imports: [RouterLink, TableDemo],
  template: `
    <section class="page-hero wrap"><span class="kicker">Interactive gallery</span><h1>See every behavior<br><em>in context.</em></h1><p>Focused, runnable examples using the package API—not screenshots or simulated controls.</p></section>
    <div class="examples-layout wrap">
      <aside aria-label="Example navigation"><span>Examples</span>@for (item of demos; track item.id) {<a [routerLink]="['/examples',item.id]" [class.active]="item.id===selected().id"><i></i><b>{{ item.title }}</b></a>}</aside>
      <section class="example-content">
        <span class="kicker">{{ selected().eyebrow }}</span><h2>{{ selected().title }}</h2><p class="lead">{{ selected().description }}</p>
        <div class="chips">@for (item of selected().highlights; track item){<span>{{ item }}</span>}</div>
        <section class="configurator" aria-labelledby="runtime-options-title">
          <div class="configurator-heading"><div><span class="kicker">Live configuration</span><h3 id="runtime-options-title">Change the options</h3><p>Every control updates the running table and the framework code below.</p></div><button type="button" class="reset-options" (click)="resetOptions()">Reset options</button></div>
          <div class="option-grid">
            <label><input type="checkbox" [checked]="runtimeOptions().globalFilter" (change)="setBooleanOption('globalFilter',$event)"><span><b>Global search</b><small>showGlobalFilter</small></span></label>
            <label><input type="checkbox" [checked]="runtimeOptions().columnFilters" (change)="setBooleanOption('columnFilters',$event)"><span><b>Column filters</b><small>columnFilters</small></span></label>
            <label><input type="checkbox" [checked]="runtimeOptions().pagination" (change)="setBooleanOption('pagination',$event)"><span><b>Pagination</b><small>pagination</small></span></label>
            <label><input type="checkbox" [checked]="runtimeOptions().selection" (change)="setBooleanOption('selection',$event)"><span><b>Row selection</b><small>selectionMode</small></span></label>
            <label><input type="checkbox" [checked]="runtimeOptions().responsive" (change)="setBooleanOption('responsive',$event)"><span><b>Responsive details</b><small>responsive</small></span></label>
            <label><input type="checkbox" [checked]="runtimeOptions().columnManager" (change)="setBooleanOption('columnManager',$event)"><span><b>Column manager</b><small>showColumnManager</small></span></label>
            <label class="page-size"><span><b>Rows per page</b><small>initialState.pagination.pageSize</small></span><select aria-label="Rows per page" [value]="runtimeOptions().pageSize" (change)="setPageSize($event)">@for(size of pageSizes;track size){<option [value]="size">{{ size }}</option>}</select></label>
          </div>
        </section>
        <app-table-demo [demo]="selected()" [runtimeOptions]="runtimeOptions()" />
        <section class="code-section" aria-labelledby="framework-code-title">
          <div class="code-heading"><div><span class="kicker">Framework examples</span><h3 id="framework-code-title">Use this configuration</h3></div><div class="framework-tabs" role="tablist" aria-label="Framework code examples">@for(item of frameworks;track item){<button type="button" role="tab" [attr.aria-selected]="activeFramework()===item" [class.active]="activeFramework()===item" (click)="activeFramework.set(item)">{{ item }}</button>}</div></div>
          <div class="code-block" role="tabpanel"><div><span>{{ activeFramework() }}</span><button type="button" (click)="copyCode()">{{ copied ? 'Copied' : 'Copy code' }}</button></div><pre><code>{{ frameworkCode() }}</code></pre></div>
        </section>
      </section>
    </div>
  `,
  styles: [`
    .examples-layout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:4rem;align-items:start}.examples-layout aside{position:sticky;top:105px;display:grid;border-top:1px solid var(--line)}aside>span{padding:1rem .2rem;color:var(--muted);font:.68rem var(--mono);text-transform:uppercase}aside a{display:grid;grid-template-columns:12px 1fr;gap:.65rem;align-items:center;padding:.85rem .2rem;border-top:1px solid var(--line);color:var(--muted);font-size:.78rem;text-decoration:none}aside a i{width:6px;height:6px;border-radius:50%;background:#cad1db}aside a.active,aside a:hover{color:var(--ink)}aside a.active i{background:var(--blue);box-shadow:0 0 0 4px var(--blue-soft)}.example-content h2{margin:.7rem 0;font-size:clamp(2.5rem,5vw,4.8rem);letter-spacing:-.065em}.lead{max-width:770px;margin:0 0 1.4rem;color:var(--muted);font-size:1rem;line-height:1.7}.chips{display:flex;flex-wrap:wrap;gap:.45rem;margin-bottom:2rem}.chips span{padding:.45rem .7rem;border-radius:99px;background:var(--blue-soft);color:#31579c;font-size:.7rem}.configurator{margin-bottom:1rem;padding:1.25rem;border:1px solid var(--line);border-radius:12px;background:white}.configurator-heading,.code-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem}.configurator h3,.code-section h3{margin:.35rem 0 0;font-size:1.35rem;letter-spacing:-.025em}.configurator p{margin:.35rem 0 0;color:var(--muted);font-size:.76rem}.reset-options{padding:.5rem .7rem;border:1px solid var(--line);border-radius:7px;background:#f8fafc;color:var(--ink);font-size:.72rem;cursor:pointer}.option-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.6rem;margin-top:1rem}.option-grid label{display:flex;min-height:58px;align-items:center;gap:.65rem;padding:.65rem .7rem;border:1px solid var(--line);border-radius:8px;background:#fbfcfe;cursor:pointer}.option-grid label:has(input:checked){border-color:#aac3fb;background:#f1f5ff}.option-grid input{width:1rem;height:1rem;margin:0;accent-color:var(--blue)}.option-grid span{display:grid;min-width:0;gap:.18rem}.option-grid b{font-size:.72rem}.option-grid small{overflow:hidden;color:var(--muted);font: .58rem var(--mono);text-overflow:ellipsis}.option-grid .page-size{justify-content:space-between;cursor:default}.page-size select{width:58px;padding:.4rem;border:1px solid var(--line-dark);border-radius:6px;background:white;color:var(--ink);font-size:.72rem}.code-section{margin-top:3rem}.framework-tabs{display:flex;flex-wrap:wrap;gap:.35rem}.framework-tabs button{padding:.55rem .75rem;border:1px solid var(--line);border-radius:7px;background:white;color:var(--muted);font-size:.72rem;font-weight:650;cursor:pointer}.framework-tabs button.active{border-color:var(--blue);background:var(--blue);color:white}.code-block{margin-top:1rem;overflow:hidden;border-radius:12px;background:#121a28;color:#d7e0ee}.code-block>div{display:flex;justify-content:space-between;padding:.75rem 1rem;border-bottom:1px solid #2e394a;color:#8ea0b8;font:.7rem var(--mono)}.code-block button{border:0;background:transparent;color:var(--lime);cursor:pointer}.code-block pre{min-height:360px;max-height:620px;margin:0;padding:1.5rem;overflow:auto;font: .78rem/1.7 var(--mono)}
    @media(max-width:1100px){.option-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:850px){.examples-layout{grid-template-columns:1fr;gap:2rem}.examples-layout aside{position:static;display:flex;overflow:auto;padding-bottom:.4rem;border-top:0}.examples-layout aside>span{display:none}aside a{min-width:max-content;padding:.65rem .8rem;border:1px solid var(--line);border-radius:99px}aside a+ a{margin-left:.4rem}}
    @media(max-width:600px){.option-grid{grid-template-columns:1fr}.configurator-heading,.code-heading{align-items:flex-start;flex-direction:column}.framework-tabs{width:100%}.framework-tabs button{flex:1}.code-block pre{min-height:300px;padding:1rem;font-size:.7rem}}
  `],
})
export class ExamplesPage {
  protected readonly demos = TABLE_DEMOS;
  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id'))), { initialValue: 'portfolio' });
  protected readonly selected = computed(() => TABLE_DEMOS.find(({ id }) => id === this.id()) ?? TABLE_DEMOS[0]);
  protected readonly frameworks = FRAMEWORKS;
  protected readonly pageSizes = DEMO_PAGE_SIZES;
  protected readonly activeFramework = signal<ExampleFramework>('Vanilla TS');
  protected readonly runtimeOptions = signal(createDemoRuntimeOptions('portfolio'));
  protected readonly frameworkCode = computed(() => createFrameworkSnippet(this.activeFramework(), this.selected(), this.runtimeOptions()));
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
      this.meta.updateTag({ name: 'description', content: demo.description });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: demo.description });
      this.meta.updateTag({ property: 'og:url', content: url });
      const canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canonical) canonical.href = url;
    });
  }

  protected setBooleanOption(option: DemoBooleanOption, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.runtimeOptions.update((current) => ({ ...current, [option]: checked }));
  }

  protected setPageSize(event: Event): void {
    const pageSize = Number((event.target as HTMLSelectElement).value) as DemoPageSize;
    this.runtimeOptions.update((current) => ({ ...current, pageSize }));
  }

  protected resetOptions(): void { this.runtimeOptions.set(createDemoRuntimeOptions(this.selected().id)); }
  protected async copyCode(): Promise<void> { await navigator.clipboard.writeText(this.frameworkCode()); this.copied = true; window.setTimeout(() => this.copied = false, 1400); }
}
