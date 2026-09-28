import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PremiumPage } from './premium-page';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

describe('PremiumPage', () => {
  it('demonstrates every licensed capability group with code and a product image', async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PremiumPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent ?? '';

    expect(element.querySelector('h1')?.textContent).toContain('Premium capabilities');
    expect(text).toContain('11 capabilities');
    for (const capability of [
      'Card view',
      'Advanced row model',
      'Indexed search',
      'Background export',
      'Worker processing',
      'Live data',
      'Server analytics',
      'Spreadsheet formulas',
      'Collaborative editing',
      'Governed editing',
      'Report designer',
    ]) {
      expect(text).toContain(capability);
    }
    expect(element.querySelectorAll('.premium-list > article')).toHaveLength(11);
    expect(element.querySelectorAll('.premium-list img')).toHaveLength(10);
    expect(element.querySelectorAll('.code-block')).toHaveLength(11);
    expect(element.querySelectorAll('.runtime-options')).toHaveLength(11);
    expect(element.querySelector('.live-preview app-table-demo')).not.toBeNull();
    expect(element.querySelector('.live-preview > a')?.getAttribute('href'))
      .toBe('/examples/card-view');
    expect(text).toContain('One package, explicit entitlement');
    const accessButton = element.querySelector<HTMLButtonElement>('.license-actions button')!;
    expect(accessButton.textContent).toContain('Request Premium access');
    const dialog = element.querySelector<HTMLDialogElement>('dialog')!;
    const show = vi.fn(() => {
      dialog.open = true;
    });
    Object.defineProperty(dialog, 'showModal', { configurable: true, value: show });
    accessButton.click();
    fixture.detectChanges();
    expect(show).toHaveBeenCalledTimes(1);
    expect(dialog.querySelector<HTMLSelectElement>('#request-type')?.value).toBe('NEW_ACCESS');
    expect(element.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it('keeps all capability links on the Premium route with a matching section', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'premium', component: PremiumPage }])],
    }).compileComponents();
    const harness = await RouterTestingHarness.create('/premium');
    const router = TestBed.inject(Router);
    const element = harness.routeNativeElement!;
    const links = [...element.querySelectorAll<HTMLAnchorElement>('.premium-index a')];
    const sections = [...element.querySelectorAll<HTMLElement>('.premium-list > article')];

    expect(links).toHaveLength(11);
    for (const [index, link] of links.entries()) {
      const target = `/premium#${sections[index].id}`;
      expect(link.getAttribute('href')).toBe(target);
      link.click();
      await harness.fixture.whenStable();
      expect(router.url).toBe(target);
      expect(harness.routeNativeElement).toBe(element);
      expect(element.querySelector(`article${link.hash}`)?.querySelector('h2')).not.toBeNull();
    }
  });
});
