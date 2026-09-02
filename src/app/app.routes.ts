import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/overview-page').then((m) => m.OverviewPage),
    data: { seo: { title: 'WTS Data Table | Accessible JavaScript Data Grid', description: 'A fast, accessible, framework-agnostic TypeScript data grid with Angular, React, and Vue integrations.', path: '/' } },
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
    data: { seo: { title: 'Features | WTS Data Table', description: 'Explore the capabilities of the WTS Data Table TypeScript data grid.', path: '/features/' } },
  },
  {
    path: 'docs',
    loadComponent: () => import('./pages/docs-page').then((m) => m.DocsPage),
    data: { seo: { title: 'Documentation | WTS Data Table', description: 'Install WTS Data Table and integrate the framework-agnostic controller or an Angular, React, or Vue wrapper.', path: '/docs/' } },
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing-page').then((m) => m.PricingPage),
    data: { seo: { title: 'Licensing | WTS Data Table', description: 'Understand the open-source foundation and optional licensed advanced capabilities for WTS Data Table.', path: '/pricing/' } },
  },
  {
    path: 'premium',
    loadComponent: () => import('./pages/premium-page').then((m) => m.PremiumPage),
    data: { seo: { title: 'Advanced Examples | WTS Data Table', description: 'See real WTS Data Table worker processing, remote viewport, and formula workbook fixtures with integration code.', path: '/premium/' } },
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundPage),
    data: { seo: { title: 'Page not found | WTS Data Table', description: 'The requested WTS Data Table page could not be found.', path: '/404/' } },
  },
];
