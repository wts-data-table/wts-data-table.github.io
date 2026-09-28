import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { DocsPage } from './docs-page';

describe('DocsPage', () => {
  it('renders visible structured breadcrumbs with a home link and current page', async () => {
    await TestBed.configureTestingModule({
      imports: [DocsPage], providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DocsPage);
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav[aria-label="Breadcrumb"]') as HTMLElement;
    expect(nav.querySelector('[itemtype="https://schema.org/BreadcrumbList"]')).not.toBeNull();
    expect([...nav.querySelectorAll('[itemprop="name"]')].map(item => item.textContent?.trim()))
      .toEqual(['Home', 'Documentation']);
    expect(nav.querySelector('a[itemprop="item"]')?.getAttribute('href')).toBe('/');
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('Documentation');
  });

  it('links every sidebar item to its section on the docs route', async () => {
    await TestBed.configureTestingModule({
      imports: [DocsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DocsPage);
    fixture.detectChanges();
    await fixture.whenStable();

    const links = [
      ...fixture.nativeElement.querySelectorAll('nav[aria-label="Getting started"] a'),
    ] as HTMLAnchorElement[];
    expect(links.slice(0, 8).map(({ pathname, hash }) => `${pathname}${hash}`)).toEqual([
      '/docs#install',
      '/docs#integrate',
      '/docs#renderers',
      '/docs#features',
      '/docs#configure',
      '/docs#lifecycle',
      '/docs#advanced',
      '/docs#reference',
    ]);
  });

  it('documents standard and licensed capabilities with developer entry points', async () => {
    await TestBed.configureTestingModule({
      imports: [DocsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DocsPage);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Feature guide');
    expect(text).toContain('Virtualization');
    expect(text).toContain('Manual server data');
    expect(text).toContain('Card view');
    expect(text).toContain('Licensed advanced features');
    expect(text).toContain('Worker processing');
    expect(text).toContain('@wts-data-table/angular');
  });

  it('uses internal website routes for every developer guide card', async () => {
    await TestBed.configureTestingModule({
      imports: [DocsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DocsPage);
    fixture.detectChanges();
    await fixture.whenStable();

    const links = [
      ...fixture.nativeElement.querySelectorAll('#reference .resource-grid a'),
    ] as HTMLAnchorElement[];
    expect(links).toHaveLength(13);
    expect(links.every(({ pathname }) => pathname.startsWith('/docs/guides/'))).toBe(true);
    expect(links.every(({ hostname }) => hostname === 'localhost')).toBe(true);
  });
});
