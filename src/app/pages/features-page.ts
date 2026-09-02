import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FEATURE_GROUPS } from '../site-data';

@Component({
  imports: [RouterLink],
  template: `
    <section class="page-hero wrap"><span class="kicker">Capability map</span><h1>Small surface.<br><em>Deep control.</em></h1><p>Compose only the table behaviors your product needs, while keeping state and data flow explicit.</p></section>
    <section class="feature-groups wrap">@for(group of groups;track group.label){<article><header><span>{{ group.label }}</span><h2>{{ group.title }}</h2></header><div>@for(item of group.items;track item){<p><i>✓</i>{{ item }}</p>}</div></article>}</section>
    <section class="architecture wrap"><div><span class="kicker">One engine, any UI</span><h2>Framework-neutral at the center.</h2><p>The typed core owns data operations and state. The DOM renderer and wrappers adapt that behavior to the interface you already use.</p><a class="button button--primary" routerLink="/docs">Choose an integration →</a></div><div class="architecture-map" aria-label="Core package connected to framework integrations"><strong>wts-data-table<small>typed core + renderer</small></strong><span>Angular</span><span>React</span><span>Vue</span><span>Vanilla TS</span></div></section>
  `,
  styles: [`
    .feature-groups{display:grid;border-top:1px solid var(--line-dark)}.feature-groups article{display:grid;grid-template-columns:.75fr 1.25fr;gap:3rem;padding:3.2rem 0;border-bottom:1px solid var(--line)}.feature-groups header span{color:var(--blue);font:.68rem var(--mono);text-transform:uppercase}.feature-groups h2{margin:.7rem 0;font-size:clamp(2rem,4vw,3.8rem);letter-spacing:-.06em}.feature-groups article>div{display:grid;grid-template-columns:1fr 1fr;gap:.7rem 2rem;align-content:center}.feature-groups p{display:flex;gap:.7rem;margin:0;padding:.75rem 0;border-bottom:1px solid var(--line);color:var(--muted)}.feature-groups i{color:#12835b;font-style:normal}.architecture{display:grid;grid-template-columns:.8fr 1.2fr;gap:6rem;align-items:center;padding-block:8rem}.architecture h2{margin:.8rem 0;font-size:clamp(2.5rem,5vw,5rem);letter-spacing:-.07em}.architecture p{margin:0 0 2rem;color:var(--muted);line-height:1.75}.architecture-map{display:grid;grid-template-columns:1fr 1fr;gap:1px;padding:1px;background:var(--line)}.architecture-map strong{display:grid;grid-column:1/-1;place-items:center;min-height:180px;background:var(--ink);color:white;font-size:1.35rem}.architecture-map small{margin-top:.4rem;color:#9daabd;font:.68rem var(--mono)}.architecture-map span{display:grid;min-height:100px;place-items:center;background:white;font-size:.85rem}
    @media(max-width:800px){.feature-groups article,.architecture{grid-template-columns:1fr;gap:2rem}.feature-groups article>div{grid-template-columns:1fr}.architecture{padding-block:5rem}}
  `],
})
export class FeaturesPage { protected readonly groups = FEATURE_GROUPS; }
