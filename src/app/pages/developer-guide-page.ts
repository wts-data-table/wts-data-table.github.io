import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { DEVELOPER_GUIDES, getDeveloperGuide } from '../developer-guides';

@Component({
  imports: [RouterLink],
  template: `
    <section class="guide-hero wrap"><a routerLink="/docs" fragment="reference">← All developer guides</a><span class="kicker">Developer guide</span><h1>{{ guide().title }}</h1><p>{{ guide().intro }}</p></section>
    <div class="guide-layout wrap">
      <aside aria-label="Developer guides">@for(item of guides;track item.slug){<a [routerLink]="['/docs/guides',item.slug]" [class.active]="item.slug===guide().slug">{{ item.title }}</a>}</aside>
      <article class="guide-content">
        @for(section of guide().sections;track section.title){<section><h2>{{ section.title }}</h2><p>{{ section.body }}</p>@if(section.points){<ul>@for(point of section.points;track point){<li>{{ point }}</li>}</ul>}</section>}
        <section class="code-section"><span>{{ guide().codeTitle }}</span><pre><code>{{ guide().code }}</code></pre></section>
        <div class="guide-footer"><a routerLink="/docs" fragment="features">Browse the feature guide</a><a routerLink="/examples/portfolio">Try live examples →</a></div>
      </article>
    </div>
  `,
  styles: [`
    .guide-hero{display:grid;gap:1rem;padding-block:5.5rem 4rem}.guide-hero>a{width:max-content;color:var(--muted);font-size:.76rem;text-decoration:none}.guide-hero h1{max-width:900px;margin:.25rem 0 0;font-size:clamp(3.5rem,7vw,7rem);letter-spacing:-.075em}.guide-hero>p{max-width:760px;margin:0;color:var(--muted);font-size:1.05rem;line-height:1.75}.guide-layout{display:grid;grid-template-columns:220px minmax(0,820px);gap:5rem;align-items:start}.guide-layout aside{position:sticky;top:105px;display:grid;max-height:calc(100vh - 130px);overflow:auto;border-top:1px solid var(--line)}.guide-layout aside a{padding:.72rem 0;border-bottom:1px solid var(--line);color:var(--muted);font-size:.74rem;text-decoration:none}.guide-layout aside a.active{color:var(--blue);font-weight:700}.guide-content>section{padding:0 0 3.2rem}.guide-content h2{margin:0 0 1rem;font-size:clamp(1.7rem,3vw,2.5rem);letter-spacing:-.045em}.guide-content p,.guide-content li{color:var(--muted);line-height:1.75}.guide-content ul{display:grid;gap:.55rem;padding-left:1.2rem}.code-section>span{color:var(--blue);font:.66rem var(--mono);text-transform:uppercase}.code-section pre{margin:1rem 0 0;padding:1.3rem;overflow:auto;border-radius:10px;background:#121a28;color:#dce5f1;font:.75rem/1.7 var(--mono)}.guide-footer{display:flex;justify-content:space-between;gap:1rem;padding:1.5rem 0 6rem;border-top:1px solid var(--line)}.guide-footer a{color:var(--ink);font-size:.78rem;font-weight:700;text-decoration:none}
    @media(max-width:750px){.guide-layout{grid-template-columns:1fr;gap:2.5rem}.guide-layout aside{position:static;display:flex;gap:.35rem;overflow:auto;border:0}.guide-layout aside a{min-width:max-content;padding:.6rem .75rem;border:1px solid var(--line);background:white}.guide-hero{padding-block:4rem 3rem}.guide-footer{align-items:flex-start;flex-direction:column}}
  `],
})
export class DeveloperGuidePage {
  protected readonly guides = DEVELOPER_GUIDES;
  private readonly slug = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('slug'))), { initialValue: 'framework-wrappers' });
  protected readonly guide = computed(() => getDeveloperGuide(this.slug()));
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const guide = this.guide();
      const title = `${guide.title} | WTS Data Table`;
      const url = `https://wts-data-table.github.io/docs/guides/${guide.slug}/`;
      this.title.setTitle(title);
      this.meta.updateTag({ name: 'description', content: guide.summary });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: guide.summary });
      this.meta.updateTag({ property: 'og:url', content: url });
      const canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canonical) canonical.href = url;
    });
  }
}
