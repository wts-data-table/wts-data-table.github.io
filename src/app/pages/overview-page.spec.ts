import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { OverviewPage } from './overview-page';
import { CARD_VIEW_LICENSE_LOADER } from '../card-view-demo-license';
import { testCardLicense } from '../license-test-fixture';

describe('Developer-focused overview', () => {
  it('provides working setup links, a copyable recipe, and a real table preview', async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewPage],
      providers: [provideRouter([]), { provide: CARD_VIEW_LICENSE_LOADER, useValue: () => testCardLicense() }],
    }).compileComponents();
    const fixture = TestBed.createComponent(OverviewPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('h1')).toHaveLength(1);
    expect(element.querySelectorAll('nav[aria-label="Framework quick starts"] a')).toHaveLength(4);
    expect(element.querySelector('nav a[href="/docs?framework=core#integrate"]')).toBeTruthy();
    expect(element.querySelector('app-doc-code pre')?.textContent).toContain("import { DataTable } from 'wts-data-table'");
    expect(element.querySelector('app-table-demo table')).toBeTruthy();
    expect(element.textContent).not.toContain('1,000,000');
    expect(element.querySelector('.grid-art')).toBeNull();
    fixture.destroy();
  });
});
