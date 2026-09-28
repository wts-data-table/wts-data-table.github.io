import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/overview-page').then((m) => m.OverviewPage),
    data: { seo: { title: 'JavaScript & TypeScript Data Grid | WTS Data Table', description: 'Build accessible JavaScript data tables for Angular, React, and Vue. Explore sorting, filtering, inline editing, virtual scrolling, and server-side pagination.', path: '/' } },
  },
  { path: 'examples', pathMatch: 'full', redirectTo: 'examples/portfolio' },
  {
    path: 'examples/:id',
    loadComponent: () => import('./pages/examples-page').then((m) => m.ExamplesPage),
    data: { seo: { title: 'Live Examples | WTS Data Table', description: 'Try sorting, filtering, selection, grouping, responsive details, and editing in live WTS Data Table examples.', path: '/examples/portfolio/' } },
  },
  {
    path: 'features',
    loadComponent: () => import('./pages/features-page').then((m) => m.FeaturesPage),
    data: { seo: { title: 'Data Grid Features: Filtering & Editing | WTS Data Table', description: 'Explore data grid sorting, column filters, inline editing, row grouping, CSV export, and virtual scrolling with WTS Data Table.', path: '/features/' } },
  },
  {
    path: 'docs/guides/:slug',
    loadComponent: () => import('./pages/developer-guide-page').then((m) => m.DeveloperGuidePage),
    data: { seo: { title: 'Developer Guide | WTS Data Table', description: 'Detailed WTS Data Table integration and production development guidance.', path: '/docs/guides/framework-wrappers/' } },
  },
  {
    path: 'docs',
    loadComponent: () => import('./pages/docs-page').then((m) => m.DocsPage),
    data: { seo: { title: 'Data Table Setup for Angular, React & Vue | WTS Data Table', description: 'Install a TypeScript data table in Angular, React, Vue, or plain JavaScript. Follow code examples for filtering, editing, pagination, and server integration.', path: '/docs/' } },
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing-page').then((m) => m.PricingPage),
    data: { seo: { title: 'Data Grid Pricing & Licensing | WTS Data Table', description: 'Compare free MIT-licensed Standard data table features with monthly or yearly Premium subscriptions. Request pricing, evaluation access, or license renewal.', path: '/pricing/' } },
  },
  {
    path: 'premium',
    loadComponent: () => import('./pages/premium-page').then((m) => m.PremiumPage),
    data: { seo: { title: 'Advanced Data Grid: Cards & Large Datasets | WTS Data Table', description: 'Explore Premium data grid examples: responsive cards, Web Worker processing, large datasets, spreadsheet formulas, server analytics, and collaborative editing.', path: '/premium/' } },
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundPage),
    data: { seo: { title: 'Page not found | WTS Data Table', description: 'The requested WTS Data Table page could not be found.', path: '/404/' } },
  },
];
