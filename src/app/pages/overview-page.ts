import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TABLE_DEMOS } from '../site-data';
import { TableDemo } from '../table-demo';

@Component({
  imports: [RouterLink, TableDemo],
  template: `
    <section class="hero wrap">
      <div class="hero__copy">
        <span class="kicker"><i></i> Framework-agnostic TypeScript data grid</span>
        <h1>Big data.<br><em>Clear decisions.</em></h1>
        <p>Accessible table primitives, serious interaction, and first-class Angular, React, and Vue integration—without tying your data layer to a UI framework.</p>
        <div class="hero__actions"><a class="button button--primary" routerLink="/examples/portfolio">Explore live examples <span>→</span></a><a class="button" routerLink="/docs">Read the docs</a></div>
        <button class="install" type="button" (click)="copyInstall()"><span>npm i wts-data-table</span><b>{{ copied() ? 'Copied' : 'Copy' }}</b></button>
      </div>
      <div class="hero__visual" aria-hidden="true">
        <div class="data-card data-card--top"><span>Rows processed</span><strong>1,000,000</strong><i>Virtualized</i></div>
        <div class="grid-art"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
        <div class="data-card data-card--bottom"><span>Frameworks</span><strong>Core + 3</strong><i>One API</i></div>
      </div>
    </section>

    <section class="proof-strip" aria-label="Package qualities"><span>Accessible by default</span><span>Zero runtime dependencies</span><span>Tree-shakable TypeScript</span><span>MIT licensed core</span></section>

    <section class="section wrap">
      <div class="section-heading"><div><span class="kicker">Live, not simulated</span><h2>A table you can test here.</h2></div><p>This is the published package running inside Angular. Sort, search, select rows, open filters, resize the browser, and change pages.</p></div>
      <app-table-demo [demo]="featured" />
      <div class="section-action"><a routerLink="/examples/portfolio">View all examples <span>→</span></a></div>
    </section>

    <section class="section section--ink">
      <div class="wrap"><span class="kicker kicker--light">Built for product teams</span><h2>Useful from the first row.<br><em>Ready for the millionth.</em></h2>
        <div class="value-grid"><article><b>01</b><h3>Own your data flow</h3><p>Use local arrays, transactions, or a server-driven data source without rewriting your interface.</p></article><article><b>02</b><h3>Ship accessible UI</h3><p>Semantic tables, keyboard workflows, focus handling, and screen-reader labels are part of the renderer.</p></article><article><b>03</b><h3>Keep framework freedom</h3><p>Build on the dependency-free controller directly or use the Angular, React, and Vue wrappers.</p></article></div>
      </div>
    </section>

    <section class="section wrap start-section"><span class="kicker">A short path to production</span><h2>Install. Configure. Ship.</h2><p>Start with the core package and a typed column model. Add a framework wrapper only when you want native templates and lifecycle binding.</p><div><a class="button button--primary" routerLink="/docs">Start building <span>→</span></a><a class="text-link" href="https://www.npmjs.com/package/wts-data-table" target="_blank" rel="noreferrer">View on npm ↗</a></div></section>
  `,
  styles: [`
    .hero { display:grid; grid-template-columns:minmax(0,1.05fr) minmax(380px,.95fr); gap:5vw; min-height:690px; align-items:center; padding-block:6.5rem; }
    .hero h1 { margin:1.3rem 0 1.8rem; font-size:clamp(4.4rem,8.5vw,8.5rem); font-weight:650; line-height:.82; letter-spacing:-.085em; }
    .hero h1 em,.section--ink h2 em { color:var(--blue); font-family:var(--serif); font-weight:400; }
    .hero__copy>p { max-width:650px; color:var(--muted); font-size:1.1rem; line-height:1.75; }
    .hero__actions { display:flex; flex-wrap:wrap; gap:.7rem; margin:2rem 0 1rem; }
    .install { display:flex; width:min(100%,390px); justify-content:space-between; padding:.9rem 1rem; border:1px solid var(--line); border-radius:9px; background:white; color:var(--muted); font: .78rem var(--mono); cursor:pointer; }
    .install b { color:var(--blue); font-family:var(--sans); }
    .hero__visual { position:relative; min-height:540px; }
    .grid-art { position:absolute; inset:50px 0; display:grid; grid-template-columns:repeat(3,1fr); gap:5px; padding:5px; transform:rotate(-4deg); border:1px solid #cbd5e1; background:#dfe6ee; box-shadow:0 45px 90px rgba(24,35,52,.16); }
    .grid-art span { min-height:130px; background:white; }
    .grid-art span:nth-child(2),.grid-art span:nth-child(6),.grid-art span:nth-child(7) { background:#dce8ff; }
    .grid-art span:nth-child(5) { background:var(--blue); }
    .data-card { position:absolute; z-index:2; display:grid; min-width:190px; gap:.35rem; padding:1.15rem; border:1px solid var(--line); border-radius:10px; background:white; box-shadow:0 18px 45px rgba(24,35,52,.14); }
    .data-card span { color:var(--muted); font-size:.68rem; text-transform:uppercase; letter-spacing:.08em; }.data-card strong{font-size:1.65rem}.data-card i{color:#11835b;font-size:.72rem;font-style:normal}.data-card--top{right:-10px;top:0}.data-card--bottom{left:-20px;bottom:8px}
    .proof-strip { display:grid; grid-template-columns:repeat(4,1fr); border-block:1px solid var(--line); }.proof-strip span{padding:1.15rem;text-align:center;color:var(--muted);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em}.proof-strip span+span{border-left:1px solid var(--line)}
    .section--ink { color:white; background:var(--ink); }.section--ink h2{max-width:900px;margin:1rem 0 4rem;font-size:clamp(3rem,6vw,6.5rem);font-weight:580;line-height:.95;letter-spacing:-.07em}.value-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #3c4758}.value-grid article{padding:2rem 2rem 1rem 0}.value-grid article+article{padding-left:2rem;border-left:1px solid #3c4758}.value-grid b{color:var(--lime);font:.72rem var(--mono)}.value-grid h3{margin:4rem 0 1rem;font-size:1.3rem}.value-grid p{color:#aeb8c6;line-height:1.7}
    .start-section{text-align:center}.start-section>p{max-width:670px;margin:0 auto 2rem;color:var(--muted);font-size:1.05rem;line-height:1.7}.start-section>div{display:flex;justify-content:center;align-items:center;gap:1.5rem}.text-link{color:var(--ink);font-size:.85rem}
    @media(max-width:900px){.hero{grid-template-columns:1fr;padding-block:4rem}.hero__visual{min-height:440px}.proof-strip{grid-template-columns:1fr 1fr}.proof-strip span:nth-child(3){border-left:0;border-top:1px solid var(--line)}.proof-strip span:nth-child(4){border-top:1px solid var(--line)}.value-grid{grid-template-columns:1fr}.value-grid article+article{padding-left:0;border-left:0;border-top:1px solid #3c4758}.value-grid h3{margin-top:2rem}}
    @media(max-width:560px){.hero h1{font-size:4rem}.hero__visual{min-height:340px}.grid-art{inset:30px 0}.grid-art span{min-height:80px}.data-card{min-width:155px}.data-card--top{right:0}.data-card--bottom{left:0}.proof-strip{grid-template-columns:1fr}.proof-strip span+span{border-left:0;border-top:1px solid var(--line)}}
  `],
})
export class OverviewPage {
  protected readonly featured = TABLE_DEMOS[0];
  protected readonly copied = signal(false);
  protected async copyInstall(): Promise<void> { await navigator.clipboard.writeText('npm i wts-data-table'); this.copied.set(true); window.setTimeout(() => this.copied.set(false), 1400); }
}
