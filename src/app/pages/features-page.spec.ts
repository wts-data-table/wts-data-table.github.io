import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { FeaturesPage } from './features-page';

describe('Feature workflow guides', () => {
  it('connects common table workflows to working examples and guides', async () => {
    await TestBed.configureTestingModule({ imports: [FeaturesPage], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(FeaturesPage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toContain('JavaScript data table');
    expect(root.querySelectorAll('.workflow-grid article')).toHaveLength(8);
    const hrefs = [...root.querySelectorAll('.workflow-grid a')].map(link => link.getAttribute('href'));
    for (const path of ['/examples/filtering', '/examples/editing', '/examples/responsive', '/docs/guides/server-integration', '/premium#worker-processing', '/examples/grouping', '/examples/selection', '/docs/guides/framework-wrappers']) expect(hrefs).toContain(path);
    expect(root.textContent).toContain('does not reduce the size of data already loaded');
    fixture.destroy();
  });
});
