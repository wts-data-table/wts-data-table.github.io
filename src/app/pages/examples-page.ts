import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
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
        <app-table-demo [demo]="selected()" />
        <div class="code-block"><div><span>TypeScript</span><button type="button" (click)="copyCode()">{{ copied ? 'Copied' : 'Copy code' }}</button></div><pre><code>{{ selected().code }}</code></pre></div>
      </section>
    </div>
  `,
  styles: [`
    .examples-layout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:4rem;align-items:start}.examples-layout aside{position:sticky;top:105px;display:grid;border-top:1px solid var(--line)}aside>span{padding:1rem .2rem;color:var(--muted);font:.68rem var(--mono);text-transform:uppercase}aside a{display:grid;grid-template-columns:12px 1fr;gap:.65rem;align-items:center;padding:.85rem .2rem;border-top:1px solid var(--line);color:var(--muted);font-size:.78rem;text-decoration:none}aside a i{width:6px;height:6px;border-radius:50%;background:#cad1db}aside a.active,aside a:hover{color:var(--ink)}aside a.active i{background:var(--blue);box-shadow:0 0 0 4px var(--blue-soft)}.example-content h2{margin:.7rem 0;font-size:clamp(2.5rem,5vw,4.8rem);letter-spacing:-.065em}.lead{max-width:770px;margin:0 0 1.4rem;color:var(--muted);font-size:1rem;line-height:1.7}.chips{display:flex;flex-wrap:wrap;gap:.45rem;margin-bottom:2rem}.chips span{padding:.45rem .7rem;border-radius:99px;background:var(--blue-soft);color:#31579c;font-size:.7rem}.code-block{margin-top:2rem;overflow:hidden;border-radius:12px;background:#121a28;color:#d7e0ee}.code-block>div{display:flex;justify-content:space-between;padding:.75rem 1rem;border-bottom:1px solid #2e394a;color:#8ea0b8;font:.7rem var(--mono)}.code-block button{border:0;background:transparent;color:var(--lime);cursor:pointer}.code-block pre{margin:0;padding:1.5rem;overflow:auto;font: .78rem/1.7 var(--mono)}
    @media(max-width:850px){.examples-layout{grid-template-columns:1fr;gap:2rem}.examples-layout aside{position:static;display:flex;overflow:auto;padding-bottom:.4rem;border-top:0}.examples-layout aside>span{display:none}aside a{min-width:max-content;padding:.65rem .8rem;border:1px solid var(--line);border-radius:99px}aside a+ a{margin-left:.4rem}}
  `],
})
export class ExamplesPage {
  protected readonly demos = TABLE_DEMOS;
  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id'))), { initialValue: 'portfolio' });
  protected readonly selected = computed(() => TABLE_DEMOS.find(({ id }) => id === this.id()) ?? TABLE_DEMOS[0]);
  protected copied = false;
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const demo = this.selected();
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

  protected async copyCode(): Promise<void> { await navigator.clipboard.writeText(this.selected().code); this.copied = true; window.setTimeout(() => this.copied = false, 1400); }
}
