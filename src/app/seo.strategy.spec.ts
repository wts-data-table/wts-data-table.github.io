import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter, TitleStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';
import { DEVELOPER_GUIDES } from './developer-guides';
import { keywordsForPage } from './seo-keywords';
import { SiteTitleStrategy } from './seo.strategy';
import { TABLE_DEMOS } from './site-data';

@Component({ template: '' })
class SeoTestPage {}

describe('Page-specific SEO metadata', () => {
  it('covers every public content page with a short, unique keyword set', () => {
    const paths = ['/', '/features', '/docs', '/premium', '/pricing',
      ...TABLE_DEMOS.map(demo => `/examples/${demo.id}`),
      ...DEVELOPER_GUIDES.map(guide => `/docs/guides/${guide.slug}`)];
    expect(paths).toHaveLength(22);
    for (const path of paths) {
      const keywords = keywordsForPage(path);
      expect(keywords.length, path).toBeGreaterThanOrEqual(4);
      expect(keywords.length, path).toBeLessThanOrEqual(12);
      expect(new Set(keywords.map(keyword => keyword.toLowerCase())).size, path).toBe(keywords.length);
      expect(keywords.every(keyword => keyword.trim() === keyword && !keyword.includes(',')), path).toBe(true);
    }
    expect(keywordsForPage('/')).toHaveLength(12);
    expect(keywordsForPage('/docs/?framework=react#integrate')).toEqual(keywordsForPage('/docs'));
    expect(keywordsForPage('/not-found')).toEqual([]);
  });

  it('updates keywords on route changes and removes them on missing pages', async () => {
    const testRoutes = routes.map(({ loadComponent, ...route }) => ({
      ...route, ...(loadComponent ? { component: SeoTestPage } : {}),
    }));
    await TestBed.configureTestingModule({ providers: [
      provideRouter(testRoutes), { provide: TitleStrategy, useClass: SiteTitleStrategy },
    ] }).compileComponents();
    const harness = await RouterTestingHarness.create('/');
    const meta = TestBed.inject(Meta);
    for (const path of ['/', '/examples/filtering', '/examples/card-view', '/docs/guides/server-integration', '/premium']) {
      await harness.navigateByUrl(path);
      expect(meta.getTag('name="keywords"')?.content).toBe(keywordsForPage(path).join(', '));
      expect(meta.getTags('name="keywords"')).toHaveLength(1);
    }
    await harness.navigateByUrl('/missing-page');
    expect(meta.getTag('name="keywords"')).toBeNull();
  });
});
