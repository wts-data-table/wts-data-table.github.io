import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LicenseRequestForm } from '../license-request-form';

export const PRICING_CAPABILITIES = [
  {
    name: 'Core table & framework integration',
    description: 'Core and DOM APIs with Angular, React, and Vue integrations.',
    premium: false,
  },
  {
    name: 'Search, sorting & filtering',
    description: 'Global search, column filters, advanced filters, and filter panes.',
    premium: false,
  },
  {
    name: 'Grouping & summaries',
    description: 'Grouped rows, aggregates, and summary footers.',
    premium: false,
  },
  {
    name: 'Selection & editing',
    description: 'Row selection, bulk actions, and standard cell editing.',
    premium: false,
  },
  {
    name: 'Responsive tables & virtualization',
    description: 'Responsive row details and virtualized table rendering.',
    premium: false,
  },
  {
    name: 'Themes & localization',
    description: 'CSS variables, framework themes, locale packs, and RTL support.',
    premium: false,
  },
  {
    name: 'Standard export',
    description:
      'Client-side table export; background export jobs are a separate licensed capability.',
    premium: false,
  },
  {
    name: 'Standard server integration',
    description:
      'Manual filtering, sorting, pagination, and managed data-source APIs for your backend.',
    premium: false,
  },
  {
    name: 'Card view',
    description: 'Table, Cards, and Auto layouts sharing search, selection, and pagination.',
    premium: true,
    fragment: 'card-view',
  },
  {
    name: 'Advanced row model',
    description: 'Remote viewport loading for large datasets with bounded client-side caching.',
    premium: true,
    fragment: 'remote-viewport',
  },
  {
    name: 'Worker processing',
    description: 'Move supported data-processing work off the main UI thread.',
    premium: true,
    fragment: 'worker-processing',
  },
  {
    name: 'Indexed search',
    description: 'Build and query indexes for repeated searches over large local datasets.',
    premium: true,
    fragment: 'indexed-search',
  },
  {
    name: 'Background export',
    description: 'Export-job orchestration with progress, cancellation, and resumable workflows.',
    premium: true,
    fragment: 'background-export',
  },
  {
    name: 'Live data',
    description:
      'Connect streaming updates to table state with recovery and backpressure controls.',
    premium: true,
    fragment: 'live-data',
  },
  {
    name: 'Server analytics',
    description: 'Server-driven pivoting, aggregation, and drill-through.',
    premium: true,
    fragment: 'server-analytics',
  },
  {
    name: 'Spreadsheet formulas',
    description: 'Formula workbook, recalculation, and a formula editor.',
    premium: true,
    fragment: 'formula-editor',
  },
  {
    name: 'Collaborative editing',
    description: 'Presence, concurrent edits, and conflict-resolution workflows.',
    premium: true,
    fragment: 'collaborative-editing',
  },
  {
    name: 'Governed editing',
    description: 'Policy-driven changes, approvals, and audit workflows.',
    premium: true,
    fragment: 'governed-editing',
  },
  {
    name: 'Report designer',
    description: 'Compose report layouts and connect report generation to your application.',
    premium: true,
    fragment: 'report-designer',
  },
] as const;

@Component({
  imports: [RouterLink, LicenseRequestForm],
  templateUrl: './pricing-page.html',
  styleUrl: './pricing-page.scss',
})
export class PricingPage {
  protected readonly capabilities = PRICING_CAPABILITIES;
}
