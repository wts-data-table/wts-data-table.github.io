import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it, vi } from 'vitest';
import { DocsPage } from './pages/docs-page';
import { DocCode } from './doc-code';

describe('documentation interactions', () => {
  it('opens a shared framework quick start and switches tabs without navigating away', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'docs', component: DocsPage }])],
    });
    const harness = await RouterTestingHarness.create('/docs?framework=react#integrate');
    const root = harness.routeNativeElement!;
    expect(root.querySelector('#framework-React')?.getAttribute('aria-selected')).toBe('true');
    expect(root.querySelector('#integrate')?.textContent).toContain('ProjectTable.tsx');
    const vue = root.querySelector<HTMLButtonElement>('#framework-Vue')!;
    vue.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    harness.detectChanges();
    expect(root.querySelector('#framework-Core')?.getAttribute('aria-selected')).toBe('true');
    expect(TestBed.inject(Location).path(true)).toContain('framework=core');
    expect(TestBed.inject(Location).path(true)).toContain('#integrate');
    expect(root.querySelector('#integrate')?.textContent).toContain(
      '<div id="project-table"></div>',
    );
  });

  it('searches options and guide content, and recovers from empty results', async () => {
    await TestBed.configureTestingModule({
      imports: [DocsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DocsPage);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const search = root.querySelector<HTMLInputElement>('#docs-search')!;
    search.value = 'card view';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelector('#doc-search-results a')?.getAttribute('href')).toContain(
      '#feature-card-view',
    );
    search.value = 'arabic';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelector('#doc-search-results')?.textContent).toContain(
      'Internationalization',
    );
    search.value = 'no-such-option-999';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelector('#doc-search-results')?.textContent).toContain(
      'No matching documentation',
    );
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(root.querySelector('#doc-search-results')).toBeNull();
  });

  it('filters features by API name and restores the complete catalog', async () => {
    await TestBed.configureTestingModule({
      imports: [DocsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DocsPage);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const filter = root.querySelector<HTMLInputElement>('#feature-filter')!;
    const count = root.querySelectorAll('.feature-item').length;
    filter.value = 'setSorting';
    filter.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelectorAll('.feature-item')).toHaveLength(1);
    expect(root.querySelector('.feature-item h4')?.textContent).toBe('Sorting');
    filter.value = 'no-such-feature-999';
    filter.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    root.querySelector<HTMLButtonElement>('.empty-state button')!.click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.feature-item')).toHaveLength(count);
  });

  it('keeps code literal when highlighting and reports clipboard success and failure', async () => {
    await TestBed.configureTestingModule({ imports: [DocCode] }).compileComponents();
    const fixture = TestBed.createComponent(DocCode);
    const code = 'const template = "<img src=x onerror=alert(1)>";\n// Keep this exact text';
    fixture.componentRef.setInput('code', code);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('pre')?.textContent).toBe(code);
    expect(root.querySelector('img')).toBeNull();

    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    try {
      root.querySelector<HTMLButtonElement>('button')!.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(writeText).toHaveBeenCalledWith(code);
      expect(root.querySelector('[role="status"]')?.textContent).toContain('Code copied');
      writeText.mockRejectedValue(new Error('Permission denied'));
      root.querySelector<HTMLButtonElement>('button')!.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(root.querySelector('[role="status"]')?.textContent).toContain('copy it manually');
    } finally {
      if (original) Object.defineProperty(navigator, 'clipboard', original);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  });
});
