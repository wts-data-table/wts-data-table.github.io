import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: `
    <section class="page-hero wrap"><span class="kicker">Licensing</span><h1>Open foundation.<br><em>Advanced scale.</em></h1><p>Use the standard data table under MIT. Add signed entitlement access when your product needs the advanced data platform capabilities.</p></section>
    <section class="plans wrap">
      <article><header><span>Standard</span><strong>Free</strong><small>MIT license</small></header><p>Everything needed for rich local data tables and framework integrations.</p><ul><li>Core and DOM renderer</li><li>Sorting, filtering, grouping</li><li>Selection and editing</li><li>Responsive and virtualized rows</li><li>Angular, React, and Vue wrappers</li></ul><a class="button" href="https://www.npmjs.com/package/wts-data-table" target="_blank" rel="noreferrer">Install from npm ↗</a></article>
      <article class="plans__advanced"><header><span>Licensed advanced</span><strong>Contact</strong><small>Signed entitlement</small></header><p>Specialized infrastructure for very large, live, governed, and analytical datasets.</p><ul><li>Dedicated-worker processing</li><li>Remote viewport and live data</li><li>Server pivot and drill-through</li><li>Formula workbook and editor</li><li>Durable export jobs</li><li>Collaboration, governance, reports</li></ul><a class="button button--primary" routerLink="/premium">Explore advanced examples →</a></article>
    </section>
    <section class="license-note wrap"><strong>One package. Normal import paths.</strong><p>Standard and advanced source stays in <code>wts-data-table</code> under the same MIT software license. Advanced factories require a verified signed entitlement; there is no separate “Pro” package and no <code>/premium</code> import namespace.</p></section>
  `,
  styles: [`
    .plans{display:grid;grid-template-columns:1fr 1fr;gap:1rem;max-width:1040px}.plans article{display:grid;align-content:start;padding:2rem;border:1px solid var(--line-dark);border-radius:14px;background:white}.plans__advanced{background:var(--ink)!important;color:white}.plans header{display:grid;gap:.25rem;padding-bottom:1.5rem;border-bottom:1px solid var(--line)}.plans header span{color:var(--blue);font:.68rem var(--mono);text-transform:uppercase}.plans__advanced header span{color:var(--lime)}.plans header strong{font-size:3rem;letter-spacing:-.06em}.plans header small,.plans article>p{color:var(--muted)}.plans__advanced header small,.plans__advanced>p{color:#aeb8c6}.plans article>p{min-height:75px;line-height:1.65}.plans ul{display:grid;gap:.75rem;margin:1rem 0 2rem;padding:0;list-style:none}.plans li:before{content:'✓';margin-right:.65rem;color:#13845c}.plans .button{justify-content:center;margin-top:auto}.plans__advanced .button--primary{background:var(--lime);color:var(--ink)}.license-note{max-width:1040px;margin-top:2rem;padding:1.3rem;border:1px solid #c8d8fa;border-radius:10px;background:var(--blue-soft)}.license-note p{margin:.5rem 0 0;color:var(--muted);line-height:1.7}
    @media(max-width:750px){.plans{grid-template-columns:1fr}.plans article>p{min-height:0}}
  `],
})
export class PricingPage {}
