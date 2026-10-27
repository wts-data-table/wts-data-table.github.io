import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEVELOPER_GUIDES } from '../developer-guides';
import { TABLE_DEMOS } from '../site-data';

@Component({
  selector: 'app-directory-page',
  imports: [RouterLink],
  template: `
    <article class="wrap directory">
      <nav aria-label="Breadcrumb"><a routerLink="/">Home</a> / <span aria-current="page">Site directory</span></nav>
      <header><span class="kicker">WTS Data Table</span><h1>Documentation and examples</h1>
        <p>Find a setup guide, explore a live table, or look up a production integration. Browse the portal below, with official npm packages listed at the end.</p></header>
      <section aria-labelledby="start-heading"><h2 id="start-heading">Start here</h2><ul>
        <li><a routerLink="/">WTS Data Table overview</a><p>Install the package and try the interactive table.</p></li>
        <li><a routerLink="/docs">Documentation and quick start</a><p>Installation, configuration, state, and API usage.</p></li>
        <li><a routerLink="/features">Data table features</a><p>Search, editing, selection, responsive layouts, and rendering options.</p></li>
        <li><a routerLink="/premium">Premium capabilities</a><p>Licensed cards, large-data processing, and advanced workflows.</p></li>
        <li><a routerLink="/pricing">Pricing and licensing</a><p>Free Standard features and renewable Premium access.</p></li>
      </ul></section>
      <section aria-labelledby="guides-heading"><h2 id="guides-heading">Developer guides</h2><ul>
        @for (guide of guides; track guide.slug) {
          <li><a [routerLink]="['/docs/guides', guide.slug]">{{ guide.title }}</a><p>{{ guide.summary }}</p></li>
        }
      </ul></section>
      <section aria-labelledby="examples-heading"><h2 id="examples-heading">Live data table examples</h2><ul>
        @for (demo of demos; track demo.id) {
          <li><a [routerLink]="['/examples', demo.id]">{{ demo.title }}</a><p>{{ demo.description }}</p></li>
        }
      </ul></section>
      <section aria-labelledby="packages-heading"><h2 id="packages-heading">Official npm packages</h2>
        <p>These links open npm. Install the core package alongside the wrapper for your framework.</p>
        <ul>
          <li><a href="https://www.npmjs.com/package/wts-data-table">wts-data-table — JavaScript and TypeScript data table</a></li>
          <li><a href="https://www.npmjs.com/package/@wts-data-table/angular">Angular wrapper</a></li>
          <li><a href="https://www.npmjs.com/package/@wts-data-table/react">React wrapper</a></li>
          <li><a href="https://www.npmjs.com/package/@wts-data-table/vue">Vue wrapper</a></li>
        </ul>
      </section>
    </article>
  `,
  styles: [`
    .directory { padding-block: 2rem 4rem; }
    nav { color: var(--muted); font-size: .85rem; margin-bottom: 2rem; }
    header { max-width: 800px; margin-bottom: 2.5rem; }
    h1 { font-size: clamp(2rem, 4vw, 3rem); line-height: 1.15; letter-spacing: -.04em; }
    h2 { font-size: 1.4rem; }
    p { color: var(--muted); line-height: 1.7; }
    section { border-top: 1px solid var(--line); padding-block: 1.5rem; }
    ul { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1.3rem 2.5rem; padding: 0; list-style: none; }
    li { min-width: 0; }
    li p { margin: .4rem 0 0; font-size: .9rem; }
    a { color: var(--blue); text-underline-offset: .2em; overflow-wrap: anywhere; }
    li a { font-weight: 600; }
    @media(max-width: 650px) { ul { grid-template-columns: 1fr; } }
  `],
})
export class DirectoryPage {
  readonly guides = DEVELOPER_GUIDES;
  readonly demos = TABLE_DEMOS;
}
