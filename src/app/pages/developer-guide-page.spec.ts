import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { DEVELOPER_GUIDES } from '../developer-guides';
import { DeveloperGuidePage } from './developer-guide-page';

describe('Developer guide breadcrumbs', () => {
  it('keeps the visible structured trail correct when navigating between guides', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'docs/guides/:slug', component: DeveloperGuidePage }])],
    }).compileComponents();
    const harness = await RouterTestingHarness.create();
    for (const guide of DEVELOPER_GUIDES) {
      await harness.navigateByUrl('/docs/guides/' + guide.slug);
      const nav = harness.routeNativeElement!.querySelector('nav[aria-label="Breadcrumb"]')!;
      const items = [...nav.querySelectorAll('[itemprop="itemListElement"]')];
      expect(items.map(item => item.querySelector('[itemprop="name"]')?.textContent?.trim()))
        .toEqual(['Home', 'Documentation', guide.title]);
      expect(items.map(item => item.querySelector('meta[itemprop="position"]')?.getAttribute('content')))
        .toEqual(['1', '2', '3']);
      expect([...nav.querySelectorAll('a')].map(link => link.getAttribute('href'))).toEqual(['/', '/docs']);
      expect(nav.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe(guide.title);
    }
  });
});
