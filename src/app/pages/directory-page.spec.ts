import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { DEVELOPER_GUIDES } from '../developer-guides';
import { TABLE_DEMOS } from '../site-data';
import { DirectoryPage } from './directory-page';

describe('Site directory', () => {
  it('provides ordinary links to every guide, example, and the npm package', async () => {
    await TestBed.configureTestingModule({ imports: [DirectoryPage], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(DirectoryPage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const hrefs = [...root.querySelectorAll('a')].map(a => a.getAttribute('href'));
    for (const guide of DEVELOPER_GUIDES) expect(hrefs).toContain('/docs/guides/' + guide.slug);
    for (const demo of TABLE_DEMOS) expect(hrefs).toContain('/examples/' + demo.id);
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('a[href="https://www.npmjs.com/package/wts-data-table"]')?.textContent).toContain('wts-data-table');
    fixture.destroy();
  });
});
