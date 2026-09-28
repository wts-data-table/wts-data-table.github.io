import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { OverviewPage } from './overview-page';
import { CARD_VIEW_LICENSE_LOADER } from '../card-view-demo-license';
import { testCardLicense } from '../license-test-fixture';

describe('Developer-focused overview', () => {
  it('switches the homepage preview between Cards, Auto, and Table without losing selection', async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewPage],
      providers: [provideRouter([]), { provide: CARD_VIEW_LICENSE_LOADER, useValue: () => testCardLicense() }],
    }).compileComponents();
    const fixture = TestBed.createComponent(OverviewPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const root = element.querySelector<HTMLElement>('.wts-data-table')!;
    const buttons = [...element.querySelectorAll<HTMLButtonElement>('.view-controls button')];
    const button = (label: string) => buttons.find(item => item.textContent?.trim() === label)!;

    try {
      expect(root.dataset['wtsView']).toBe('table');
      expect(button('Cards').disabled).toBe(false);
      button('Cards').click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(button('Cards').getAttribute('aria-pressed')).toBe('true');
      expect(root.dataset['wtsView']).toBe('cards');
      expect(root.querySelectorAll('.wts-data-table-card-view__card')).toHaveLength(8);

      root.querySelector<HTMLInputElement>('.wts-data-table-card-view__selection')!.click();
      await fixture.whenStable();
      expect(element.querySelector('.demo-readout')?.textContent).toContain('1 selected');

      let width = 600;
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
        x: 0, y: 0, top: 0, left: 0, width, right: width,
        height: 400, bottom: 400, toJSON: () => ({})
      }));
      button('Auto').click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(button('Auto').getAttribute('aria-pressed')).toBe('true');
      expect(root.dataset['wtsView']).toBe('cards');
      width = 1000;
      window.dispatchEvent(new Event('resize'));
      await vi.waitFor(() => expect(root.dataset['wtsView']).toBe('table'));

      button('Table').click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(button('Table').getAttribute('aria-pressed')).toBe('true');
      expect(root.dataset['wtsView']).toBe('table');
      expect(element.querySelector('.wts-data-table')).toBe(root);
      expect(element.querySelector('.demo-readout')?.textContent).toContain('1 selected');
    } finally {
      fixture.destroy();
      vi.restoreAllMocks();
    }
  });

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
